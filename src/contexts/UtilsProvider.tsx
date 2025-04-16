import type { Settings } from "@/src/components/types/shared";
import { ChooseTheme } from "@/src/constants/Themes";
import { moviesGenresInDB, settingsInDB, tvGenresInDB } from "@/src/db/schema";
import { API } from "@/src/utils/api";
import { sql } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { getLocales } from "expo-localization";
import { type ReactNode, createContext, useContext } from "react";
import { LocalDB } from "../db/DatabaseProvider";

// Custom hooks to access the API and settings
export const useTMDB = () => {
    const context = useContext(UtilsContext);
    if (!context) throw new Error("useTMDB must be used within a UtilsProvider");

    return context.apiInstance;
};

export const useSettings = () => {
    const context = useContext(UtilsContext);
    if (!context) throw new Error("useSettings must be used within a UtilsProvider");

    return { settings: context.settings, updateSettings: context.updateSettings };
};

type UtilsContextType = {
    apiInstance: API;
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
    const apiInstance = new API(settings);

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
        const movieGenres = await apiInstance.genresList("movie", locale);
        const tvGenres = await apiInstance.genresList("tv", locale);

        if (!movieGenres || !tvGenres) return;

        await LocalDB.insert(moviesGenresInDB)
            .values(movieGenres)
            .onConflictDoUpdate({ target: moviesGenresInDB.id, set: { name: sql`excluded.name` } });

        await LocalDB.insert(tvGenresInDB)
            .values(tvGenres)
            .onConflictDoUpdate({ target: tvGenresInDB.id, set: { name: sql`excluded.name` } });
    };

    return <UtilsContext.Provider value={{ apiInstance, settings, updateSettings }}>{children}</UtilsContext.Provider>;
};
