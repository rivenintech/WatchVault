import Header from "@/src/components/Header";
import { useSettings } from "@/src/contexts/UtilsProvider";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import { createContext, useState } from "react";
import { StyleSheet } from "react-native";

export type MediaTypeContextType = {
    mediaType: "tv" | "movie";
    setMediaType: (mediaType: "tv" | "movie") => void;
};

export const MediaTypeContext = createContext<MediaTypeContextType | undefined>(undefined);

export default function RootLayout() {
    const [mediaType, setMediaType] = useState<"tv" | "movie">("tv");
    const { colors } = useSettings().settings.theme;

    return (
        <MediaTypeContext.Provider value={{ mediaType, setMediaType }}>
            <Tabs
                screenOptions={{
                    tabBarActiveTintColor: colors.primary,
                    tabBarInactiveTintColor: colors.textSecondary,
                    tabBarStyle: [styles.tabBarStyle, { borderColor: colors.border, backgroundColor: colors.border }],
                    tabBarItemStyle: styles.tabBarItemStyle,
                    header: () => <Header mediaType={mediaType} setMediaType={setMediaType} />,
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        title: "Watchlist",
                        tabBarIcon: ({ color }) => <Ionicons name="film-outline" color={color} size={24} />,
                    }}
                    initialParams={{ mediaType }}
                />
                <Tabs.Screen
                    name="discover"
                    options={{
                        title: "Explore",
                        tabBarIcon: ({ color }) => <Ionicons name="search-sharp" color={color} size={24} />,
                    }}
                />
                <Tabs.Screen
                    name="stats"
                    options={{
                        title: "Stats",
                        tabBarIcon: ({ color }) => <Ionicons name="stats-chart" color={color} size={24} />,
                    }}
                />
            </Tabs>
        </MediaTypeContext.Provider>
    );
}

const styles = StyleSheet.create({
    tabBarStyle: {
        borderRadius: 10,
        margin: 10,
        height: 65,
        borderWidth: 1,
    },
    tabBarItemStyle: {
        marginVertical: 5,
    },
});
