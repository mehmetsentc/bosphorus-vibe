import { create } from "zustand";

type WorldCupPopupStore = {
  forceOpen: boolean;
  requestOpen: () => void;
  clearForceOpen: () => void;
};

export const useWorldCupPopupStore = create<WorldCupPopupStore>((set) => ({
  forceOpen: false,
  requestOpen: () => set({ forceOpen: true }),
  clearForceOpen: () => set({ forceOpen: false }),
}));
