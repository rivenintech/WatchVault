import { Hono } from "hono";
import configurationRoute from "./routes/configuration";
import discoverRoute from "./routes/discover";
import genresRoute from "./routes/genres";
import movieRoute from "./routes/media/movie";
import tvRoute from "./routes/media/tv";
import personRoute from "./routes/person";
import searchRoute from "./routes/search";

const app = new Hono<{ Bindings: CloudflareBindings }>();

const route = app
  .route("/configuration", configurationRoute)
  .route("/search", searchRoute)
  .route("/discover", discoverRoute)
  .route("/genres", genresRoute)
  .route("/person", personRoute)
  .route("/tv", tvRoute)
  .route("/movie", movieRoute);

export default app;
export type AppType = typeof route;
