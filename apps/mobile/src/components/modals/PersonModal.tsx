import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useQuery } from "@tanstack/react-query";
import React, { RefObject } from "react";
import { useTMDB } from "../../contexts/UtilsProvider";
import { LoadingIndicator } from "../components";
import { PersonCreditsList, PersonDetails } from "../person";
import { DrawerModalScroll } from "./modals";

type PersonModalProps = {
    modalRef: RefObject<BottomSheetModal>;
    person?: { id: number; profile_path: string | null; name: string; roles: { character: string }[] };
};

export function PersonModal({ modalRef, person }: PersonModalProps) {
    const API = useTMDB();

    const fetchPersonDetails = async (id: number) => {
        const data = await API.person(id);

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
            }, {})
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
        queryFn: () => fetchPersonDetails(person?.id),
        enabled: !!person?.id,
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
