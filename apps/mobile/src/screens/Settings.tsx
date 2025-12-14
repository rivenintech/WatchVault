import { ChooseTheme, ThemeList } from "@/src/constants/themes";
import { useSettings } from "@/src/contexts/UtilsProvider";
import { useQuery } from "@tanstack/react-query";
import { parseResponse } from "hono/client";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { tmdbClient } from "../utils/apiClient";

export default function SettingsScreen() {
    const { settings, updateSettings } = useSettings();
    const { colors } = settings.theme;
    const [selectedRegion, setSelectedRegion] = useState(settings.region);
    const themes = ThemeList();
    const [selectedTheme, setSelectedTheme] = useState(settings.theme_name);

    const { data: regions } = useQuery({
        queryKey: ["regions"],
        queryFn: () =>
            parseResponse(
                tmdbClient.configuration.regions.$get({
                    query: {
                        language: settings.locale,
                    },
                }),
            ),
    });

    useEffect(() => {
        updateSettings({ ...settings, region: selectedRegion, theme: ChooseTheme(selectedTheme), theme_name: selectedTheme });
    }, [selectedRegion, settings, updateSettings, selectedTheme]);

    return (
        <View style={styles.container}>
            <View>
                <Text style={[styles.label, { color: colors.primary }]}>Region</Text>
                <Dropdown
                    style={[styles.dropdown, { borderBottomColor: colors.textSecondary }]}
                    selectedTextStyle={[styles.selectedText, { color: colors.text }]}
                    itemTextStyle={{ color: colors.text }}
                    placeholderStyle={{ color: colors.textSecondary }}
                    inputSearchStyle={[styles.searchInput, { backgroundColor: colors.border, color: colors.text }]}
                    iconStyle={[styles.iconStyle, { tintColor: colors.primary }]}
                    containerStyle={{
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                    }}
                    activeColor="transparent"
                    search
                    maxHeight={300}
                    value={selectedRegion}
                    data={regions?.results || []}
                    valueField="iso_3166_1"
                    labelField="english_name"
                    placeholder="Select region"
                    searchPlaceholder="Search..."
                    onChange={(item) => {
                        setSelectedRegion(item.iso_3166_1);
                    }}
                />
                <Text style={[styles.helperText, { color: colors.textSecondary }]}>
                    Used to determine the the availability of movies and shows in your region.
                </Text>
            </View>

            <View>
                <Text style={[styles.label, { color: colors.primary }]}>Theme</Text>
                <Dropdown
                    style={[styles.dropdown, { borderBottomColor: colors.textSecondary }]}
                    selectedTextStyle={[styles.selectedText, { color: colors.text }]}
                    itemTextStyle={{ color: colors.text }}
                    placeholderStyle={{ color: colors.textSecondary }}
                    inputSearchStyle={[styles.searchInput, { backgroundColor: colors.border, color: colors.text }]}
                    iconStyle={[styles.iconStyle, { tintColor: colors.primary }]}
                    containerStyle={{
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                    }}
                    activeColor="transparent"
                    search
                    maxHeight={300}
                    value={selectedTheme}
                    data={themes}
                    valueField="value"
                    labelField="label"
                    placeholder="Select theme"
                    searchPlaceholder="Search..."
                    onChange={(item) => {
                        setSelectedTheme(item.value);
                    }}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 10,
    },
    label: {
        fontWeight: "500",
    },
    dropdown: {
        height: 50,
        borderBottomWidth: 0.5,
    },
    selectedText: {
        marginLeft: 8,
        fontWeight: "500",
    },
    searchInput: {
        height: 40,
        borderColor: "transparent",
        borderRadius: 5,
        marginHorizontal: 8,
    },
    iconStyle: {
        width: 20,
        height: 20,
    },
    helperText: {
        fontSize: 12,
        marginTop: 10,
    },
});
