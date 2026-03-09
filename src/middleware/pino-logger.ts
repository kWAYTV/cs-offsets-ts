import { pinoLogger as createPinoLogger } from "hono-pino";
import pino from "pino";
import pretty from "pino-pretty";

import { env } from "../env.js";

export function pinoLogger() {
  return createPinoLogger({
    pino: pino(
      { level: env.LOG_LEVEL },
      env.NODE_ENV === "production" ? undefined : pretty()
    ),
  });
}
