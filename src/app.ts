import type { Hono } from "hono";
import { createApp } from "./app/app.js";

const app = await createApp();
export default app as Hono;
