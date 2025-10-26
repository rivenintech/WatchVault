import { Ionicons } from "@expo/vector-icons";
import {
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
    BottomSheetModal,
    BottomSheetModalProps,
    BottomSheetScrollView,
    BottomSheetView,
} from "@gorhom/bottom-sheet";
import { BottomSheetScrollViewProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetScrollable/types";
import { BottomSheetViewProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetView/types";
import { useCalendars, useLocales } from "expo-localization";
import React, { RefObject, useCallback, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DateTimePicker, { DateType, useDefaultStyles } from "react-native-ui-datepicker";
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
            <DrawerModal modalRef={drawerRef}>
                <View style={{ backgroundColor: colors.background, gap: 25 }}>
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
            </DrawerModal>
        </>
    );
}

type ConfirmModalProps = { modalRef: RefObject<BottomSheetModal>; onSubmit: () => void };

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

type CalendarModalProps = {
    modalRef: RefObject<BottomSheetModal>;
    onSubmit: (selectedDate: string) => void;
    minDate?: string;
    maxDate?: string;
};

export function CalendarModal({ modalRef, onSubmit, minDate, maxDate }: CalendarModalProps) {
    const { colors, dark } = useSettings().settings.theme;
    const [selected, setSelected] = useState<DateType>();
    const defaultStyles = useDefaultStyles(dark ? "dark" : "light");
    const { firstWeekday, calendar, timeZone, uses24hourClock } = useCalendars()[0];
    const { languageCode } = useLocales()[0];

    // DateTimePicker uses 0 - 6, but expo-localization uses 1 - 7
    // https://docs.expo.dev/versions/latest/sdk/localization/#weekday
    // https://github.com/farhoudshapouran/react-native-ui-datepicker?tab=readme-ov-file#calendar-base-props
    const firstWeekdayNumber = firstWeekday ? (firstWeekday as number) - 1 : undefined;

    const submitDate = () => {
        if (!selected) return;

        onSubmit(selected?.toString());
        modalRef.current?.dismiss();
    };

    return (
        <DrawerModal modalRef={modalRef}>
            <DateTimePicker
                mode="single"
                locale={languageCode ?? undefined}
                date={selected}
                firstDayOfWeek={firstWeekdayNumber}
                calendar={calendar === "persian" ? "jalali" : "gregory"}
                timeZone={timeZone ?? "UTC"}
                use12Hours={uses24hourClock === false}
                onChange={({ date }) => setSelected(date)}
                maxDate={maxDate}
                minDate={minDate}
                styles={{
                    ...defaultStyles,
                    selected: { borderColor: colors.primary, borderWidth: 2 },
                    selected_label: { color: colors.primary, fontWeight: "700" },
                    button_next_image: { tintColor: colors.primary },
                    button_prev_image: { tintColor: colors.primary },
                    selected_month: { backgroundColor: colors.primary },
                    selected_month_label: { color: colors.textHeading },
                    active_year: { backgroundColor: colors.primary, color: colors.textHeading },
                    selected_year: { backgroundColor: colors.border },
                    selected_year_label: { color: colors.text },
                }}
            />
            <View
                style={{
                    backgroundColor: colors.background,
                    paddingHorizontal: 20,
                    paddingVertical: 15,
                }}
            >
                <View style={{ flexDirection: "row", gap: 20 }}>
                    <Pressable hitSlop={20} onPress={() => setSelected(new Date())} style={{ marginRight: "auto" }}>
                        <Text style={{ color: colors.primary, fontWeight: "500" }}>Today</Text>
                    </Pressable>
                    <Pressable
                        hitSlop={20}
                        onPress={() => {
                            setSelected(undefined);
                            modalRef.current?.dismiss();
                        }}
                    >
                        <Text style={{ color: colors.primary, fontWeight: "500" }}>Cancel</Text>
                    </Pressable>
                    <Pressable hitSlop={20} onPress={() => submitDate()}>
                        <Text style={{ color: colors.primary, fontWeight: "500" }}>OK</Text>
                    </Pressable>
                </View>
            </View>
        </DrawerModal>
    );
}

type DrawerModalTemplateProps = BottomSheetModalProps & {
    children: React.ReactNode;
    modalRef: React.RefObject<BottomSheetModal>;
};

export function DrawerModalTemplate({ modalRef, children, ...props }: DrawerModalTemplateProps) {
    const { colors } = useSettings().settings.theme;
    const insets = useSafeAreaInsets();

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
            topInset={insets.top}
            handleIndicatorStyle={{ backgroundColor: colors.text }}
            handleStyle={{ backgroundColor: colors.background }}
            enableOverDrag={false}
            backgroundStyle={{ backgroundColor: colors.background }}
            backdropComponent={renderBackdrop}
        >
            {children}
        </BottomSheetModal>
    );
}

export function DrawerModalScroll({
    modalRef,
    children,
    style = { padding: 10 },
    ...props
}: DrawerModalTemplateProps & { style?: BottomSheetScrollViewProps["style"] }) {
    const insets = useSafeAreaInsets();

    return (
        <DrawerModalTemplate modalRef={modalRef} {...props}>
            <BottomSheetScrollView contentContainerStyle={[style, { paddingBottom: insets.bottom }]}>{children}</BottomSheetScrollView>
        </DrawerModalTemplate>
    );
}

export function DrawerModal({
    modalRef,
    children,
    style = { padding: 10 },
    ...props
}: DrawerModalTemplateProps & { style?: BottomSheetViewProps["style"] }) {
    const insets = useSafeAreaInsets();

    return (
        <DrawerModalTemplate modalRef={modalRef} {...props}>
            <BottomSheetView style={[style, { paddingBottom: insets.bottom }]}>{children}</BottomSheetView>
        </DrawerModalTemplate>
    );
}
