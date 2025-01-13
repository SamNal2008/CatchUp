import { CheckInModel } from "@/repositories/check-ins/CheckInEntity";
import { create, useStore } from "zustand";

type CheckinStore = {
  checkIns: CheckInModel[];
  addCheckIn: (checkin: CheckInModel) => void;
  removeCheckIn: (checkin: CheckInModel) => void;
  clearAllCheckIns: () => void;
  setCheckIns: (checkins: CheckInModel[]) => void;
};

const checkinStore = create<CheckinStore>((set) => ({
  checkIns: [],
  setCheckIns: (checkIns: CheckInModel[]) => set({ checkIns }),
  addCheckIn: (checkin: CheckInModel) =>
    set((state) => ({ checkIns: [...state.checkIns, checkin] })),
  removeCheckIn: (checkinToDelete: CheckInModel) =>
    set((state) => ({
      checkIns: state.checkIns.filter(
        (checkin: CheckInModel) =>
          checkin.checkInDate !== checkinToDelete.checkInDate &&
          checkin.contact.id !== checkinToDelete.contact.id,
      ),
    })),
  clearAllCheckIns: () => set({ checkIns: [] }),
}));

export const useCheckinsStore = () => useStore(checkinStore);
