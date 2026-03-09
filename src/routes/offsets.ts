import type { MiddlewareHandler } from "hono";
import { Hono } from "hono";
import { errorResponseSchema } from "../lib/schemas/error-response.js";
import { offsetsResponseSchema } from "../lib/schemas/offsets-response.js";
import type { OffsetsService } from "../lib/types/offsets-service.js";
import { nowIso } from "../utils/time.js";

export function createOffsetsRouter(
  offsetsService: OffsetsService,
  offsetsLimiter: MiddlewareHandler
) {
  const router = new Hono();

  router.get("/offsets", offsetsLimiter, async (c) => {
    try {
      const payload = await offsetsService.getPayloadWithCache();
      const v = offsetsResponseSchema.parse(payload);
      const body = {
        ok: v.ok,
        timestamp: v.timestamp,
        offsets: v.offsets,
        missingKeys: v.missingKeys,
        cache: v.cache,
        ...(v.error != null && { error: v.error }),
        ...(v.stale != null && { stale: v.stale }),
      };
      return c.json(body);
    } catch (err) {
      const raw = {
        ok: false as const,
        timestamp: nowIso(),
        error: err instanceof Error ? err.message : String(err),
        cache: offsetsService.cacheInfo(),
      };
      const v = errorResponseSchema.parse(raw);
      return c.json(
        { ok: v.ok, timestamp: v.timestamp, error: v.error, cache: v.cache },
        500
      );
    }
  });

  return router;
}
