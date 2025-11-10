import { sValidator } from "@hono/standard-validator";
import { Hono } from "hono";
import * as v from "valibot";
import { fetchTMDB } from "../../../utils/fetchTMDB";
import { groupWatchProviders } from "../../../utils/groupWatchProviders";
import { TVDetails, TVDetailsParam, TVDetailsQuery, TvRuntime, TvRuntimeEp, TvSeasons, TvToLocalDB } from "./schema";
import seasonRoute from "./season";

const app = new Hono<{ Bindings: CloudflareBindings }>();

const routes = app
    .route("/:id/season", seasonRoute)
    .get("/:id", sValidator("param", TVDetailsParam), sValidator("query", TVDetailsQuery), async (c) => {
        const { id } = c.req.valid("param") || {};
        const { language = "en-US", region = "US" } = c.req.valid("query") || {};

        const response = await fetchTMDB(
            `tv/${id}?language=${language}&append_to_response=recommendations,watch/providers,aggregate_credits`,
            c.env.TMDB_API_KEY
        );
        const responseData = await response.json();
        const parsed = v.safeParse(TVDetails, responseData);

        if (!parsed.success) {
            return c.json({ error: "Failed to parse TMDB response", details: parsed.issues }, 500);
        }

        const watchProvidersProcessed = groupWatchProviders(parsed.output["watch/providers"], region);

        return c.json({ ...parsed.output, "watch/providers": watchProvidersProcessed }, 200);
    })
    .get("/:id/to-local-db", sValidator("param", TVDetailsParam), sValidator("query", v.pick(TVDetailsQuery, ["language"])), async (c) => {
        const { id } = c.req.valid("param") || {};
        const { language = "en-US" } = c.req.valid("query") || {};

        const response = await fetchTMDB(`tv/${id}?language=${language}`, c.env.TMDB_API_KEY);
        const responseData = await response.json();
        const parsedTvDetails = v.safeParse(TvToLocalDB, responseData);

        if (!parsedTvDetails.success) {
            return c.json({ error: "Failed to parse TMDB response", details: parsedTvDetails.issues }, 500);
        }

        const seasonKeys = parsedTvDetails.output.seasons.map((season) => `season/${season.season_number}`);
        const seasonKeysChunks = splitArrayIntoChunks(seasonKeys, 20);
        const mergedData = {};

        for (const chunk of seasonKeysChunks) {
            const data = await fetchTMDB(`tv/${id}?language=${language}&append_to_response=${chunk.join(",")}`, c.env.TMDB_API_KEY);
            Object.assign(mergedData, data);
        }

        const parsedTVSeasons = v.parse(TvSeasons, mergedData);

        const seasonsWithEp = parsedTVSeasons.seasons.map((season) => ({
            ...season,
            episodes: parsedTVSeasons[`season/${season.season_number}`].episodes,
        }));

        const completeTvInfo = {
            ...parsedTvDetails.output,
            seasons: seasonsWithEp,
        };

        return c.json(completeTvInfo, 200);
    })
    .get("/:id/total-runtime", sValidator("param", TVDetailsParam), async (c) => {
        const { id } = c.req.valid("param") || {};

        const response = await fetchTMDB(`tv/${id}`, c.env.TMDB_API_KEY);
        const responseData = await response.json();
        const parsedTvDetails = v.safeParse(TvRuntime, responseData);

        if (!parsedTvDetails.success) {
            return c.json({ error: "Failed to parse TMDB response", details: parsedTvDetails.issues }, 500);
        }

        const seasonKeys = parsedTvDetails.output.seasons.map((season) => `season/${season.season_number}`);
        const seasonKeysChunks = splitArrayIntoChunks(seasonKeys, 20);
        const mergedData = {};

        for (const chunk of seasonKeysChunks) {
            const response = await fetchTMDB(`tv/${id}?append_to_response=${chunk.join(",")}`, c.env.TMDB_API_KEY);
            const responseData = await response.json();
            Object.assign(mergedData, responseData);
        }

        // Remove all fields except season/XX
        const filteredData = Object.fromEntries(Object.entries(mergedData).filter(([key]) => key.startsWith("season/")));

        const parsedTVSeasons = v.parse(TvRuntimeEp, filteredData);

        const totalRuntime = seasonKeys.reduce((total, seasonKey) => {
            const episodes = parsedTVSeasons[seasonKey].episodes;
            const seasonRuntime = episodes.reduce((epTotal, ep) => epTotal + (ep.runtime || 0), 0);
            return total + seasonRuntime;
        }, 0);

        return c.json(totalRuntime, 200);
    });

const splitArrayIntoChunks = (array: any[], chunkSize: number) => {
    if (chunkSize <= 0) throw new Error("Chunk size must be greater than 0");

    const chunks = [];

    for (let i = 0; i < array.length; i += chunkSize) {
        const chunk = array.slice(i, i + chunkSize);
        chunks.push(chunk);
    }

    return chunks;
};

export default routes;
