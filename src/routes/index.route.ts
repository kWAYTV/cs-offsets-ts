import { createRoute } from "@hono/zod-openapi";
import { OK } from "stoker/http-status-codes";
import jsonContent from "stoker/openapi/helpers/json-content";

import { createRouter } from "../lib/create-app.js";
import { indexResponseSchema } from "../lib/schemas/index-response.js";

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
  },
});

const router = createRouter().openapi(route, (c) =>
  c.json(
    { ok: true, timestamp: new Date().toISOString(), endpoints: ENDPOINTS },
    OK
  )
);

export default router;
