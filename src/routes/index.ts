import { Hono } from "hono";

export function createIndexRouter() {
  const router = new Hono();

  router.get("/", (c) => {
    return c.json({
      ok: true,
      timestamp: new Date().toISOString(),
      endpoints: { offsets: "/offsets" },
    });
  });

  return router;
}
