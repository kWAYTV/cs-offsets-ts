import index from "../routes/index.route.js";
import offsets from "../routes/offsets/offsets.index.js";
import { createCacheStore } from "../services/cache-store.js";
import { createOffsetsService } from "../services/offsets-service.js";
import configureOpenAPI from "./configure-open-api.js";
import createBaseApp from "./create-app.js";

export async function createApp() {
  const app = createBaseApp();
  const cache = createCacheStore();
  const offsetsService = createOffsetsService(cache);

  app.use("*", async (c, next) => {
    c.set("offsetsService", offsetsService);
    await next();
  });

  const routes = [index, offsets] as const;
  for (const route of routes) {
    app.route("/", route);
  }

  await configureOpenAPI(app);

  return app;
}
