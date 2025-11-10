import * as v from "valibot";

export const ConfigurationDetails = v.object({
    images: v.object({
        secure_base_url: v.string(),
        backdrop_sizes: v.array(v.string()),
        logo_sizes: v.array(v.string()),
        poster_sizes: v.array(v.string()),
        profile_sizes: v.array(v.string()),
        still_sizes: v.array(v.string()),
    }),
});

export const LanguagesList = v.array(
    v.object({
        iso_639_1: v.pipe(v.string(), v.nonEmpty()),
        english_name: v.pipe(v.string(), v.nonEmpty()),
        name: v.pipe(
            v.string(),
            v.transform((input) => (input === "" ? undefined : input))
        ),
    })
);

export const RegionsList = v.object({
    results: v.array(
        v.object({
            iso_3166_1: v.pipe(v.string(), v.nonEmpty()),
            english_name: v.pipe(v.string(), v.nonEmpty()),
            native_name: v.pipe(v.string(), v.nonEmpty()),
        })
    ),
});

export const ProvidersList = v.object({
    results: v.array(
        v.object({
            display_priority: v.number(),
            logo_path: v.string(),
            provider_id: v.number(),
            provider_name: v.string(),
        })
    ),
});

export const RegionsQuery = v.optional(
    v.object({
        language: v.optional(v.string()),
    })
);

export const WatchProvidersParam = v.object({
    mediaType: v.union([v.literal("movie"), v.literal("tv")]),
});

export const WatchProvidersQuery = v.optional(
    v.object({
        language: v.optional(v.string()),
        region: v.optional(v.string()),
    })
);
