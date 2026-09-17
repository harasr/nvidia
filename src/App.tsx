import React, { useState } from 'react';
import { useUIStore } from './store/uiStore.ts';
import { useGameStore } from './store/gameStore.ts';
import { DEFAULT_LEVELS } from './data/defaultLevels.ts';
import { LevelMeta } from './types/level.ts';

import { Navbar } from './components/ui/Navbar.tsx';
import { NotificationToast } from './components/ui/NotificationToast.tsx';
import { MainMenuView } from './components/menu/MainMenuView.tsx';
import { LevelSelectView } from './components/level-select/LevelSelectView.tsx';
import { GameView } from './components/game/GameView.tsx';
import { EditorView } from './components/editor/EditorView.tsx';
import { LeaderboardModal } from './components/leaderboard/LeaderboardModal.tsx';
import { PublishLevelModal } from './components/modals/PublishLevelModal.tsx';
import { SettingsModal } from './components/modals/SettingsModal.tsx';
import { GoogleAuthModal } from './components/auth/GoogleAuthModal.tsx';
import { ShopModal } from './components/shop/ShopModal.tsx';

export default function App() {
  const { currentView, setCurrentView, openPublishModal, isGoogleAuthOpen, closeGoogleAuth } = useUIStore();
  const { currentLevel, setCurrentLevel } = useGameStore();

  const [activeLevel, setActiveLevel] = useState<LevelMeta>(() => {
    if (currentLevel) {
      const defaultLvl = DEFAULT_LEVELS.find(l => l.id === currentLevel.id);
      return defaultLvl || currentLevel;
    }
    return DEFAULT_LEVELS[0];
  });

  const handlePlayLevel = (level: LevelMeta) => {
    setActiveLevel(level);
    setCurrentLevel(level);
    setCurrentView('GAME');
  };

  const handleQuickPlay = () => {
    handlePlayLevel(DEFAULT_LEVELS[0]);
  };

  return (
    <div className="min-h-screen bg-[#0A0C14] text-[#F0F4F8] flex flex-col selection:bg-cyan-500 selection:text-black">
      {/* Universal Navigation Header */}
      <Navbar />

      {/* Main Content Workspace depending on View */}
      <main className="flex-1 flex flex-col justify-center items-center w-full">
        {currentView === 'MENU' && (
          <MainMenuView onQuickPlay={handleQuickPlay} />
        )}

        {currentView === 'LEVEL_SELECT' && (
          <LevelSelectView onSelectLevel={handlePlayLevel} />
        )}

        {currentView === 'GAME' && (
          <div className="w-full flex-1 flex items-center justify-center p-2">
            <GameView level={activeLevel} onExit={() => setCurrentView('LEVEL_SELECT')} />
          </div>
        )}

        {currentView === 'EDITOR' && (
          <EditorView onPublishClick={openPublishModal} />
        )}
      </main>

      {/* Cinematic Made by Thanh Footer */}
      <footer
        id="app-cinematic-footer"
        className="w-full py-2.5 px-4 bg-[#07080E]/90 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-slate-400 select-none z-30"
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="text-slate-300 font-semibold">GEOMETRY DASH WEB STUDIO</span>
          <span className="text-slate-600">|</span>
          <span className="text-cyan-400 font-bold tracking-wider">
            MADE BY THANH
          </span>
        </div>

        <div className="flex items-center gap-3 mt-1 sm:mt-0 text-[10px] text-slate-500">
          <span>Tuned Light Physics (1420 G)</span>
          <span>•</span>
          <span>Google OAuth 2.0</span>
          <span>•</span>
          <span>Global Top 10 Live</span>
        </div>
      </footer>

      {/* Universal Modals & Floating Toasts */}
      <LeaderboardModal />
      <PublishLevelModal />
      <SettingsModal />
      <ShopModal />
      <GoogleAuthModal isOpen={isGoogleAuthOpen} onClose={closeGoogleAuth} />
      <NotificationToast />
    </div>
  );
}
