import { useNotifications } from "@/hooks/useNotificatons";
import { ContactId, ContactModel } from "@/repositories/contacts/ContactEntity";
import { getContactsRepository } from "@/repositories/contacts/Contacts.repository";
import { logService } from "@/services/log.service";
import { useNewFriendStore } from "@/store/NewFriend.store";
import { useSQLiteContext } from "expo-sqlite";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface ContactContextProps {
  friends: ContactModel[];
  fetchFriends: () => Promise<void>;
  addNewFriend: (contact: ContactModel) => Promise<void>;
  deleteFriend: (contactId: ContactId) => Promise<void>;
}

const ContactContext = createContext<ContactContextProps | null>(null);

export const useContacts = () => {
  const context = useContext(ContactContext);
  if (!context) throw new Error("Context should be defined");
  return context;
};

export const ContactProvider = ({ children }: { children: ReactNode }) => {
  const {
    registerFriendNotificationReminder,
    registerFriendNotificationBirthdayReminder,
    deleteFriendNotification,
  } = useNotifications();
  const { setContact } = useNewFriendStore();
  const [friends, setFriends] = useState<ContactModel[]>([]);
  const db = useSQLiteContext();
  const contactsRepository = getContactsRepository(db);

  const clearNewContact = () => {
    setContact(null);
  };

  const fetchFriends = useCallback(async () => {
    const friends = await contactsRepository.getAll();
    setFriends(friends);
  }, []);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  const deleteFriend = async (contactId: ContactId) => {
    await deleteFriendNotification(contactId);
    await contactsRepository.remove(contactId);
    await fetchFriends();
  };

  const addNewFriend = async (contact: ContactModel) => {
    try {
      await contactsRepository.addNewFriend(contact);
      registerFriendNotificationReminder(contact);
      registerFriendNotificationBirthdayReminder(contact);
      clearNewContact();
      await fetchFriends();
    } catch (error) {
      logService.error("Error saving contact", error);
      alert(
        "Unable to save contact : " +
        contact.firstName +
        ", are you sure you did not already add this friend ?",
      );
    }
  };

  return (
    <ContactContext.Provider
      value={{ friends, fetchFriends, addNewFriend, deleteFriend }}
    >
      {children}
    </ContactContext.Provider>
  );
};
