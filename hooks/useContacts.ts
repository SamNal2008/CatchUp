import {PhoneNumber} from "expo-contacts/src/Contacts";
import {useEffect, useState} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Contact {
    id?: string;
    name: string;
    phoneNumbers?: PhoneNumber[];
}

// Do not use for now
export const useContacts = () => {

    useEffect(() => {
        getContact();
    }, []);

    const [contacts, setContacts] = useState<Contact[]>([]);

    const saveContact = async (contacts: Contact[]): Promise<void> => {
        await AsyncStorage.setItem('contacts', JSON.stringify(contacts));
        console.debug('Contacts saved', contacts);
    }

    const getContact = async (): Promise<void>  => {
        const contacts = await AsyncStorage.getItem('contacts');
        if (contacts) {
            setContacts(JSON.parse(contacts));
        }
        setContacts([]);
    }

    return {saveContact, contacts};
}