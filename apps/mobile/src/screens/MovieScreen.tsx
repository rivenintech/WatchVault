import { WatchedWatchlistBtn } from "@/src/components/Movie";
import { CastAndCrew, MovieTvPage, Recommendations, WhereToWatch } from "@/src/components/MovieShowIndex";
import { useSettings } from "@/src/contexts/UtilsProvider";
import { LocalDB } from "@/src/db/DatabaseProvider";
import { moviesInDB, moviesToGenres } from "@/src/db/schema";
import { useQuery } from "@tanstack/react-query";
import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useLocalSearchParams } from "expo-router";
import { parseResponse } from "hono/client";
import { StyleSheet, Text, View } from "react-native";
import { ToggleMoreText } from "../components/ToggleMoreText";
import { movieWithGenresQuery } from "../db/dbQueries";
import { tmdbClient } from "../utils/apiClient";

export default function MovieScreen() {
    const { id: idStr } = useLocalSearchParams();
    const id = Number(idStr);
    const { settings } = useSettings();
    const { colors } = settings.theme;

    const localMovieData = useLiveQuery(movieWithGenresQuery(id)).data;

    const { data: apiMovieData } = useQuery({
        queryKey: ["movieDetails", id],
        queryFn: () =>
            parseResponse(
                tmdbClient.movie[":id"].$get({
                    param: {
                        id: id.toString(),
                    },
                    query: {
                        language: settings.locale,
                        region: settings.region,
                    },
                })
            ),
        enabled: !!id,
    });

    // Merge local and API data
    const movieData = localMovieData || apiMovieData;

    const handleWatchedDateChange = async (date: string | null | undefined) => {
        // Delete movie
        if (date === undefined) await LocalDB.delete(moviesInDB).where(eq(moviesInDB.id, id));

        if (typeof date === "string" || date === null) {
            // If movie is in DB - update it's watched date
            if (localMovieData) {
                await LocalDB.update(moviesInDB).set({ watched_date: date }).where(eq(moviesInDB.id, id));
            } else {
                if (!apiMovieData) {
                    // TODO Handle error - notification?
                    console.error("API movie data not found");
                    return;
                }

                await LocalDB.insert(moviesInDB).values({ ...apiMovieData, watched_date: date });
                // Add genres associated with movie
                apiMovieData.genres.map(async (genre) => await LocalDB.insert(moviesToGenres).values({ movie_id: id, genre_id: genre.id }));
            }
        }
    };

    // if (!movieData) return LoadingIndicator;

    return movieData ? (
        <MovieTvPage
            backdrop_path={movieData.backdrop_path}
            poster_path={movieData.poster_path}
            title={movieData.title}
            genres={movieData.genres}
            release_date={movieData.release_date}
            runtime={movieData.runtime}
            localData={Boolean(localMovieData)}
        >
            <WatchedWatchlistBtn
                releaseDate={movieData.release_date}
                watchedDate={localMovieData?.watched_date}
                setWatchedDate={handleWatchedDateChange}
            />

            <View>
                <Text style={[styles.sectionHeading, { color: colors.textHeading }]}>Overview</Text>
                <ToggleMoreText max_lines={3}>{movieData.overview}</ToggleMoreText>
            </View>

            {apiMovieData && (
                <>
                    {apiMovieData["watch/providers"] && <WhereToWatch watchProviders={apiMovieData["watch/providers"]} />}
                    <CastAndCrew credits={apiMovieData.credits} />
                    <Recommendations recommendations={apiMovieData.recommendations?.results} />
                </>
            )}
        </MovieTvPage>
    ) : (
        <View></View>
    );
}

const styles = StyleSheet.create({
    sectionHeading: {
        fontWeight: "500",
        fontSize: 16,
        marginBottom: 6,
    },
});
