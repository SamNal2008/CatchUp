import { Contact } from "expo-contacts";
import { ReminderFrequency } from "./ReminderFrequency";

export type ContactModel = {
    frequency: ReminderFrequency;
} & Contact;

export type ContactEntity = {
    contact_id: ContactId;
    frequency: ReminderFrequency;
}

export type ContactId = string;

export const createNewContactEntity = (contact: Contact | null, frequency: ReminderFrequency): ContactModel => {
    if (contact === null) {
        throw new Error('Contact should not be null');
    }
    return ({
        ...contact,
        frequency
    });
};