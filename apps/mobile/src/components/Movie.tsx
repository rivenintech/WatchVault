import { formatDate } from "@/src/utils/datetime";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import React, { useEffect, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import Animated, { FadeIn, FadeOut, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { useSettings } from "../contexts/UtilsProvider";
import { ConfirmModal, WatchedDrawer } from "./Modals/Modals";

export function WatchedWatchlistBtn({ releaseDate, watchedDate, setWatchedDate }) {
    const { colors } = useSettings().settings.theme;
    const confirmModalRef = useRef<BottomSheetModal>(null);
    const watchedDrawerRef = useRef<BottomSheetModal>(null);

    const btnWidth = useSharedValue(typeof watchedDate === "string" ? 100 : 60);
    const btnOpacity = useSharedValue(typeof watchedDate === "string" ? 0 : 100);
    const btnWidthAnimated = useAnimatedStyle(() => ({
        width: withSpring(`${btnWidth.value}%`),
    }));

    const btnOpacityAnimated = useAnimatedStyle(() => ({
        opacity: withTiming(btnOpacity.value / 100),
    }));

    useEffect(() => {
        if (typeof watchedDate === "string") {
            btnWidth.value = 100;
            btnOpacity.value = 0;
        } else {
            btnWidth.value = 60;
            btnOpacity.value = 100;
        }
    }, [watchedDate]);

    return (
        <>
            <WatchedDrawer drawerRef={watchedDrawerRef} releaseDate={releaseDate} onSubmit={(selectedDate) => setWatchedDate(selectedDate)} />
            <ConfirmModal modalRef={confirmModalRef} onSubmit={() => setWatchedDate(undefined)} />
            <View style={styles.btnContainer}>
                <Animated.View style={btnWidthAnimated}>
                    <View>
                        {typeof watchedDate === "string" ? (
                            <>
                                <Pressable
                                    onPress={() => confirmModalRef.current?.present()}
                                    style={[
                                        {
                                            borderColor: colors.primary,
                                        },
                                        styles.primaryBtn,
                                    ]}
                                >
                                    <Ionicons name="bookmark-outline" color={colors.primary} size={24} />
                                    <Text style={[{ color: colors.primary }, styles.btnText]}>Remove From Watched</Text>
                                </Pressable>
                                <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.watchedDate}>
                                    <Ionicons name="checkmark-sharp" color={colors.primary} size={12} />
                                    <Text style={[{ color: colors.primary }, styles.watchedDateText]}>{formatDate(watchedDate, "full")}</Text>
                                </Animated.View>
                            </>
                        ) : (
                            <Pressable
                                style={[{ borderColor: colors.textHeading }, styles.primaryBtn]}
                                onPress={() => watchedDrawerRef.current?.present()}
                            >
                                <Ionicons name="add" color="white" size={24} />
                                <Text style={[{ color: colors.textHeading }, styles.btnText]}>Add To Watched</Text>
                            </Pressable>
                        )}
                    </View>
                </Animated.View>

                {watchedDate === null ? (
                    <Pressable style={styles.watchlistBtn} onPress={() => setWatchedDate(undefined)}>
                        <Animated.Text style={[{ color: colors.primary }, btnOpacityAnimated, styles.btnText]}>In Watchlist</Animated.Text>
                    </Pressable>
                ) : (
                    <Pressable style={styles.watchlistBtn} onPress={() => setWatchedDate(null)}>
                        <Animated.Text style={[{ color: colors.textSecondary }, btnOpacityAnimated, styles.btnText]}>Watchlist</Animated.Text>
                    </Pressable>
                )}
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    watchlistBtn: { flexDirection: "row", alignItems: "center", marginHorizontal: "auto" },
    btnText: { fontWeight: "500" },
    primaryBtn: {
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 10,
        borderRadius: 25,
        flexDirection: "row",
        gap: 5,
    },
    watchedDateText: { fontSize: 10 },
    watchedDate: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        marginTop: 6,
    },
    btnContainer: { flexDirection: "row" },
});
