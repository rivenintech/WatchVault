import type {
    BottomSheetBackdropProps,
    BottomSheetModalProps} from "@gorhom/bottom-sheet";
import {
    BottomSheetBackdrop,
    BottomSheetModal,
    BottomSheetScrollView,
    BottomSheetView,
} from "@gorhom/bottom-sheet";
import type { BottomSheetScrollViewProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetScrollable/types";
import type { BottomSheetViewProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetView/types";
import type { ReactNode, RefObject} from "react";
import { useCallback } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSettings } from "../../contexts/UtilsProvider";

type DrawerModalTemplateProps = BottomSheetModalProps & {
    children: ReactNode;
    modalRef: RefObject<BottomSheetModal | null>;
};

function DrawerModalTemplate({ modalRef, children, ...props }: DrawerModalTemplateProps) {
    const { colors } = useSettings().settings.theme;
    const insets = useSafeAreaInsets();

    const renderBackdrop = useCallback(
        (backdropProps: BottomSheetBackdropProps) => (
            <BottomSheetBackdrop {...backdropProps} opacity={0.5} appearsOnIndex={0} disappearsOnIndex={-1} />
        ),
        []
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
