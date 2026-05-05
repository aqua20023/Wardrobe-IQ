import { create } from "zustand";

type AppState = {
  activeOccasion: string | null;
  setActiveOccasion: (occasion: string | null) => void;
};

export const useAppStore = create<AppState>((set) => ({
  activeOccasion: null,
  setActiveOccasion: (activeOccasion) => set({ activeOccasion })
}));
