import * as v from "valibot";
import { Credits, Recommendations, WatchProviders } from "../schema";

export const TVDetailsParam = v.object({
  id: v.pipe(v.string(), v.transform(parseInt)),
});

export const TVDetailsQuery = v.object({
  language: v.optional(v.string()),
  region: v.optional(v.string()),
});

export const TVDetails = v.object({
  backdrop_path: v.nullable(v.string()),
  poster_path: v.nullable(v.string()),
  first_air_date: v.nullable(v.string()),
  name: v.string(),
  genres: v.array(
    v.object({
      id: v.number(),
      name: v.string(),
    }),
  ),
  overview: v.string(),
  id: v.number(),
  seasons: v.array(
    v.object({
      episode_count: v.number(),
      id: v.number(),
      season_number: v.number(),
      poster_path: v.nullable(v.string()),
      name: v.string(),
      overview: v.string(),
    }),
  ),
  "watch/providers": WatchProviders,
  aggregate_credits: Credits,
  recommendations: Recommendations,
});

export const TvToLocalDB = v.object({
  id: v.number(),
  name: v.string(),
  poster_path: v.nullable(v.string()),
  backdrop_path: v.nullable(v.string()),
  first_air_date: v.nullable(v.string()),
  overview: v.string(),
  genres: v.array(
    v.object({
      id: v.number(),
    }),
  ),
  seasons: v.array(
    v.object({
      season_number: v.number(),
    }),
  ),
});

export const TvSeasons = v.objectWithRest(
  {
    seasons: v.array(
      v.object({
        id: v.number(),
        name: v.string(),
        season_number: v.number(),
        overview: v.string(),
        poster_path: v.nullable(v.string()),
      }),
    ),
  },
  v.object({
    episodes: v.array(
      v.object({
        id: v.number(),
        name: v.string(),
        episode_number: v.number(),
        overview: v.string(),
        runtime: v.nullable(v.number()),
        air_date: v.nullable(v.string()),
        vote_average: v.number(),
        vote_count: v.number(),
      }),
    ),
  }),
);

export const TvRuntime = v.object({
  seasons: v.array(
    v.object({
      season_number: v.number(),
    }),
  ),
});

export const TvRuntimeEp = v.record(
  v.string(),
  v.object({
    episodes: v.array(
      v.object({
        runtime: v.nullable(v.number()),
      }),
    ),
  }),
);
