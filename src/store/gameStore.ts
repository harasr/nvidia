import { create } from 'zustand';
import { EngineState, GameSettings, PlayStats } from '../types/game.ts';
import { LevelMeta } from '../types/level.ts';

interface GameStoreState {
  currentLevel: LevelMeta | null;
  engineState: EngineState;
  stats: PlayStats;
  fps: number;
  settings: GameSettings;

  setCurrentLevel: (level: LevelMeta | null) => void;
  setEngineState: (state: EngineState) => void;
  updateStats: (partial: Partial<PlayStats>) => void;
  setFps: (fps: number) => void;
  updateSettings: (partial: Partial<GameSettings>) => void;
  resetStats: () => void;
}

export const useGameStore = create<GameStoreState>((set) => ({
  currentLevel: null,
  engineState: EngineState.IDLE,
  fps: 60,
  stats: {
    attempts: 1,
    percentage: 0,
    bestPercentage: 0,
    timeElapsed: 0,
    jumpCount: 0,
  },
  settings: {
    showFps: true,
    musicVolume: 0.6,
    sfxVolume: 0.75,
    autoRestartDelayMs: 90,
    particlesEnabled: true,
  },

  setCurrentLevel: (level) => set({ currentLevel: level }),
  setEngineState: (engineState) => set({ engineState }),
  updateStats: (partial) =>
    set((state) => ({
      stats: {
        ...state.stats,
        ...partial,
        bestPercentage:
          partial.percentage !== undefined
            ? Math.max(state.stats.bestPercentage, partial.percentage)
            : state.stats.bestPercentage,
      },
    })),
  setFps: (fps) => set({ fps }),
  updateSettings: (partial) =>
    set((state) => ({
      settings: { ...state.settings, ...partial },
    })),
  resetStats: () =>
    set({
      stats: {
        attempts: 1,
        percentage: 0,
        bestPercentage: 0,
        timeElapsed: 0,
        jumpCount: 0,
      },
    }),
}));
