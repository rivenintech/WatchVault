import { getTMDBImageURL } from "@/src/utils/images";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Pressable, ScrollView } from "react-native-gesture-handler";
import { useSettings } from "../contexts/UtilsProvider";
import { PersonModal } from "./Modals/PersonModal";

type CastAndCrewProps = {
  credits: {
    cast: ({ id: number; profile_path: string | null; name: string } & ({ character: string } | { roles: { character: string }[] }))[];
  };
  title?: string;
};

export default function CastAndCrew({ credits, title }: CastAndCrewProps) {
  const { colors } = useSettings().settings.theme;
  const personRef = useRef<BottomSheetModal>(null);

  const transformedData = credits.cast.map((item) => {
    if (!("roles" in item)) {
      return {
        ...item,
        roles: [{ character: item.character }],
      };
    }
    return item;
  });

  const [person, setPerson] = useState<(typeof transformedData)[0]>();

  return (
    <View>
      <PersonModal modalRef={personRef} person={person} />
      <Text style={[styles.headings, { color: colors.textHeading }]}>{title || "Cast & Crew"}</Text>
      <View>
        <FlashList
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                setPerson(item);
                personRef.current?.present();
              }}
              style={{ width: 100 }}
            >
              <Image
                style={{ height: 150, width: 100 }}
                source={getTMDBImageURL("poster", "w185", item.profile_path)}
                recyclingKey={item.profile_path}
                transition={200}
              />
              <Text numberOfLines={1} style={{ color: colors.text, fontSize: 12, marginTop: 1, textAlign: "center" }}>
                {item.name}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 10, textAlign: "center" }}>{item.roles[0].character}</Text>
            </Pressable>
          )}
          data={transformedData}
          horizontal={true}
          ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
          renderScrollComponent={ScrollView}
          showsHorizontalScrollIndicator={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headings: { fontWeight: "500", fontSize: 16, marginBottom: 6 },
});
