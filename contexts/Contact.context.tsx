import { useNotifications } from "@/hooks/useNotificatons";
import { ContactId, ContactModel } from "@/repositories/contacts/ContactEntity";
import { getContactsRepository } from "@/repositories/contacts/Contacts.repository";
import { logService } from "@/services/log.service";
import { useContactsStore } from "@/store/Contacts.store";
import { useNewFriendStore } from "@/store/NewFriend.store";
import { useSQLiteContext } from "expo-sqlite";
import { createContext, ReactNode, useContext, useEffect } from "react";

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
  const { contacts, setContacts } = useContactsStore();
  const db = useSQLiteContext();
  const contactsRepository = getContactsRepository(db);

  const clearNewContact = () => {
    setContact(null);
  };

  const fetchFriends = async () => {
    const friends = await contactsRepository.getAll();
    setContacts(friends);
  };

  useEffect(() => {
    fetchFriends();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteFriend = async (contactId: ContactId) => {
    await deleteFriendNotification(contactId);
    await contactsRepository.remove(contactId);
    await fetchFriends();
  };

  const addNewFriend = async (contact: ContactModel) => {
    try {
      console.log(contact);
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
      value={{ friends: contacts, fetchFriends, addNewFriend, deleteFriend }}
    >
      {children}
    </ContactContext.Provider>
  );
};
