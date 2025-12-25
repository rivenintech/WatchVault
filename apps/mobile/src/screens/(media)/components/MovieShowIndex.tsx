import { useSettings } from "@/src/contexts/UtilsProvider";
import { formatDate, formatTime } from "@/src/utils/datetime";
import { getTMDBImageURL } from "@/src/utils/images";
import { Ionicons } from "@expo/vector-icons";
import { Image, ImageBackground } from "expo-image";
import { Link, router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Pressable, ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function MovieTvPage({ backdrop_path, poster_path, release_date, runtime, title, genres, localData, children }) {
  const { settings } = useSettings();
  const { colors } = settings.theme;
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom }}>
        <View>
          <ImageBackground
            source={getTMDBImageURL("backdrop", "original", backdrop_path)}
            recyclingKey={backdrop_path}
            cachePolicy={"disk"}
            style={{ aspectRatio: 16 / 9 }}
            transition={300}
          >
            <View style={styles.darkOverlay} />
          </ImageBackground>
          <Pressable onPress={() => router.back()} style={[styles.backBtn, { top: insets.top }]} hitSlop={20}>
            <Ionicons name="arrow-back" color="white" size={24} />
          </Pressable>

          <Image
            source={getTMDBImageURL("poster", "original", poster_path)}
            recyclingKey={poster_path}
            cachePolicy={"disk"}
            style={styles.poster}
            transition={300}
          />
          <View
            style={{
              position: "absolute",
              bottom: "-12%",
              right: 10,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Ionicons name="calendar-outline" color={colors.primary} size={12} />
            <Text style={[{ color: colors.text }, styles.dateRuntimeText]}> {formatDate(release_date, "short")} (US)</Text>
            <Text style={[{ color: colors.text }, styles.dateRuntimeText, styles.dateRuntimeDivider]}>|</Text>
            <Ionicons name="time-outline" color={colors.primary} size={12} />
            <Text style={[{ color: colors.text }, styles.dateRuntimeText]}> {formatTime(runtime)}</Text>
          </View>
        </View>

        <View style={styles.info}>
          <View>
            <Text style={[{ color: colors.textHeading }, styles.title]}>{title}</Text>
            <Text style={[{ color: colors.text }, styles.genres]}>
              {genres.map((genre, index) => (
                <Text key={index}>
                  <Link href={""}>{genre.name || genre.genre?.name}</Link>
                  {index !== genres.length - 1 && <Text style={{ color: colors.primary }}> / </Text>}
                </Text>
              ))}
            </Text>
          </View>
          {children}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  dateRuntimeText: {
    fontSize: 12,
  },
  dateRuntimeDivider: { marginHorizontal: 6 },
  poster: {
    position: "absolute",
    width: 100,
    height: 150,
    top: "60%",
    left: 20,
    borderRadius: 5,
  },
  backBtn: { position: "absolute", left: 20, marginTop: 10 },
  darkOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  title: { fontSize: 24, fontWeight: "bold" },
  genres: { fontStyle: "italic" },
  info: { marginHorizontal: 20, marginTop: 65, flex: 1, gap: 15 },
});
