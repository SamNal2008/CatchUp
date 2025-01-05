import { create, useStore } from "zustand";
import { ReminderFrequency } from "@/repositories";
import { Contact } from "expo-contacts";
import { DateUtils } from "@/constants/DateUtils";

type NewFriendStore = {
  contact: Contact | null;
  setContact: (contact: Contact | null) => void;
  contactBirthday: Date | null;
  setContactBirthday: (date: Date | null) => void;
  contactLastCheckIn: Date;
  setContactLastCheckIn: (date: Date) => void;
  selectedFrequency: ReminderFrequency;
  setSelectedFrequency: (frequency: ReminderFrequency | null) => void;
  reset: () => void;
};

const newFriendStore = create<NewFriendStore>((set) => ({
  contact: null,
  setContact: (contact) => {
    set({
      contact,
      contactBirthday: contact?.birthday
        ? DateUtils.getDateFromContactDate(contact.birthday)
        : null,
      contactLastCheckIn: new Date(),
      selectedFrequency: "weekly",
    });
  },
  contactBirthday: null,
  setContactBirthday: (contactBirthday) => set({ contactBirthday }),
  contactLastCheckIn: new Date(),
  setContactLastCheckIn: (contactLastCheckIn) => set({ contactLastCheckIn }),
  selectedFrequency: "weekly",
  setSelectedFrequency: (selectedFrequency) =>
    set({ selectedFrequency: selectedFrequency ?? "never" }),
  reset: () =>
    set({
      contact: null,
      contactBirthday: null,
      contactLastCheckIn: new Date(),
      selectedFrequency: "weekly",
    }),
}));

export const useNewFriendStore = () => useStore(newFriendStore);
