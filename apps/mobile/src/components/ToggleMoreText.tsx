import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { NativeSyntheticEvent, Pressable, Text, TextLayoutEventData, TextStyle, View } from "react-native";
import { useSettings } from "../contexts/UtilsProvider";

export default function ToggleMoreText({ max_lines, children, style }: { max_lines: number; children: string; style?: TextStyle }) {
    const { colors } = useSettings().settings.theme;
    const [showFullText, setShowText] = useState(false);
    const [showBtn, setShowBtn] = useState(false);

    const onTextLayout = (e: NativeSyntheticEvent<TextLayoutEventData>) => {
        if (e.nativeEvent.lines.length <= max_lines) {
            setShowBtn(false);
        } else {
            setShowBtn(true);
        }
    };

    return (
        <Pressable onPress={() => setShowText(!showFullText)}>
            <Text style={[style, { color: colors.text }]} numberOfLines={showFullText ? undefined : max_lines} onTextLayout={onTextLayout}>
                {children}
            </Text>
            {showBtn && (
                <View style={{ alignItems: "baseline", flexDirection: "row", gap: 5 }}>
                    <Text style={{ color: colors.primary }}>Show {showFullText ? "less" : "more"}</Text>
                    <Ionicons name={showFullText ? "chevron-up" : "chevron-down"} size={12} color={colors.primary} />
                </View>
            )}
        </Pressable>
    );
}
