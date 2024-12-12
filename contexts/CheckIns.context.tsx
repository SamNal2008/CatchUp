import {getCheckInsRepository, CheckInsRepository} from "@/repositories/check-ins/CheckIns.repository";
import {useSQLiteContext} from "expo-sqlite";
import {createContext, ReactNode, useContext, useEffect, useState} from "react";
import {ContactId, getContactsRepository} from "@/repositories";
import {CheckInModel} from "@/repositories/check-ins/CheckInEntity";
import {useNotifications} from "@/hooks/useNotificatons";
import {useNewCheckinInfo, useSetContactToCheckin, useSetNoteContent, useSetNoteDate} from "@/store/CheckinNote.store";
import {logService} from "@/services/log.service";
import {useRouter} from "expo-router";

type CheckInsContextProps = {
    deleteCheckinForFriend: (contactId: ContactId) => void;
    checkInOnContact: () => void;
    clearAllCheckIns: () => void;
    getLatestCheckInForContact: (contactId: ContactId) => Date | null;
    getAllCheckins: () => Promise<CheckInModel[]>;
    checkIns: CheckInModel[];
}

const CheckInsContext = createContext<CheckInsContextProps | null>(null);

export const useCheckIns = () => {
    const context = useContext(CheckInsContext);
    if (!context) throw new Error('Context should be defined');
    return context;
}

export const CheckInsProvider = ({children}: { children: ReactNode }) => {
    const db = useSQLiteContext();
    const {navigate} = useRouter();
    const setContactToCheckin = useSetContactToCheckin();
    const setNoteContent = useSetNoteContent();
    const setCheckinDate = useSetNoteDate();
    const {checkinDate, contactToCheckin, noteContent} = useNewCheckinInfo();
    const {postPoneReminder} = useNotifications();

    const [checkIns, setCheckIns] = useState<CheckInModel[]>([]);

    const checkInsRepository: CheckInsRepository = getCheckInsRepository(db);
    const contactsRepository = getContactsRepository(db);

    const refreshCheckIns = async () => {
        const checkIns = await getAllCheckins();
        setCheckIns(checkIns);
    }

    const deleteCheckinForFriend = (contactId: ContactId) => {
        checkInsRepository.deleteAllCheckInWithContactId(contactId);
    }

    const checkInOnContact = () => {
        if (!contactToCheckin || !contactToCheckin?.id) {
            logService.warn('Contact id is not defined');
            return;
        }
        try {
            checkInsRepository.checkInOnContact({
                contact_id: contactToCheckin.id,
                check_in_date: checkinDate as unknown as string,
                note_content: noteContent
            });
            postPoneReminder(contactToCheckin, checkinDate);
            setContactToCheckin(null);
            setCheckinDate(new Date());
            setNoteContent('');
            refreshCheckIns().catch(logService.error);
        } catch (e) {
            logService.error("Error while saving checking on friend", e);
        }
    }

    const clearAllCheckIns = () => {
        checkInsRepository.deleteAllCheckIns();
        refreshCheckIns().then().catch(logService.error);
    }

    const getLatestCheckInForContact = (contactId: ContactId): Date | null => {
        const res = checkInsRepository.getLatestCheckInForContact(contactId)?.check_in_date ?? null;
        if (res !== null) {
            return new Date(res);
        }
        return res;
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

    useEffect(() => {
        refreshCheckIns().catch(logService.error);
    }, []);

    return (
        <CheckInsContext.Provider value={{
            deleteCheckinForFriend,
            checkInOnContact,
            clearAllCheckIns,
            getLatestCheckInForContact,
            getAllCheckins,
            checkIns
        }}>
            {children}
        </CheckInsContext.Provider>
    );
};