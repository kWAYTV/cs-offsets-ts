import { z } from "@hono/zod-openapi";
import { cacheInfoSchema } from "./cache-info.js";

export const errorResponseSchema = z
  .object({
    cache: cacheInfoSchema,
    error: z.string(),
    ok: z.literal(false),
    timestamp: z.string().datetime(),
  })
  .openapi("ErrorResponse");

export type ErrorResponse = z.infer<typeof errorResponseSchema>;
