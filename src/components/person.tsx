import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { Text, View } from "react-native";
import { useSettings } from "../contexts/UtilsProvider";
import { formatDate, getAge } from "../utils/datetime";
import { getTMDBImageURL } from "../utils/images";
import { APIResponses } from "../utils/types/apiResponses";
import { ToggleMoreText } from "./ToggleMoreText";

export function PersonDetails({ person, roles }: { person: APIResponses["person"] & { roles: { character: string }[] } }) {
    const { colors } = useSettings().settings.theme;

    if (!person) return;

    return (
        <View>
            <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
                <Image
                    style={{ width: 100, height: 150 }}
                    source={{ uri: getTMDBImageURL("poster", "w342", person.profile_path) }}
                    recyclingKey={person.id.toString()}
                    transition={200}
                />
                <View style={{ flex: 1 }}>
                    <View style={{ marginBottom: 10 }}>
                        <Text style={{ color: colors.textHeading, fontWeight: "500", fontSize: 16 }}>{person.name}</Text>
                        <Text style={{ color: colors.primary }}>as {roles?.map((role) => role.character).join(", ")}</Text>
                    </View>
                    <View>
                        <View style={{ flexDirection: "row" }}>
                            <Text style={{ color: colors.textSecondary }}>Age: </Text>
                            <Text style={{ color: colors.text }}>{getAge(person.birthday)}</Text>
                        </View>
                        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                            <Text style={{ color: colors.textSecondary }}>
                                Born:{" "}
                                <Text style={{ color: colors.text }}>
                                    {formatDate(person.birthday, "medium")}
                                    {person.place_of_birth && `, ${person.place_of_birth}`}
                                </Text>
                            </Text>
                        </View>
                        {person.deathday && (
                            <View style={{ flexDirection: "row" }}>
                                <Text style={{ color: colors.textSecondary }}>Deathday: </Text>
                                <Text style={{ color: colors.text }}>{formatDate(person.deathday, "medium")}</Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>
            {person.biography && <ToggleMoreText max_lines={3}>{person.biography.split("\n")[0]}</ToggleMoreText>}
        </View>
    );
}

export function PersonCreditsList({ credits }) {
    const { colors } = useSettings().settings.theme;
    let lastYear: string | null = null;

    return (
        <FlashList
            data={credits}
            ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
            keyExtractor={(item) => item.id.toString()}
            estimatedItemSize={22}
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
                                    alignCredits: "center",
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
