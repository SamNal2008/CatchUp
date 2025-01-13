import { ContactModel } from "@/repositories";
import { logService } from "@/services/log.service";
import { create, useStore } from "zustand/index";

type NewCheckinWithNoteStore = {
  noteContent: string;
  checkInDate: Date;
  setNoteContent: (content: string) => void;
  setCheckInDate: (date: Date) => void;
  isModalVisible: boolean;
  openModal: () => void;
  closeModal: () => void;
  contactToCheckin: ContactModel | null;
  setContactToCheckin: (contact: ContactModel | null) => void;
  resetNewFriendCheckIn: () => void;
};

const newCheckinStore = create<NewCheckinWithNoteStore>((set) => ({
  noteContent: "",
  checkInDate: new Date(),
  isModalVisible: false,
  contactToCheckin: null,
  setContactToCheckin: (contactToCheckin: ContactModel | null) =>
    set(() => ({ contactToCheckin })),
  openModal: () =>
    set((prev) => {
      logService.log("openModal : " + prev.isModalVisible);
      return { isModalVisible: !prev.isModalVisible };
    }),
  closeModal: () => set(() => ({ isModalVisible: false })),
  setNoteContent: (noteContent: string) => set(() => ({ noteContent })),
  setCheckInDate: (checkInDate: Date) => set(() => ({ checkInDate })),
  resetNewFriendCheckIn: () =>
    set((prev) => ({
      ...prev,
      noteContent: "",
      checkInDate: new Date(),
      contactToCheckin: null,
    })),
}));

export const useNewCheckinStore = () => useStore(newCheckinStore);

export const useSetNoteContent = () =>
  useStore(newCheckinStore, (store) => store.setNoteContent);
export const useSetNoteDate = () =>
  useStore(newCheckinStore, (store) => store.setCheckInDate);
export const useSetContactToCheckin = () =>
  useStore(newCheckinStore, (store) => store.setContactToCheckin);

export const useNewCheckinInfo = () => {
  const noteContent = useNoteContent();
  const checkinDate = useCheckinDate();
  const contactToCheckin = useContactToCheckin();
  const setNoteContent = useSetNoteContent();
  return { noteContent, checkinDate, contactToCheckin, setNoteContent };
};

export const useNewNoteCheckInModalControl = () => {
  const openModal = useOpenModal();
  const closeModal = useCloseModal();
  const isModalVisible = useIsModalVisible();

  return { openModal, closeModal, isModalVisible };
};

const useNoteContent = () =>
  useStore(newCheckinStore, (store) => store.noteContent);
const useCheckinDate = () =>
  useStore(newCheckinStore, (store) => store.checkInDate);
const useContactToCheckin = () =>
  useStore(newCheckinStore, (store) => store.contactToCheckin);

const useCloseModal = () =>
  useStore(newCheckinStore, (store) => store.closeModal);
const useOpenModal = () =>
  useStore(newCheckinStore, (store) => store.openModal);
const useIsModalVisible = () =>
  useStore(newCheckinStore, (store) => store.isModalVisible);
