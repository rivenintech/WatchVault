import { getTMDBImageURL } from "@/src/utils/images";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSettings } from "../../../contexts/UtilsProvider";
import { formatDate } from "../../../utils/datetime";

type SearchResultItemProps = {
    image_path: string | null;
    date?: string;
    text: string;
    secondaryText: string;
};
export default function SearchResultItem({ image_path, date, text, secondaryText }: SearchResultItemProps) {
    const { colors } = useSettings().settings.theme;

    return (
        <>
            <Image source={getTMDBImageURL("poster", "original", image_path)} style={styles.poster} recyclingKey={image_path} transition={150} />
            <View style={styles.flex1}>
                {date && <Text style={[styles.release_date, { color: colors.primary }]}>{formatDate(date, "short")}</Text>}
                <Text style={[styles.title, { color: colors.text }]}>{text}</Text>
                <Text numberOfLines={3} style={[styles.overview, { color: colors.text }]}>
                    {secondaryText}
                </Text>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    poster: {
        aspectRatio: 2 / 3,
        height: 130,
        marginRight: 10,
    },
    release_date: { fontWeight: "bold", fontSize: 12, marginBottom: 2 },
    title: { fontWeight: "bold", fontSize: 18 },
    overview: { marginVertical: 8, fontSize: 13 },
    flex1: { flex: 1 },
});
