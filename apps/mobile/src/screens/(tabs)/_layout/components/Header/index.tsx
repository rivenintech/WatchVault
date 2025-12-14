import { useSettings } from "@/src/contexts/UtilsProvider";
import { StatusBar } from "expo-status-bar";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { MediaTypeContextType } from "../..";
import SearchBar from "./SearchBar";

export default function Header({ mediaType, setMediaType }: MediaTypeContextType) {
    const { colors, dark } = useSettings().settings.theme;
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.safeArea, { backgroundColor: colors.background, paddingTop: insets.top }]}>
            <StatusBar style={dark ? "light" : "dark"} />
            <SearchBar />
            <View style={styles.toggleContainer}>
                <Pressable onPress={() => setMediaType("tv")}>
                    <Text style={[styles.toggleText, { color: mediaType === "tv" ? colors.primary : colors.textSecondary }]}>Shows</Text>
                </Pressable>

                <Pressable onPress={() => setMediaType("movie")}>
                    <Text style={[styles.toggleText, { color: mediaType === "movie" ? colors.primary : colors.textSecondary }]}>Movies</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        marginHorizontal: 10,
        marginTop: 10,
        gap: 10,
    },
    toggleContainer: {
        flexDirection: "row",
        gap: 10,
    },
    toggleText: {
        fontSize: 26,
        fontWeight: "bold",
    },
});
