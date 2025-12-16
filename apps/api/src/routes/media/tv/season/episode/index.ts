import { sValidator } from "@hono/standard-validator";
import { Hono } from "hono";
import * as v from "valibot";
import { fetchTMDB } from "../../../../../utils/fetchTMDB";
import { TvEpisode, TVEpisodeParam, TVEpisodeQuery } from "./schema";

const app = new Hono<{ Bindings: CloudflareBindings }>();

const routes = app.get("/:episodeNumber", sValidator("param", TVEpisodeParam), sValidator("query", TVEpisodeQuery), async (c) => {
  const { id, seasonNumber, episodeNumber } = c.req.valid("param") || {};
  const { language = "en-US" } = c.req.valid("query") || {};

  const response = await fetchTMDB(`tv/${id}/season/${seasonNumber}/episode/${episodeNumber}?language=${language}`, c.env.TMDB_API_KEY);
  const responseData = await response.json();
  const parsed = v.safeParse(TvEpisode, responseData);

  if (!parsed.success) {
    return c.json({ error: "Failed to parse TMDB response", details: parsed.issues }, 500);
  }

  return c.json(parsed.output, 200);
});

export default routes;
