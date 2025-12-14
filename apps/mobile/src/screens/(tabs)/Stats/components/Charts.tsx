import { useSettings } from "@/src/contexts/UtilsProvider";
import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

type Slice = { id: number | string; name: string; value: number };

type DonutChartProps = {
    data: Slice[];
    pieColors: string[];
    size?: number;
    innerRadiusFactor?: number;
    noDataText?: string;
    selectedSlice?: Slice;
    setSelectedSlice: (selectedSlice: Slice | undefined) => void;
    children?: ReactNode;
};

export default function DonutChart({
    data,
    pieColors,
    size = 300,
    innerRadiusFactor = 0.7,
    noDataText = "No data available",
    selectedSlice,
    setSelectedSlice,
    children,
}: DonutChartProps) {
    const { colors } = useSettings().settings.theme;

    if (data.length === 0) return <Text style={{ color: colors.primary, textAlign: "center" }}>{noDataText}</Text>;

    const radius = size / 2;
    const innerRadius = radius * innerRadiusFactor;
    const centerX = radius;
    const centerY = radius;
    const total = data.reduce((sum, slice) => sum + slice.value, 0);
    let cumulativeAngle = 0;

    const handlePress = (slice: Slice) => {
        if (selectedSlice?.id === slice.id) {
            setSelectedSlice(undefined);
            return;
        }

        setSelectedSlice(slice);
    };

    return (
        <View style={styles.wrapper}>
            <View style={styles.chartContainer}>
                <Svg width={size} height={size}>
                    {/* Render pie chart slices */}
                    {data.map((slice, index) => {
                        const percentage = (slice.value / total) * 100;
                        const arcLength = (percentage / 100) * 360;
                        const startAngle = cumulativeAngle;
                        const endAngle = cumulativeAngle + arcLength;
                        cumulativeAngle = endAngle;
                        const path = createArcPath(centerX, centerY, radius, startAngle, endAngle);
                        return (
                            <Path
                                key={`slice-${index}`}
                                d={path}
                                fill={pieColors[index]}
                                fillOpacity={selectedSlice && selectedSlice.id !== slice.id ? 0.2 : 1}
                                onPress={() => handlePress(slice)}
                            />
                        );
                    })}
                    {/* Render inner circle to create donut effect */}
                    <Circle cx={centerX} cy={centerY} r={innerRadius} fill={colors.background} />
                </Svg>
                <View style={styles.absoluteCenter}>{children}</View>
            </View>

            {/* Render legend */}
            <View style={styles.legendContainer}>
                {data.map(({ name }, index) => (
                    <View key={`legend-${index}`} style={styles.legendItem}>
                        <View style={[styles.legendColor, { backgroundColor: pieColors[index] }]} />
                        <Text style={[styles.legendText, { color: colors.text }]}>{name}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

// Function to convert degrees to radians
const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;

    return {
        x: centerX + radius * Math.cos(angleInRadians),
        y: centerY + radius * Math.sin(angleInRadians),
    };
};

// Function to create an SVG arc path
const createArcPath = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);

    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return [
        `M ${start.x} ${start.y}`, // Move to start
        `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`, // Arc path
        "L",
        x,
        y, // Line to center
        "Z", // Close path
    ].join(" ");
};

const styles = StyleSheet.create({
    wrapper: {
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
    },
    chartContainer: {
        alignItems: "center",
        justifyContent: "center",
    },
    absoluteCenter: {
        position: "absolute",
    },
    legendContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 10,
    },
    legendItem: {
        flexDirection: "row",
        alignItems: "baseline",
        gap: 5,
    },
    legendColor: {
        width: 10,
        height: 10,
    },
    legendText: {},
});
