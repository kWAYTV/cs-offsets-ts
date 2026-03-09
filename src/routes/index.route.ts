import { createRoute } from "@hono/zod-openapi";
import { OK, TOO_MANY_REQUESTS } from "stoker/http-status-codes";
import jsonContent from "stoker/openapi/helpers/json-content";

import { createRouter } from "../core/create-app.js";
import { indexResponseSchema } from "../schemas/index-response.js";
import { rateLimitResponseSchema } from "../schemas/rate-limit.js";

const ENDPOINTS = {
  offsets: "/offsets",
  doc: "/doc",
  scalar: "/scalar",
  llms: "/llms.txt",
} as const;

const route = createRoute({
  method: "get",
  path: "/",
  responses: {
    [OK]: jsonContent(indexResponseSchema, "API info and endpoints"),
    [TOO_MANY_REQUESTS]: jsonContent(
      rateLimitResponseSchema,
      "Rate limit exceeded"
    ),
  },
});

const router = createRouter().openapi(route, (c) =>
  c.json(
    { ok: true, timestamp: new Date().toISOString(), endpoints: ENDPOINTS },
    OK
  )
);

export default router;
