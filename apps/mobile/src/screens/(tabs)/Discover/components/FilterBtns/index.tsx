import { useSettings } from "@/src/contexts/UtilsProvider";
import { LocalDB } from "@/src/db/DatabaseProvider";
import { moviesGenresInDB, tvGenresInDB } from "@/src/db/schema";
import { tmdbClient } from "@/src/utils/apiClient";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useQuery } from "@tanstack/react-query";
import { parseResponse } from "hono/client";
import { useMemo, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SelectGenres, SelectWatchProviders, SortByModal } from "./DiscoverModals";

type selected = Record<"movie" | "tv", { sortBy: "popularity" | "rating"; genres: number[]; providers: number[] }>;

type FiltersBtnsProps = {
    mediaType: "movie" | "tv";
    onChange: (selected: selected) => void;
};

export default function FiltersBtns({ mediaType, onChange }: FiltersBtnsProps) {
    const settings = useSettings().settings;
    const { colors } = settings.theme;
    const genreSheet = useRef<BottomSheetModal>(null);
    const watchProvidersSheet = useRef<BottomSheetModal>(null);
    const sortBySheet = useRef<BottomSheetModal>(null);

    const movieGenres = useMemo(() => LocalDB.select().from(moviesGenresInDB).orderBy(moviesGenresInDB.name).all(), []);
    const tvGenres = useMemo(() => LocalDB.select().from(tvGenresInDB).orderBy(tvGenresInDB.name).all(), []);
    const genres = useMemo(() => (mediaType === "movie" ? movieGenres : tvGenres), [mediaType]);

    const [selected, setSelected] = useState<selected>({
        movie: { sortBy: "popularity", genres: [], providers: [] },
        tv: { sortBy: "popularity", genres: [], providers: [] },
    });

    const { data: watchProviders } = useQuery({
        queryKey: ["watchProviders", mediaType],
        queryFn: () =>
            parseResponse(
                tmdbClient.configuration["watch-providers"][":mediaType"].$get({
                    param: {
                        mediaType: mediaType,
                    },
                    query: {
                        language: settings.locale,
                        region: settings.region,
                    },
                }),
            ),
    });

    const updateSelected = (key: "genres" | "providers" | "sortBy", value: number[] | "popularity" | "rating") => {
        setSelected((prev) => ({
            ...prev,
            [mediaType]: { ...prev[mediaType], [key]: value },
        }));
    };

    return (
        <>
            <SelectGenres
                modalRef={genreSheet}
                genres={genres}
                selectedGenres={selected[mediaType].genres}
                setSelectedGenres={(genres) => updateSelected("genres", genres)}
                onSelectedGenres={() => onChange(selected)}
            />

            <SelectWatchProviders
                modalRef={watchProvidersSheet}
                watchProviders={watchProviders?.results}
                selectedProvider={selected[mediaType].providers}
                setSelectedProvider={(providers) => updateSelected("providers", providers)}
                onSelectedProviders={() => onChange(selected)}
            />

            <SortByModal
                modalRef={sortBySheet}
                selectedOption={selected[mediaType].sortBy}
                setSelectedOption={(option) => updateSelected("sortBy", option)}
                onSelectedOption={() => onChange(selected)}
            />

            <View style={{ flexDirection: "row", gap: 10, marginRight: "auto", marginBottom: 10 }}>
                <Pressable onPress={() => sortBySheet.current?.present()}>
                    <Text style={{ color: colors.text, padding: 5, borderWidth: 1, borderColor: colors.primary, borderRadius: 5 }}>Sort by</Text>
                </Pressable>
                <Pressable onPress={() => genreSheet.current?.present()}>
                    <Text style={{ color: colors.text, padding: 5, borderWidth: 1, borderColor: colors.primary, borderRadius: 5 }}>Genres</Text>
                </Pressable>
                <Pressable onPress={() => watchProvidersSheet.current?.present()}>
                    <Text style={{ color: colors.text, padding: 5, borderWidth: 1, borderColor: colors.primary, borderRadius: 5 }}>
                        Where to watch
                    </Text>
                </Pressable>
            </View>
        </>
    );
}
