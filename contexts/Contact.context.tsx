import { useNotifications } from "@/hooks/useNotificatons";
import { ContactId, ContactModel } from "@/repositories/contacts/ContactEntity";
import { getContactsRepository } from "@/repositories/contacts/Contacts.repository";
import { logService } from "@/services/log.service";
import { useContactsStore } from "@/store/Contacts.store";
import { useNewFriendStore } from "@/store/NewFriend.store";
import { useSQLiteContext } from "expo-sqlite";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";

interface ContactContextProps {
  friends: ContactModel[];
  fetchFriends: () => Promise<void>;
  addNewFriend: (contact: ContactModel) => Promise<void>;
  updateFriend: (contact: ContactModel) => Promise<void>;
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
  const { contacts, setContacts, addContact, removeContact, updateContact } =
    useContactsStore();
  const db = useSQLiteContext();

  // Use ref to prevent contactsRepository from causing re-renders
  const contactsRepositoryRef = useRef(getContactsRepository(db));

  // Prevent initialization on every render
  const isInitializedRef = useRef(false);

  const clearNewContact = useCallback(() => {
    setContact(null);
  }, [setContact]);

  // Main function to synchronize store with database
  const fetchFriends = useCallback(async () => {
    try {
      const friends = await contactsRepositoryRef.current.getAll();
      setContacts(friends);
      logService.info(`Synchronized ${friends.length} contacts from database`);
    } catch (error) {
      logService.error("Error fetching contacts:", error);
      // Show error to user
      alert("Failed to load your contacts. Please try again.");
    }
  }, [setContacts]);

  // Load contacts when component mounts - using useRef to prevent multiple calls
  useEffect(() => {
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      fetchFriends().catch((error) =>
        logService.error("Initial contacts load failed", error),
      );
    }
  }, [fetchFriends]); // Empty dependency array to only run on mount

  const deleteFriend = useCallback(
    async (contactId: ContactId) => {
      if (!contactId) {
        logService.error("Cannot delete contact without ID");
        throw new Error("Contact ID is required");
      }

      try {
        // Optimistic update
        removeContact(contactId);

        // Then update database and notifications
        await deleteFriendNotification(contactId);
        await contactsRepositoryRef.current.remove(contactId);

        logService.info(`Successfully deleted contact: ${contactId}`);
      } catch (error) {
        logService.error(`Error deleting contact ${contactId}`, error);

        // Revert optimistic update on error by re-fetching from database
        await fetchFriends();
        throw error;
      }
    },
    [removeContact, deleteFriendNotification, fetchFriends],
  );

  const addNewFriend = useCallback(
    async (contact: ContactModel) => {
      if (!contact.id) {
        logService.error("Cannot add contact without ID");
        throw new Error("Contact ID is required");
      }

      try {
        // Add to database
        const savedContact =
          await contactsRepositoryRef.current.addNewFriend(contact);

        // Update local state
        addContact(savedContact);

        // Set up notifications
        registerFriendNotificationReminder(savedContact);
        registerFriendNotificationBirthdayReminder(savedContact);

        // Clear the form
        clearNewContact();

        logService.info(`Successfully added new contact: ${savedContact.id}`);
      } catch (error) {
        logService.error("Error saving contact", error);

        // Show user-friendly error
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        alert(`Unable to save contact: ${contact.firstName}. ${errorMessage}`);
        throw error;
      }
    },
    [
      addContact,
      registerFriendNotificationReminder,
      registerFriendNotificationBirthdayReminder,
      clearNewContact,
    ],
  );

  const updateFriend = useCallback(
    async (contact: ContactModel) => {
      if (!contact.id) {
        logService.error("Cannot update contact without ID");
        throw new Error("Contact ID is required");
      }

      try {
        // Update in database
        const updatedContact =
          await contactsRepositoryRef.current.update(contact);

        // Update local state
        updateContact(updatedContact);

        // Update notifications
        registerFriendNotificationReminder(updatedContact);
        registerFriendNotificationBirthdayReminder(updatedContact);

        logService.info(`Successfully updated contact: ${contact.id}`);
      } catch (error) {
        logService.error(`Error updating contact ${contact.id}`, error);

        // Show user-friendly error
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        alert(
          `Unable to update contact: ${contact.firstName}. ${errorMessage}`,
        );
        throw error;
      }
    },
    [
      updateContact,
      registerFriendNotificationReminder,
      registerFriendNotificationBirthdayReminder,
    ],
  );

  return (
    <ContactContext.Provider
      value={{
        friends: contacts,
        fetchFriends,
        addNewFriend,
        updateFriend,
        deleteFriend,
      }}
    >
      {children}
    </ContactContext.Provider>
  );
};
