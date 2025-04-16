import { Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { useSettings } from "../contexts/UtilsProvider";

type DonutChartProps = {
    data: { name: string; value: number }[];
    pieColors: string[];
    size?: number;
    innerRadius?: number;
    noDataText?: string;
    selectedSlice?: { name: string; value: number };
    setSelectedSlice: (selectedSlice: { name: string; value: number } | undefined) => void;
    children?: React.ReactNode;
};

export default function DonutChart({
    data,
    pieColors,
    size = 300,
    innerRadius = 100,
    noDataText = "No data available",
    selectedSlice,
    setSelectedSlice,
    children,
}: DonutChartProps) {
    const { colors } = useSettings().settings.theme;

    if (data.length === 0) return <Text style={{ color: colors.primary, textAlign: "center" }}>{noDataText}</Text>;

    const radius = size / 2;
    const centerX = radius;
    const centerY = radius;

    const total = data.reduce((sum, slice) => sum + slice.value, 0);

    let cumulativeAngle = 0;

    const handlePress = (slice: { name: string; value: number }) => {
        if (selectedSlice === slice) {
            setSelectedSlice(undefined);
            return;
        }

        setSelectedSlice(slice);
    };

    return (
        <View style={{ alignItems: "center", justifyContent: "center", gap: 10 }}>
            <View style={{ alignItems: "center", justifyContent: "center" }}>
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
                                fillOpacity={selectedSlice && selectedSlice !== slice ? 0.2 : 1}
                                onPress={() => handlePress(slice)}
                            />
                        );
                    })}
                    {/* Render inner circle to create donut effect */}
                    <Circle cx={centerX} cy={centerY} r={innerRadius} fill={colors.background} />
                </Svg>

                <View
                    style={{
                        position: "absolute",
                    }}
                >
                    {children}
                </View>
            </View>

            {/* Render legend */}
            <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                {data.map(({ name }, index) => (
                    <View key={`legend-${index}`} style={{ flexDirection: "row", alignItems: "baseline", gap: 5 }}>
                        <View style={{ backgroundColor: pieColors[index], width: 10, height: 10 }} />
                        <Text style={{ color: colors.text }}>{name}</Text>
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
