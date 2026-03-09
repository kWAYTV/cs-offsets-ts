import { z } from "@hono/zod-openapi";

export const cacheInfoSchema = z
  .object({
    ageMs: z.number().nullable(),
    expiresAt: z.string().nullable(),
    fetchCount: z.number(),
    lastDurationMs: z.number().nullable(),
    lastError: z.string().nullable(),
    lastFetchAt: z.string().nullable(),
    remainingMs: z.number(),
    remainingSeconds: z.number().nullable(),
    status: z.enum(["never", "ok", "error"]),
    ttlMs: z.number(),
  })
  .openapi("CacheInfo");

export type CacheInfo = z.infer<typeof cacheInfoSchema>;
