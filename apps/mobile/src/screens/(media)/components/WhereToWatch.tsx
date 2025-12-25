import { useSettings } from "@/src/contexts/UtilsProvider";
import { getTMDBImageURL } from "@/src/utils/images";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

type WhereToWatchProps = { watchProviders: { providers: { logo_path: string; provider_name: string; watchOptions: string[] }[] } };

export default function WhereToWatch({ watchProviders }: WhereToWatchProps) {
  const { colors } = useSettings().settings.theme;

  return (
    <View>
      <Text style={[styles.headings, { color: colors.textHeading }]}>Where To Watch</Text>
      <View>
        <FlashList
          renderItem={({ item }) => (
            <View style={[styles.watchProviders, { backgroundColor: colors.border }]}>
              <Image
                style={{ width: 36, height: 36 }}
                source={getTMDBImageURL("logo", "w45", item.logo_path)}
                recyclingKey={item.logo_path}
                cachePolicy={"disk"}
                transition={200}
              />
              <View>
                <Text style={[{ color: colors.text }, styles.watchProvidersName]}>{item.provider_name}</Text>
                <Text style={[{ color: colors.textSecondary }, styles.watchProvidersText]}>{item.watchOptions.join(", ")}</Text>
              </View>
            </View>
          )}
          data={watchProviders.providers}
          showsHorizontalScrollIndicator={false}
          horizontal={true}
          ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headings: { fontWeight: "500", fontSize: 16, marginBottom: 6 },
  watchProvidersName: { fontSize: 12, fontWeight: "500" },
  watchProvidersText: { fontSize: 10 },
  watchProviders: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 6,
    borderRadius: 5,
  },
});
