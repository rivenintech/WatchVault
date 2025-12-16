import { useSettings } from "@/src/contexts/UtilsProvider";
import { formatDate } from "@/src/utils/datetime";
import { Ionicons } from "@expo/vector-icons";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import type { RefObject } from "react";
import { useRef } from "react";
import { Pressable, Text, View } from "react-native";
import { CalendarModal } from "./CalendarModal";
import { DrawerModal } from "./Templates";

type WatchedDrawerProps = {
  drawerRef: RefObject<BottomSheetModal | null>;
  releaseDate?: string | null;
  onSubmit: (selectedDate: string, props: any) => void;
} & Record<string, unknown>;

export default function WatchedDrawer({ drawerRef, releaseDate, onSubmit, ...props }: WatchedDrawerProps) {
  const { colors } = useSettings().settings.theme;
  const calendarRef = useRef<BottomSheetModal>(null);
  const today = new Date().toISOString().split("T")[0];

  const submitDate = (selectedDate: string) => {
    onSubmit(selectedDate, props);
    drawerRef.current?.dismiss();
  };

  return (
    <>
      <CalendarModal modalRef={calendarRef} onSubmit={submitDate} minDate={releaseDate || undefined} maxDate={today} />
      <DrawerModal modalRef={drawerRef}>
        <View style={{ backgroundColor: colors.background, gap: 25 }}>
          <Text style={{ fontWeight: "500", fontSize: 22, color: "white" }}>When did you watch this?</Text>
          <Pressable hitSlop={10} style={{ flexDirection: "row", alignItems: "center", gap: 20 }} onPress={() => submitDate(today)}>
            <Ionicons name="alarm-outline" color="white" size={28} />
            <Text style={{ color: "white", fontSize: 16 }}>Now</Text>
          </Pressable>
          {releaseDate && (
            <Pressable hitSlop={10} style={{ flexDirection: "row", alignItems: "center", gap: 20 }} onPress={() => submitDate(releaseDate)}>
              <Ionicons name="calendar-number-outline" color="white" size={28} />

              <Text style={{ color: "white", fontSize: 16 }}>
                Release date <Text style={{ fontSize: 12, color: "gray" }}> - {formatDate(releaseDate, "short")}</Text>
              </Text>
            </Pressable>
          )}
          <Pressable hitSlop={10} style={{ flexDirection: "row", alignItems: "center", gap: 20 }} onPress={() => calendarRef.current?.present()}>
            <Ionicons name="calendar-clear-outline" color="white" size={28} />
            <Text style={{ color: "white", fontSize: 16 }}>Choose time</Text>
            <Ionicons name="chevron-down" color="white" size={28} style={{ marginLeft: "auto" }} />
          </Pressable>
        </View>
      </DrawerModal>
    </>
  );
}
