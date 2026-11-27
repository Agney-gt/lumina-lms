import { create } from "zustand";

interface NavigationState {
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  drawerOpen: false,
  setDrawerOpen: (open) => set({ drawerOpen: open }),
}));
