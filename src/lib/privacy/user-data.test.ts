import { describe, expect, it, vi } from "vitest";
import { deleteUserData, exportUserData, normaliseEmail, purgeExpired, type UserDataClient } from "./user-data";

function fakeDb(user: { id: string; email: string; name: string } | null) {
  const calls: Record<string, unknown[]> = {};
  const record = (name: string, result: unknown) =>
    vi.fn(async (arg: unknown) => {
      (calls[name] ??= []).push(arg);
      return result;
    });
  const db = {
    user: {
      findUnique: record("user.findUnique", user && { ...user, signInProvider: "invite", createdAt: new Date(0) }),
      delete: record("user.delete", user),
    },
    invite: {
      findMany: record("invite.findMany", [{ email: "a@example.com" }]),
      deleteMany: record("invite.deleteMany", { count: 1 }),
    },
    session: {
      findMany: record("session.findMany", []),
      deleteMany: record("session.deleteMany", { count: 2 }),
    },
    a3: {
      findMany: record("a3.findMany", []),
      deleteMany: record("a3.deleteMany", { count: 3 }),
    },
    $transaction: vi.fn(async (fn: (tx: unknown) => unknown) => fn(db)),
  };
  return { db: db as unknown as UserDataClient, calls };
}

describe("user data requests", () => {
  it("matches email addresses the way invites store them", () => {
    expect(normaliseEmail("  Tester@Example.COM ")).toBe("tester@example.com");
  });

  it("exports the person's data without any token hashes", async () => {
    const { db, calls } = fakeDb({ id: "u1", email: "a@example.com", name: "A" });
    const data = await exportUserData(db, "A@example.com");
    expect(data?.user).toEqual({ email: "a@example.com", name: "A", signInProvider: "invite", createdAt: new Date(0) });
    const selects = [calls["invite.findMany"][0], calls["session.findMany"][0]].map((c) => (c as { select: object }).select);
    for (const select of selects) expect(select).not.toHaveProperty("tokenHash");
  });

  it("returns nothing when no record exists", async () => {
    const { db } = fakeDb(null);
    (db.invite.findMany as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);
    expect(await exportUserData(db, "nobody@example.com")).toBeNull();
  });

  it("deletes the account, its A3s, sessions and invites in one transaction", async () => {
    const { db, calls } = fakeDb({ id: "u1", email: "a@example.com", name: "A" });
    expect(await deleteUserData(db, "a@example.com")).toEqual({ found: true, a3s: 3, sessions: 2, invites: 1 });
    expect(calls["a3.deleteMany"][0]).toEqual({ where: { ownerId: "u1" } });
    expect(calls["user.delete"][0]).toEqual({ where: { id: "u1" } });
    expect(db.$transaction).toHaveBeenCalledOnce();
  });

  it("still deletes an unused invite for someone who never signed in", async () => {
    const { db, calls } = fakeDb(null);
    expect(await deleteUserData(db, "a@example.com")).toEqual({ found: true, a3s: 0, sessions: 0, invites: 1 });
    expect(calls["user.delete"]).toBeUndefined();
  });

  it("purges only expired sessions and unused expired invites", async () => {
    const { db, calls } = fakeDb(null);
    const now = new Date("2026-11-28T00:00:00Z");
    await purgeExpired(db, now);
    expect(calls["session.deleteMany"][0]).toEqual({ where: { expiresAt: { lte: now } } });
    expect(calls["invite.deleteMany"][0]).toEqual({ where: { usedAt: null, expiresAt: { lte: now } } });
  });
});
