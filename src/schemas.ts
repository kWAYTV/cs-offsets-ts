import { z } from "zod";

export const cacheInfoSchema = z.object({
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
});

export type CacheInfo = z.infer<typeof cacheInfoSchema>;

export const indexResponseSchema = z.object({
  cache: cacheInfoSchema,
  endpoints: z.object({ offsets: z.literal("/offsets") }),
  ok: z.literal(true),
  timestamp: z.string().datetime(),
});

export type IndexResponse = z.infer<typeof indexResponseSchema>;

export const offsetsResponseSchema = z.object({
  cache: cacheInfoSchema,
  missingKeys: z.array(z.string()),
  offsets: z.record(z.string(), z.number()),
  ok: z.literal(true),
  timestamp: z.string().datetime(),
  error: z.string().optional(),
  stale: z.boolean().optional(),
});

export type OffsetsResponse = z.infer<typeof offsetsResponseSchema>;

export const errorResponseSchema = z.object({
  cache: cacheInfoSchema,
  error: z.string(),
  ok: z.literal(false),
  timestamp: z.string().datetime(),
});

export type ErrorResponse = z.infer<typeof errorResponseSchema>;

export const rateLimitResponseSchema = z.object({
  error: z.string(),
  ok: z.literal(false),
});

export type RateLimitResponse = z.infer<typeof rateLimitResponseSchema>;
