import { rateLimiter } from "hono-rate-limiter";

const WINDOW_MS = 60 * 1000;

function keyGenerator(c: {
  req: { header: (name: string) => string | undefined };
}) {
  const forwarded = c.req.header("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }
  return c.req.header("x-real-ip") ?? "unknown";
}

export const globalLimiter = rateLimiter({
  windowMs: WINDOW_MS,
  limit: 120,
  keyGenerator,
  message: { ok: false, error: "Rate limit exceeded." },
});

export const offsetsLimiter = rateLimiter({
  windowMs: WINDOW_MS,
  limit: 30,
  keyGenerator,
  message: { ok: false, error: "Rate limit exceeded for /offsets." },
});
