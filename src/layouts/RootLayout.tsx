import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { ThemeProvider } from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { UtilsProvider, useSettings } from "../contexts/UtilsProvider";
import { LocalDatabase } from "../db/DatabaseProvider";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Set the animation options. This is optional.
SplashScreen.setOptions({
    duration: 150,
    fade: true,
});

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
        },
    },
});

export default function RootLayout() {
    return (
        <LocalDatabase>
            <UtilsProvider>
                <QueryClientProvider client={queryClient}>
                    <ThemedLayout />
                </QueryClientProvider>
            </UtilsProvider>
        </LocalDatabase>
    );
}

function ThemedLayout() {
    const { theme } = useSettings().settings;

    return (
        <ThemeProvider value={theme}>
            <GestureHandlerRootView style={{ flex: 1 }} onLayout={() => SplashScreen.hide()}>
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
