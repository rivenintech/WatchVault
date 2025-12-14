import { LoadingIndicator } from "@/src/components/LoadingIndicator";
import EpisodeDetails from "@/src/components/Modals/EpisodeDetails";
import WatchedDrawer from "@/src/components/Modals/WatchedDrawer";
import { useSettings } from "@/src/contexts/UtilsProvider";
import { LocalDB } from "@/src/db/DatabaseProvider";
import { tvEpisodesInDB, tvInDB, tvSeasonsInDB, tvToGenres } from "@/src/db/schema";
import { tmdbClient } from "@/src/utils/apiClient";
import { Ionicons } from "@expo/vector-icons";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";
import { asc, count, eq, getTableColumns } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { parseResponse } from "hono/client";
import { useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TvEpisodeItem from "./components/TvEpisodeItem";

export default function TvSeasonScreen() {
    const { id: idStr, showID, seasonNumber } = useLocalSearchParams();
    const id = Number(idStr);
    const { settings } = useSettings();
    const { colors } = settings.theme;
    const [isWatched, setIsWatched] = useState(false);
    const watchedDrawerRef = useRef<BottomSheetModal>(null);
    const episodeDetailsRef = useRef<BottomSheetModal>(null);
    const [currentEpisode, setCurrentEpisode] = useState();

    const localSeason = useLiveQuery(
        LocalDB.query.tvSeasonsInDB.findFirst({
            where: eq(tvSeasonsInDB.id, id),
        })
    ).data;

    const localEpisodes = useLiveQuery(
        LocalDB.select({ ...getTableColumns(tvEpisodesInDB), show_id: tvSeasonsInDB.show_id, season_number: tvSeasonsInDB.season_number })
            .from(tvEpisodesInDB)
            .innerJoin(tvSeasonsInDB, eq(tvSeasonsInDB.id, tvEpisodesInDB.season_id))
            .where(eq(tvEpisodesInDB.season_id, id))
            .orderBy(asc(tvEpisodesInDB.episode_number))
    ).data;

    const localEpisodeCount = useLiveQuery(
        LocalDB.select({ watched_episodes: count(tvEpisodesInDB.watched_date), episode_count: count(tvEpisodesInDB.id) })
            .from(tvEpisodesInDB)
            .where(eq(tvEpisodesInDB.season_id, id))
    ).data[0];

    // Merge these queries after this is fixed
    // https://github.com/drizzle-team/drizzle-orm/issues/2660
    const localSeasonData =
        localSeason && localEpisodes && localEpisodeCount ? { ...localSeason, episodes: localEpisodes, ...localEpisodeCount } : undefined;

    const { data: seasonData } = useQuery({
        queryKey: ["apiSeasonData", showID, seasonNumber],
        queryFn: async () =>
            localSeasonData ||
            parseResponse(
                tmdbClient.tv[":id"].season[":seasonNumber"].$get({
                    param: {
                        id: showID.toString(),
                        seasonNumber: seasonNumber.toString(),
                    },
                    query: {
                        language: settings.locale,
                    },
                })
            ),
    });

    if (!seasonData) return LoadingIndicator;

    const handleCheckboxPress = async (episode: (typeof seasonData.episodes)[0], uncheck: boolean) => {
        // Delete watched date
        if (uncheck) {
            await LocalDB.update(tvEpisodesInDB).set({ watched_date: null }).where(eq(tvEpisodesInDB.id, episode.id));
        } else {
            setCurrentEpisode(episode);
            watchedDrawerRef.current?.present();
        }
    };

    const handleUpsert = async (selectedDate: string, data?: { [key: string]: any }) => {
        if (!currentEpisode) return; // TODO - improve

        // In DB - just update
        if (localSeasonData) {
            await LocalDB.update(tvEpisodesInDB).set({ watched_date: selectedDate }).where(eq(tvEpisodesInDB.id, currentEpisode.id));
        } else {
            // Add show to db
            // Add TV Series
            const tv = await parseResponse(
                tmdbClient.tv[":id"]["to-local-db"].$get({
                    param: {
                        id: showID.toString(),
                    },
                    query: {
                        language: settings.locale,
                    },
                })
            );

            if (!tv) return;

            await LocalDB.insert(tvInDB).values({
                id: tv.id,
                name: tv.name,
                poster_path: tv.poster_path,
                backdrop_path: tv.backdrop_path,
                first_air_date: tv.first_air_date,
                overview: tv.overview,
            });

            // Add genres associated with TV show
            await LocalDB.insert(tvToGenres).values(tv.genres.map((genre) => ({ show_id: tv.id, genre_id: genre.id })));

            // Insert seasons
            await LocalDB.insert(tvSeasonsInDB).values(tv.seasons.map((season) => ({ ...season, show_id: tv.id })));

            // Insert episodes
            for (const season of tv.seasons) {
                if (!season.episodes) return;

                await LocalDB.insert(tvEpisodesInDB).values(season.episodes.map((episode) => ({ ...episode, season_id: season.id })));
            }

            await LocalDB.update(tvEpisodesInDB).set({ watched_date: selectedDate }).where(eq(tvEpisodesInDB.id, currentEpisode.id));
        }
    };

    const renderItem = ({ item }: { item: (typeof seasonData.episodes)[0] }) => {
        const isChecked = "watched_date" in item ? item.watched_date !== null : false;

        return (
            <TvEpisodeItem
                episode_number={item.episode_number}
                name={item.name}
                vote_average={item.vote_average}
                isChecked={isChecked}
                onEpisodePress={() => {
                    setCurrentEpisode(item);
                    episodeDetailsRef.current?.present();
                }}
                onCheckboxPress={() => handleCheckboxPress(item, isChecked)}
            />
        );
    };

    return (
        <SafeAreaView>
            <Stack.Screen options={{ header: () => null }} />
            <WatchedDrawer drawerRef={watchedDrawerRef} releaseDate={currentEpisode?.air_date} onSubmit={handleUpsert} itemData={currentEpisode} />
            <EpisodeDetails episodeData={currentEpisode} watchedDrawerRef={watchedDrawerRef} drawerRef={episodeDetailsRef} />

            <View style={styles.wrapper}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color={colors.textHeading} />
                    </Pressable>
                    <Text style={[styles.seasonTitle, { color: colors.textHeading }]}>{seasonData.name}</Text>
                    <Text style={[styles.episodeProgress, { color: colors.textSecondary }]}>
                        {localSeasonData?.watched_episodes || 0}/{seasonData.episode_count} (
                        {seasonData.episode_count - (localSeasonData?.watched_episodes || 0)} left)
                    </Text>
                    <Pressable
                        role="checkbox"
                        aria-checked={isWatched}
                        style={[styles.checkbox, isWatched ? { backgroundColor: colors.primary } : { borderColor: colors.textSecondary }]}
                        onPress={() => setIsWatched((prevIsWatched) => !prevIsWatched)}
                    >
                        {isWatched && <Ionicons name="checkmark" size={20} color="white" />}
                    </Pressable>
                </View>

                <View style={styles.listContainer}>
                    <FlashList
                        contentContainerStyle={{ paddingBottom: 200 }}
                        data={seasonData.episodes}
                        renderItem={renderItem}
                        showsVerticalScrollIndicator={false}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        paddingHorizontal: 10,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 20,
    },
    seasonTitle: {
        fontSize: 18,
        fontWeight: "500",
        marginLeft: 15,
    },
    episodeProgress: {
        fontSize: 12,
        marginLeft: "auto",
    },
    listContainer: {
        height: "100%",
    },
    episodeNumber: {
        fontSize: 12,
    },
    episodeRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    episodeTitle: {
        fontWeight: "500",
        width: "80%",
        paddingTop: 2,
        paddingBottom: 5,
    },
    rightSection: {
        flexDirection: "row",
        alignItems: "center",
        width: "20%",
    },
    starIcon: {
        marginLeft: "auto",
    },
    voteAverage: {
        fontSize: 12,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 4,
        borderWidth: 1,
        backgroundColor: "transparent",
        marginLeft: 5,
    },
});
