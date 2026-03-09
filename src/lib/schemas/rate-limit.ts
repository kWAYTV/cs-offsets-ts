import { z } from "@hono/zod-openapi";

export const rateLimitResponseSchema = z
  .object({
    error: z.string(),
    ok: z.literal(false),
  })
  .openapi("RateLimitResponse");

export type RateLimitResponse = z.infer<typeof rateLimitResponseSchema>;
