import React from 'react';
import { useUIStore, AppView } from '../../store/uiStore.ts';
import { useAuthStore } from '../../store/authStore.ts';
import { Star, Trophy, Hammer, Play, Settings as SettingsIcon, Home, ListMusic } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentView, setCurrentView, openLeaderboard, openSettings, openGoogleAuth } = useUIStore();
  const { user } = useAuthStore();

  return (
    <header
      id="main-navigation-bar"
      className="h-14 border-b border-white/10 bg-[#0A0B12]/85 backdrop-blur-md px-3 sm:px-4 flex items-center justify-between z-40 relative select-none"
    >
      {/* Brand logo & Main tabs */}
      <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
        <button
          id="btn-nav-home"
          onClick={() => setCurrentView('MENU')}
          className="flex items-center gap-2 group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#00F0FF] to-[#9D00FF] p-[2px] shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#0D0E15] rounded-[6px] flex items-center justify-center font-bold text-xs text-[#00F0FF] font-mono">
              GD
            </div>
          </div>
          <span className="hidden sm:inline font-bold text-base tracking-wider font-heading text-white">
            GEOMETRY <span className="text-[#00F0FF]">STUDIO</span>
          </span>
        </button>

        {/* View Switcher Tabs */}
        <nav className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
          <button
            id="nav-tab-menu"
            onClick={() => setCurrentView('MENU')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              currentView === 'MENU'
                ? 'bg-[#00F0FF] text-black shadow-md shadow-cyan-500/30'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Menu</span>
          </button>

          <button
            id="nav-tab-levels"
            onClick={() => setCurrentView('LEVEL_SELECT')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              currentView === 'LEVEL_SELECT'
                ? 'bg-[#00F0FF] text-black shadow-md shadow-cyan-500/30'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <ListMusic className="w-3.5 h-3.5" />
            <span>Levels</span>
          </button>

          <button
            id="nav-tab-editor"
            onClick={() => setCurrentView('EDITOR')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              currentView === 'EDITOR'
                ? 'bg-[#FFE600] text-black shadow-md shadow-yellow-500/30'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Hammer className="w-3.5 h-3.5" />
            <span>Editor</span>
          </button>

          <button
            id="nav-tab-leaderboard"
            onClick={openLeaderboard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide text-slate-300 hover:text-white hover:bg-white/5 transition-all"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Top 10</span>
          </button>
        </nav>
      </div>

      {/* Center "Made by Thanh" Cinematic Branding */}
      <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-[11px] font-mono tracking-wider shadow-[0_0_12px_rgba(0,240,255,0.15)]">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
        <span className="text-slate-300">DIRECTED & CODED BY</span>
        <span className="font-extrabold text-[#00F0FF] drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]">
          THANH
        </span>
      </div>

      {/* Right User Stats & Settings */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Stars pill */}
        <div
          id="user-stars-badge"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold font-mono"
          title="Total Stars Earned"
        >
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{user.stars}</span>
        </div>

        {/* Coins pill */}
        <div
          id="user-coins-badge"
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold font-mono"
          title="Secret Coins Found"
        >
          <span className="w-3.5 h-3.5 rounded-full bg-cyan-400 inline-block ring-2 ring-cyan-200"></span>
          <span>{user.secretCoins}</span>
        </div>

        {/* Google Auth / Profile Button */}
        <button
          id="btn-nav-google-auth"
          onClick={openGoogleAuth}
          className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 transition-all hover:border-cyan-400/50"
          title="Sign in with Google API"
        >
          <img
            src={user.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces'}
            alt={user.name}
            className="w-6 h-6 rounded-full ring-1 ring-cyan-400/50 object-cover"
          />
          <span className="hidden xl:inline text-xs font-semibold text-slate-200 truncate max-w-[90px]">
            {user.name}
          </span>
          <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center p-[2px]">
            <svg className="w-full h-full" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          </div>
        </button>

        {/* Settings button */}
        <button
          id="btn-open-settings"
          onClick={openSettings}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors"
          title="Game Settings"
        >
          <SettingsIcon className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
