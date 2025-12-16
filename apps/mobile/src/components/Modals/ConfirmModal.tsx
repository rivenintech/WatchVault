import { useSettings } from "@/src/contexts/UtilsProvider";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import type { RefObject } from "react";
import { Pressable, Text, View } from "react-native";
import { DrawerModal } from "./Templates";

export type ConfirmModalProps = { modalRef: RefObject<BottomSheetModal | null>; onSubmit: () => void };

export function ConfirmModal({ modalRef, onSubmit }: ConfirmModalProps) {
  const { colors } = useSettings().settings.theme;

  return (
    <DrawerModal modalRef={modalRef}>
      <View style={{ gap: 10, borderRadius: 10, backgroundColor: colors.background }}>
        <Text style={{ color: "white", fontWeight: "500", fontSize: 20 }}>Are you sure?</Text>
        <Text style={{ color: colors.text }}>This will remove the movie from your watched list.</Text>
        <View style={{ flexDirection: "row", gap: 20, marginLeft: "auto", marginTop: 10 }}>
          <Pressable
            onPress={() => {
              modalRef.current?.dismiss();
            }}
            style={{ borderColor: colors.textSecondary, borderWidth: 1, paddingVertical: 5, paddingHorizontal: 15, borderRadius: 25 }}
          >
            <Text style={{ color: colors.textSecondary, fontWeight: "500" }}>No</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              onSubmit();
              modalRef.current?.dismiss();
            }}
            style={{ borderColor: "red", borderWidth: 1, paddingVertical: 5, paddingHorizontal: 15, borderRadius: 25 }}
          >
            <Text style={{ color: "red", fontWeight: "500" }}>Yes</Text>
          </Pressable>
        </View>
      </View>
    </DrawerModal>
  );
}
