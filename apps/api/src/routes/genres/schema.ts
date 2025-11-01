import * as v from "valibot";

export const GenresQuery = v.object({
    language: v.optional(v.string()),
});

export const GenresParam = v.object({
    mediaType: v.union([v.literal("movie"), v.literal("tv")]),
});

export const GenresList = v.object({
    genres: v.array(v.object({ id: v.number(), name: v.string() })),
});
