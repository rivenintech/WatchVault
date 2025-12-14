import { LoadingIndicator } from "@/src/components/LoadingIndicator";
import { CastAndCrew, MovieTvPage, Recommendations, WhereToWatch } from "@/src/components/MovieShowIndex";
import SlidingScreen from "@/src/components/SlidingScreen";
import ToggleMoreText from "@/src/components/ToggleMoreText";
import { useSettings } from "@/src/contexts/UtilsProvider";
import { LocalDB } from "@/src/db/DatabaseProvider";
import { tvGenresQuery, tvSeasonsQuery } from "@/src/db/dbQueries";
import { tvShowStatusView } from "@/src/db/schema";
import { tmdbClient } from "@/src/utils/apiClient";
import { useNetInfo } from "@react-native-community/netinfo";
import { useQuery } from "@tanstack/react-query";
import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useLocalSearchParams } from "expo-router";
import { parseResponse } from "hono/client";
import React, { useMemo } from "react";
import { Text } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import TvSeasons from "./components/TvSeasons";

export default function TvScreen() {
    const { id: idStr } = useLocalSearchParams();
    const id = Number(idStr);
    const { settings } = useSettings();
    const { colors } = settings.theme;
    const { isInternetReachable } = useNetInfo();

    const localTV = useLiveQuery(LocalDB.select().from(tvShowStatusView).where(eq(tvShowStatusView.id, id))).data[0];
    const genres = useLiveQuery(tvGenresQuery(id)).data;
    const localSeasons = useLiveQuery(tvSeasonsQuery(id)).data;

    const localShowData = useMemo(() => {
        if (localTV && localSeasons) {
            return { ...localTV, seasons: localSeasons, genres: genres };
        }

        return undefined;
    }, [localTV, localSeasons, genres]);

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
                })
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
                })
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
