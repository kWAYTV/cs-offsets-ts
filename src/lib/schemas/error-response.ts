import { z } from "zod";
import { cacheInfoSchema } from "./cache-info.js";

export const errorResponseSchema = z.object({
  cache: cacheInfoSchema,
  error: z.string(),
  ok: z.literal(false),
  timestamp: z.string().datetime(),
});

export type ErrorResponse = z.infer<typeof errorResponseSchema>;
