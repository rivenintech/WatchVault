import * as v from "valibot";

export const DiscoverParam = v.object({
  mediaType: v.union([v.literal("movie"), v.literal("tv")]),
});

const stringOrStringArray = v.optional(
  v.union([
    v.pipe(
      v.string(),
      v.transform((val) => [val]),
    ),
    v.array(v.string()),
  ]),
);

export const DiscoverQuery = v.object({
  page: v.string(),
  sortBy: v.optional(v.union([v.literal("popularity"), v.literal("rating")])),
  genres: stringOrStringArray,
  watchProviders: stringOrStringArray,
  region: v.optional(v.string()),
  language: v.optional(v.string()),
});

export const Discover = v.object({
  page: v.number(),
  results: v.array(
    v.object({
      id: v.number(),
      poster_path: v.nullable(v.string()),
      vote_average: v.number(),
    }),
  ),
});
