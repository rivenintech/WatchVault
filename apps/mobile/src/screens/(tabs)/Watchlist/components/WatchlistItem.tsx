import { getTMDBImageURL } from "@/src/utils/images";
import { Image } from "expo-image";
import { Link } from "expo-router";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSettings } from "../../../../contexts/UtilsProvider";

type WatchlistItemProps = {
    link: string;
    title: string;
    poster_path: string | null;
    children: ReactNode;
};
export default function WatchlistItem({ link, title, poster_path, children }: WatchlistItemProps) {
    const { colors } = useSettings().settings.theme;
    return (
        <Link href={link} asChild>
            <Pressable style={styles.container}>
                <Image
                    source={getTMDBImageURL("poster", "original", poster_path)}
                    recyclingKey={poster_path}
                    cachePolicy={"disk"}
                    style={styles.poster}
                />
                <View style={styles.content}>
                    <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
                    {children}
                </View>
            </Pressable>
        </Link>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        paddingVertical: 10,
    },
    poster: {
        width: 100,
        height: 150,
        marginRight: 10,
    },
    content: {
        flex: 1,
    },
    title: { fontWeight: "bold", fontSize: 18 },
});
