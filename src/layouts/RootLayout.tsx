import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { Suspense } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { LoadingIndicator } from "../components/components";
import { UtilsProvider, useSettings } from "../contexts/UtilsProvider";
import { LocalDatabase } from "../db/DatabaseProvider";

export default function RootLayout() {
    return (
        <Suspense fallback={LoadingIndicator}>
            <LocalDatabase>
                <UtilsProvider>
                    <ThemedLayout />
                </UtilsProvider>
            </LocalDatabase>
        </Suspense>
    );
}

function ThemedLayout() {
    const { theme } = useSettings().settings;

    return (
        <ThemeProvider value={theme}>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <BottomSheetModalProvider>
                    <Stack screenOptions={{ contentStyle: { backgroundColor: theme.colors.background } }}>
                        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                        <Stack.Screen name="search" options={{ presentation: "modal", headerShown: false, animation: "fade" }} />
                        <Stack.Screen name="movie/[id]" options={{ headerShown: false }} />
                        <Stack.Screen name="tv/[id]" options={{ headerShown: false }} />
                        <Stack.Screen name="person/[id]" options={{ headerShown: false }} />
                    </Stack>
                </BottomSheetModalProvider>
            </GestureHandlerRootView>
        </ThemeProvider>
    );
}
