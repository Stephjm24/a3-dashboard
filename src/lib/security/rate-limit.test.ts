import { describe, expect, it } from "vitest";
import { clientAddress, createRateLimiter, tooManyMessage } from "./rate-limit";

const rule = { limit: 3, windowMs: 60_000 };

describe("createRateLimiter", () => {
  it("allows up to the limit, then refuses until the window ends", () => {
    const limiter = createRateLimiter();
    const t = 1_000_000;
    expect([1, 2, 3].map(() => limiter.hit("a", rule, t).ok)).toEqual([true, true, true]);
    expect(limiter.hit("a", rule, t + 1_000)).toEqual({ ok: false, retryAfterSeconds: 59 });
    expect(limiter.hit("a", rule, t + 60_000).ok).toBe(true);
  });

  it("counts each key separately", () => {
    const limiter = createRateLimiter();
    for (let i = 0; i < 3; i++) limiter.hit("a", rule, 0);
    expect(limiter.hit("a", rule, 0).ok).toBe(false);
    expect(limiter.hit("b", rule, 0).ok).toBe(true);
  });

  it("keeps memory bounded when many addresses hit it", () => {
    const limiter = createRateLimiter();
    for (let i = 0; i < 10_050; i++) limiter.hit(`ip${i}`, rule, 0);
    expect(limiter.size()).toBeLessThanOrEqual(10_000);
  });
});

describe("clientAddress", () => {
  const h = (values: Record<string, string>) => ({ get: (k: string) => values[k] ?? null });

  it("uses the address the nearest proxy added, not one the client sent", () => {
    expect(clientAddress(h({ "x-forwarded-for": "6.6.6.6, 203.0.113.7" }))).toBe("203.0.113.7");
  });

  it("falls back to X-Real-IP, then to a shared bucket", () => {
    expect(clientAddress(h({ "x-real-ip": "198.51.100.2" }))).toBe("198.51.100.2");
    expect(clientAddress(h({}))).toBe("unknown");
  });
});

describe("tooManyMessage", () => {
  it("says how long to wait in minutes", () => {
    expect(tooManyMessage(30)).toBe("Too many attempts. Please wait a minute and try again.");
    expect(tooManyMessage(600)).toBe("Too many attempts. Please wait 10 minutes and try again.");
  });
});
