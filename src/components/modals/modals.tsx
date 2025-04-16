import { Ionicons } from "@expo/vector-icons";
import { BottomSheetBackdrop, BottomSheetBackdropProps, BottomSheetModal, BottomSheetModalProps, BottomSheetView } from "@gorhom/bottom-sheet";
import React, { RefObject, useCallback, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import { useSettings } from "../../contexts/UtilsProvider";
import { formatDate } from "../../utils/datetime";

type WatchedDrawerProps = {
    drawerRef: RefObject<BottomSheetModal>;
    releaseDate?: string | null;
    onSubmit: (selectedDate: string, props: any) => void;
} & Record<string, unknown>;

export function WatchedDrawer({ drawerRef, releaseDate, onSubmit, ...props }: WatchedDrawerProps) {
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
            <DrawerModalTemplate modalRef={drawerRef}>
                <View style={{ backgroundColor: colors.background, padding: 20, gap: 25 }}>
                    <Text style={{ fontWeight: "500", fontSize: 22, color: "white" }}>When did you watch this?</Text>
                    <Pressable hitSlop={10} style={{ flexDirection: "row", alignItems: "center", gap: 20 }} onPress={() => submitDate(today)}>
                        <Ionicons name="alarm-outline" color="white" size={28} />
                        <Text style={{ color: "white", fontSize: 16 }}>Now</Text>
                    </Pressable>
                    {releaseDate && (
                        <Pressable
                            hitSlop={10}
                            style={{ flexDirection: "row", alignItems: "center", gap: 20 }}
                            onPress={() => submitDate(releaseDate)}
                        >
                            <Ionicons name="calendar-number-outline" color="white" size={28} />

                            <Text style={{ color: "white", fontSize: 16 }}>
                                Release date <Text style={{ fontSize: 12, color: "gray" }}> - {formatDate(releaseDate, "short")}</Text>
                            </Text>
                        </Pressable>
                    )}
                    <Pressable
                        hitSlop={10}
                        style={{ flexDirection: "row", alignItems: "center", gap: 20 }}
                        onPress={() => calendarRef.current?.present()}
                    >
                        <Ionicons name="calendar-clear-outline" color="white" size={28} />
                        <Text style={{ color: "white", fontSize: 16 }}>Choose time</Text>
                        <Ionicons name="chevron-down" color="white" size={28} style={{ marginLeft: "auto" }} />
                    </Pressable>
                </View>
            </DrawerModalTemplate>
        </>
    );
}

type ConfirmModalProps = { modalRef: RefObject<BottomSheetModal>; onSubmit: () => void };

export function ConfirmModal({ modalRef, onSubmit }: ConfirmModalProps) {
    const { colors } = useSettings().settings.theme;

    return (
        <DrawerModalTemplate modalRef={modalRef}>
            <View style={{ padding: 20, gap: 10, borderRadius: 10, backgroundColor: colors.background }}>
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
        </DrawerModalTemplate>
    );
}

type CalendarModalProps = {
    modalRef: RefObject<BottomSheetModal>;
    onSubmit: (selectedDate: string) => void;
    minDate?: string;
    maxDate?: string;
};

export function CalendarModal({ modalRef, onSubmit, minDate, maxDate }: CalendarModalProps) {
    const { colors } = useSettings().settings.theme;
    const [selected, setSelected] = useState("");

    return (
        <DrawerModalTemplate modalRef={modalRef} enableContentPanningGesture={false}>
            <Calendar
                minDate={minDate}
                maxDate={maxDate}
                disableAllTouchEventsForDisabledDays
                enableSwipeMonths={true}
                onDayPress={(day: DateData) => {
                    setSelected(day.dateString);
                }}
                theme={{
                    calendarBackground: colors.border,
                    textSectionTitleColor: colors.text,
                    dayTextColor: colors.text,
                    monthTextColor: colors.text,
                    selectedDayTextColor: colors.text,
                    todayTextColor: colors.primary,
                    arrowColor: colors.primary,
                    textDisabledColor: colors.textSecondary,
                    disabledArrowColor: colors.textSecondary,
                    textMonthFontWeight: "bold",
                    textDayHeaderFontSize: 14,
                }}
                markedDates={{
                    [selected]: { selected: true, disableTouchEvent: true, selectedColor: colors.primary },
                }}
            />
            <View
                style={{
                    backgroundColor: colors.border,
                    paddingHorizontal: 20,
                    paddingTop: 5,
                    paddingBottom: 15,
                }}
            >
                <View style={{ marginLeft: "auto", flexDirection: "row", gap: 20 }}>
                    <Pressable hitSlop={20} onPress={() => modalRef.current?.dismiss()}>
                        <Text style={{ color: colors.primary, fontWeight: "500" }}>Cancel</Text>
                    </Pressable>
                    <Pressable
                        hitSlop={20}
                        onPress={() => {
                            onSubmit(selected);
                            modalRef.current?.dismiss();
                        }}
                    >
                        <Text style={{ color: colors.primary, fontWeight: "500" }}>OK</Text>
                    </Pressable>
                </View>
            </View>
        </DrawerModalTemplate>
    );
}

type DrawerModalTemplateProps = BottomSheetModalProps & {
    children: React.ReactNode;
    modalRef: React.RefObject<BottomSheetModal>;
};

export function DrawerModalTemplate({ modalRef, children, ...props }: DrawerModalTemplateProps) {
    const { colors } = useSettings().settings.theme;

    const renderBackdrop = useCallback(
        (backdropProps: BottomSheetBackdropProps) => (
            <BottomSheetBackdrop {...backdropProps} opacity={0.5} appearsOnIndex={0} disappearsOnIndex={-1} />
        ),
        [],
    );

    return (
        <BottomSheetModal
            {...props}
            ref={modalRef}
            stackBehavior="push"
            handleIndicatorStyle={{ backgroundColor: colors.text }}
            handleStyle={{ backgroundColor: colors.background }}
            enableOverDrag={false}
            backgroundStyle={{ backgroundColor: colors.background }}
            backdropComponent={renderBackdrop}
        >
            <BottomSheetView>{children}</BottomSheetView>
        </BottomSheetModal>
    );
}
