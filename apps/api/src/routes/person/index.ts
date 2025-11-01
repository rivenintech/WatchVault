import { sValidator } from "@hono/standard-validator";
import { Hono } from "hono";
import * as v from "valibot";
import { fetchTMDB } from "../../utils/fetchTMDB";
import { PersonDetails, PersonParam, PersonQuery } from "./schema";

const app = new Hono<{ Bindings: CloudflareBindings }>();

const routes = app.get("/:id", sValidator("param", PersonParam), sValidator("query", PersonQuery), async (c) => {
    const { id } = c.req.valid("param") || {};
    const { language = "en-US" } = c.req.valid("query") || {};

    const response = await fetchTMDB(`person/${id}?language=${language}&append_to_response=combined_credits`, c.env.TMDB_API_KEY);
    const responseData = await response.json();
    const parsed = v.safeParse(PersonDetails, responseData);

    if (!parsed.success) {
        return c.json({ error: "Failed to parse TMDB response", details: parsed.issues }, 500);
    }

    return c.json(parsed.output, 200);
});

export default routes;
