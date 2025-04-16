import { RenderItem } from "@/src/components/searchRenderers";
import { useSettings, useTMDB } from "@/src/contexts/UtilsProvider";
import { APIResponses } from "@/src/utils/types/apiResponses";
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { Link, router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SearchScreen() {
    const { colors } = useSettings().settings.theme;
    const [query, setQuery] = useState("");
    const [movies, setMovies] = useState<APIResponses["search"]>();
    const API = useTMDB();

    // Debouncing to reduce API calls
    useEffect(() => {
        const timerId = setTimeout(async () => {
            if (query.trim() !== "") {
                setMovies(await API.search(query));
            } else {
                setMovies([]);
            }
        }, 500);
        return () => clearTimeout(timerId);
    }, [query]);

    const handleInputChange = (query: string) => {
        setQuery(query);
    };

    if (!movies) return;

    return (
        // Instead of flex: 1, try: height: height (const { height } = useWindowDimensions();)
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Pressable onPress={() => router.back()}>
                    <Ionicons name="close" color={colors.textSecondary} size={24} />
                </Pressable>
                <TextInput
                    style={[styles.textInput, { color: colors.text }]}
                    autoFocus={true}
                    placeholderTextColor={colors.textSecondary}
                    placeholder="Search"
                    onChangeText={handleInputChange}
                    value={query}
                />
            </View>

            {query.trim() !== "" ? (
                <FlashList
                    data={movies}
                    renderItem={({ item }) => (
                        <Link href={`/${item.media_type}/${item.id}`} asChild>
                            <Pressable style={styles.listItemContainer}>
                                {item.media_type === "person" ? (
                                    <RenderItem
                                        image_path={item.profile_path}
                                        text={item.name}
                                        secondaryText={`Known for: ${item.known_for.map((movieTV) => (movieTV.media_type === "movie" ? movieTV.title : movieTV.name)).join(", ")}.`}
                                    />
                                ) : item.media_type === "movie" ? (
                                    <RenderItem
                                        image_path={item.poster_path}
                                        date={item.release_date}
                                        text={item.title}
                                        secondaryText={item.overview}
                                    />
                                ) : (
                                    <RenderItem
                                        image_path={item.poster_path}
                                        date={item.first_air_date}
                                        text={item.name}
                                        secondaryText={item.overview}
                                    />
                                )}
                            </Pressable>
                        </Link>
                    )}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                />
            ) : (
                <View style={styles.emptyState}>
                    <Ionicons name="search" color="gray" size={80} />
                    <Text style={styles.emptyStateText}>Find movies, TV shows, and people...</Text>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 10,
        flex: 1,
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        borderWidth: 1,
        borderRadius: 25,
        paddingHorizontal: 15,
        height: 50,
        marginBottom: 10,
    },
    textInput: {
        flex: 1,
    },
    listItemContainer: {
        flexDirection: "row",
        height: 130,
        overflow: "hidden",
    },
    separator: {
        height: 10,
    },
    emptyState: {
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
        gap: 10,
    },
    emptyStateText: {
        color: "gray",
    },
});
