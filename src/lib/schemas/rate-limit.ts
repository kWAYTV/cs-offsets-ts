import { z } from "zod";

export const rateLimitResponseSchema = z.object({
  error: z.string(),
  ok: z.literal(false),
});

export type RateLimitResponse = z.infer<typeof rateLimitResponseSchema>;
