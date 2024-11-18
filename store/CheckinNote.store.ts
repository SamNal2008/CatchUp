import {create, useStore} from "zustand/index";
import {ContactModel} from "@/repositories";

type NewCheckinWithNoteStore = {
    noteContent: string,
    checkinDate: Date,
    setNoteContent: (content: string) => void;
    setCheckinDate: (date: Date) => void;
    isModalVisible: boolean;
    openModal: () => void;
    closeModal: () => void;
    contactToCheckin: ContactModel | null;
    setContentToCheckin: (contact: ContactModel | null) => void;
};

const newCheckinStore = create<NewCheckinWithNoteStore>((set) => ({
    noteContent: '',
    checkinDate: new Date(),
    isModalVisible: false,
    contactToCheckin: null,
    setContentToCheckin: (contactToCheckin: ContactModel | null) => set(() => ({contactToCheckin})),
    openModal: () => set(() => ({isModalVisible: true})),
    closeModal: () => set(() => ({isModalVisible: false})),
    setNoteContent: (noteContent: string) => set(() => ({noteContent})),
    setCheckinDate: (checkinDate: Date) => set(() => ({checkinDate})),
}));

export const useSetNoteContent = () => useStore(newCheckinStore, store => store.setNoteContent);
export const useSetNoteDate = () => useStore(newCheckinStore, store => store.setCheckinDate);
export const useSetContactToCheckin = () => useStore(newCheckinStore, store => store.setContentToCheckin);

export const useNewCheckinInfo = () => {
    const noteContent = useNoteContent();
    const checkinDate = useCheckinDate();
    const contactToCheckin = useContactToCheckin();
    return {noteContent, checkinDate, contactToCheckin};
}

export const useNewNoteCheckInModalControl = () => {
    const openModal = useOpenModal();
    const closeModal = useCloseModal();
    const isModalVisible = useIsModalVisible();

    return {openModal, closeModal, isModalVisible};
}

const useNoteContent = () => useStore(newCheckinStore, store => store.noteContent);
const useCheckinDate = () => useStore(newCheckinStore, store => store.checkinDate);
const useContactToCheckin = () => useStore(newCheckinStore, store => store.contactToCheckin);

const useCloseModal = () => useStore(newCheckinStore, store => store.closeModal);
const useOpenModal = () => useStore(newCheckinStore, store => store.openModal);
const useIsModalVisible = () => useStore(newCheckinStore, store => store.isModalVisible);
