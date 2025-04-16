import { useSettings, useTMDB } from "@/src/contexts/UtilsProvider";
import { LocalDB } from "@/src/db/DatabaseProvider";
import { moviesGenresInDB, tvGenresInDB } from "@/src/db/schema";
import { APIResponses } from "@/src/utils/types/apiResponses";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SelectGenres, SelectWatchProviders, SortByModal } from "./modals/DiscoverModals";

type selected = Record<"movie" | "tv", { sortBy: "popularity" | "rating"; genres: number[]; providers: number[] }>;

type DiscoverProps = {
    mediaType: "movie" | "tv";
    onChange: (selected: selected) => void;
};

export default function FiltersBtns({ mediaType, onChange }: DiscoverProps) {
    type Providers = Record<"movie" | "tv", APIResponses["watchProvidersList"]>;
    const { colors } = useSettings().settings.theme;
    const genreSheet = useRef<BottomSheetModal>(null);
    const watchProvidersSheet = useRef<BottomSheetModal>(null);
    const sortBySheet = useRef<BottomSheetModal>(null);
    const API = useTMDB();

    const movieGenres = useMemo(() => LocalDB.select().from(moviesGenresInDB).orderBy(moviesGenresInDB.name).all(), []);
    const tvGenres = useMemo(() => LocalDB.select().from(tvGenresInDB).orderBy(tvGenresInDB.name).all(), []);
    const genres = useMemo(() => (mediaType === "movie" ? movieGenres : tvGenres), [mediaType]);

    const [watchProviders, setWatchProviders] = useState<Providers>({ movie: [], tv: [] });
    const [selected, setSelected] = useState<selected>({
        movie: { sortBy: "popularity", genres: [], providers: [] },
        tv: { sortBy: "popularity", genres: [], providers: [] },
    });

    // Fetch watch providers on mount
    useEffect(() => {
        (async () => {
            setWatchProviders({ movie: await API.watchProvidersList("movie"), tv: await API.watchProvidersList("tv") });
        })();
    }, []);

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

            {watchProviders[mediaType] && (
                <SelectWatchProviders
                    modalRef={watchProvidersSheet}
                    watchProviders={watchProviders[mediaType]}
                    selectedProvider={selected[mediaType].providers}
                    setSelectedProvider={(providers) => updateSelected("providers", providers)}
                    onSelectedProviders={() => onChange(selected)}
                />
            )}

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
                {watchProviders[mediaType] && (
                    <Pressable onPress={() => genreSheet.current?.present()}>
                        <Text style={{ color: colors.text, padding: 5, borderWidth: 1, borderColor: colors.primary, borderRadius: 5 }}>Genres</Text>
                    </Pressable>
                )}
                <Pressable onPress={() => watchProvidersSheet.current?.present()}>
                    <Text style={{ color: colors.text, padding: 5, borderWidth: 1, borderColor: colors.primary, borderRadius: 5 }}>
                        Where to watch
                    </Text>
                </Pressable>
            </View>
        </>
    );
}
