import { describe, expect, it } from "bun:test";
import { REQUIRED_KEYS } from "../config/constants.js";
import app from "../src/app.js";
import { cacheInfoSchema } from "../src/schemas/cache-info.js";

const CACHE_STATUS_RE = /^(never|ok|error)$/;

import { indexResponseSchema } from "../src/schemas/index-response.js";
import { offsetsResponseSchema } from "../src/schemas/offsets-response.js";
import { rateLimitResponseSchema } from "../src/schemas/rate-limit.js";
import { fetchJson, request } from "./helpers.js";

describe("GET /", () => {
  it("returns 200 with valid index schema", async () => {
    const res = await app.fetch(request("/"));
    expect(res.status).toBe(200);
    const body = await fetchJson(res);
    indexResponseSchema.parse(body);
  });

  it("returns correct endpoint paths", async () => {
    const res = await app.fetch(request("/"));
    const body = (await fetchJson(res)) as {
      endpoints: { offsets: string; doc: string; scalar: string; llms: string };
    };
    expect(body.endpoints.offsets).toBe("/offsets");
    expect(body.endpoints.doc).toBe("/doc");
    expect(body.endpoints.scalar).toBe("/scalar");
    expect(body.endpoints.llms).toBe("/llms.txt");
  });
});

describe("GET /offsets", () => {
  it("returns 200 with valid offsets schema", async () => {
    const res = await app.fetch(request("/offsets"));
    expect(res.status).toBe(200);
    const body = await fetchJson(res);
    offsetsResponseSchema.parse(body);
  });

  it("includes cache info with valid schema", async () => {
    const res = await app.fetch(request("/offsets"));
    const body = await fetchJson(res);
    const parsed = offsetsResponseSchema.parse(body);
    cacheInfoSchema.parse(parsed.cache);
    expect(parsed.cache.status).toMatch(CACHE_STATUS_RE);
    expect(parsed.cache.ttlMs).toBe(300_000);
  });

  it("offsets values are numbers", async () => {
    const res = await app.fetch(request("/offsets"));
    const body = await fetchJson(res);
    const parsed = offsetsResponseSchema.parse(body);
    for (const [, value] of Object.entries(parsed.offsets)) {
      expect(typeof value).toBe("number");
      expect(Number.isFinite(value)).toBe(true);
    }
  });

  it("missingKeys only contains required keys not in offsets", async () => {
    const res = await app.fetch(request("/offsets"));
    const body = await fetchJson(res);
    const parsed = offsetsResponseSchema.parse(body);
    for (const key of parsed.missingKeys) {
      expect(REQUIRED_KEYS as readonly string[]).toContain(key);
      expect(parsed.offsets[key]).toBeUndefined();
    }
  });
});

describe("GET /doc", () => {
  it("returns 200 with OpenAPI 3 structure", async () => {
    const res = await app.fetch(request("/doc"));
    expect(res.status).toBe(200);
    const body = await fetchJson(res);
    const doc = body as { openapi: string; info: object; paths: object };
    expect(doc.openapi).toBeDefined();
    expect(doc.info).toBeDefined();
    expect(doc.paths).toBeDefined();
    expect(doc.paths["/"]).toBeDefined();
    expect(doc.paths["/offsets"]).toBeDefined();
  });

  it("doc paths match API", async () => {
    const res = await app.fetch(request("/doc"));
    const body = await fetchJson(res);
    const paths = (body as { paths: Record<string, { get?: unknown }> }).paths;
    expect(paths["/"]?.get).toBeDefined();
    expect(paths["/offsets"]?.get).toBeDefined();
  });
});

describe("GET /llms.txt", () => {
  it("returns 200 with markdown", async () => {
    const res = await app.fetch(request("/llms.txt"));
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text");
  });

  it("contains API documentation", async () => {
    const text = await (await app.fetch(request("/llms.txt"))).text();
    expect(text).toContain("CS2 Offsets");
    expect(text).toContain("/offsets");
  });
});

describe("GET /scalar", () => {
  it("returns 200 with HTML", async () => {
    const res = await app.fetch(request("/scalar"));
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html.length).toBeGreaterThan(0);
    expect(html).toContain("<");
  });
});

describe("404", () => {
  it("returns 404 for unknown path", async () => {
    const res = await app.fetch(request("/nonexistent"));
    expect(res.status).toBe(404);
  });

  it("returns 404 for unknown method on known path", async () => {
    const res = await app.fetch(request("/offsets", { method: "POST" }));
    expect(res.status).toBe(404);
  });
});

describe("rate limiting", () => {
  it("returns 429 when offsets limit exceeded", async () => {
    for (let i = 0; i < 31; i++) {
      const res = await app.fetch(request("/offsets"));
      if (res.status === 429) {
        const body = await fetchJson(res);
        rateLimitResponseSchema.parse(body);
        return;
      }
    }
    expect.unreachable("Expected 429 after 31 requests");
  });

  it("429 response includes rate limit headers", async () => {
    let lastRes: Response | null = null;
    for (let i = 0; i < 31; i++) {
      lastRes = await app.fetch(request("/offsets"));
      if (lastRes.status === 429) {
        break;
      }
    }
    expect(lastRes?.status).toBe(429);
    const header =
      lastRes?.headers.get("RateLimit-Limit") ??
      lastRes?.headers.get("RateLimit");
    expect(header).toBeTruthy();
  });
});
