import { LoadingIndicator } from "@/src/components/LoadingIndicator";
import { useSettings } from "@/src/contexts/UtilsProvider";
import { tmdbClient } from "@/src/utils/apiClient";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { skipToken, useQuery } from "@tanstack/react-query";
import { parseResponse } from "hono/client";
import type { RefObject } from "react";
import { DrawerModalScroll } from "../Templates";
import PersonCreditsList from "./components/PersonCreditsList";
import PersonDetails from "./components/PersonDetails";

type PersonModalProps = {
    modalRef: RefObject<BottomSheetModal | null>;
    person?: { id: number; profile_path: string | null; name: string; roles: { character: string }[] };
};

export function PersonModal({ modalRef, person }: PersonModalProps) {
    const { settings } = useSettings();

    const fetchPersonDetails = async (id: number) => {
        const data = await parseResponse(
            tmdbClient.person[":id"].$get({
                param: {
                    id: id.toString(),
                },
                query: {
                    language: settings.locale,
                },
            }),
        );

        if (!data) return;

        // Remove movie/tv show duplicates and combine characters
        data.combined_credits.cast = Object.values(
            data.combined_credits.cast.reduce((acc: { [key: number]: any }, item) => {
                if (!acc[item.id]) {
                    acc[item.id] = { ...item, character: item.character };
                } else {
                    acc[item.id].character += `, ${item.character}`;
                }
                return acc;
            }, {}),
        );

        // Sort by release date/first air date
        data?.combined_credits.cast.sort((a, b) => {
            const dateA = "release_date" in a ? a.release_date : a.first_air_date;
            const dateB = "release_date" in b ? b.release_date : b.first_air_date;

            // Place nulls at the top (unreleased movies/tv shows)
            if (!dateA && !dateB) return 0;
            if (!dateA) return -1;
            if (!dateB) return 1;

            return new Date(dateB).getTime() - new Date(dateA).getTime();
        });

        return data;
    };

    const { data: personDetails } = useQuery({
        queryKey: ["personDetails", person?.id],
        queryFn: person?.id ? () => fetchPersonDetails(person.id) : skipToken,
    });

    return (
        <DrawerModalScroll modalRef={modalRef}>
            {personDetails && person ? (
                <>
                    <PersonDetails person={personDetails} roles={person.roles} />
                    <PersonCreditsList credits={personDetails.combined_credits.cast} />
                </>
            ) : (
                LoadingIndicator
            )}
        </DrawerModalScroll>
    );
}
