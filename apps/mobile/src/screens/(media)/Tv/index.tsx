import CastAndCrew from "@/src/components/CastAndCrew";
import { LoadingIndicator } from "@/src/components/LoadingIndicator";
import SlidingScreen from "@/src/components/SlidingScreen";
import ToggleMoreText from "@/src/components/ToggleMoreText";
import { useSettings } from "@/src/contexts/UtilsProvider";
import { LocalDB } from "@/src/db/DatabaseProvider";
import { tvEpisodesInDB } from "@/src/db/schema";
import { MovieTvPage } from "@/src/screens/(media)/components/MovieShowIndex";
import Recommendations from "@/src/screens/(media)/components/Recommendations";
import WhereToWatch from "@/src/screens/(media)/components/WhereToWatch";
import { tmdbClient } from "@/src/utils/apiClient";
import { useNetInfo } from "@react-native-community/netinfo";
import { useQuery } from "@tanstack/react-query";
import { and, eq, isNotNull } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useLocalSearchParams } from "expo-router";
import { parseResponse } from "hono/client";
import { Text } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import TvSeasons from "./components/TvSeasons";

export default function TvScreen() {
  const { id: idStr } = useLocalSearchParams();
  const id = Number(idStr);
  const { settings } = useSettings();
  const { colors } = settings.theme;
  const { isInternetReachable } = useNetInfo();

  // TODO: https://github.com/drizzle-team/drizzle-orm/issues/2660
  const { updatedAt: episodesUpdatedAt } = useLiveQuery(LocalDB.query.tvEpisodesInDB.findFirst());

  const localShowData = useLiveQuery(
    LocalDB.query.tvInDB.findFirst({
      with: {
        genres: {
          orderBy: {
            id: "asc",
          },
        },
        seasons: {
          extras: {
            watched_episodes: (t) => LocalDB.$count(tvEpisodesInDB, and(eq(tvEpisodesInDB.season_id, t.id), isNotNull(tvEpisodesInDB.watched_date))),
            episode_count: (t) => LocalDB.$count(tvEpisodesInDB, eq(tvEpisodesInDB.season_id, t.id)),
          },
          orderBy: {
            season_number: "asc",
          },
        },
      },
      where: { id },
    }),
    [episodesUpdatedAt],
  ).data;

  const { data: apiShowData } = useQuery({
    queryKey: ["apiShowData", id],
    queryFn: () =>
      parseResponse(
        tmdbClient.tv[":id"].$get({
          param: {
            id: id.toString(),
          },
          query: {
            language: settings.locale,
            region: settings.region,
          },
        }),
      ),
  });

  const showData = localShowData || apiShowData;

  const { data: totalRuntime } = useQuery({
    queryKey: ["totalRuntime", id],
    queryFn: () =>
      parseResponse(
        tmdbClient.tv[":id"]["total-runtime"].$get({
          param: {
            id: id.toString(),
          },
        }),
      ),
  });

  return showData ? (
    <MovieTvPage
      backdrop_path={showData.backdrop_path}
      poster_path={showData.poster_path}
      release_date={showData.first_air_date}
      runtime={totalRuntime}
      title={showData.name}
      genres={showData.genres}
      localData={Boolean(localShowData)}
    >
      <SlidingScreen tabs={["Overview", "Seasons"]}>
        <ScrollView contentContainerStyle={{ gap: 15 }}>
          <ToggleMoreText max_lines={3}>{showData.overview}</ToggleMoreText>

          {apiShowData && (
            <>
              {apiShowData["watch/providers"] && <WhereToWatch watchProviders={apiShowData["watch/providers"]} />}
              {apiShowData.aggregate_credits && <CastAndCrew credits={apiShowData.aggregate_credits} />}
              <Recommendations recommendations={apiShowData.recommendations?.results} />
            </>
          )}
        </ScrollView>
        <TvSeasons seasons={showData.seasons} showID={showData.id} />
      </SlidingScreen>
    </MovieTvPage>
  ) : isInternetReachable === false ? (
    <Text style={{ color: "red" }}>No internet connection</Text>
  ) : (
    LoadingIndicator
  );
}
