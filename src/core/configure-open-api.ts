import { Scalar } from "@scalar/hono-api-reference";
import { createMarkdownFromOpenApi } from "@scalar/openapi-to-markdown";

import type { AppOpenAPI } from "../types/app.js";

const OPENAPI_INFO = {
  title: "CS2 Offsets API",
  version: "1.0.0",
  description:
    "Serves flattened CS2 ESP offsets from a2x/cs2-dumper for CS2Go.",
} as const;

export default async function configureOpenAPI(app: AppOpenAPI) {
  app.doc("/doc", { openapi: "3.0.0", info: OPENAPI_INFO });

  app.get("/scalar", Scalar({ url: "/doc", pageTitle: OPENAPI_INFO.title }));

  const doc = app.getOpenAPI31Document({
    openapi: "3.1.0",
    info: OPENAPI_INFO,
  });
  const markdown = await createMarkdownFromOpenApi(JSON.stringify(doc));
  app.get("/llms.txt", (c) => c.text(markdown));
}
