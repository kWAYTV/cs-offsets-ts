import { z } from "@hono/zod-openapi";
import { cacheInfoSchema } from "./cache-info.js";

export const offsetsResponseSchema = z
  .object({
    cache: cacheInfoSchema,
    missingKeys: z.array(z.string()),
    offsets: z.record(z.string(), z.number()),
    ok: z.literal(true),
    timestamp: z.string().datetime(),
    error: z.string().optional(),
    stale: z.boolean().optional(),
  })
  .openapi("OffsetsResponse");

export type OffsetsResponse = z.infer<typeof offsetsResponseSchema>;
