import { useSettings } from "@/src/contexts/UtilsProvider";
import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";

export default function PersonScreen() {
    const { id: idStr } = useLocalSearchParams();
    const id = Number(idStr);
    const { colors } = useSettings().settings.theme;

    return <View></View>;
}
