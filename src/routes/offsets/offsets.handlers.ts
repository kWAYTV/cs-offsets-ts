import { INTERNAL_SERVER_ERROR, OK } from "stoker/http-status-codes";

import { errorResponseSchema } from "../../schemas/error-response.js";
import { offsetsResponseSchema } from "../../schemas/offsets-response.js";
import type { AppRouteHandler } from "../../types/app.js";
import { nowIso } from "../../utils/time.js";

import type { ListRoute } from "./offsets.routes.js";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const offsetsService = c.get("offsetsService");

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
    return c.json(body, OK);
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
      INTERNAL_SERVER_ERROR
    );
  }
};
