/**
 * A small fixed-window rate limiter kept in server memory.
 *
 * It protects one server process. When the app runs as several instances
 * (Azure Container Apps with more than one replica), move the counters to a
 * shared store such as Redis so the limits hold across instances.
 */
export type RateLimitRule = { limit: number; windowMs: number };

export type RateLimitResult = { ok: true } | { ok: false; retryAfterSeconds: number };

type Bucket = { count: number; resetAt: number };

const MAX_KEYS = 10_000;

export function createRateLimiter() {
  const buckets = new Map<string, Bucket>();

  function sweep(now: number) {
    for (const [key, bucket] of buckets) if (bucket.resetAt <= now) buckets.delete(key);
  }

  return {
    /** Counts one attempt for `key` and says whether it is within `rule`. */
    hit(key: string, rule: RateLimitRule, now: number = Date.now()): RateLimitResult {
      let bucket = buckets.get(key);
      if (!bucket || bucket.resetAt <= now) {
        if (buckets.size >= MAX_KEYS) sweep(now);
        // Still full after removing expired windows: drop the oldest key so memory stays bounded.
        if (buckets.size >= MAX_KEYS) buckets.delete(buckets.keys().next().value as string);
        bucket = { count: 0, resetAt: now + rule.windowMs };
        buckets.set(key, bucket);
      }
      bucket.count += 1;
      if (bucket.count > rule.limit) {
        return { ok: false, retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) };
      }
      return { ok: true };
    },
    size: () => buckets.size,
  };
}

/** Limits used by the app. Generous for a person, tight for a script. */
export const RULES = {
  /** Opening or accepting invite links, per client address. */
  invite: { limit: 20, windowMs: 15 * 60 * 1000 },
  /** Creating A3s, per user. */
  createA3: { limit: 30, windowMs: 60 * 60 * 1000 },
  /** Saving or restoring, per user. */
  save: { limit: 120, windowMs: 60 * 1000 },
  /** Reading an uploaded CSV or Excel file, per user. */
  upload: { limit: 20, windowMs: 10 * 60 * 1000 },
} satisfies Record<string, RateLimitRule>;

export const limiter = createRateLimiter();

/**
 * The client address as seen by the nearest proxy. The last entry of
 * X-Forwarded-For is the one that proxy added, so a client cannot choose it.
 */
export function clientAddress(headers: { get(name: string): string | null }): string {
  const forwarded = headers.get("x-forwarded-for");
  const last = forwarded?.split(",").map((s) => s.trim()).filter(Boolean).pop();
  return last || headers.get("x-real-ip")?.trim() || "unknown";
}

export function tooManyMessage(retryAfterSeconds: number): string {
  const minutes = Math.ceil(retryAfterSeconds / 60);
  return `Too many attempts. Please wait ${minutes === 1 ? "a minute" : `${minutes} minutes`} and try again.`;
}
