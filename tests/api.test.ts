import { describe, expect, it } from "bun:test";
import app from "../src/index.js";
import {
  indexResponseSchema,
  offsetsResponseSchema,
  rateLimitResponseSchema,
} from "../src/schemas.js";

async function fetchJson(res: Response): Promise<unknown> {
  return await res.json();
}

describe("GET /", () => {
  it("returns 200 with valid index response", async () => {
    const res = await app.fetch(new Request("http://localhost/"));
    expect(res.status).toBe(200);
    const body = await fetchJson(res);
    indexResponseSchema.parse(body);
  });

  it("response has correct shape", async () => {
    const res = await app.fetch(new Request("http://localhost/"));
    const body = await fetchJson(res);
    const parsed = indexResponseSchema.parse(body);
    expect(parsed.endpoints.offsets).toBe("/offsets");
    expect(parsed.ok).toBe(true);
  });
});

describe("GET /offsets", () => {
  it("returns 200 with valid offsets response", async () => {
    const res = await app.fetch(new Request("http://localhost/offsets"));
    expect(res.status).toBe(200);
    const body = await fetchJson(res);
    offsetsResponseSchema.parse(body);
  });

  it("response has required offset keys", async () => {
    const res = await app.fetch(new Request("http://localhost/offsets"));
    const body = await fetchJson(res);
    const parsed = offsetsResponseSchema.parse(body);
    expect(parsed.offsets).toBeDefined();
    expect(typeof parsed.offsets).toBe("object");
    expect(parsed.missingKeys).toBeInstanceOf(Array);
  });
});

describe("rate limiting", () => {
  it("returns 429 when offsets rate limit exceeded", async () => {
    for (let i = 0; i < 31; i++) {
      const res = await app.fetch(new Request("http://localhost/offsets"));
      if (res.status === 429) {
        const body = await fetchJson(res);
        rateLimitResponseSchema.parse(body);
        return;
      }
    }
    expect.unreachable("Expected 429 after 31 requests");
  });
});
