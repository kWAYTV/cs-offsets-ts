import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { createMarkdownFromOpenApi } from "@scalar/openapi-to-markdown";
import { logger } from "hono/logger";
import { errorResponseSchema } from "../lib/schemas/error-response.js";
import { indexResponseSchema } from "../lib/schemas/index-response.js";
import { offsetsResponseSchema } from "../lib/schemas/offsets-response.js";
import { rateLimitResponseSchema } from "../lib/schemas/rate-limit.js";
import { globalLimiter, offsetsLimiter } from "../middleware/rate-limit.js";
import { createCacheStore } from "../services/cache-store.js";
import { createOffsetsService } from "../services/offsets-service.js";
import { nowIso } from "../utils/time.js";

const indexRoute = createRoute({
  method: "get",
  path: "/",
  responses: {
    200: {
      content: {
        "application/json": { schema: indexResponseSchema },
      },
      description: "API info and endpoints",
    },
  },
});

const offsetsRoute = createRoute({
  method: "get",
  path: "/offsets",
  middleware: [offsetsLimiter],
  responses: {
    200: {
      content: {
        "application/json": { schema: offsetsResponseSchema },
      },
      description: "Flattened CS2 offsets (5min cache)",
    },
    429: {
      content: {
        "application/json": { schema: rateLimitResponseSchema },
      },
      description: "Rate limit exceeded",
    },
    500: {
      content: {
        "application/json": { schema: errorResponseSchema },
      },
      description: "Server error",
    },
  },
});

export async function createApp(): Promise<OpenAPIHono> {
  const app = new OpenAPIHono();

  app.use(logger());
  app.use("*", globalLimiter);

  const cache = createCacheStore();
  const offsetsService = createOffsetsService(cache);

  app.openapi(indexRoute, (c) => {
    return c.json(
      {
        ok: true as const,
        timestamp: new Date().toISOString(),
        endpoints: {
          offsets: "/offsets",
          doc: "/doc",
          scalar: "/scalar",
          llms: "/llms.txt",
        },
      },
      200
    );
  });

  app.openapi(offsetsRoute, async (c) => {
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
      return c.json(body, 200);
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

  app.doc("/doc", {
    openapi: "3.0.0",
    info: {
      title: "CS2 Offsets API",
      version: "1.0.0",
      description:
        "Serves flattened CS2 ESP offsets from a2x/cs2-dumper for CS2Go.",
    },
  });

  app.get(
    "/scalar",
    Scalar({ url: "/doc", pageTitle: "CS2 Offsets API", theme: "kepler" })
  );

  const openApiDoc = app.getOpenAPI31Document({
    openapi: "3.1.0",
    info: { title: "CS2 Offsets API", version: "1.0.0" },
  });
  const markdown = await createMarkdownFromOpenApi(JSON.stringify(openApiDoc));
  app.get("/llms.txt", (c) => c.text(markdown));

  return app;
}
