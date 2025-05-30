import * as v from "valibot";

// Common schemas - only used as a base for other schemas
const CommonMediaInfo = v.object({
    adult: v.boolean(),
    backdrop_path: v.nullable(v.string()),
    id: v.number(),
    original_language: v.string(),
    overview: v.string(),
    popularity: v.number(),
    poster_path: v.nullable(v.string()),
    vote_average: v.number(),
    vote_count: v.number(),
});

const CommonPersonInfo = v.object({
    adult: v.boolean(),
    gender: v.number(),
    id: v.number(),
    known_for_department: v.string(),
    name: v.string(),
    original_name: v.string(),
    popularity: v.number(),
    profile_path: v.nullable(v.string()),
});

const DiscoverMovie = v.intersect([
    CommonMediaInfo,
    v.object({
        genre_ids: v.array(v.number()),
        original_title: v.string(),
        release_date: v.string(),
        title: v.string(),
        video: v.boolean(),
    }),
]);

const DiscoverTV = v.intersect([
    CommonMediaInfo,
    v.object({
        first_air_date: v.string(),
        genre_ids: v.array(v.number()),
        name: v.string(),
        original_name: v.string(),
        origin_country: v.array(v.string()),
    }),
]);

const SearchMovie = v.intersect([
    DiscoverMovie,
    v.object({
        media_type: v.literal("movie"),
    }),
]);

const SearchTV = v.intersect([
    DiscoverTV,
    v.object({
        media_type: v.literal("tv"),
    }),
]);

const SearchPerson = v.intersect([
    CommonPersonInfo,
    v.object({
        known_for: v.array(v.union([SearchTV, SearchMovie])),
        media_type: v.literal("person"),
    }),
]);

const Country = v.object({
    iso_3166_1: v.string(),
    name: v.string(),
});

const Language = v.object({
    english_name: v.string(),
    iso_639_1: v.string(),
    name: v.string(),
});

const CastMember = v.intersect([
    CommonPersonInfo,
    v.object({
        character: v.string(),
        credit_id: v.string(),
        order: v.number(),
    }),
]);

const CrewMember = v.intersect([
    CommonPersonInfo,
    v.object({
        credit_id: v.string(),
        department: v.string(),
        job: v.string(),
    }),
]);

const Creator = v.object({
    id: v.number(),
    credit_id: v.string(),
    name: v.string(),
    gender: v.number(),
    profile_path: v.nullable(v.string()),
});

const ProductionCompany = v.object({
    id: v.number(),
    logo_path: v.nullable(v.string()),
    name: v.string(),
    origin_country: v.string(),
});

const Recommendations = v.object({
    page: v.number(),
    results: v.array(v.union([SearchMovie, SearchTV])),
    total_pages: v.number(),
    total_results: v.number(),
});

const Credits = v.object({
    id: v.optional(v.number()),
    cast: v.array(CastMember),
    crew: v.array(CrewMember),
});

const CastMemberWithRoles = v.intersect([
    CommonPersonInfo,
    v.object({
        roles: v.array(
            v.object({
                credit_id: v.string(),
                character: v.string(),
                episode_count: v.number(),
            }),
        ),
        total_episode_count: v.number(),
        order: v.number(),
    }),
]);

const CrewMemberWithJobs = v.intersect([
    CommonPersonInfo,
    v.object({
        jobs: v.array(
            v.object({
                credit_id: v.string(),
                job: v.string(),
                episode_count: v.number(),
            }),
        ),
        department: v.string(),
        total_episode_count: v.number(),
    }),
]);

const AggregateCredits = v.object({
    cast: v.array(CastMemberWithRoles),
    crew: v.array(CrewMemberWithJobs),
});

const Episode = v.object({
    id: v.number(),
    name: v.string(),
    overview: v.string(),
    vote_average: v.number(),
    vote_count: v.number(),
    air_date: v.nullable(v.string()),
    episode_number: v.number(),
    production_code: v.string(),
    runtime: v.nullable(v.number()),
    season_number: v.number(),
    show_id: v.number(),
    still_path: v.nullable(v.string()),
});

const Season = v.object({
    air_date: v.nullable(v.string()),
    episode_count: v.number(),
    id: v.number(),
    name: v.string(),
    overview: v.string(),
    poster_path: v.nullable(v.string()),
    season_number: v.number(),
    vote_average: v.number(),
});

const Genre = v.object({ id: v.number(), name: v.string() });

// Schemas for specific endpoints
export const EpisodeDetails = v.intersect([
    v.omit(Episode, ["show_id"]),
    v.object({
        crew: v.array(CrewMember),
        guest_stars: v.array(CastMember),
    }),
]);

export const GenresList = v.object({
    genres: v.array(Genre),
});

export const Region = v.object({
    results: v.array(v.object({ iso_3166_1: v.string(), english_name: v.string(), native_name: v.string() })),
});

export const Provider = v.object({
    display_priority: v.number(),
    logo_path: v.string(),
    provider_id: v.number(),
    provider_name: v.string(),
});

export const ProvidersList = v.object({
    results: v.array(Provider),
});

export const WatchProviders = v.object({
    results: v.objectWithRest(
        {},
        v.object({
            link: v.string(),
            flatrate: v.optional(v.array(Provider)),
            rent: v.optional(v.array(Provider)),
            buy: v.optional(v.array(Provider)),
        }),
    ),
});

export const Discover = v.object({
    page: v.number(),
    results: v.array(v.union([DiscoverMovie, DiscoverTV])),
    total_pages: v.number(),
    total_results: v.number(),
});

export const SearchMulti = v.object({
    page: v.number(),
    results: v.array(v.union([SearchMovie, SearchTV, SearchPerson])),
    total_pages: v.number(),
    total_results: v.number(),
});

export const MovieDetails = v.intersect([
    CommonMediaInfo,
    v.object({
        belongs_to_collection: v.nullable(
            v.object({
                backdrop_path: v.nullable(v.string()),
                id: v.number(),
                name: v.string(),
                poster_path: v.nullable(v.string()),
            }),
        ),
        budget: v.number(),
        genres: v.array(Genre),
        homepage: v.nullable(v.string()),
        imdb_id: v.nullable(v.string()),
        original_title: v.string(),
        production_companies: v.array(ProductionCompany),
        production_countries: v.array(Country),
        release_date: v.string(),
        revenue: v.number(),
        runtime: v.nullable(v.number()),
        spoken_languages: v.array(Language),
        status: v.string(),
        tagline: v.string(),
        title: v.string(),
        video: v.boolean(),
        recommendations: v.nullish(Recommendations),
        "watch/providers": v.nullish(WatchProviders),
        credits: v.nullish(Credits),
    }),
]);

export const TvDetails = v.intersect([
    CommonMediaInfo,
    v.object({
        created_by: v.array(Creator),
        episode_run_time: v.array(v.number()),
        first_air_date: v.string(),
        genres: v.array(Genre),
        homepage: v.nullable(v.string()),
        in_production: v.boolean(),
        languages: v.array(v.string()),
        last_air_date: v.string(),
        last_episode_to_air: Episode,
        name: v.string(),
        next_episode_to_air: v.nullable(Episode),
        networks: v.array(ProductionCompany),
        number_of_episodes: v.number(),
        number_of_seasons: v.number(),
        origin_country: v.array(v.string()),
        original_name: v.string(),
        popularity: v.number(),
        production_companies: v.array(ProductionCompany),
        production_countries: v.array(Country),
        seasons: v.array(Season),
        spoken_languages: v.array(Language),
        status: v.string(),
        tagline: v.string(),
        type: v.string(),
        recommendations: v.nullish(Recommendations),
        "watch/providers": v.nullish(WatchProviders),
        aggregate_credits: v.nullish(AggregateCredits),
    }),
]);

export const SeasonDetails = v.intersect([
    v.omit(Season, ["episode_count"]),
    v.object({
        _id: v.string(),
        episodes: v.array(v.intersect([EpisodeDetails, v.object({ show_id: v.number() })])),
    }),
]);

export const PersonDetails = v.intersect([
    v.omit(CommonPersonInfo, ["original_name"]),
    v.object({
        also_known_as: v.array(v.string()),
        biography: v.string(),
        birthday: v.nullable(v.string()),
        deathday: v.nullable(v.string()),
        homepage: v.nullable(v.string()),
        imdb_id: v.nullable(v.string()),
        place_of_birth: v.nullable(v.string()),
        combined_credits: v.object({
            cast: v.array(
                v.union([
                    v.intersect([SearchMovie, v.object({ order: v.number(), character: v.nullable(v.string()), credit_id: v.string() })]),
                    v.intersect([
                        SearchTV,
                        v.object({ episode_count: v.nullish(v.number()), character: v.nullable(v.string()), credit_id: v.string() }),
                    ]),
                ]),
            ),
            crew: v.array(
                v.union([
                    v.intersect([SearchMovie, v.object({ department: v.string(), job: v.string(), credit_id: v.string() })]),
                    v.intersect([
                        SearchTV,
                        v.object({ department: v.string(), episode_count: v.nullish(v.number()), job: v.string(), credit_id: v.string() }),
                    ]),
                ]),
            ),
        }),
    }),
]);
