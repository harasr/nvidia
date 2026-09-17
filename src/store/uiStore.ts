import { create } from 'zustand';

export type AppView = 'MENU' | 'LEVEL_SELECT' | 'GAME' | 'EDITOR' | 'LEADERBOARD';

interface UIStoreState {
  currentView: AppView;
  isLeaderboardOpen: boolean;
  isProfileOpen: boolean;
  isSettingsOpen: boolean;
  isPublishModalOpen: boolean;
  isGoogleAuthOpen: boolean;
  isShopOpen: boolean;
  notification: { message: string; type: 'success' | 'error' | 'info' } | null;

  setCurrentView: (view: AppView) => void;
  openLeaderboard: () => void;
  closeLeaderboard: () => void;
  openProfile: () => void;
  closeProfile: () => void;
  openSettings: () => void;
  closeSettings: () => void;
  openPublishModal: () => void;
  closePublishModal: () => void;
  openGoogleAuth: () => void;
  closeGoogleAuth: () => void;
  openShop: () => void;
  closeShop: () => void;
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
  clearNotification: () => void;
}

export const useUIStore = create<UIStoreState>((set) => ({
  currentView: 'MENU',
  isLeaderboardOpen: false,
  isProfileOpen: false,
  isSettingsOpen: false,
  isPublishModalOpen: false,
  isGoogleAuthOpen: false,
  isShopOpen: false,
  notification: null,

  setCurrentView: (currentView) => set({ currentView }),
  openLeaderboard: () => set({ isLeaderboardOpen: true }),
  closeLeaderboard: () => set({ isLeaderboardOpen: false }),
  openProfile: () => set({ isProfileOpen: true }),
  closeProfile: () => set({ isProfileOpen: false }),
  openSettings: () => set({ isSettingsOpen: true }),
  closeSettings: () => set({ isSettingsOpen: false }),
  openPublishModal: () => set({ isPublishModalOpen: true }),
  closePublishModal: () => set({ isPublishModalOpen: false }),
  openGoogleAuth: () => set({ isGoogleAuthOpen: true }),
  closeGoogleAuth: () => set({ isGoogleAuthOpen: false }),
  openShop: () => set({ isShopOpen: true }),
  closeShop: () => set({ isShopOpen: false }),
  showNotification: (message, type = 'info') => {
    set({ notification: { message, type } });
    setTimeout(() => {
      set({ notification: null });
    }, 3200);
  },
  clearNotification: () => set({ notification: null }),
}));
