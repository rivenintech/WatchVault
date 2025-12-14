import { tmdbClient } from "@/src/utils/apiClient";
import { getTMDBImageURL } from "@/src/utils/images";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { skipToken, useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { parseResponse } from "hono/client";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { useSettings } from "../../contexts/UtilsProvider";
import { formatDate, formatTime } from "../../utils/datetime";
import { CastAndCrew } from "../MovieShowIndex";
import ToggleMoreText from "../ToggleMoreText";
import { DrawerModal } from "./Templates";

type EpisodeDetailsDrawerProps = {
    drawerRef: React.RefObject<BottomSheetModal | null>;
    episodeData?: {
        show_id: number;
        season_number: number;
        episode_number: number;
        name: string;
        air_date: string;
        overview: string;
        runtime: number;
        watched_date: string | null;
        vote_average: number;
    };
    watchedDrawerRef: React.RefObject<BottomSheetModal | null>;
};

export default function EpisodeDetails({ drawerRef, episodeData, watchedDrawerRef }: EpisodeDetailsDrawerProps) {
    const { settings } = useSettings();
    const { colors } = settings.theme;

    const { data: apiData } = useQuery({
        queryKey: ["episodeDetails", episodeData?.show_id, episodeData?.season_number, episodeData?.episode_number],
        queryFn: episodeData
            ? () =>
                  parseResponse(
                      tmdbClient.tv[":id"].season[":seasonNumber"].episode[":episodeNumber"].$get({
                          param: {
                              id: episodeData.show_id.toString(),
                              seasonNumber: episodeData.season_number.toString(),
                              episodeNumber: episodeData.episode_number.toString(),
                          },
                          query: {
                              language: settings.locale,
                          },
                      })
                  )
            : skipToken,
    });

    return (
        <DrawerModal modalRef={drawerRef} style={{}}>
            {episodeData && (
                <>
                    <View>
                        <Image
                            source={getTMDBImageURL("backdrop", "original", apiData?.still_path)}
                            style={{
                                aspectRatio: 16 / 9,
                            }}
                            recyclingKey={apiData?.id.toString()}
                            transition={300}
                        />
                        <View
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: "rgba(0, 0, 0, 0.5)",
                            }}
                        />
                        <View
                            style={{
                                position: "absolute",
                                bottom: 5,
                                left: 15,
                            }}
                        >
                            <Text style={{ color: "white", fontWeight: "bold", fontSize: 18 }}>
                                S.{episodeData.season_number} • EP.{episodeData.episode_number}
                            </Text>
                            <Text style={{ color: colors.text, fontSize: 15 }}>{episodeData.name}</Text>
                        </View>
                        <Pressable onPress={() => watchedDrawerRef.current?.present()} style={{ position: "absolute", bottom: "-10%", right: 15 }}>
                            <Ionicons
                                name="checkmark-circle-outline"
                                color={episodeData.watched_date ? colors.primary : colors.textHeading}
                                size={42}
                            />
                        </Pressable>
                        <View style={{ position: "absolute", top: 10, right: 10 }}>
                            <View
                                style={{
                                    borderWidth: 1,
                                    borderColor: "rgba(136, 136, 136, 0.3)",
                                    backgroundColor: "rgba(0, 0, 0, 0.3)",
                                    borderRadius: 15,
                                    padding: 5,
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 5,
                                }}
                            >
                                <Ionicons name="star" color={colors.primary} size={12} />
                                <Text style={{ color: colors.text, fontSize: 12 }}>{Number(episodeData.vote_average).toFixed(2)}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={{ padding: 15, gap: 5 }}>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <Ionicons name="calendar-outline" color={colors.primary} size={12} />
                            <Text style={{ color: "white", fontSize: 12 }}> {formatDate(episodeData.air_date, "long")} • </Text>
                            <Ionicons name="timer-outline" color={colors.primary} size={12} />
                            <Text style={{ color: "white", fontSize: 12 }}> {formatTime(episodeData.runtime)} </Text>
                        </View>
                        <Text style={{ color: "white", fontSize: 16, fontWeight: "500" }}>Overview</Text>
                        <ToggleMoreText max_lines={3}>{episodeData.overview}</ToggleMoreText>
                        {apiData?.guest_stars && <CastAndCrew title="Guest Stars" credits={{ crew: undefined, cast: apiData.guest_stars }} />}
                    </View>
                </>
            )}
        </DrawerModal>
    );
}
