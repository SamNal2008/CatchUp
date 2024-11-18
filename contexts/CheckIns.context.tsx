import {getCheckInsRepository, CheckInsRepository} from "@/repositories/check-ins/CheckIns.repository";
import {useSQLiteContext} from "expo-sqlite";
import {createContext, ReactNode, useContext} from "react";
import {ContactId, ContactsRepository, getContactsRepository} from "@/repositories";
import {CheckInModel} from "@/repositories/check-ins/CheckInEntity";
import {useContacts} from "@/contexts/Contact.context";

type CheckInsContextProps = {
    deleteCheckinForFriend: (contactId: ContactId) => void;
    checkInOnContact: (checkIn: CheckInModel) => void;
    clearAllCheckIns: () => void;
    getLatestCheckInForContact: (contactId: ContactId) => Date | null;
    getAllCheckins: () => Promise<CheckInModel[]>;
}

const CheckInsContext = createContext<CheckInsContextProps | null>(null);

export const useCheckIns = () => {
    const context = useContext(CheckInsContext);
    if (!context) throw new Error('Context should be defined');
    return context;
}

export const CheckInsProvider = ({children}: { children: ReactNode }) => {
    const db = useSQLiteContext();
    const checkInsRepository: CheckInsRepository = getCheckInsRepository(db);
    const contactsRepository = getContactsRepository(db);
    const deleteCheckinForFriend = (contactId: ContactId) => {
        checkInsRepository.deleteAllCheckInWithContactId(contactId);
    }

    const checkInOnContact = (checkIn: CheckInModel) => {
        if (!checkIn.contact.id) {
            console.warn('Contact id is not defined');
            return;
        }
        try {
            checkInsRepository.checkInOnContact({
                contact_id: checkIn.contact.id!,
                check_in_date: checkIn.checkInDate,
                note_content: checkIn.noteContent
            });
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

    const getAllCheckins = async (): Promise<CheckInModel[]> => {
        const checkInEntities = checkInsRepository.getAllCheckIns().filter(checkInEntity => checkInEntity.contact_id !== null);
        const checkInModels: CheckInModel[] = [];
        for (const checkInEntity of checkInEntities) {
            const contact = await contactsRepository.getById(checkInEntity.contact_id);
            checkInModels.push({
                contact: contact!,
                noteContent: checkInEntity.note_content,
                checkInDate: new Date(checkInEntity.check_in_date)
            });
        }
        return checkInModels;
    }

    return (
        <CheckInsContext.Provider value={{
            deleteCheckinForFriend,
            checkInOnContact,
            clearAllCheckIns,
            getLatestCheckInForContact,
            getAllCheckins
        }}>
            {children}
        </CheckInsContext.Provider>
    );
};