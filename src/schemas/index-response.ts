import { z } from "@hono/zod-openapi";

export const indexResponseSchema = z
  .object({
    ok: z.literal(true),
    timestamp: z.string(),
    endpoints: z.object({
      offsets: z.string(),
      doc: z.string(),
      scalar: z.string(),
      llms: z.string(),
    }),
  })
  .openapi("IndexResponse");

export type IndexResponse = z.infer<typeof indexResponseSchema>;
