import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useCalendars, useLocales } from "expo-localization";
import type { RefObject} from "react";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import type { DateType} from "react-native-ui-datepicker";
import DateTimePicker, { useDefaultStyles } from "react-native-ui-datepicker";
import { useSettings } from "../../contexts/UtilsProvider";
import { DrawerModal } from "./Templates";

type CalendarModalProps = {
    modalRef: RefObject<BottomSheetModal | null>;
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
