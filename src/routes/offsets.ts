import type { MiddlewareHandler } from "hono";
import { Hono } from "hono";
import { errorResponseSchema, offsetsResponseSchema } from "../schemas.js";
import type { OffsetsService } from "../types.js";
import { nowIso } from "../utils/time.js";

export function createOffsetsRouter(
  offsetsService: OffsetsService,
  offsetsLimiter: MiddlewareHandler
) {
  const router = new Hono();

  router.get("/offsets", offsetsLimiter, async (c) => {
    try {
      const payload = await offsetsService.getPayloadWithCache();
      return c.json(offsetsResponseSchema.parse(payload));
    } catch (err) {
      const raw = {
        ok: false as const,
        timestamp: nowIso(),
        error: err instanceof Error ? err.message : String(err),
        cache: offsetsService.cacheInfo(),
      };
      return c.json(errorResponseSchema.parse(raw), 500);
    }
  });

  return router;
}
