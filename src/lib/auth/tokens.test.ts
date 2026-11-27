import { describe, expect, it } from "vitest";
import { daysFromNow, generateToken, hashToken, isUsableInvite } from "./tokens";

describe("tokens", () => {
  it("generates long, distinct, URL-safe tokens", () => {
    const a = generateToken();
    const b = generateToken();
    expect(a).not.toEqual(b);
    expect(a).toMatch(/^[A-Za-z0-9_-]{43}$/);
  });

  it("hashes the same token the same way, and never returns the token itself", () => {
    const t = generateToken();
    expect(hashToken(t)).toEqual(hashToken(t));
    expect(hashToken(t)).not.toContain(t);
  });

  it("accepts only unused, unexpired invites", () => {
    const now = new Date("2026-11-27T12:00:00Z");
    expect(isUsableInvite({ usedAt: null, expiresAt: daysFromNow(1, now) }, now)).toBe(true);
    expect(isUsableInvite({ usedAt: now, expiresAt: daysFromNow(1, now) }, now)).toBe(false);
    expect(isUsableInvite({ usedAt: null, expiresAt: daysFromNow(-1, now) }, now)).toBe(false);
    expect(isUsableInvite(null, now)).toBe(false);
  });
});
