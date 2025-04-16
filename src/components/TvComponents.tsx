import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSettings } from "../contexts/UtilsProvider";

export function TvProgress({ episode_count, watched_episodes }: { episode_count: number; watched_episodes: number }) {
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

export function ProgressBar({ watched_episodes, episode_count }: { watched_episodes?: number; episode_count: number }) {
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

type TvNextEpisodeProps = { season_number: number; episode_number: number; name: string };
export function TvNextEpisode({ season_number, episode_number, name }: TvNextEpisodeProps) {
    const { colors } = useSettings().settings.theme;
    return (
        <Text style={[styles.nextEpisodeText, { color: colors.text }]}>
            <Text style={[styles.nextEpisodeHighlight, { backgroundColor: colors.border }]}>
                S.{season_number} • EP.{episode_number}
            </Text>
            <Text> - </Text>
            <Text>{name}</Text>
        </Text>
    );
}

type TvEpisodeItemProps = {
    episode_number: number;
    name: string;
    vote_average: number | null;
    isChecked: boolean;
    onEpisodePress: () => void;
    onCheckboxPress: () => void;
};
export function TvEpisodeItem({ episode_number, name, vote_average, isChecked, onEpisodePress, onCheckboxPress }: TvEpisodeItemProps) {
    const { colors } = useSettings().settings.theme;
    return (
        <Pressable onPress={() => onEpisodePress()}>
            <Text style={[styles.episodeNumber, { color: colors.textSecondary }]}>Episode {episode_number}</Text>
            <View style={styles.episodeRow}>
                <Text style={[styles.episodeTitle, { color: colors.textHeading }]} numberOfLines={3}>
                    {name}
                </Text>
                <View style={styles.rightSection}>
                    {vote_average !== 0 && (
                        <>
                            <Ionicons name="star" size={12} color={colors.primary} />
                            <Text style={[styles.voteAverage, { color: colors.textSecondary }]}>{Number(vote_average).toFixed(2)}</Text>
                        </>
                    )}
                    <Pressable
                        role="checkbox"
                        aria-checked={isChecked}
                        style={[styles.checkbox, isChecked ? { backgroundColor: colors.primary } : { borderColor: colors.textSecondary }]}
                        onPress={() => onCheckboxPress()}
                    >
                        {isChecked && <Ionicons name="checkmark" size={20} color="white" />}
                    </Pressable>
                </View>
            </View>
        </Pressable>
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
    progressBarBackground: {
        flex: 1,
        height: 5,
        borderRadius: 5,
        overflow: "hidden",
    },
    progressBar: {
        height: "100%",
    },
    nextEpisodeText: {
        marginVertical: 5,
        fontSize: 13,
    },
    nextEpisodeHighlight: {
        fontWeight: "500",
    },
    rightSection: {
        justifyContent: "flex-end",
        flexDirection: "row",
        alignItems: "center",
        width: "20%",
    },
    voteAverage: {
        fontSize: 12,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 4,
        borderWidth: 1,
        backgroundColor: "transparent",
        marginLeft: 5,
    },
    episodeNumber: {
        fontSize: 12,
    },
    episodeRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    episodeTitle: {
        fontWeight: "500",
        width: "80%",
        paddingTop: 2,
        paddingBottom: 5,
    },
});
