import * as v from "valibot";

export const PersonParam = v.object({
    id: v.string(),
});

export const PersonQuery = v.object({
    language: v.optional(v.string()),
});

export const PersonDetails = v.object({
    id: v.number(),
    profile_path: v.nullable(v.string()),
    name: v.string(),
    birthday: v.nullable(v.string()),
    place_of_birth: v.nullable(v.string()),
    deathday: v.nullable(v.string()),
    biography: v.string(),
    combined_credits: v.object({
        cast: v.array(
            v.intersect([
                v.object({
                    id: v.number(),
                    character: v.string(),
                    poster_path: v.nullable(v.string()),
                    overview: v.string(),
                }),
                v.variant("media_type", [
                    v.object({
                        media_type: v.literal("movie"),
                        release_date: v.nullable(v.string()),
                        title: v.string(),
                    }),
                    v.object({
                        media_type: v.literal("tv"),
                        first_air_date: v.nullable(v.string()),
                        name: v.string(),
                    }),
                ]),
            ])
        ),
    }),
});
