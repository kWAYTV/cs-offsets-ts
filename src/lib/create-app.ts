import { $, OpenAPIHono } from "@hono/zod-openapi";
import { notFound, onError, serveEmojiFavicon } from "stoker/middlewares";
import { defaultHook } from "stoker/openapi";

import { pinoLogger } from "../middleware/pino-logger.js";
import { globalLimiter } from "../middleware/rate-limit.js";
import type { AppBindings } from "./types.js";

export function createRouter() {
  return new OpenAPIHono<AppBindings>({
    strict: false,
    defaultHook,
  });
}

export default function createBaseApp() {
  return $(
    createRouter()
      .use(serveEmojiFavicon("👁️"))
      .use(pinoLogger())
      .use("*", globalLimiter)
      .notFound(notFound)
      .onError(onError)
  );
}
