import { createRoute } from "@hono/zod-openapi";
import {
  INTERNAL_SERVER_ERROR,
  OK,
  TOO_MANY_REQUESTS,
} from "stoker/http-status-codes";
import jsonContent from "stoker/openapi/helpers/json-content";

import { errorResponseSchema } from "../../lib/schemas/error-response.js";
import { offsetsResponseSchema } from "../../lib/schemas/offsets-response.js";
import { rateLimitResponseSchema } from "../../lib/schemas/rate-limit.js";
import { offsetsLimiter } from "../../middleware/rate-limit.js";

export const list = createRoute({
  method: "get",
  path: "/offsets",
  middleware: [offsetsLimiter],
  responses: {
    [OK]: jsonContent(
      offsetsResponseSchema,
      "Flattened CS2 offsets (5min cache)"
    ),
    [TOO_MANY_REQUESTS]: jsonContent(
      rateLimitResponseSchema,
      "Rate limit exceeded"
    ),
    [INTERNAL_SERVER_ERROR]: jsonContent(errorResponseSchema, "Server error"),
  },
});

export type ListRoute = typeof list;
