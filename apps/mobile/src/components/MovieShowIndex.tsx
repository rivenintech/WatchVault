import { formatDate, formatTime } from "@/src/utils/datetime";
import { getTMDBImageURL } from "@/src/utils/images";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import { Image, ImageBackground } from "expo-image";
import { Link, router } from "expo-router";
import { useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Pressable, ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSettings } from "../contexts/UtilsProvider";
import { ProgressBar } from "./TvComponents";
import { PersonModal } from "./modals/PersonModal";

export function MovieTvPage({ backdrop_path, poster_path, release_date, runtime, title, genres, localData, children }) {
    const { settings } = useSettings();
    const { colors } = settings.theme;
    const insets = useSafeAreaInsets();

    return (
        <View style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom }}>
                <View>
                    <ImageBackground
                        source={getTMDBImageURL("backdrop", "original", backdrop_path)}
                        recyclingKey={backdrop_path}
                        cachePolicy={"disk"}
                        style={{ aspectRatio: 16 / 9 }}
                        transition={300}
                    >
                        <View style={styles.darkOverlay} />
                    </ImageBackground>
                    <Pressable onPress={() => router.back()} style={[styles.backBtn, { top: insets.top }]} hitSlop={20}>
                        <Ionicons name="arrow-back" color="white" size={24} />
                    </Pressable>

                    <Image
                        source={getTMDBImageURL("poster", "original", poster_path)}
                        recyclingKey={poster_path}
                        cachePolicy={"disk"}
                        style={styles.poster}
                        transition={300}
                    />
                    <View
                        style={{
                            position: "absolute",
                            bottom: "-12%",
                            right: 10,
                            flexDirection: "row",
                            alignItems: "center",
                        }}
                    >
                        <Ionicons name="calendar-outline" color={colors.primary} size={12} />
                        <Text style={[{ color: colors.text }, styles.dateRuntimeText]}> {formatDate(release_date, "short")} (US)</Text>
                        <Text style={[{ color: colors.text }, styles.dateRuntimeText, styles.dateRuntimeDivider]}>|</Text>
                        <Ionicons name="time-outline" color={colors.primary} size={12} />
                        <Text style={[{ color: colors.text }, styles.dateRuntimeText]}> {formatTime(runtime)}</Text>
                    </View>
                </View>

                <View style={styles.info}>
                    <View>
                        <Text style={[{ color: colors.textHeading }, styles.title]}>{title}</Text>
                        <Text style={[{ color: colors.text }, styles.genres]}>
                            {genres.map((genre, index) => (
                                <Text key={index}>
                                    <Link href={""}>{genre.name || genre.genre?.name}</Link>
                                    {index !== genres.length - 1 && <Text style={{ color: colors.primary }}> / </Text>}
                                </Text>
                            ))}
                        </Text>
                    </View>
                    {children}
                </View>
            </ScrollView>
        </View>
    );
}

type WhereToWatchProps = { watchProviders: { providers: { logo_path: string; provider_name: string; watchOptions: string[] }[] } };

export function WhereToWatch({ watchProviders }: WhereToWatchProps) {
    const { colors } = useSettings().settings.theme;

    return (
        <View>
            <Text style={[styles.headings, { color: colors.textHeading }]}>Where To Watch</Text>
            <View>
                <FlashList
                    renderItem={({ item }) => (
                        <View style={[styles.watchProviders, { backgroundColor: colors.border }]}>
                            <Image
                                style={{ width: 36, height: 36 }}
                                source={getTMDBImageURL("logo", "w45", item.logo_path)}
                                recyclingKey={item.logo_path}
                                cachePolicy={"disk"}
                                transition={200}
                            />
                            <View>
                                <Text style={[{ color: colors.text }, styles.watchProvidersName]}>{item.provider_name}</Text>
                                <Text style={[{ color: colors.textSecondary }, styles.watchProvidersText]}>{item.watchOptions.join(", ")}</Text>
                            </View>
                        </View>
                    )}
                    data={watchProviders.providers}
                    showsHorizontalScrollIndicator={false}
                    horizontal={true}
                    ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
                />
            </View>
        </View>
    );
}

type CastAndCrewProps = {
    credits: {
        cast: Array<{ id: number; profile_path: string | null; name: string } & ({ character: string } | { roles: { character: string }[] })>;
    };
    title?: string;
};

export function CastAndCrew({ credits, title }: CastAndCrewProps) {
    const { colors } = useSettings().settings.theme;
    const personRef = useRef<BottomSheetModal>(null);

    const transformedData = credits.cast.map((item) => {
        if (!("roles" in item)) {
            return {
                ...item,
                roles: [{ character: item.character }],
            };
        }
        return item;
    });

    const [person, setPerson] = useState<(typeof transformedData)[0]>();

    return (
        <View>
            <PersonModal modalRef={personRef} person={person} />
            <Text style={[styles.headings, { color: colors.textHeading }]}>{title || "Cast & Crew"}</Text>
            <View>
                <FlashList
                    renderItem={({ item }) => (
                        <Pressable
                            onPress={() => {
                                setPerson(item);
                                personRef.current?.present();
                            }}
                            style={{ width: 100 }}
                        >
                            <Image
                                style={{ height: 150, width: 100 }}
                                source={getTMDBImageURL("poster", "w185", item.profile_path)}
                                recyclingKey={item.profile_path}
                                transition={200}
                            />
                            <Text numberOfLines={1} style={{ color: colors.text, fontSize: 12, marginTop: 1, textAlign: "center" }}>
                                {item.name}
                            </Text>
                            <Text style={{ color: colors.textSecondary, fontSize: 10, textAlign: "center" }}>{item.roles[0].character}</Text>
                        </Pressable>
                    )}
                    data={transformedData}
                    horizontal={true}
                    ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
                    renderScrollComponent={ScrollView}
                    showsHorizontalScrollIndicator={false}
                />
            </View>
        </View>
    );
}

type RecommendationsProps = {
    recommendations: {
        id: number;
        media_type: "movie" | "tv";
        poster_path: string | null;
    }[];
};

export function Recommendations({ recommendations }: RecommendationsProps) {
    const { colors } = useSettings().settings.theme;

    return (
        <View style={{ marginVertical: 10 }}>
            <Text style={[styles.headings, { color: colors.textHeading }]}>You May Also Like</Text>
            <View style={{ height: 150 }}>
                <FlashList
                    renderItem={({ item }) => (
                        <Link href={`/${item.media_type}/${item.id}`} style={{ aspectRatio: 2 / 3, width: 100 }} replace>
                            <Image
                                style={{ width: "100%", height: "100%" }}
                                source={getTMDBImageURL("poster", "w500", item.poster_path)}
                                recyclingKey={item.poster_path}
                                transition={200}
                            />
                        </Link>
                    )}
                    data={recommendations}
                    horizontal={true}
                    ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
                    renderScrollComponent={ScrollView}
                    showsHorizontalScrollIndicator={false}
                />
            </View>
        </View>
    );
}

type TVSeasonsProps = {
    seasons: {
        id: number;
        season_number: number;
        poster_path: string | null;
        watched_episodes?: number;
        episode_count: number;
        name: string;
        overview: string | null;
    }[];
    showID: number;
};

export function TVSeasons({ seasons, showID }: TVSeasonsProps) {
    const { colors } = useSettings().settings.theme;

    return (
        <View style={{ flex: 1 }}>
            <FlashList
                data={seasons}
                ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
                renderItem={({ item }) => {
                    const isWatched = item.watched_episodes === item.episode_count;

                    return (
                        <Link key={item.id} href={{ pathname: `./season/${item.id}`, params: { showID: showID, seasonNumber: item.season_number } }}>
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    borderRadius: 10,
                                    borderBottomColor: colors.border,
                                    borderBottomWidth: 1,
                                }}
                            >
                                <Image
                                    source={getTMDBImageURL("poster", "w500", item.poster_path)}
                                    recyclingKey={item.poster_path}
                                    cachePolicy={"disk"}
                                    transition={200}
                                    style={{
                                        aspectRatio: 2 / 3,
                                        height: 120,
                                        borderRadius: 10,
                                        margin: 5,
                                    }}
                                />
                                <View style={{ flex: 1, padding: 15 }}>
                                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                        <Text style={{ color: "white", fontWeight: "500", fontSize: 18 }}>{item.name}</Text>
                                        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                                            <Text style={{ color: "white", fontWeight: "bold" }}>
                                                {item.watched_episodes || 0}/{item.episode_count}
                                            </Text>
                                            <Ionicons
                                                name="checkmark-circle-sharp"
                                                color={isWatched ? colors.primary : colors.textHeading}
                                                size={30}
                                            />
                                        </View>
                                    </View>
                                    <Text numberOfLines={3} style={{ color: "white", marginTop: 5, fontSize: 12 }}>
                                        {item.overview}
                                    </Text>
                                    <View style={{ flexDirection: "row", marginTop: 15 }}>
                                        <ProgressBar watched_episodes={item.watched_episodes} episode_count={item.episode_count} />
                                    </View>
                                </View>
                            </View>
                        </Link>
                    );
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    dateRuntimeText: {
        fontSize: 12,
    },
    dateRuntimeDivider: { marginHorizontal: 6 },
    poster: {
        position: "absolute",
        width: 100,
        height: 150,
        top: "60%",
        left: 20,
        borderRadius: 5,
    },
    backBtn: { position: "absolute", left: 20, marginTop: 10 },
    darkOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
    title: { fontSize: 24, fontWeight: "bold" },
    genres: { fontStyle: "italic" },
    info: { marginHorizontal: 20, marginTop: 65, flex: 1, gap: 15 },
    headings: { fontWeight: "500", fontSize: 16, marginBottom: 6 },
    watchProviders: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        padding: 6,
        borderRadius: 5,
    },
    watchProvidersName: { fontSize: 12, fontWeight: "500" },
    watchProvidersText: { fontSize: 10 },
});
