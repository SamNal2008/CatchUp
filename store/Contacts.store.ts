import { ContactModel } from "@/repositories";
import { create, useStore } from "zustand";

type ContactsStore = {
  contacts: ContactModel[];
  addContact: (contact: ContactModel) => void;
  removeContact: (contact: ContactModel) => void;
  clearAllContacts: () => void;
  setContacts: (contacts: ContactModel[]) => void;
};

const contactsStore = create<ContactsStore>((set) => ({
  contacts: [],
  setContacts: (contacts: ContactModel[]) => set({ contacts }),
  addContact: (contact: ContactModel) =>
    set((state) => ({ contacts: [...state.contacts, contact] })),
  removeContact: (contactToDelete: ContactModel) =>
    set((state) => ({
      contacts: state.contacts.filter(
        (contact: ContactModel) => contact.id !== contactToDelete.id,
      ),
    })),
  clearAllContacts: () => set({ contacts: [] }),
}));

export const useContactsStore = () => useStore(contactsStore);
