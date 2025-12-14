import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { Text, View } from "react-native";
import { useSettings } from "../../../../contexts/UtilsProvider";
import { getTMDBImageURL } from "../../../../utils/images";

type PersonCreditsListProps = {
    credits: (
        | {
              id: number;
              media_type: "movie";
              poster_path: string | null;
              overview: string;
              character: string;
              title: string;
              release_date: string | null;
          }
        | {
              id: number;
              media_type: "tv";
              poster_path: string | null;
              overview: string;
              character: string;
              name: string;
              first_air_date: string | null;
          }
    )[];
};

export default function PersonCreditsList({ credits }: PersonCreditsListProps) {
    const { colors } = useSettings().settings.theme;
    let lastYear: string | null = null;

    return (
        <FlashList
            data={credits}
            ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => {
                const year = item.media_type === "movie" ? item.release_date.split("-")[0] : item.first_air_date.split("-")[0];
                const isSameYear = year === lastYear;
                lastYear = year;

                return (
                    <>
                        {!isSameYear && (
                            <Text
                                style={{
                                    color: colors.textSecondary,
                                    fontWeight: "500",
                                    fontSize: 12,
                                    marginTop: 10,
                                    marginBottom: 5,
                                }}
                            >
                                {year || "N/A"}
                            </Text>
                        )}

                        <Link key={item.id} href={`/${item.media_type}/${item.id}`}>
                            <View
                                style={{
                                    flexDirection: "row",
                                    borderRadius: 10,
                                    borderBottomColor: colors.border,
                                    borderBottomWidth: 1,
                                }}
                            >
                                <Image
                                    source={getTMDBImageURL("poster", "w500", item.poster_path)}
                                    recyclingKey={item.poster_path}
                                    cachePolicy={"disk"}
                                    transition={200}
                                    style={{
                                        aspectRatio: 2 / 3,
                                        height: 120,
                                        borderRadius: 10,
                                        margin: 5,
                                    }}
                                />
                                <View style={{ flex: 1, padding: 15 }}>
                                    <Text style={{ color: "white", fontWeight: "500", fontSize: 16 }}>
                                        {item.media_type === "movie" ? item.title : item.name}
                                    </Text>
                                    <Text numberOfLines={4} style={{ color: "white", marginTop: 3, fontSize: 12 }}>
                                        {item.overview}
                                    </Text>
                                    {item.character && <Text style={{ color: colors.primary, marginTop: 3, fontSize: 12 }}>as {item.character}</Text>}
                                </View>
                            </View>
                        </Link>
                    </>
                );
            }}
        />
    );
}
