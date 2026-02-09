import { ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const LoadingIndicator = (
  <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <ActivityIndicator color={"#fff"} />
  </SafeAreaView>
);
