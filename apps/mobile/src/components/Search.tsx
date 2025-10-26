import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";
import { useSettings } from "../contexts/UtilsProvider";

export function SearchBar() {
    const { colors } = useSettings().settings.theme;
    return (
        <Link asChild href="/search" style={[styles.searchLink, { backgroundColor: colors.border }]}>
            <Pressable>
                <Ionicons name="search" color={colors.textSecondary} size={24} />
                <Text style={{ color: colors.textSecondary }}>Search</Text>

                <Link href="/settings" style={styles.settingsLink}>
                    <Ionicons name="settings-outline" color={colors.textSecondary} size={24} />
                </Link>
            </Pressable>
        </Link>
    );
}

const styles = StyleSheet.create({
    searchLink: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        borderWidth: 1,
        borderRadius: 25,
        paddingVertical: 10,
        paddingHorizontal: 15,
        height: 50,
    },
    settingsLink: {
        marginLeft: "auto",
    },
});
