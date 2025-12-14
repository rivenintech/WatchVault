import { useSettings } from "@/src/contexts/UtilsProvider";
import { MediaTypeContext } from "@/src/screens/(tabs)/_layout";
import MoviesList from "@/src/screens/(tabs)/Watchlist/components/MoviesList";
import ShowsList from "@/src/screens/(tabs)/Watchlist/components/ShowsList";
import { useContext } from "react";
import { StyleSheet, View } from "react-native";

export default function IndexScreen() {
    const { colors } = useSettings().settings.theme;
    const context = useContext(MediaTypeContext);

    if (!context) {
        throw new Error("MediaTypeContext not found");
    }

    return (
        <View style={[styles.wrapper, { backgroundColor: colors.background }]}>{context.mediaType === "tv" ? <ShowsList /> : <MoviesList />}</View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        paddingHorizontal: 10,
    },
});
