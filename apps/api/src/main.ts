import { Hono } from "hono";
import configurationRoute from "./routes/configuration";

const app = new Hono<{ Bindings: CloudflareBindings }>();

const route = app.route("/configuration", configurationRoute);

export default app;
export type AppType = typeof route;
