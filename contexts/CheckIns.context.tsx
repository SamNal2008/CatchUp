import { useNotifications } from "@/hooks/useNotificatons";
import {
  ContactId,
  ContactsRepository,
  getContactsRepository,
} from "@/repositories";
import { CheckInModel } from "@/repositories/check-ins/CheckInEntity";
import {
  CheckInsRepository,
  getCheckInsRepository,
} from "@/repositories/check-ins/CheckIns.repository";
import { logService } from "@/services/log.service";
import { useNewCheckinStore } from "@/store/CheckinNote.store";
import { useCheckinsStore } from "@/store/Checkins.store";
import { useContactsStore } from "@/store/Contacts.store";
import { useSQLiteContext } from "expo-sqlite";
import { createContext, ReactNode, useContext, useEffect } from "react";

type CheckInsContextProps = {
  deleteCheckinForFriend: (contactId: ContactId) => void;
  checkInOnContact: () => void;
  clearAllCheckIns: () => void;
  getLatestCheckInForContact: (contactId: ContactId) => Date | null;
  getAllCheckins: () => Promise<CheckInModel[]>;
  checkIns: CheckInModel[];
};

const CheckInsContext = createContext<CheckInsContextProps | null>(null);

export const useCheckIns = () => {
  const context = useContext(CheckInsContext);
  if (!context) throw new Error("Context should be defined");
  return context;
};

export const CheckInsProvider = ({ children }: { children: ReactNode }) => {
  const db = useSQLiteContext();
  const { checkInDate, contactToCheckin, noteContent, resetNewFriendCheckIn } =
    useNewCheckinStore();
  const { postPoneReminder } = useNotifications();
  const { contacts } = useContactsStore();
  const checkInsRepository: CheckInsRepository = getCheckInsRepository(db);
  const contactsRepository: ContactsRepository = getContactsRepository(db);
  const { checkIns, setCheckIns, clearAllCheckIns } = useCheckinsStore();

  const getAllCheckins = async (): Promise<CheckInModel[]> => {
    return checkIns;
  };

  const refreshCheckIns = async () => {
    const checkInEntities = checkInsRepository.getAllCheckIns();
    const refreshedCheckIns: CheckInModel[] = [];
    for (const checkInEntity of checkInEntities) {
      const contact = await contactsRepository.getById(
        checkInEntity.contact_id,
      );
      if (contact) {
        const checkIn: CheckInModel = {
          checkInDate: new Date(checkInEntity.check_in_date),
          contact,
          noteContent: checkInEntity.note_content,
        };
        refreshedCheckIns.push(checkIn);
      } else {
        logService.warn("Contact not found for check-in, deleting check-in");
        checkInsRepository.deleteAllCheckInWithContactId(
          checkInEntity.contact_id,
        );
      }
    }
    setCheckIns(refreshedCheckIns);
  };

  const deleteCheckinForFriend = async (contactId: ContactId) => {
    checkInsRepository.deleteAllCheckInWithContactId(contactId);
    refreshCheckIns();
  };

  const checkInOnContact = () => {
    if (!contactToCheckin || !contactToCheckin?.id) {
      logService.warn("Contact id is not defined");
      return;
    }
    try {
      checkInsRepository.checkInOnContact({
        contact_id: contactToCheckin.id,
        check_in_date: checkInDate,
        note_content: noteContent,
      });
      refreshCheckIns();
      postPoneReminder(contactToCheckin, checkInDate);
      resetNewFriendCheckIn();
    } catch (e) {
      logService.error("Error while saving checking on friend", e);
    }
  };

  const getLatestCheckInForContact = (contactId: ContactId): Date | null => {
    const res = checkIns
      .sort((a, b) => b.checkInDate.getTime() - a.checkInDate.getTime())
      .find((checkIn) => checkIn.contact.id === contactId);
    return res?.checkInDate ?? null;
  };

  useEffect(() => {
    refreshCheckIns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    refreshCheckIns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contacts]);

  return (
    <CheckInsContext.Provider
      value={{
        deleteCheckinForFriend,
        checkInOnContact,
        clearAllCheckIns,
        getLatestCheckInForContact,
        getAllCheckins,
        checkIns,
      }}
    >
      {children}
    </CheckInsContext.Provider>
  );
};
