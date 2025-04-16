import RootLayout from "@/src/layouts/RootLayout";
import * as SystemUI from "expo-system-ui";

SystemUI.setBackgroundColorAsync("transparent");

export default function Layout() {
    return <RootLayout />;
}
