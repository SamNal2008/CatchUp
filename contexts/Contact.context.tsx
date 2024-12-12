import { useNotifications } from "@/hooks/useNotificatons";
import { ContactId, ContactModel } from "@/repositories/contacts/ContactEntity";
import { getContactsRepository } from "@/repositories/contacts/Contacts.repository";
import { Contact } from "expo-contacts";
import { useSQLiteContext } from "expo-sqlite";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import {useCheckIns} from "@/contexts/CheckIns.context";
import {logService} from "@/services/log.service";
import {useNewFriendStore} from "@/store/NewFriend.store";

interface ContactContextProps {
    friends: Array<ContactModel>;
    fetchFriends: () => Promise<void>;
    addNewFriend: (contact: ContactModel) => Promise<void>;
    deleteFriend: (contactId: ContactId) => Promise<void>;
}

const ContactContext = createContext<ContactContextProps | null>(null);

export const useContacts = () => {
    const context = useContext(ContactContext);
    if (!context) throw new Error('Context should be defined');
    return context;
}

export const ContactProvider = ({ children }: { children: ReactNode }) => {
    const { registerFriendNotificationReminder, registerFriendNotificationBirthdayReminder, deleteFriendNotification } = useNotifications();
    const {setContact} = useNewFriendStore();
    const {deleteCheckinForFriend} = useCheckIns();
    const [friends, setFriends] = useState<Array<ContactModel>>([]);
    const db = useSQLiteContext();
    const contactsRepository = getContactsRepository(db);

    const clearNewContact = () => {
        setContact(null);
    }

    useEffect(() => {
        fetchFriends();
    }, []);

    const deleteFriend = async (contactId: ContactId) => {
        await deleteFriendNotification(contactId);
        await contactsRepository.remove(contactId);
        await fetchFriends();
    }

    const fetchFriends = async () => {
        const contacts = await contactsRepository.getAll();
        setFriends(contacts);
    }

    const addNewFriend = async (contact: ContactModel) => {
        try {
            await contactsRepository.addNewFriend(contact);
            registerFriendNotificationReminder(contact);
            registerFriendNotificationBirthdayReminder(contact);
            clearNewContact();
            await fetchFriends();
        } catch (error) {
            logService.error('Error saving contact', error);
            alert('Unable to save contact : ' + contact.firstName + ', are you sure you did not already add this friend ?');
        }
    };

    return (
        <ContactContext.Provider value={{ friends, fetchFriends, addNewFriend, deleteFriend }}>
            {children}
        </ContactContext.Provider>
    );
};