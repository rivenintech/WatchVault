import * as v from "valibot";
import { Credits, Recommendations, WatchProviders } from "../schema";

export const Movie = v.object({
  id: v.number(),
  title: v.string(),
  overview: v.string(),
  release_date: v.string(),
  runtime: v.nullable(v.number()),
  backdrop_path: v.nullable(v.string()),
  poster_path: v.nullable(v.string()),
  genres: v.array(
    v.object({
      id: v.number(),
      name: v.string(),
    }),
  ),
  "watch/providers": WatchProviders,
  credits: Credits,
  recommendations: Recommendations,
});

export const MovieParam = v.object({
  id: v.pipe(v.string(), v.transform(parseInt)),
});

export const MovieQuery = v.object({
  language: v.optional(v.string()),
  region: v.optional(v.string()),
});
