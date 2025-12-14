import { StyleSheet, View } from "react-native";
import { useSettings } from "../contexts/UtilsProvider";

export default function ProgressBar({ watched_episodes, episode_count }: { watched_episodes?: number; episode_count: number }) {
    const { colors } = useSettings().settings.theme;
    return (
        <View style={[styles.progressBarBackground, { backgroundColor: colors.text }]}>
            <View
                style={[
                    styles.progressBar,
                    {
                        width: `${((watched_episodes || 0) / episode_count) * 100}%`,
                        backgroundColor: colors.primary,
                    },
                ]}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    progressBarBackground: {
        flex: 1,
        height: 5,
        borderRadius: 5,
        overflow: "hidden",
    },
    progressBar: {
        height: "100%",
    },
});
