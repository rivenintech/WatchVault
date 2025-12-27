import { SearchBar } from "@/src/components/SearchBar";
import { useSettings } from "@/src/contexts/UtilsProvider";
import SearchResultItem from "@/src/screens/Search/components/SearchResultItem";
import { tmdbClient } from "@/src/utils/apiClient";
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";
import { Link, router } from "expo-router";
import { parseResponse } from "hono/client";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDebounce } from "use-debounce";

export default function SearchScreen() {
  const { settings } = useSettings();
  const { colors } = settings.theme;
  const [query, setQuery] = useState("");

  // Using useDebounce with tanstack query to handle search input
  const [debouncedQuery] = useDebounce(query, 500);
  const { data: movies } = useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: () =>
      parseResponse(
        tmdbClient.search.$get({
          query: {
            language: settings.locale,
            q: debouncedQuery,
          },
        }),
      ),
    enabled: debouncedQuery.trim() !== "", // Only run query if debounced query is not empty
  });

  return (
    // Instead of flex: 1, try: height: height (const { height } = useWindowDimensions();)
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <SearchBar input={query} onClose={() => router.back()} handleInput={(input) => setQuery(input)} />

      {movies ? (
        <FlashList
          data={movies.results}
          renderItem={({ item }) => (
            <Link href={`/${item.media_type}/${item.id}`} asChild>
              <Pressable style={styles.listItemContainer}>
                {item.media_type === "person" ? (
                  <SearchResultItem
                    image_path={item.profile_path}
                    text={item.name}
                    secondaryText={`Known for: ${item.known_for
                      .map((movieTV) => (movieTV.media_type === "movie" ? movieTV.title : movieTV.name))
                      .join(", ")}.`}
                  />
                ) : item.media_type === "movie" ? (
                  <SearchResultItem image_path={item.poster_path} date={item.release_date} text={item.title} secondaryText={item.overview} />
                ) : (
                  <SearchResultItem image_path={item.poster_path} date={item.first_air_date} text={item.name} secondaryText={item.overview} />
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
