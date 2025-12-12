import { LocalDB } from "@/src/db/DatabaseProvider";
import { tvEpisodesInDB, tvShowStatusView } from "@/src/db/schema";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSettings } from "../contexts/UtilsProvider";
import { nextEpisodesQuery } from "../db/dbQueries";
import { WatchedButtonTick } from "./Buttons";
import { WatchlistItem } from "./ListItem";
import { EpisodeDetailsDrawer } from "./Modals/EpisodeDetails";
import { WatchedDrawer } from "./Modals/Modals";
import SlidingScreen from "./SlidingScreen";
import { TvNextEpisode, TvProgress } from "./TvComponents";

const TABS = ["Watching", "Planned", "Watched"];

export default function ShowsList() {
    const { colors } = useSettings().settings.theme;
    const watchedDrawerRef = useRef<BottomSheetModal>(null);
    const episodeDrawerRef = useRef<BottomSheetModal>(null);

    const nextEpisodes = useLiveQuery(nextEpisodesQuery).data;
    const showsData = useLiveQuery(LocalDB.select().from(tvShowStatusView), [nextEpisodes]).data;

    const [focusedShowId, setFocusedShowId] = useState<number | undefined>();
    const focusedEpisode = useMemo(() => nextEpisodes.find((episode) => episode.show_id === focusedShowId), [focusedShowId, nextEpisodes]);

    const onSubmit = async (selectedDate: string, data: { id: number }) => {
        await LocalDB.update(tvEpisodesInDB).set({ watched_date: selectedDate }).where(eq(tvEpisodesInDB.id, data.id));
    };

    const renderItem = ({ item }: { item: (typeof showsData)[0] }) => {
        const nextEpisode = nextEpisodes.find((episode) => episode.show_id === item.id);

        return (
            <WatchlistItem link={`/tv/${item.id}`} poster_path={item.poster_path} title={item.name}>
                {item.status === "watching" && nextEpisode && (
                    <TvNextEpisode season_number={nextEpisode.season_number} episode_number={nextEpisode.episode_number} name={nextEpisode.name} />
                )}

                <TvProgress episode_count={item.episode_count} watched_episodes={item.watched_episodes} />

                {item.status === "planned" && <Text style={[styles.overviewText, { color: colors.text }]}>{item.overview}</Text>}

                {item.status === "watching" && (
                    <WatchedButtonTick
                        onPress={() => {
                            setFocusedShowId(nextEpisode?.show_id);
                            watchedDrawerRef.current?.present();
                        }}
                    >
                        <Pressable
                            onPress={() => {
                                setFocusedShowId(nextEpisode?.show_id);
                                episodeDrawerRef.current?.present();
                            }}
                        >
                            <Text style={[styles.detailsText, { color: colors.textSecondary }]}>Details</Text>
                        </Pressable>
                    </WatchedButtonTick>
                )}
            </WatchlistItem>
        );
    };

    return (
        <View>
            <WatchedDrawer drawerRef={watchedDrawerRef} releaseDate={focusedEpisode?.air_date} onSubmit={onSubmit} id={focusedEpisode?.id} />
            <EpisodeDetailsDrawer drawerRef={episodeDrawerRef} episodeData={focusedEpisode} watchedDrawerRef={watchedDrawerRef} />
            <SlidingScreen tabs={TABS} containerStyle={{ height: "100%", width: "100%" }}>
                {TABS.map((status) => (
                    <View key={status} style={{ flex: 1 }}>
                        <FlashList data={showsData.filter((item) => item.status === status.toLowerCase())} renderItem={renderItem} />
                    </View>
                ))}
            </SlidingScreen>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        paddingVertical: 10,
    },
    poster: {
        width: 100,
        height: 150,
        marginRight: 10,
    },
    content: {
        flex: 1,
    },
    title: {
        fontWeight: "bold",
        fontSize: 18,
    },
    nextEpisodeText: {
        marginVertical: 5,
        fontSize: 13,
    },
    nextEpisodeHighlight: {
        fontWeight: "500",
    },
    progressContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: 5,
    },
    progressLabel: {
        fontSize: 12,
    },
    progressBarBackground: {
        flex: 1,
        height: 4,
        borderRadius: 5,
        overflow: "hidden",
    },
    progressBar: {
        height: "100%",
    },
    overviewText: {
        marginVertical: 8,
    },
    bottomActions: {
        position: "absolute",
        bottom: 10,
        right: 10,
    },
    actionRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
    },
    detailsText: {
        fontWeight: "500",
    },
    checkmarkButton: {
        borderWidth: 1,
        paddingHorizontal: 30,
        borderRadius: 25,
    },
});
