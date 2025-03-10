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
  birthday: string | null; // ISO string format in database
};

export type ContactId = string;

type CreateNewContactEntityParams = {
  contact: Contact | null;
  frequency: ReminderFrequency;
  birthDate: Date | null;
  lastCheckin: Date | null;
};

export const createNewContactEntity = ({
  birthDate,
  contact,
  frequency,
  lastCheckin,
}: CreateNewContactEntityParams): ContactModel => {
  if (contact === null) {
    throw new Error("Contact should not be null");
  }

  // Validate birthDate if provided
  if (birthDate !== null && !(birthDate instanceof Date)) {
    throw new Error("birthDate must be a valid Date object or null");
  }

  // Validate lastCheckin if provided
  if (lastCheckin !== null && !(lastCheckin instanceof Date)) {
    throw new Error("lastCheckin must be a valid Date object or null");
  }

  return {
    ...contact,
    frequency,
    birthDate,
    lastCheckin,
  };
};

// Helper function to convert Date to ISO string for database storage
export const dateToISOString = (date: Date | null): string | null => {
  return date ? date.toISOString() : null;
};

// Helper function to convert ISO string from database to Date
export const isoStringToDate = (isoString: string | null): Date | null => {
  if (!isoString) return null;
  const date = new Date(isoString);
  return isNaN(date.getTime()) ? null : date;
};
