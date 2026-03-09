import type { Hono } from "hono";
import { createApp } from "./lib/app.js";

const app = await createApp();
export default app as unknown as Hono;
