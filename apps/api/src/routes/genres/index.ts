import { sValidator } from "@hono/standard-validator";
import { Hono } from "hono";
import * as v from "valibot";
import { fetchTMDB } from "../../utils/fetchTMDB";
import { GenresList, GenresParam, GenresQuery } from "./schema";

const app = new Hono<{ Bindings: CloudflareBindings }>();

const routes = app.get("/:mediaType", sValidator("param", GenresParam), sValidator("query", GenresQuery), async (c) => {
    const { mediaType } = c.req.valid("param") || {};
    const { language = "en-US" } = c.req.valid("query") || {};

    const response = await fetchTMDB(`genre/${mediaType}/list?language=${language}`, c.env.TMDB_API_KEY);
    const responseData = await response.json();
    const parsed = v.safeParse(GenresList, responseData);

    if (!parsed.success) {
        return c.json({ error: "Failed to parse TMDB response", details: parsed.issues }, 500);
    }

    return c.json(parsed.output, 200);
});

export default routes;
