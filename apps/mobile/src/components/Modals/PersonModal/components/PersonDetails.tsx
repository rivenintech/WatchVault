import { Image } from "expo-image";
import { Text, View } from "react-native";
import { useSettings } from "../../../../contexts/UtilsProvider";
import { formatDate, getAge } from "../../../../utils/datetime";
import { getTMDBImageURL } from "../../../../utils/images";
import ToggleMoreText from "../../../ToggleMoreText";

type PersonDetailsProps = {
    person: {
        id: number;
        name: string;
        profile_path: string | null;
        birthday: string | null;
        deathday: string | null;
        place_of_birth: string | null;
        biography: string | null;
    };
    roles: { character: string }[];
};

export default function PersonDetails({ person, roles }: PersonDetailsProps) {
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
                        {person.birthday && (
                            <>
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
                            </>
                        )}
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
