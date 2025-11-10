import { sValidator } from "@hono/standard-validator";
import { Hono } from "hono";
import * as v from "valibot";
import { fetchTMDB } from "../../utils/fetchTMDB";
import { ConfigurationDetails, LanguagesList, ProvidersList, RegionsList, RegionsQuery, WatchProvidersParam, WatchProvidersQuery } from "./schema";

const app = new Hono<{ Bindings: CloudflareBindings }>();

const routes = app
    .get("/", async (c) => {
        const response = await fetchTMDB(`configuration`, c.env.TMDB_API_KEY);
        const responseData = await response.json();
        const parsed = v.safeParse(ConfigurationDetails, responseData);

        if (!parsed.success) {
            return c.json({ error: "Failed to parse TMDB response", details: parsed.issues }, 500);
        }

        return c.json(parsed.output, 200);
    })
    .get("/languages", async (c) => {
        const response = await fetchTMDB(`configuration/languages`, c.env.TMDB_API_KEY);
        const responseData = await response.json();
        const parsed = v.safeParse(LanguagesList, responseData);

        if (!parsed.success) {
            return c.json({ error: "Failed to parse TMDB response", details: parsed.issues }, 500);
        }

        return c.json(parsed.output, 200);
    })
    .get("/regions", sValidator("query", RegionsQuery), async (c) => {
        const { language = "en-US" } = c.req.valid("query") || {};

        const response = await fetchTMDB(`watch/providers/regions?language=${language}`, c.env.TMDB_API_KEY);
        const responseData = await response.json();
        const parsed = v.safeParse(RegionsList, responseData);

        if (!parsed.success) {
            return c.json({ error: "Failed to parse TMDB response", details: parsed.issues }, 500);
        }

        return c.json(parsed.output, 200);
    })
    .get("/watch-providers/:mediaType", sValidator("param", WatchProvidersParam), sValidator("query", WatchProvidersQuery), async (c) => {
        const { mediaType } = c.req.valid("param");
        const { language = "en-US", region = "US" } = c.req.valid("query") || {};

        const response = await fetchTMDB(`watch/providers/${mediaType}?language=${language}&watch_region=${region}`, c.env.TMDB_API_KEY);
        const responseData = await response.json();
        const parsed = v.safeParse(ProvidersList, responseData);

        if (!parsed.success) {
            return c.json({ error: "Failed to parse TMDB response", details: parsed.issues }, 500);
        }

        return c.json(parsed.output, 200);
    });

export default routes;
