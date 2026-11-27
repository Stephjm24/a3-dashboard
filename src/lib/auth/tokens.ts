import { createHash, randomBytes } from "node:crypto";

/** A random, URL-safe token for invite links and session cookies. */
export function generateToken(): string {
  return randomBytes(32).toString("base64url");
}

/** Only this hash is stored, so a database leak does not reveal usable tokens. */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export const INVITE_LIFETIME_DAYS = 14;
export const SESSION_LIFETIME_DAYS = 30;

export function daysFromNow(days: number, now: Date = new Date()): Date {
  return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
}

export function isUsableInvite(
  invite: { usedAt: Date | null; expiresAt: Date } | null,
  now: Date = new Date(),
): boolean {
  return invite !== null && invite.usedAt === null && invite.expiresAt > now;
}
