import type { AppType } from "@/../api/src/main";
import { hc } from "hono/client";

export const tmdbClient = hc<AppType>(process.env.EXPO_PUBLIC_TMDB_API_URL!);
