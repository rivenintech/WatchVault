import { useSettings } from "@/src/contexts/UtilsProvider";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export function SearchBarLink() {
  const { colors } = useSettings().settings.theme;
  return (
    <Link asChild href="/search" style={[styles.searchLink, { backgroundColor: colors.border }]}>
      <Pressable>
        <Ionicons name="search" color={colors.textSecondary} size={24} />
        <Text style={[styles.textInput, { color: colors.textSecondary }]}>Search...</Text>

        <Link href="/settings" style={styles.settingsLink}>
          <Ionicons name="settings-outline" color={colors.textSecondary} size={24} />
        </Link>
      </Pressable>
    </Link>
  );
}

type SearchBarProps = {
  onClose: () => void;
  handleInput: (text: string) => void;
  input: string;
};

export function SearchBar({ onClose, handleInput, input }: SearchBarProps) {
  const { colors } = useSettings().settings.theme;
  return (
    <View style={[styles.searchLink, { backgroundColor: colors.border }]}>
      <Pressable onPress={onClose}>
        <Ionicons name="close" color={colors.textSecondary} size={24} />
      </Pressable>
      <TextInput
        style={[styles.textInput, { color: colors.textSecondary }]}
        autoFocus
        placeholderTextColor={colors.textSecondary}
        placeholder="Search..."
        onChangeText={handleInput}
        value={input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  searchLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 15,
    height: 50,
  },
  textInput: {
    padding: 0,
    flex: 1,
  },
  settingsLink: {
    marginLeft: "auto",
  },
});
