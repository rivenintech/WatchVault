import * as v from "valibot";

export const SearchQuery = v.optional(
    v.object({
        language: v.optional(v.string()),
        q: v.string(),
    })
);

const person = v.object({
    media_type: v.literal("person"),
    id: v.number(),
    profile_path: v.nullable(v.string()),
    name: v.string(),
    known_for: v.array(
        v.union([v.object({ media_type: v.literal("movie"), title: v.string() }), v.object({ media_type: v.literal("tv"), name: v.string() })])
    ),
});

const media = v.object({
    id: v.number(),
    poster_path: v.nullable(v.string()),
    overview: v.string(),
});

const movie = v.intersect([
    media,
    v.object({
        media_type: v.literal("movie"),
        release_date: v.string(),
        title: v.string(),
    }),
]);

const tv = v.intersect([
    media,
    v.object({
        media_type: v.literal("tv"),
        first_air_date: v.string(),
        name: v.string(),
    }),
]);

export const Search = v.object({
    results: v.array(v.union([movie, tv, person])),
});
