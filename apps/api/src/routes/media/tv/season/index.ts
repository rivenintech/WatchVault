import { sValidator } from "@hono/standard-validator";
import { Hono } from "hono";
import * as v from "valibot";
import { fetchTMDB } from "../../../../utils/fetchTMDB";
import episodeRoute from "./episode";
import { TvSeason, TVSeasonParam, TVSeasonQuery } from "./schema";

const app = new Hono<{ Bindings: CloudflareBindings }>();

const routes = app
    .route("/:seasonNumber/episode", episodeRoute)
    .get("/:seasonNumber", sValidator("param", TVSeasonParam), sValidator("query", TVSeasonQuery), async (c) => {
        const { id, seasonNumber } = c.req.valid("param") || {};
        const { language = "en-US" } = c.req.valid("query") || {};

        const response = await fetchTMDB(`tv/${id}/season/${seasonNumber}?language=${language}`, c.env.TMDB_API_KEY);
        const responseData = await response.json();
        const parsed = v.safeParse(TvSeason, responseData);

        if (!parsed.success) {
            return c.json({ error: "Failed to parse TMDB response", details: parsed.issues }, 500);
        }

        return c.json({ ...parsed.output, episode_count: parsed.output.episodes.length }, 200);
    });

export default routes;
