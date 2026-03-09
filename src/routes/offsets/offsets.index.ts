import { createRouter } from "../../core/create-app.js";
import { list as offsetsListHandler } from "./offsets.handlers.js";
import { list as offsetsListRoute } from "./offsets.routes.js";

const router = createRouter().openapi(offsetsListRoute, offsetsListHandler);

export default router;
