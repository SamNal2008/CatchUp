import { ContactModel } from "@/repositories/contacts/ContactEntity";
import { ReminderFrequency } from "@/repositories/contacts/ReminderFrequency";
import { logService } from "@/services/log.service";
import { Contact } from "expo-contacts";
import { create, useStore } from "zustand";

/**
 * Mode determines whether we're creating a new contact or updating an existing one
 */
export enum ContactEditMode {
  CREATE = "create",
  UPDATE = "update",
}

/**
 * Default state values
 */
const defaultState = {
  contact: null,
  databaseContact: null,
  contactBirthday: null,
  contactLastCheckIn: new Date(),
  selectedFrequency: "monthly" as ReminderFrequency,
  editMode: ContactEditMode.CREATE,
};

/**
 * Store for managing contact editing
 */
type NewFriendStore = {
  // Basic contact information
  contact: Contact | null;
  setContact: (contact: Contact | null) => void;

  // Database contact (when in update mode)
  databaseContact: ContactModel | null;
  setDatabaseContact: (contact: ContactModel | null) => void;

  // Edit mode
  editMode: ContactEditMode;
  setEditMode: (mode: ContactEditMode) => void;

  // Contact properties
  contactBirthday: Date | null;
  setContactBirthday: (date: Date | null) => void;
  contactLastCheckIn: Date;
  setContactLastCheckIn: (date: Date) => void;
  selectedFrequency: ReminderFrequency;
  setSelectedFrequency: (frequency: ReminderFrequency | null) => void;

  // Convenience methods
  reset: () => void;
  initializeFromExistingContact: (existingContact: ContactModel) => void;
};

const newFriendStore = create<NewFriendStore>((set) => ({
  // Initialize with default values
  ...defaultState,

  // Simple setters
  setContact: (contact) => set({ contact }),
  setDatabaseContact: (databaseContact) => set({ databaseContact }),
  setEditMode: (editMode) => set({ editMode }),
  setContactBirthday: (contactBirthday) => set({ contactBirthday }),
  setContactLastCheckIn: (contactLastCheckIn) => set({ contactLastCheckIn }),
  setSelectedFrequency: (selectedFrequency) => {
    if (selectedFrequency) set({ selectedFrequency });
  },

  // Reset to initial state
  reset: () => {
    logService.info("Resetting contact form state");
    set(defaultState);
  },

  // Initialize from existing contact data
  initializeFromExistingContact: (existingContact: ContactModel) => {
    logService.info(
      `Initializing from existing contact: ${existingContact.id}`,
    );

    set({
      contact: existingContact,
      databaseContact: existingContact,
      editMode: ContactEditMode.UPDATE,
      selectedFrequency: existingContact.frequency,
      contactBirthday: existingContact.birthDate,
      contactLastCheckIn: existingContact.lastCheckin || new Date(),
    });
  },
}));

export const useNewFriendStore = () => useStore(newFriendStore);
