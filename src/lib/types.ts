import type { OpenAPIHono, RouteConfig, RouteHandler } from "@hono/zod-openapi";
import type { PinoLogger } from "hono-pino";
import type { OffsetsService } from "./types/offsets-service.js";

export interface AppBindings {
  Variables: {
    logger: PinoLogger;
    offsetsService: OffsetsService;
  };
}

export type AppOpenAPI = OpenAPIHono<AppBindings>;

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<
  R,
  AppBindings
>;
