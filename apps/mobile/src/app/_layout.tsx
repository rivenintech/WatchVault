import RootLayout from "@/src/screens/_layout";
import * as SystemUI from "expo-system-ui";

SystemUI.setBackgroundColorAsync("transparent");

export default function Layout() {
    return <RootLayout />;
}
