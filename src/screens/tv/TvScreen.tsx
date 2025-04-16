import { LoadingIndicator } from "@/src/components/components";
import { CastAndCrew, MovieTvPage, Recommendations, TVSeasons, WhereToWatch } from "@/src/components/MovieShowIndex";
import SlidingScreen from "@/src/components/SlidingScreen";
import { useSettings, useTMDB } from "@/src/contexts/UtilsProvider";
import { LocalDB } from "@/src/db/DatabaseProvider";
import { tvGenresQuery, tvSeasonsQuery } from "@/src/db/dbQueries";
import { tvShowStatusView } from "@/src/db/schema";
import { useNetInfo } from "@react-native-community/netinfo";
import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

export default function TvScreen() {
    const { id: idStr } = useLocalSearchParams();
    const id = Number(idStr);
    const { settings } = useSettings();
    const { colors } = settings.theme;
    const [apiShowData, setApiShowData] = useState<Awaited<ReturnType<typeof API.tvSeries.details>>>();
    const API = useTMDB();
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

    const showData = localShowData || apiShowData;

    useEffect(() => {
        if (!isInternetReachable) return;

        (async () => {
            const apiShowData = await API.tvSeries.details(id, "aggregate_credits", "recommendations", "watch/providers");
            setApiShowData(apiShowData);
        })();
    }, [id, isInternetReachable]);

    return showData ? (
        <MovieTvPage
            backdrop_path={showData.backdrop_path}
            poster_path={showData.poster_path}
            release_date={showData.first_air_date}
            runtime={showData.total_runtime}
            title={showData.name}
            genres={showData.genres}
            localData={Boolean(localShowData)}
        >
            <SlidingScreen tabs={["Overview", "Seasons"]}>
                <ScrollView contentContainerStyle={{ gap: 15 }}>
                    <View>
                        <Text style={{ color: colors.text }}>{showData.overview}</Text>
                    </View>

                    {apiShowData && (
                        <>
                            {apiShowData["watch/providers"] && <WhereToWatch watchProviders={apiShowData["watch/providers"]} />}
                            {apiShowData.aggregate_credits && <CastAndCrew credits={apiShowData.aggregate_credits} />}
                            <Recommendations recommendations={apiShowData.recommendations?.results} />
                        </>
                    )}
                </ScrollView>
                <TVSeasons seasons={showData.seasons} showID={showData.id} />
            </SlidingScreen>
        </MovieTvPage>
    ) : isInternetReachable === false ? (
        <Text style={{ color: "red" }}>No internet connection</Text>
    ) : (
        LoadingIndicator
    );
}
