import { useSettings } from "@/src/contexts/UtilsProvider";
import { getTMDBImageURL } from "@/src/utils/images";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

type RecommendationsProps = {
  recommendations: {
    id: number;
    media_type: "movie" | "tv";
    poster_path: string | null;
  }[];
};

export default function Recommendations({ recommendations }: RecommendationsProps) {
  const { colors } = useSettings().settings.theme;

  return (
    <View style={{ marginVertical: 10 }}>
      <Text style={[styles.headings, { color: colors.textHeading }]}>You May Also Like</Text>
      <View style={{ height: 150 }}>
        <FlashList
          renderItem={({ item }) => (
            <Link href={`/${item.media_type}/${item.id}`} style={{ aspectRatio: 2 / 3, width: 100 }} replace>
              <Image
                style={{ width: "100%", height: "100%" }}
                source={getTMDBImageURL("poster", "w500", item.poster_path)}
                recyclingKey={item.poster_path}
                transition={200}
              />
            </Link>
          )}
          data={recommendations}
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
