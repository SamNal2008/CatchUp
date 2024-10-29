import { Contact } from "expo-contacts";
import { ReminderFrequency } from "./ReminderFrequency";

export type ContactModel = {
    frequency: ReminderFrequency;
    birthDate: Date | null;
    lastCheckin: Date | null;
} & Contact;

export type ContactEntity = {
    contact_id: ContactId;
    frequency: ReminderFrequency;
}

export type ContactId = string;

type CreateNewContactEntityParams = {
    contact: Contact | null;
    frequency: ReminderFrequency;
    birthDate: Date | null;
    lastCheckin: Date | null;
}

export const createNewContactEntity = ({birthDate, contact, frequency, lastCheckin}: CreateNewContactEntityParams): ContactModel => {
    if (contact === null) {
        throw new Error('Contact should not be null');
    }
    return ({
        ...contact,
        frequency,
        birthDate,
        lastCheckin
    });
};