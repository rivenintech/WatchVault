import * as v from "valibot";

export const TVSeasonParam = v.object({
    id: v.pipe(v.string(), v.transform(parseInt)),
    seasonNumber: v.pipe(v.string(), v.transform(parseInt)),
});

export const TVSeasonQuery = v.object({
    language: v.optional(v.string()),
});

export const TvSeason = v.object({
    name: v.string(),
    episodes: v.array(
        v.object({
            id: v.number(),
            name: v.string(),
            episode_number: v.number(),
            vote_average: v.number(),
        })
    ),
});
