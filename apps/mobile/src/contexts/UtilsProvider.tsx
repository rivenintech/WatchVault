import type { ThemeType } from "@/src/constants/themes";
import { ChooseTheme } from "@/src/constants/themes";
import { moviesGenresInDB, settingsInDB, tvGenresInDB } from "@/src/db/schema";
import { sql } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { getLocales } from "expo-localization";
import { parseResponse } from "hono/client";
import { type ReactNode, createContext, useContext } from "react";
import { LocalDB } from "../db/DatabaseProvider";
import { tmdbClient } from "../utils/apiClient";

type Settings = { id: number; locale: string; theme: ThemeType; theme_name: string; region: string };

// Custom hooks to access the settings
export const useSettings = () => {
    const context = useContext(UtilsContext);
    if (!context) throw new Error("useSettings must be used within a UtilsProvider");

    return { settings: context.settings, updateSettings: context.updateSettings };
};

type UtilsContextType = {
    settings: Settings;
    updateSettings: (newSettings: Settings) => void;
};
const UtilsContext = createContext<UtilsContextType | undefined>(undefined);

export const UtilsProvider = ({ children }: { children: ReactNode }) => {
    const settingsFromDB = useLiveQuery(LocalDB.query.settingsInDB.findFirst());

    const initializeSettings = async () => {
        // Wait until the query finishes
        if (!settingsFromDB.updatedAt) return;

        // If the settings are not in the database, insert them
        if (!settingsFromDB.data) {
            await LocalDB.insert(settingsInDB).values({
                id: 1,
                locale: getLocales()[0].languageTag,
                region: getLocales()[0].regionCode || "US",
                theme_name: "Dark",
            });
        }

        // If the genres are not in the database, add them
        const genresExist = [Boolean(await LocalDB.query.moviesGenresInDB.findFirst()), Boolean(await LocalDB.query.tvGenresInDB.findFirst())].every(
            Boolean,
        );

        if (!genresExist) await addGenres();
    };

    initializeSettings();

    if (!settingsFromDB.data) return;

    const settings = { ...settingsFromDB.data, theme: ChooseTheme(settingsFromDB.data.theme_name) };

    const updateSettings = async (newSettings: Settings) => {
        // If the locale has changed, update the genres
        if (settings.locale !== newSettings.locale) {
            await addGenres(newSettings.locale);
        }

        // Update the settings in the database
        await LocalDB.update(settingsInDB).set({
            locale: newSettings.locale,
            region: newSettings.region,
            theme_name: newSettings.theme_name,
        });
    };

    const addGenres = async (locale?: string) => {
        const movieGenres = await parseResponse(
            tmdbClient.genres[":mediaType"].$get({
                param: { mediaType: "movie" },
                query: { language: locale || settings.locale },
            }),
        );
        const tvGenres = await parseResponse(
            tmdbClient.genres[":mediaType"].$get({
                param: { mediaType: "tv" },
                query: { language: locale || settings.locale },
            }),
        );

        if (!movieGenres || !tvGenres) return;

        await LocalDB.insert(moviesGenresInDB)
            .values(movieGenres.genres)
            .onConflictDoUpdate({ target: moviesGenresInDB.id, set: { name: sql`excluded.name` } });

        await LocalDB.insert(tvGenresInDB)
            .values(tvGenres.genres)
            .onConflictDoUpdate({ target: tvGenresInDB.id, set: { name: sql`excluded.name` } });
    };

    return <UtilsContext.Provider value={{ settings, updateSettings }}>{children}</UtilsContext.Provider>;
};
