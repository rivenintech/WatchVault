import { LoadingIndicator } from "@/src/components/components";
import FiltersBtns from "@/src/components/Discover";
import { useSettings, useTMDB } from "@/src/contexts/UtilsProvider";
import { MediaTypeContext } from "@/src/layouts/TabsLayout";
import { getTMDBImageURL } from "@/src/utils/images";
import { useNetInfo } from "@react-native-community/netinfo";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { useContext, useEffect, useRef, useState } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import * as SVG from "react-native-svg";

const colsNum = 3;

const getRatingColor = (rating: number) => {
    if (rating < 40) return { primary: "#db2360", secondary: "#571435" };
    if (rating < 70) return { primary: "#d2d531", secondary: "#423d0f" };

    return { primary: "#21d07a", secondary: "#204529" };
};

export default function DiscoverScreen() {
    const { colors } = useSettings().settings.theme;
    const { width } = useWindowDimensions();
    const ctx = useContext(MediaTypeContext);
    const listRef = useRef<FlashList<any>>(null);
    const API = useTMDB();
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const { isInternetReachable } = useNetInfo();

    if (!ctx) {
        throw new Error("MediaTypeContext not found");
    }

    const [filters, setFilters] = useState<Record<"movie" | "tv", { sortBy: "popularity" | "rating"; genres: number[]; providers: number[] }>>({
        movie: { sortBy: "popularity", genres: [], providers: [] },
        tv: { sortBy: "popularity", genres: [], providers: [] },
    });
    const [data, setData] = useState<Awaited<ReturnType<typeof API.discover>>>();

    // Fetch movies/tv in mount, on media type change and filters change
    useEffect(() => {
        fetchMoviesTV(1);
    }, [filters, ctx.mediaType]);

    const fetchMoviesTV = async (page: number) => {
        // Don't fetch if loading
        if (loading) return;

        setLoading(true);

        // Fetch movies/tv with filters and current page
        const { sortBy, genres, providers } = filters[ctx.mediaType];
        const fetchedData = await API.discover(ctx.mediaType, page, sortBy, genres, providers);

        if (!fetchedData) {
            console.error("Failed to fetch movies/tv");
            setLoading(false);
            return;
        }

        // Append new movies/tv
        if (page === 1) {
            listRef.current?.scrollToOffset({ offset: 0, animated: true });
            setData(fetchedData);
        } else setData((prevData = []) => [...prevData, ...fetchedData]);

        setPage(page);
        setLoading(false);
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <FiltersBtns mediaType={ctx.mediaType} onChange={(filters) => setFilters(filters)} />

            {data ? (
                <FlashList
                    ref={listRef}
                    onEndReached={() => fetchMoviesTV(page + 1)}
                    onEndReachedThreshold={0.2}
                    data={data}
                    numColumns={colsNum}
                    keyExtractor={(item) => item.id.toString()}
                    estimatedItemSize={150}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                    ListFooterComponent={loading ? LoadingIndicator : null}
                    renderItem={({ item }) => {
                        const rating = Math.round(item.vote_average * 10);
                        const ratingColors = getRatingColor(rating);

                        return (
                            <Link href={`../${ctx.mediaType}/${item.id}`} style={styles.link}>
                                <View style={[styles.card, { width: width / colsNum - 20 }]}>
                                    <SVG.Svg width="40" height="40" viewBox="0 0 36 36" style={styles.svg}>
                                        <SVG.Circle cx="18" cy="18" r="15.91549431" fill="#081c22" stroke={ratingColors.secondary} strokeWidth="2" />
                                        <SVG.Circle
                                            cx="18"
                                            cy="18"
                                            r="15.91549431"
                                            fill="none"
                                            stroke={ratingColors.primary}
                                            strokeWidth="2"
                                            strokeDasharray={`${rating}, 100`}
                                            strokeLinecap="round"
                                            transform="rotate(-90 18 18)"
                                        />
                                        <SVG.Text x="16" y="20.5" fontSize="9" textAnchor="middle" fill="white" fontWeight="bold">
                                            {rating}%
                                        </SVG.Text>
                                    </SVG.Svg>
                                    <Image
                                        source={getTMDBImageURL("poster", "w500", item.poster_path)}
                                        style={styles.poster}
                                        transition={200}
                                        recyclingKey={item.poster_path}
                                    />
                                </View>
                            </Link>
                        );
                    }}
                />
            ) : (
                <View></View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        height: "100%",
        paddingHorizontal: 10,
    },
    separator: {
        height: 10,
    },
    link: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    card: {
        position: "relative",
    },
    svg: {
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 1,
    },
    poster: {
        aspectRatio: 2 / 3,
        borderRadius: 5,
    },
});
