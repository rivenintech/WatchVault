import ProgressBar from "@/src/components/ProgressBar";
import { useSettings } from "@/src/contexts/UtilsProvider";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

export default function TvProgress({ episode_count, watched_episodes }: { episode_count: number; watched_episodes: number }) {
    const { colors } = useSettings().settings.theme;
    return (
        <View style={styles.container}>
            {episode_count === watched_episodes ? (
                <View>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                        <Ionicons name="checkmark-sharp" color={colors.primary} size={12} />
                        <Text style={{ color: colors.primary }}>Finished</Text>
                    </View>
                    <Text style={[styles.progressLabel, { color: colors.text }]}>
                        {watched_episodes}/{episode_count} episodes • ?h ?m total
                    </Text>
                </View>
            ) : (
                <View style={styles.progressContainer}>
                    <Text style={[styles.progressLabel, { color: colors.text }]}>
                        {watched_episodes}/{episode_count} ({episode_count - watched_episodes} left)
                    </Text>
                    <ProgressBar watched_episodes={watched_episodes} episode_count={episode_count} />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 5,
    },
    progressContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    progressLabel: {
        fontSize: 12,
    },
});
