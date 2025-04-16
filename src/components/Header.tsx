import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSettings } from "../contexts/UtilsProvider";
import { MediaTypeContextType } from "../layouts/TabsLayout";
import { SearchBar } from "./Search";

export default function Header({ mediaType, setMediaType }: MediaTypeContextType) {
    const { colors } = useSettings().settings.theme;

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
            <SearchBar />
            <View style={styles.toggleContainer}>
                <Pressable onPress={() => setMediaType("tv")}>
                    <Text style={[styles.toggleText, { color: mediaType === "tv" ? colors.primary : colors.textSecondary }]}>Shows</Text>
                </Pressable>

                <Pressable onPress={() => setMediaType("movie")}>
                    <Text style={[styles.toggleText, { color: mediaType === "movie" ? colors.primary : colors.textSecondary }]}>Movies</Text>
                </Pressable>
            </View>
        </SafeAreaView>
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
