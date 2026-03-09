import app from "./index.js";

const port = Number(process.env.PORT) || 3000;

Bun.serve({
  fetch: app.fetch,
  port,
});

console.log(`Server running at http://localhost:${port}`);
console.log(`GET  http://localhost:${port}/offsets`);
