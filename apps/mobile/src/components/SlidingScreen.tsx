import { type ReactNode, useRef, useState } from "react";
import { Animated, type LayoutChangeEvent, Pressable, type StyleProp, StyleSheet, Text, View, type ViewStyle } from "react-native";
import PagerView from "react-native-pager-view";
import { useSettings } from "../contexts/UtilsProvider";

type SlidingScreenProps = {
  children: ReactNode[];
  tabs: string[];
  containerStyle?: StyleProp<ViewStyle>;
};

export default function SlidingScreen({ children, tabs, containerStyle = { flex: 1, width: "100%" } }: SlidingScreenProps) {
  const { colors } = useSettings().settings.theme;
  const pagerRef = useRef<PagerView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  // Animated value to track page scroll
  const gap = 15;
  const [tabWidths, setTabWidths] = useState(Array(children.length).fill(0));

  // Calculate line width and position based on page scroll
  const linePosition = scrollX.interpolate({
    inputRange: tabs.map((_, index) => index),
    outputRange: tabWidths.map((_, index) => tabWidths.slice(0, index).reduce((a, b) => a + b, 0) + gap * index),
    extrapolate: "clamp",
  });

  const lineWidth = scrollX.interpolate({
    inputRange: tabs.map((_, index) => index),
    outputRange: tabWidths,
    extrapolate: "clamp",
  });

  const handleTabLayout = (event: LayoutChangeEvent, index: number) => {
    const { width } = event.nativeEvent.layout;
    setTabWidths((prev) => {
      const newWidths = [...prev];
      newWidths[index] = width;
      return newWidths;
    });
  };

  return (
    <View style={containerStyle}>
      <View style={styles.tabContainer}>
        <View style={[styles.tabRow, { gap: gap }]}>
          {tabs.map((title, index) => (
            <Pressable hitSlop={20} key={index} onPress={() => pagerRef.current?.setPage(index)}>
              <Text style={[styles.tabText, { color: colors.textHeading }]} onLayout={(event) => handleTabLayout(event, index)}>
                {title}
              </Text>
            </Pressable>
          ))}
        </View>
        <Animated.View
          style={[
            styles.indicator,
            {
              backgroundColor: colors.primary,
              width: lineWidth,
              transform: [{ translateX: linePosition }],
            },
          ]}
        />
      </View>

      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={0}
        pageMargin={40}
        onPageScroll={({ nativeEvent }) => scrollX.setValue(nativeEvent.position + nativeEvent.offset)}
      >
        {children}
      </PagerView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    marginVertical: 10,
  },
  tabRow: {
    flexDirection: "row",
  },
  tabText: {
    fontWeight: "500",
  },
  indicator: {
    height: 2,
    marginTop: 5,
  },
  pager: {
    flex: 1,
  },
});
