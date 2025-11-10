import * as v from "valibot";

export const TVEpisodeParam = v.object({
    id: v.pipe(v.string(), v.transform(parseInt)),
    seasonNumber: v.pipe(v.string(), v.transform(parseInt)),
    episodeNumber: v.pipe(v.string(), v.transform(parseInt)),
});

export const TVEpisodeQuery = v.object({
    language: v.optional(v.string()),
});

export const TvEpisode = v.object({
    id: v.number(),
    still_path: v.nullable(v.string()),
    guest_stars: v.array(
        v.object({
            id: v.number(),
            profile_path: v.nullable(v.string()),
            name: v.string(),
            character: v.string(),
            order: v.number(),
        })
    ),
});
