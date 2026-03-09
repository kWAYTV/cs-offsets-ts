import type { Context, Next } from "hono";
import { rateLimitResponseSchema } from "../schemas.js";

const store = new Map<string, { count: number; resetAt: number }>();

/** Prune expired entries periodically */
function prune(): void {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  }
}

function getClientIp(c: Context): string {
  const forwarded = c.req.header("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }
  return c.req.header("x-real-ip") ?? "unknown";
}

export function createRateLimiter(options: {
  windowMs: number;
  max: number;
  message?: { ok: boolean; error: string };
}) {
  const { windowMs, max, message } = {
    message: { ok: false, error: "Too many requests. Please try again soon." },
    ...options,
  };

  return async (c: Context, next: Next) => {
    if (store.size > 10_000) {
      prune();
    }

    const ip = getClientIp(c);
    const now = Date.now();
    let entry = store.get(ip);

    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      store.set(ip, entry);
    }

    entry.count += 1;

    if (entry.count > max) {
      return c.json(rateLimitResponseSchema.parse(message), 429, {
        "Retry-After": String(Math.ceil((entry.resetAt - now) / 1000)),
      });
    }

    await next();
  };
}

export const globalLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 120,
});

export const offsetsLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 30,
  message: { ok: false, error: "Rate limit exceeded for /offsets." },
});
