import { create } from 'zustand';
import { UserProfile } from '../types/api.ts';

interface AuthStoreState {
  user: UserProfile;
  isAuthenticated: boolean;
  loginWithGoogle: (email?: string, name?: string) => void;
  logout: () => void;
  addStars: (amount: number) => void;
  addCoins: (amount: number) => void;
  setUser: (user: UserProfile) => void;
  equipSkin: (skinId: string) => void;
  unlockSkin: (skinId: string, cost: number) => boolean;
}

const STORAGE_KEY = 'gd_web_studio_user';

function getStoredUser(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return {
    id: 'user_local_1',
    name: 'CyberDash',
    email: 'player@geometrydash.studio',
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=100&h=100&fit=crop&crop=faces',
    stars: 12,
    secretCoins: 300, // Give some starting coins for shop testing
    completedLevelsCount: 1,
    createdLevelsCount: 1,
    equippedSkin: 'skin_default',
    unlockedSkins: ['skin_default'],
  };
}

export const useAuthStore = create<AuthStoreState>((set) => ({
  user: getStoredUser(),
  isAuthenticated: true,

  loginWithGoogle: (email = 'gamer@google.com', name = 'NeonPilot') => {
    const isVIP = email === 'duongtrungthanh011020122@gmail.com';

    const newUser: UserProfile = {
      id: 'usr_' + Date.now(),
      name,
      email,
      image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=100&h=100&fit=crop&crop=faces',
      stars: isVIP ? 9999 : 25,
      secretCoins: isVIP ? 999999 : 300,
      completedLevelsCount: 2,
      createdLevelsCount: 1,
      equippedSkin: 'skin_default',
      unlockedSkins: isVIP 
        ? ['skin_default', 'skin_gold', 'skin_demon', 'skin_neon', 'skin_emerald']
        : ['skin_default'],
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    set({ user: newUser, isAuthenticated: true });
  },

  logout: () => {
    const guestUser: UserProfile = {
      id: 'guest_' + Date.now(),
      name: 'Guest Player',
      email: 'guest@geometrydash.studio',
      stars: 0,
      secretCoins: 0,
      completedLevelsCount: 0,
      createdLevelsCount: 0,
      equippedSkin: 'skin_default',
      unlockedSkins: ['skin_default'],
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(guestUser));
    set({ user: guestUser, isAuthenticated: false });
  },

  addStars: (amount: number) =>
    set((state) => {
      const updated = {
        ...state.user,
        stars: state.user.stars + amount,
        completedLevelsCount: state.user.completedLevelsCount + 1,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return { user: updated };
    }),

  addCoins: (amount: number) =>
    set((state) => {
      const updated = {
        ...state.user,
        secretCoins: state.user.secretCoins + amount,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return { user: updated };
    }),

  setUser: (user) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    set({ user });
  },

  equipSkin: (skinId: string) =>
    set((state) => {
      if (!state.user.unlockedSkins?.includes(skinId)) return { user: state.user };
      const updated = { ...state.user, equippedSkin: skinId };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return { user: updated };
    }),

  unlockSkin: (skinId: string, cost: number) => {
    let success = false;
    set((state) => {
      if (state.user.secretCoins >= cost && !state.user.unlockedSkins?.includes(skinId)) {
        const updated = {
          ...state.user,
          secretCoins: state.user.secretCoins - cost,
          unlockedSkins: [...(state.user.unlockedSkins || []), skinId],
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        success = true;
        return { user: updated };
      }
      return { user: state.user };
    });
    return success;
  },
}));
