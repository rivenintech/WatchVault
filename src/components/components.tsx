import { useNetInfo } from "@react-native-community/netinfo";
import { ActivityIndicator, Text } from "react-native";
import { useSettings } from "../contexts/UtilsProvider";

export const LoadingIndicator = <ActivityIndicator style={{ flex: 1, justifyContent: "center", alignItems: "center" }} color={"#fff"} />;

export const TestHandle = () => {
    const colors = useSettings().settings.theme.colors;
    const { isInternetReachable } = useNetInfo();
    console.log(isInternetReachable);

    // Return information if there is no internet
    if (isInternetReachable === false) {
        return <Text style={{ color: colors.error }}>No internet connection</Text>;
    }
    return LoadingIndicator;
};
