import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";
import { useSettings } from "../contexts/UtilsProvider";

type WatchedButtonTickProps = { onPress: () => void; children?: React.ReactNode };
export function WatchedButtonTick({ onPress, children }: WatchedButtonTickProps) {
    const { colors } = useSettings().settings.theme;

    return (
        <View style={styles.actionRow}>
            {children}
            <Pressable style={[styles.editStatusBtn, { borderColor: colors.border }]} onPress={() => onPress()}>
                <Ionicons name="checkmark" color="white" size={24} />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    editStatusBtn: { borderWidth: 1, paddingHorizontal: 30, borderRadius: 25 },
    actionRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        marginLeft: "auto",
        marginTop: "auto",
    },
});
