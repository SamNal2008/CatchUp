import { getCheckInsRepository, CheckInsRepository } from "@/repositories/check-ins/CheckIns.repository";
import { useSQLiteContext } from "expo-sqlite";
import { createContext, ReactNode, useContext } from "react";
import {ContactId} from "@/repositories";
import {CheckInModel} from "@/repositories/check-ins/CheckInEntity";

type CheckInsContextProps = {
    deleteCheckinForFriend: (contactId: ContactId) => void;
    checkInOnContact: (checkIn: CheckInModel) => void;
    clearAllCheckIns: () => void;
    getLatestCheckInForContact: (contactId: ContactId) => Date | null;
}

const CheckInsContext = createContext<CheckInsContextProps | null>(null);

export const useCheckIns = () => {
    const context = useContext(CheckInsContext);
    if (!context) throw new Error('Context should be defined');
    return context;
}

export const CheckInsProvider = ({children}: {children: ReactNode}) => {
    const db = useSQLiteContext();
    const checkInsRepository: CheckInsRepository = getCheckInsRepository(db);

    const deleteCheckinForFriend = (contactId: ContactId) => {
        checkInsRepository.deleteAllCheckInWithContactId(contactId);
    }

    const checkInOnContact = (checkIn: CheckInModel) => {
        if (!checkIn.contact.id) {
            console.warn('Contact id is not defined');
            return;
        }
        try {
            checkInsRepository.checkInOnContact(checkIn.contact.id);
        } catch (e) {
            console.error("Error while saving checking on friend", e);
        }
    }

    const clearAllCheckIns = () => {
        checkInsRepository.deleteAllCheckIns();
    }

    const getLatestCheckInForContact = (contactId: ContactId): Date | null => {
        return checkInsRepository.getLatestCheckInForContact(contactId)?.check_in_date ?? null;
    }

    return (
        <CheckInsContext.Provider value={{deleteCheckinForFriend, checkInOnContact, clearAllCheckIns, getLatestCheckInForContact}}>
            {children}
        </CheckInsContext.Provider>
    );
};