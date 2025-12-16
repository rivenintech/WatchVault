import { LoadingIndicator } from "@/src/components/LoadingIndicator";
import { useSettings } from "@/src/contexts/UtilsProvider";
import { MediaTypeContext } from "@/src/screens/(tabs)/_layout";
import FiltersBtns from "@/src/screens/(tabs)/Discover/components/FilterBtns";
import { tmdbClient } from "@/src/utils/apiClient";
import { getTMDBImageURL } from "@/src/utils/images";
import { FlashList } from "@shopify/flash-list";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { parseResponse } from "hono/client";
import { useContext, useState } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import * as SVG from "react-native-svg";

const colsNum = 3;

const getRatingColor = (rating: number) => {
  if (rating < 40) return { primary: "#db2360", secondary: "#571435" };
  if (rating < 70) return { primary: "#d2d531", secondary: "#423d0f" };

  return { primary: "#21d07a", secondary: "#204529" };
};

export default function DiscoverScreen() {
  const { settings } = useSettings();
  const { colors } = settings.theme;
  const { width } = useWindowDimensions();
  const ctx = useContext(MediaTypeContext);

  if (!ctx) {
    throw new Error("MediaTypeContext not found");
  }

  const [filters, setFilters] = useState<Record<"movie" | "tv", { sortBy: "popularity" | "rating"; genres: number[]; providers: number[] }>>({
    movie: { sortBy: "popularity", genres: [], providers: [] },
    tv: { sortBy: "popularity", genres: [], providers: [] },
  });

  const fetchMoviesTV = async ({ pageParam }: { pageParam: number }) => {
    // Fetch movies/tv with filters and current page
    const { sortBy, genres, providers } = filters[ctx.mediaType];
    const fetchedData = await parseResponse(
      tmdbClient.discover[":mediaType"].$get({
        param: {
          mediaType: ctx.mediaType,
        },
        query: {
          page: pageParam.toString(),
          sortBy,
          genres: genres.map(String),
          watchProviders: providers.map(String),
          region: settings.region,
          language: settings.locale,
        },
      }),
    );

    return fetchedData;
  };

  const { data, error, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["discover", ctx.mediaType, filters[ctx.mediaType]],
    queryFn: ({ pageParam }) => fetchMoviesTV({ pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage?.page + 1,
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FiltersBtns mediaType={ctx.mediaType} onChange={(filters) => setFilters(filters)} />

      <FlashList
        onEndReached={() => hasNextPage && !isFetching && fetchNextPage()}
        onEndReachedThreshold={0.2}
        data={data?.pages.flatMap((page) => page?.results)}
        numColumns={colsNum}
        keyExtractor={(item) => item.id.toString()}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListFooterComponent={isFetchingNextPage ? LoadingIndicator : null}
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
