import { useSettings } from "@/src/contexts/UtilsProvider";
import { StyleSheet, Text } from "react-native";

type TvNextEpisodeProps = { season_number: number; episode_number: number; name: string };
export default function TvNextEpisode({ season_number, episode_number, name }: TvNextEpisodeProps) {
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

const styles = StyleSheet.create({
    nextEpisodeText: {
        marginVertical: 5,
        fontSize: 13,
    },
    nextEpisodeHighlight: {
        fontWeight: "500",
    },
});
