import { moviesInDB } from "@/src/db/schema";
import { Ionicons } from "@expo/vector-icons";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSettings } from "../contexts/UtilsProvider";
import { LocalDB } from "../db/DatabaseProvider";
import { plannedMoviesQuery, watchedMoviesQuery } from "../db/dbQueries";
import { formatDate } from "../utils/datetime";
import { WatchedButtonTick } from "./Buttons";
import { LoadingIndicator } from "./components";
import { WatchlistItem } from "./ListItem";
import { WatchedDrawer } from "./modals/modals";
import SlidingScreen from "./SlidingScreen";

const TABS = ["Planned", "Watched"];

export default function MoviesList() {
    const { settings } = useSettings();
    const { colors } = settings.theme;
    const [openModalData, setOpenModalData] = useState<{ id: number; releaseDate: string }>();
    const watchedDrawerRef = useRef<BottomSheetModal>(null);

    const plannedMovies = useLiveQuery(plannedMoviesQuery).data;
    const watchedMovies = useLiveQuery(watchedMoviesQuery).data;

    const moviesData = { Planned: plannedMovies, Watched: watchedMovies };

    const onSubmit = async (selectedDate: string, data: { id: number }) => {
        await LocalDB.update(moviesInDB).set({ watched_date: selectedDate }).where(eq(moviesInDB.id, data.id));
    };

    const renderItem = ({ item }: { item: (typeof plannedMovies)[0] }) => {
        return (
            <WatchlistItem link={`/movie/${item.id}`} poster_path={item.poster_path} title={item.title}>
                <Text style={[styles.release_date, { color: colors.textSecondary }]}>{formatDate(item.release_date, "medium")}</Text>
                <Text numberOfLines={4} style={[styles.overview, { color: colors.text }]}>
                    {item.overview}
                </Text>

                {/* Don't show the "watched" button if the movie is already watched */}
                {item.watched_date ? (
                    <View style={styles.watchedInfo}>
                        <Ionicons name="checkmark-sharp" color={colors.primary} size={12} />
                        <Text style={[{ color: colors.primary }, styles.watchedInfoText]}>{formatDate(item.watched_date, "full")}</Text>
                    </View>
                ) : (
                    <WatchedButtonTick
                        onPress={() => {
                            setOpenModalData({ id: item.id, releaseDate: item.release_date });
                            watchedDrawerRef.current?.present();
                        }}
                    />
                )}
            </WatchlistItem>
        );
    };

    if (!moviesData) return LoadingIndicator;

    return (
        <View>
            <WatchedDrawer drawerRef={watchedDrawerRef} onSubmit={onSubmit} releaseDate={openModalData?.releaseDate} id={openModalData?.id} />
            <SlidingScreen tabs={TABS} containerStyle={{ height: "100%", width: "100%" }}>
                {TABS.map((status) => (
                    <View key={status} style={styles.flex1}>
                        <FlashList data={moviesData[status]} renderItem={renderItem} estimatedItemSize={2} />
                    </View>
                ))}
            </SlidingScreen>
        </View>
    );
}

const styles = StyleSheet.create({
    item: {
        flexDirection: "row",
        paddingVertical: 10,
    },
    poster: {
        width: 100,
        height: 150,
        marginRight: 10,
    },
    release_date: { fontWeight: "bold", fontSize: 12, marginBottom: 2 },
    title: { fontWeight: "bold", fontSize: 18 },
    overview: { marginVertical: 8, fontSize: 13 },
    editStatusBtn: { borderWidth: 1, paddingHorizontal: 30, borderRadius: 25 },
    watchedInfo: { flexDirection: "row", alignItems: "center", gap: 5 },
    watchedInfoText: { fontSize: 10 },
    watchedBtn: { position: "absolute", bottom: 10, right: 10 },
    flex1: { flex: 1 },
});
