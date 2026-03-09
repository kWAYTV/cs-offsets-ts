import type { Hono } from "hono";
import { createApp } from "./app/app.js";

const app: Hono = createApp();

export default app;
