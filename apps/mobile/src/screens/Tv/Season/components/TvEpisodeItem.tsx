import { useSettings } from "@/src/contexts/UtilsProvider";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

type TvEpisodeItemProps = {
    episode_number: number;
    name: string;
    vote_average: number | null;
    isChecked: boolean;
    onEpisodePress: () => void;
    onCheckboxPress: () => void;
};
export default function TvEpisodeItem({ episode_number, name, vote_average, isChecked, onEpisodePress, onCheckboxPress }: TvEpisodeItemProps) {
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
