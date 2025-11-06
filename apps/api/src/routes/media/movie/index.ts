import { sValidator } from "@hono/standard-validator";
import { Hono } from "hono";
import * as v from "valibot";
import { fetchTMDB } from "../../../utils/fetchTMDB";
import { groupWatchProviders } from "../../../utils/groupWatchProviders";
import { Movie, MovieParam, MovieQuery } from "./schema";

const app = new Hono<{ Bindings: CloudflareBindings }>();

const routes = app.get("/:id", sValidator("param", MovieParam), sValidator("query", MovieQuery), async (c) => {
    const { id } = c.req.valid("param") || {};
    const { language = "en-US", region = "US" } = c.req.valid("query") || {};

    const response = await fetchTMDB(
        `movie/${id}?language=${language}&append_to_response=credits,recommendations,watch/providers`,
        c.env.TMDB_API_KEY
    );
    const responseData = await response.json();
    const parsed = v.safeParse(Movie, responseData);

    if (!parsed.success) {
        return c.json({ error: "Failed to parse TMDB response", details: parsed.issues }, 500);
    }

    const watchProvidersProcessed = groupWatchProviders(parsed.output["watch/providers"], region);

    return c.json({ ...parsed.output, "watch/providers": watchProvidersProcessed }, 200);
});

export default routes;
