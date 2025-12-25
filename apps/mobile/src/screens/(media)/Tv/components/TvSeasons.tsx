import ProgressBar from "@/src/components/ProgressBar";
import { useSettings } from "@/src/contexts/UtilsProvider";
import { getTMDBImageURL } from "@/src/utils/images";
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { Text, View } from "react-native";

type TVSeasonsProps = {
  seasons: {
    id: number;
    season_number: number;
    poster_path: string | null;
    watched_episodes?: number;
    episode_count: number;
    name: string;
    overview: string | null;
  }[];
  showID: number;
};

export default function TvSeasons({ seasons, showID }: TVSeasonsProps) {
  const { colors } = useSettings().settings.theme;

  return (
    <View style={{ flex: 1 }}>
      <FlashList
        data={seasons}
        ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
        renderItem={({ item }) => {
          const isWatched = item.watched_episodes === item.episode_count;

          return (
            <Link key={item.id} href={{ pathname: `./season/${item.id}`, params: { showID: showID, seasonNumber: item.season_number } }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
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
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <Text style={{ color: "white", fontWeight: "500", fontSize: 18 }}>{item.name}</Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                      <Text style={{ color: "white", fontWeight: "bold" }}>
                        {item.watched_episodes || 0}/{item.episode_count}
                      </Text>
                      <Ionicons name="checkmark-circle-sharp" color={isWatched ? colors.primary : colors.textHeading} size={30} />
                    </View>
                  </View>
                  <Text numberOfLines={3} style={{ color: "white", marginTop: 5, fontSize: 12 }}>
                    {item.overview}
                  </Text>
                  <View style={{ flexDirection: "row", marginTop: 15 }}>
                    <ProgressBar watched_episodes={item.watched_episodes} episode_count={item.episode_count} />
                  </View>
                </View>
              </View>
            </Link>
          );
        }}
      />
    </View>
  );
}
