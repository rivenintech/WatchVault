import { sValidator } from "@hono/standard-validator";
import { Hono } from "hono";
import * as v from "valibot";
import { fetchTMDB } from "../../utils/fetchTMDB";
import { Discover, DiscoverParam, DiscoverQuery } from "./schema";

const app = new Hono<{ Bindings: CloudflareBindings }>();

const routes = app.get("/:mediaType", sValidator("param", DiscoverParam), sValidator("query", DiscoverQuery), async (c) => {
  const { mediaType } = c.req.valid("param") || {};
  const { page, language = "en-US", region = "US", sortBy = "popularity", genres, watchProviders } = c.req.valid("query") || {};

  const sortType = sortBy === "popularity" ? "popularity.desc" : "vote_average.desc&vote_count.gte=100";
  const genresList = genres ? `&with_genres=${genres.join("|")}` : "";
  const watchProvidersList = watchProviders ? `&with_watch_providers=${watchProviders.join("|")}` : "";
  const path = mediaType === "tv" ? "tv?watch_region=" : "movie?include_video=false&region=";

  const response = await fetchTMDB(
    `discover/${path}${region}&language=${language}&page=${page}&sort_by=${sortType}${genresList}${watchProvidersList}`,
    c.env.TMDB_API_KEY,
  );
  const responseData = await response.json();
  const parsed = v.safeParse(Discover, responseData);

  if (!parsed.success) {
    return c.json({ error: "Failed to parse TMDB response", details: parsed.issues }, 500);
  }

  return c.json(parsed.output, 200);
});

export default routes;
