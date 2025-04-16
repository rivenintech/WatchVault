import DonutChart from "@/src/components/Charts";
import { LoadingIndicator } from "@/src/components/components";
import { useSettings } from "@/src/contexts/UtilsProvider";
import { finishedTvQuery, statsMoviesGenresQuery, statsMoviesQuery, statsTvGenresQuery, statsTvQuery } from "@/src/db/dbQueries";
import { MediaTypeContext } from "@/src/layouts/TabsLayout";
import { formatTime } from "@/src/utils/datetime";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useContext, useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function StatsScreen() {
    const { colors } = useSettings().settings.theme;
    const ctx = useContext(MediaTypeContext);
    const [selectedSlice, setSelectedSlice] = useState<{ name: string; value: number } | undefined>();

    if (!ctx) {
        throw new Error("MediaTypeContext not found");
    }

    useEffect(() => {
        setSelectedSlice(undefined);
    }, [ctx]);

    const movieDetails = useLiveQuery(statsMoviesQuery).data[0];
    const moviesGenres = useLiveQuery(statsMoviesGenresQuery).data;
    const tvDetails = useLiveQuery(statsTvQuery).data[0];
    const completedShows = useLiveQuery(finishedTvQuery).data[0];
    const tvGenres = useLiveQuery(statsTvGenresQuery).data;

    const dataObjects = useMemo(() => {
        const tv = { total: completedShows?.total, totalTime: tvDetails?.totalTime, totalEpisodes: tvDetails?.totalEpisodes, genres: tvGenres };
        const movies = { total: movieDetails?.total, totalTime: movieDetails?.totalTime, genres: moviesGenres };
        return { tv, movies };
    }, [completedShows, movieDetails, moviesGenres, tvDetails, tvGenres]);

    const data = useMemo(() => (ctx?.mediaType === "movie" ? dataObjects.movies : dataObjects.tv), [ctx?.mediaType, dataObjects]);

    return (
        <View style={styles.container}>
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <MaterialCommunityIcons name="television-classic" size={24} color={colors.text} />
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Watched Stats</Text>
                </View>

                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <MaterialCommunityIcons name="movie-open-outline" size={24} color={colors.text} />
                        <View>
                            <Text style={[styles.statValue, { color: colors.primary }]}>{data.total}</Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                                Watched {ctx?.mediaType === "movie" ? "movies" : "shows"}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.statBox}>
                        <MaterialCommunityIcons name="clock-outline" size={24} color={colors.text} />
                        <View>
                            <Text style={[styles.statValue, { color: colors.primary }]}>{formatTime(data.totalTime)}</Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total time</Text>
                        </View>
                    </View>

                    {"totalEpisodes" in data && (
                        <View style={styles.statBox}>
                            <MaterialCommunityIcons name="playlist-check" size={24} color={colors.text} />
                            <View>
                                <Text style={[styles.statValue, { color: colors.primary }]}>{data.totalEpisodes}</Text>
                                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total episodes</Text>
                            </View>
                        </View>
                    )}
                </View>
            </View>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <MaterialCommunityIcons name="chart-pie" size={24} color={colors.text} />
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Top Genres</Text>
                </View>

                {data.genres ? (
                    <DonutChart
                        data={data.genres}
                        noDataText="Watch something to see your top genres..."
                        pieColors={["#eccc68", "#ff7f50", "#ff6b81", "#70a1ff", "#2ed573"]}
                        size={250}
                        innerRadius={80}
                        selectedSlice={selectedSlice}
                        setSelectedSlice={setSelectedSlice}
                    >
                        <Text style={[styles.donutTitle, { color: colors.textHeading }]}>{selectedSlice?.name || "Tap a slice"}</Text>
                        <Text style={[styles.donutSubtitle, { color: colors.textSecondary }]}>
                            {selectedSlice?.value ? `${selectedSlice?.value} shows` : "to reveal genre"}
                        </Text>
                    </DonutChart>
                ) : (
                    LoadingIndicator
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 10,
        marginHorizontal: 10,
        gap: 30,
    },
    section: {
        gap: 15,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },
    sectionTitle: {
        fontWeight: "bold",
        fontSize: 18,
    },
    statsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "flex-start",
        gap: 20,
    },
    statBox: {
        width: "33%",
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },
    statValue: {
        fontWeight: "bold",
        fontSize: 16,
    },
    statLabel: {
        fontWeight: "500",
        fontSize: 12,
    },
    donutTitle: {
        textAlign: "center",
        fontWeight: "bold",
        fontSize: 18,
    },
    donutSubtitle: {
        textAlign: "center",
        fontWeight: "500",
    },
});
