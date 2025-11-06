import * as v from "valibot";

export const Recommendations = v.object({
    results: v.array(v.object({ media_type: v.union([v.literal("movie"), v.literal("tv")]), id: v.number(), poster_path: v.string() })),
});

export const Credits = v.object({
    cast: v.array(
        v.object({
            id: v.number(),
            profile_path: v.nullable(v.string()),
            name: v.string(),
            roles: v.array(
                v.object({
                    character: v.string(),
                })
            ),
            order: v.number(),
        })
    ),
});

export const Provider = v.object({
    provider_id: v.number(),
    display_priority: v.number(),
    logo_path: v.string(),
    provider_name: v.string(),
});

export const WatchProviders = v.object({
    results: v.record(
        v.string(),
        v.object({
            link: v.string(),
            flatrate: v.optional(v.array(Provider)),
            rent: v.optional(v.array(Provider)),
            buy: v.optional(v.array(Provider)),
        })
    ),
});
