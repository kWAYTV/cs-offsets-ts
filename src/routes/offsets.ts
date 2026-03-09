import type { MiddlewareHandler } from "hono";
import { Hono } from "hono";
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
      return c.json(payload);
    } catch (err) {
      return c.json(
        {
          ok: false,
          timestamp: nowIso(),
          error: err instanceof Error ? err.message : String(err),
          cache: offsetsService.cacheInfo(),
        },
        500
      );
    }
  });

  return router;
}
