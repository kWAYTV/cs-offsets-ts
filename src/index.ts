import { Hono } from "hono";
import { globalLimiter, offsetsLimiter } from "./middleware/rate-limit.js";
import { createIndexRouter } from "./routes/index.js";
import { createOffsetsRouter } from "./routes/offsets.js";
import { createCacheStore } from "./services/cache-store.js";
import { createOffsetsService } from "./services/offsets-service.js";

const app = new Hono();

app.use("*", globalLimiter);

const cache = createCacheStore();
const offsetsService = createOffsetsService(cache);

app.route("/", createIndexRouter(offsetsService));
app.route("/", createOffsetsRouter(offsetsService, offsetsLimiter));

export default app;
