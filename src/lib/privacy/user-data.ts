// Answers data protection requests for one person: a copy of their data
// (access and portability), deleting it (erasure), and removing expired
// sign-in records. Run from the command line with `npm run user-data`
// (scripts/user-data.ts). See docs/compliance/DATA_RETENTION.md.
//
// Deleting rows here does not remove copies held in database backups or by
// the hosting provider. Those expire on the provider's own schedule.
import type { PrismaClient } from "@/generated/prisma/client";

export type UserDataClient = Pick<PrismaClient, "user" | "invite" | "session" | "a3" | "$transaction">;

export function normaliseEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Everything stored about the person, as plain JSON. Token hashes are left
 * out: they are security values, not information about the person.
 */
export async function exportUserData(db: UserDataClient, rawEmail: string) {
  const email = normaliseEmail(rawEmail);
  const user = await db.user.findUnique({ where: { email } });
  const invites = await db.invite.findMany({
    where: { OR: [{ email }, ...(user ? [{ userId: user.id }] : [])] },
    select: { email: true, createdAt: true, expiresAt: true, usedAt: true },
    orderBy: { createdAt: "asc" },
  });
  if (!user) return invites.length ? { exportedAt: new Date().toISOString(), user: null, invites, sessions: [], a3s: [] } : null;

  const sessions = await db.session.findMany({
    where: { userId: user.id },
    select: { createdAt: true, expiresAt: true },
    orderBy: { createdAt: "asc" },
  });
  const a3s = await db.a3.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "asc" },
    include: {
      versions: { orderBy: { version: "asc" } },
      drafts: true,
      coachingTurns: { orderBy: { createdAt: "asc" } },
      rawInputs: true,
      uploads: true,
      reviews: true,
    },
  });
  return {
    exportedAt: new Date().toISOString(),
    user: { email: user.email, name: user.name, signInProvider: user.signInProvider, createdAt: user.createdAt },
    invites,
    sessions,
    a3s,
  };
}

export type DeleteResult = { found: boolean; a3s: number; sessions: number; invites: number };

/**
 * Deletes the person's account, sessions, invites and every A3 they own. Each
 * A3's versions, drafts, coaching turns, inputs, uploads and reviews go with it.
 */
export async function deleteUserData(db: UserDataClient, rawEmail: string): Promise<DeleteResult> {
  const email = normaliseEmail(rawEmail);
  return db.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { email } });
    const invites = await tx.invite.deleteMany({
      where: { OR: [{ email }, ...(user ? [{ userId: user.id }] : [])] },
    });
    if (!user) return { found: invites.count > 0, a3s: 0, sessions: 0, invites: invites.count };
    const a3s = await tx.a3.deleteMany({ where: { ownerId: user.id } });
    const sessions = await tx.session.deleteMany({ where: { userId: user.id } });
    await tx.user.delete({ where: { id: user.id } });
    return { found: true, a3s: a3s.count, sessions: sessions.count, invites: invites.count };
  });
}

/** Removes sessions that have expired and invites that expired without being used. */
export async function purgeExpired(db: UserDataClient, now: Date = new Date()) {
  const sessions = await db.session.deleteMany({ where: { expiresAt: { lte: now } } });
  const invites = await db.invite.deleteMany({ where: { usedAt: null, expiresAt: { lte: now } } });
  return { sessions: sessions.count, invites: invites.count };
}
