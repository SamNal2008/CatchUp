import { ContactId, ContactModel } from "@/repositories";
import { create, useStore } from "zustand";

type ContactsStore = {
  contacts: ContactModel[];
  addContact: (contact: ContactModel) => void;
  removeContact: (contactId: ContactId) => void;
  updateContact: (contact: ContactModel) => void;
  clearAllContacts: () => void;
  setContacts: (contacts: ContactModel[]) => void;
  isSyncing: boolean;
  setSyncing: (isSyncing: boolean) => void;
};

const contactsStore = create<ContactsStore>((set) => ({
  contacts: [],
  isSyncing: false,
  setSyncing: (isSyncing: boolean) => set({ isSyncing }),
  setContacts: (contacts: ContactModel[]) => set({ contacts }),
  addContact: (contact: ContactModel) =>
    set((state) => ({ contacts: [...state.contacts, contact] })),
  removeContact: (contactId: ContactId) =>
    set((state) => ({
      contacts: state.contacts.filter(
        (contact: ContactModel) => contact.id !== contactId,
      ),
    })),
  updateContact: (updatedContact: ContactModel) =>
    set((state) => ({
      contacts: state.contacts.map((contact: ContactModel) =>
        contact.id === updatedContact.id ? updatedContact : contact,
      ),
    })),
  clearAllContacts: () => set({ contacts: [] }),
}));

export const useContactsStore = () => useStore(contactsStore);
