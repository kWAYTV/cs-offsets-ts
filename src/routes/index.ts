import { Hono } from "hono";
import { indexResponseSchema } from "../schemas.js";
import type { OffsetsService } from "../types.js";
import { nowIso } from "../utils/time.js";

export function createIndexRouter(offsetsService: OffsetsService) {
  const router = new Hono();

  router.get("/", (c) => {
    const raw = {
      ok: true as const,
      timestamp: nowIso(),
      endpoints: { offsets: "/offsets" as const },
      cache: offsetsService.cacheInfo(),
    };
    return c.json(indexResponseSchema.parse(raw));
  });

  return router;
}
