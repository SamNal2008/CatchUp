import { getCheckInsRepository, CheckInsRepository } from "@/repositories/check-ins/CheckIns.repository";
import { useSQLiteContext } from "expo-sqlite";
import { createContext, ReactNode, useContext } from "react";
import {ContactId} from "@/repositories";

type CheckInsContextProps = {
    checkInsRepository: CheckInsRepository;
    deleteCheckinForFriend(contactId: ContactId): void;
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

    return (
        <CheckInsContext.Provider value={{checkInsRepository, deleteCheckinForFriend}}>
            {children}
        </CheckInsContext.Provider>
    );
};