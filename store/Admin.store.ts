import { create, useStore } from "zustand";

type AdminStore = {
    isAdmin: boolean;
    toggleAdminMode: () => void;
};
  
const adminStore = create<AdminStore>((set) => ({
    isAdmin: false,
    toggleAdminMode: () => set((state) => ({ isAdmin: !state.isAdmin })),
}));

export const useIsAdmin = () => useStore(adminStore, store => store.isAdmin);
export const useToggleAdminMode = () => useStore(adminStore, store => store.toggleAdminMode);