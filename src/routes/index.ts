import { Hono } from "hono";
import type { OffsetsService } from "../types.js";
import { nowIso } from "../utils/time.js";

export function createIndexRouter(offsetsService: OffsetsService) {
  const router = new Hono();

  router.get("/", (c) => {
    return c.json({
      ok: true,
      timestamp: nowIso(),
      endpoints: { offsets: "/offsets" },
      cache: offsetsService.cacheInfo(),
    });
  });

  return router;
}
