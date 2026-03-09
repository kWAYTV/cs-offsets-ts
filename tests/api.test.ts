import { describe, expect, it } from "bun:test";
import app from "../src/app.js";
import { offsetsResponseSchema } from "../src/lib/schemas/offsets-response.js";
import { rateLimitResponseSchema } from "../src/lib/schemas/rate-limit.js";

async function fetchJson(res: Response): Promise<unknown> {
  return await res.json();
}

describe("GET /", () => {
  it("returns 200 with ok and endpoints", async () => {
    const res = await app.fetch(new Request("http://localhost/"));
    expect(res.status).toBe(200);
    const body = (await fetchJson(res)) as {
      ok: boolean;
      endpoints: { offsets: string; doc: string; scalar: string; llms: string };
    };
    expect(body.ok).toBe(true);
    expect(body.endpoints.offsets).toBe("/offsets");
    expect(body.endpoints.doc).toBe("/doc");
    expect(body.endpoints.scalar).toBe("/scalar");
    expect(body.endpoints.llms).toBe("/llms.txt");
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

describe("GET /doc", () => {
  it("returns 200 with OpenAPI JSON", async () => {
    const res = await app.fetch(new Request("http://localhost/doc"));
    expect(res.status).toBe(200);
    const body = await fetchJson(res);
    expect(body).toHaveProperty("openapi");
    expect(body).toHaveProperty("info");
    expect((body as { paths: object }).paths).toHaveProperty("/");
    expect((body as { paths: object }).paths).toHaveProperty("/offsets");
  });
});

describe("GET /llms.txt", () => {
  it("returns 200 with markdown content", async () => {
    const res = await app.fetch(new Request("http://localhost/llms.txt"));
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("CS2 Offsets");
    expect(text).toContain("/offsets");
  });
});

describe("GET /scalar", () => {
  it("returns 200", async () => {
    const res = await app.fetch(new Request("http://localhost/scalar"));
    expect(res.status).toBe(200);
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
