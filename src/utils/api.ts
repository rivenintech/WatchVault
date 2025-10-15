import * as v from "valibot";
import type { Settings } from "../components/types/shared";
import {
    Discover,
    EpisodeDetails,
    GenresList,
    MovieDetails,
    PersonDetails,
    type Provider,
    ProvidersList,
    Region,
    SearchMulti,
    SeasonDetails,
    TvDetails,
    TvDetailsWithSeasons,
    type WatchProviders,
} from "./apiSchemas";

export class API {
    private settings: Settings;

    constructor(settings: Settings) {
        this.settings = settings;
    }

    movies = {
        details: this.getMovie.bind(this),
    };
    tvSeries = {
        details: this.getTV.bind(this),
        seasons: {
            details: this.getTVseason.bind(this),
        },
        episodes: {
            details: this.getEpisodeDetails.bind(this),
        },
        detailsWithSeasonsAndEpisodes: this.getTVWithSeasonsAndEpisodes.bind(this),
    };
    person = this.personDetails.bind(this);
    genresList = this.getGenresList.bind(this);
    discover = this.discoverMoviesTV.bind(this);
    search = this.searchTMDB.bind(this);
    watchProvidersList = this.getWatchProviders.bind(this);
    regions = this.getWatchProvidersRegions.bind(this);

    private async fetchTMDB(endpoint: string) {
        const apiUrl = process.env.EXPO_PUBLIC_TMDB_API_URL;

        const options = {
            method: "GET",
            headers: {
                accept: "application/json",
            },
        };

        try {
            const response = await fetch(new URL(endpoint, apiUrl), options);

            if (!response.ok) {
                throw new Error(`Failed to fetch data from TMDB: ${response.statusText} (Status code: ${response.status})`);
            }

            return await response.json();
        } catch (error) {
            this.logError(error);
        }
    }

    private async getWatchProviders(mediaType: "movie" | "tv") {
        const data = await this.fetchTMDB(`watch/providers/${mediaType}?language=${this.settings.locale}&watch_region=${this.settings.region}`);

        try {
            return v.parse(ProvidersList, data).results;
        } catch (error) {
            this.logError(error);
        }
    }

    private async getWatchProvidersRegions() {
        const data = await this.fetchTMDB(`watch/providers/regions?language=${this.settings.locale}`);

        try {
            return v.parse(Region, data).results;
        } catch (error) {
            this.logError(error);
        }
    }

    private async getMovie(id: number, ...appendToResponse: ("recommendations" | "watch/providers" | "credits")[]) {
        // Remove duplicates and join into a comma-separated string
        const appendToResponseString = Array.from(new Set(appendToResponse)).join(",");

        const data = await this.fetchTMDB(`movie/${id}?language=${this.settings.locale}&append_to_response=${appendToResponseString}`);

        try {
            const parsedData = v.parse(MovieDetails, data);
            const watchProvidersProcessed = parsedData["watch/providers"] && this.groupWatchProviders(parsedData["watch/providers"]);

            return { ...parsedData, "watch/providers": watchProvidersProcessed };
        } catch (error) {
            this.logError(error);
        }
    }

    private async getGenresList(mediaType: "movie" | "tv", locale?: string) {
        const data = await this.fetchTMDB(`genre/${mediaType}/list?language=${locale || this.settings.locale}`);

        try {
            return v.parse(GenresList, data).genres;
        } catch (error) {
            this.logError(error);
        }
    }

    private async getTV(id: number, ...appendToResponse: ("recommendations" | "watch/providers" | "aggregate_credits")[]) {
        // Remove duplicates and join into a comma-separated string
        const appendToResponseString = Array.from(new Set(appendToResponse)).join(",");

        const data = await this.fetchTMDB(`tv/${id}?language=${this.settings.locale}&append_to_response=${appendToResponseString}`);

        try {
            const parsedData = v.parse(TvDetails, data);
            const watchProvidersProcessed = parsedData["watch/providers"] && this.groupWatchProviders(parsedData["watch/providers"]);

            return { ...parsedData, "watch/providers": watchProvidersProcessed };
        } catch (error) {
            this.logError(error);
        }
    }

    private async getTVWithSeasonsAndEpisodes(id: number, seasonKeys: string[]) {
        // Split append_to_response into chunks of 20 (TMDB limit)
        const seasonKeysChunks = this.splitArrayIntoChunks(seasonKeys, 20);

        try {
            const mergedData = {};

            for (const chunk of seasonKeysChunks) {
                const data = await this.fetchTMDB(`tv/${id}?language=${this.settings.locale}&append_to_response=${chunk.join(",")}`);
                Object.assign(mergedData, data);
            }

            const parsedData = v.parse(TvDetailsWithSeasons, mergedData);

            return parsedData;
        } catch (error) {
            this.logError(error);
        }
    }

    private splitArrayIntoChunks(array: any[], chunkSize: number) {
        if (chunkSize <= 0) throw new Error("Chunk size must be greater than 0");

        const chunks = [];

        for (let i = 0; i < array.length; i += chunkSize) {
            const chunk = array.slice(i, i + chunkSize);
            chunks.push(chunk);
        }

        return chunks;
    }

    private async searchTMDB(searchQuery: string) {
        const data = await this.fetchTMDB(`search/multi?language=${this.settings.locale}&query=${searchQuery}`);

        try {
            return v.parse(SearchMulti, data).results;
        } catch (error) {
            this.logError(error);
        }
    }

    private async getTVseason(seriesId: number, seasonNumber: number) {
        const data = await this.fetchTMDB(`tv/${seriesId}/season/${seasonNumber}?language=${this.settings.locale}`);

        try {
            const parsedData = v.parse(SeasonDetails, data);

            return { ...parsedData, episode_count: parsedData.episodes.length };
        } catch (error) {
            this.logError(error);
        }
    }

    private async getEpisodeDetails(showId: number, seasonNumber: number, episodeNumber: number) {
        const data = await this.fetchTMDB(`tv/${showId}/season/${seasonNumber}/episode/${episodeNumber}?language=${this.settings.locale}`);

        try {
            return v.parse(EpisodeDetails, data);
        } catch (error) {
            this.logError(error);
        }
    }

    private async discoverMoviesTV(
        mediaType: "movie" | "tv",
        page: number,
        sortBy: "popularity" | "rating",
        genres?: number[],
        watchProviders?: number[]
    ) {
        const sortType = sortBy === "popularity" ? "popularity.desc" : "vote_average.desc&vote_count.gte=100";
        const genresList = genres ? `&with_genres=${genres?.join("|")}` : "";
        const watchProvidersList = watchProviders ? `&with_watch_providers=${watchProviders?.join("|")}` : "";

        const path = mediaType === "tv" ? "tv?watch_region=" : "movie?include_video=false&region=";
        const data = await this.fetchTMDB(
            `discover/${path}${this.settings.region}&language=${this.settings.locale}&page=${page}&sort_by=${sortType}${genresList}${watchProvidersList}`
        );

        try {
            return v.parse(Discover, data);
        } catch (error) {
            this.logError(error);
        }
    }

    private async personDetails(personId: number) {
        const data = await this.fetchTMDB(`person/${personId}?language=${this.settings.locale}&append_to_response=combined_credits`);

        try {
            return v.parse(PersonDetails, data);
        } catch (error) {
            this.logError(error);
        }
    }

    private logError(error: any) {
        if (v.isValiError(error)) {
            const path = error.issues[0].path?.map((p) => p.key).join(" -> ");
            console.error(`[Valibot] Path: ${path}`);
            console.warn(error);
        } else {
            console.error(error);
        }
    }

    private groupWatchProviders(data: v.InferOutput<typeof WatchProviders>) {
        const localeData = data.results?.[this.settings.region];

        if (!localeData) return;

        const providersMap = new Map<number, v.InferOutput<typeof Provider> & { watchOptions: string[] }>();

        // Helper function to process a provider list (rent, flatrate, buy)
        const processProviderType = (type: "rent" | "flatrate" | "buy", watchOptionTitle: string) => {
            for (const { provider_id, logo_path, provider_name, display_priority } of localeData[type] ?? []) {
                if (!providersMap.has(provider_id)) {
                    providersMap.set(provider_id, {
                        provider_id,
                        logo_path,
                        provider_name,
                        display_priority,
                        watchOptions: [],
                    });
                }
                providersMap.get(provider_id)?.watchOptions.push(watchOptionTitle);
            }
        };

        processProviderType("rent", "Rent");
        processProviderType("flatrate", "Stream");
        processProviderType("buy", "Buy");

        // Convert the Map to a sorted array
        const sortedProviders = Array.from(providersMap.values()).sort((a, b) => a.display_priority - b.display_priority);

        return { link: localeData.link, providers: sortedProviders };
    }
}
