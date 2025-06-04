import { getTMDBImageURL } from "@/src/utils/images";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import React, { RefObject } from "react";
import { Pressable, Text, View } from "react-native";
import { useSettings } from "../../contexts/UtilsProvider";
import { DrawerModal, DrawerModalScroll } from "./modals";

type SelectWatchProvidersProps = {
    modalRef: RefObject<BottomSheetModal>;
    watchProviders: { provider_id: number; logo_path: string }[];
    selectedProvider: number[];
    setSelectedProvider: (selectedGenres: number[]) => void;
    onSelectedProviders: () => void;
};

export function SelectWatchProviders({
    modalRef,
    watchProviders,
    selectedProvider,
    setSelectedProvider,
    onSelectedProviders,
}: SelectWatchProvidersProps) {
    const { colors } = useSettings().settings.theme;

    const toggleProvider = (providerId: number) => {
        if (selectedProvider.includes(providerId)) {
            setSelectedProvider(selectedProvider.filter((item) => item !== providerId));
        } else {
            setSelectedProvider([...selectedProvider, providerId]);
        }
    };

    return (
        <DrawerModalScroll modalRef={modalRef} onDismiss={() => onSelectedProviders()}>
            <Text style={{ color: colors.textHeading, fontWeight: "500", fontSize: 20, marginBottom: 2 }}>
                Where To Watch ({watchProviders?.length})
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 10 }}>Select providers to filter the results.</Text>
            <FlashList
                data={watchProviders}
                numColumns={6}
                estimatedItemSize={55}
                extraData={selectedProvider}
                keyExtractor={(item) => item.provider_id.toString()}
                renderItem={({ item }) => (
                    <Pressable
                        onPress={() => toggleProvider(item.provider_id)}
                        style={[
                            { padding: 8, borderWidth: 1, borderColor: colors.border, borderRadius: 15 },
                            selectedProvider.includes(item.provider_id) && { borderColor: colors.primary },
                        ]}
                    >
                        <Image
                            style={{ width: 38, height: 38, borderRadius: 5 }}
                            source={getTMDBImageURL("logo", "w92", item.logo_path)}
                            transition={100}
                        />
                    </Pressable>
                )}
            />

            <View style={{ marginTop: 20, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 }}>
                <Pressable onPress={() => setSelectedProvider([])} style={{ width: "10%", justifyContent: "center", alignItems: "center" }}>
                    <Ionicons name="trash-bin-sharp" size={24} color={colors.text} />
                </Pressable>
                <Pressable
                    onPress={() => modalRef.current?.dismiss()}
                    style={{ padding: 10, flex: 1, backgroundColor: colors.primary, borderRadius: 15 }}
                >
                    <Text
                        style={{
                            color: colors.text,
                            fontSize: 16,
                            fontWeight: "bold",
                            textAlign: "center",
                        }}
                    >
                        Apply
                    </Text>
                </Pressable>
            </View>
        </DrawerModalScroll>
    );
}

type SortByModalProps = {
    modalRef: RefObject<BottomSheetModal>;
    selectedOption: "popularity" | "rating";
    setSelectedOption: (option: "popularity" | "rating") => void;
    onSelectedOption: () => void;
};

export function SortByModal({ modalRef, selectedOption, setSelectedOption, onSelectedOption }: SortByModalProps) {
    const { colors } = useSettings().settings.theme;

    return (
        <DrawerModal modalRef={modalRef} onDismiss={() => onSelectedOption()}>
            <Text style={{ color: colors.textHeading, fontWeight: "500", fontSize: 20, marginBottom: 2 }}>Sort By</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 10 }}>Select the option to sort the results.</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                {["popularity", "rating"].map((option) => (
                    <Pressable
                        onPress={() => setSelectedOption(option.toLowerCase() as "popularity" | "rating")}
                        key={option}
                        style={[
                            { padding: 8, borderWidth: 1, borderColor: colors.border, borderRadius: 15 },
                            selectedOption === option && { borderColor: colors.primary },
                        ]}
                    >
                        <Text
                            style={[
                                { textTransform: "capitalize", color: colors.text, fontWeight: 500 },
                                selectedOption === option && { color: colors.primary },
                            ]}
                        >
                            {option}
                        </Text>
                    </Pressable>
                ))}
            </View>
            <View style={{ marginTop: 20, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 }}>
                <Pressable
                    onPress={() => modalRef.current?.dismiss()}
                    style={{ padding: 10, flex: 1, backgroundColor: colors.primary, borderRadius: 15 }}
                >
                    <Text
                        style={{
                            color: colors.text,
                            fontSize: 16,
                            fontWeight: "bold",
                            textAlign: "center",
                        }}
                    >
                        Apply
                    </Text>
                </Pressable>
            </View>
        </DrawerModal>
    );
}

type SelectGenresProps = {
    modalRef: RefObject<BottomSheetModal>;
    genres: { id: number; name: string }[];
    selectedGenres: number[];
    setSelectedGenres: (selectedGenres: number[]) => void;
    onSelectedGenres: () => void;
};

export function SelectGenres({ modalRef, genres, selectedGenres, setSelectedGenres, onSelectedGenres }: SelectGenresProps) {
    const { colors } = useSettings().settings.theme;

    const toggleGenre = (genreId: number) => {
        if (selectedGenres.includes(genreId)) {
            setSelectedGenres(selectedGenres.filter((item) => item !== genreId));
        } else {
            setSelectedGenres([...selectedGenres, genreId]);
        }
    };

    return (
        <DrawerModal modalRef={modalRef} onDismiss={() => onSelectedGenres()}>
            <Text style={{ color: colors.textHeading, fontWeight: "500", fontSize: 20, marginBottom: 2 }}>Genres</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 10 }}>Select genres to filter the results.</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                {genres.map((genre) => (
                    <Pressable
                        onPress={() => toggleGenre(genre.id)}
                        key={genre.id}
                        style={[
                            { padding: 8, borderWidth: 1, borderColor: colors.border, borderRadius: 15 },
                            selectedGenres.includes(genre.id) && { borderColor: colors.primary },
                        ]}
                    >
                        <Text style={[{ color: colors.text, fontWeight: 500 }, selectedGenres.includes(genre.id) && { color: colors.primary }]}>
                            {genre.name}
                        </Text>
                    </Pressable>
                ))}
            </View>

            <View style={{ marginTop: 20, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 }}>
                <Pressable onPress={() => setSelectedGenres([])} style={{ width: "10%", justifyContent: "center", alignItems: "center" }}>
                    <Ionicons name="trash-bin-sharp" size={24} color={colors.text} />
                </Pressable>
                <Pressable
                    onPress={() => modalRef.current?.dismiss()}
                    style={{ padding: 10, flex: 1, backgroundColor: colors.primary, borderRadius: 15 }}
                >
                    <Text
                        style={{
                            color: colors.text,
                            fontSize: 16,
                            fontWeight: "bold",
                            textAlign: "center",
                        }}
                    >
                        Apply
                    </Text>
                </Pressable>
            </View>
        </DrawerModal>
    );
}
