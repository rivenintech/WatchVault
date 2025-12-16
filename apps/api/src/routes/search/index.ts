import { sValidator } from "@hono/standard-validator";
import { Hono } from "hono";
import * as v from "valibot";
import { fetchTMDB } from "../../utils/fetchTMDB";
import { Search, SearchQuery } from "./schema";

const app = new Hono<{ Bindings: CloudflareBindings }>();

const routes = app.get("/", sValidator("query", SearchQuery), async (c) => {
  const { language = "en-US", q: searchQuery } = c.req.valid("query") || {};

  const response = await fetchTMDB(`search/multi?language=${language}&query=${searchQuery}`, c.env.TMDB_API_KEY);
  const responseData = await response.json();
  const parsed = v.safeParse(Search, responseData);

  if (!parsed.success) {
    return c.json({ error: "Failed to parse TMDB response", details: parsed.issues }, 500);
  }

  return c.json(parsed.output, 200);
});

export default routes;
