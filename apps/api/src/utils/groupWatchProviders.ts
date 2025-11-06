import * as v from "valibot";
import { Provider, WatchProviders } from "../routes/media/schema";

export const groupWatchProviders = (data: v.InferOutput<typeof WatchProviders>, region: string) => {
    const localeData = data.results[region];

    if (!localeData) return;

    const providersMap = new Map<number, v.InferOutput<typeof Provider> & { watchOptions: string[] }>();

    // Helper function to process a provider list (rent, flatrate, buy)
    const processProviderType = (type: "rent" | "flatrate" | "buy", watchOptionTitle: string) => {
        for (const { provider_id, logo_path, provider_name, display_priority } of localeData[type] ?? []) {
            if (!providersMap.has(provider_id)) {
                providersMap.set(provider_id, {
                    provider_id,
                    logo_path,
                    provider_name,
                    display_priority,
                    watchOptions: [],
                });
            }
            providersMap.get(provider_id)?.watchOptions.push(watchOptionTitle);
        }
    };

    processProviderType("rent", "Rent");
    processProviderType("flatrate", "Stream");
    processProviderType("buy", "Buy");

    // Convert the Map to a sorted array
    const sortedProviders = Array.from(providersMap.values()).sort((a, b) => a.display_priority - b.display_priority);

    return { link: localeData.link, providers: sortedProviders };
};
