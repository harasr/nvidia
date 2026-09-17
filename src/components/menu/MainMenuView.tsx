import React from 'react';
import { useUIStore } from '../../store/uiStore.ts';
import { Play, Hammer, Trophy, ListMusic, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface MainMenuViewProps {
  onQuickPlay: () => void;
}

export const MainMenuView: React.FC<MainMenuViewProps> = ({ onQuickPlay }) => {
  const { setCurrentView, openLeaderboard, openShop } = useUIStore();

  return (
    <div id="main-menu" className="w-full flex-1 flex flex-col items-center justify-center py-8 px-4 select-none relative overflow-hidden">
      {/* Background Animated Floating Geometry Shapes */}
      <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
        <motion.div
          animate={{ rotate: 360, x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ repeat: Infinity, duration: 18, ease: 'linear' }}
          className="absolute top-1/4 left-1/6 w-24 h-24 border-2 border-cyan-400 rounded-lg"
        />
        <motion.div
          animate={{ rotate: -360, x: [0, -50, 0], y: [0, 40, 0] }}
          transition={{ repeat: Infinity, duration: 22, ease: 'linear' }}
          className="absolute bottom-1/4 right-1/6 w-32 h-32 border-2 border-purple-500 rounded-xl"
        />
      </div>

      {/* Main Title Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10 z-10"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono font-semibold mb-2">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          RHYTHM PLATFORMER & LEVEL CREATOR
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black font-heading tracking-wider text-white drop-shadow-[0_0_25px_rgba(0,240,255,0.4)]">
          GEOMETRY <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] via-[#9D00FF] to-[#FF007F]">DASH</span>
        </h1>
        <p className="text-[10px] sm:text-xs text-slate-400 font-mono tracking-widest mt-1">WEB STUDIO BY DEVTHANH</p>
      </motion.div>

      {/* Main Action Hub Buttons */}
      <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-4 max-w-4xl w-full z-10">
        {/* Play Button */}
        <motion.button
          id="menu-btn-play"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onQuickPlay}
          className="relative w-full sm:w-48 h-12 skew-x-[-12deg] bg-gradient-to-r from-cyan-900/80 to-blue-900/80 border border-cyan-400/50 hover:border-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.2)] hover:shadow-[0_0_25px_rgba(0,240,255,0.5)] cursor-pointer overflow-hidden group"
        >
          <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-300"></div>
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-300 to-transparent opacity-50 group-hover:opacity-100"></div>
          <div className="relative flex items-center justify-center h-full skew-x-[12deg] gap-2 px-3">
            <Play className="w-4 h-4 text-cyan-300 fill-current group-hover:text-white transition-colors" />
            <span className="font-heading font-black text-sm tracking-widest uppercase text-cyan-100 group-hover:text-white drop-shadow-lg">CHƠI NGAY</span>
          </div>
        </motion.button>

        {/* Level Select Button */}
        <motion.button
          id="menu-btn-levels"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setCurrentView('LEVEL_SELECT')}
          className="relative w-full sm:w-40 h-12 skew-x-[-12deg] bg-gradient-to-r from-purple-900/80 to-fuchsia-900/80 border border-purple-400/50 hover:border-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.2)] hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] cursor-pointer overflow-hidden group"
        >
          <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-300"></div>
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-300 to-transparent opacity-50 group-hover:opacity-100"></div>
          <div className="relative flex items-center justify-center h-full skew-x-[12deg] gap-2 px-3">
            <ListMusic className="w-4 h-4 text-purple-300 group-hover:text-white transition-colors" />
            <span className="font-heading font-black text-sm tracking-widest uppercase text-purple-100 group-hover:text-white drop-shadow-lg">MÀN CHƠI</span>
          </div>
        </motion.button>

        {/* Editor Button */}
        <motion.button
          id="menu-btn-editor"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setCurrentView('EDITOR')}
          className="relative w-full sm:w-40 h-12 skew-x-[-12deg] bg-gradient-to-r from-amber-900/80 to-orange-900/80 border border-amber-400/50 hover:border-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.2)] hover:shadow-[0_0_25px_rgba(251,191,36,0.5)] cursor-pointer overflow-hidden group"
        >
          <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-300"></div>
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-300 to-transparent opacity-50 group-hover:opacity-100"></div>
          <div className="relative flex items-center justify-center h-full skew-x-[12deg] gap-2 px-3">
            <Hammer className="w-4 h-4 text-amber-300 group-hover:text-white transition-colors" />
            <span className="font-heading font-black text-sm tracking-widest uppercase text-amber-100 group-hover:text-white drop-shadow-lg">TẠO MÀN</span>
          </div>
        </motion.button>

        {/* Leaderboard Button */}
        <motion.button
          id="menu-btn-leaderboard"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={openLeaderboard}
          className="relative w-full sm:w-40 h-12 skew-x-[-12deg] bg-gradient-to-r from-rose-900/80 to-pink-900/80 border border-rose-400/50 hover:border-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.2)] hover:shadow-[0_0_25px_rgba(244,63,94,0.5)] cursor-pointer overflow-hidden group"
        >
          <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-300"></div>
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-rose-300 to-transparent opacity-50 group-hover:opacity-100"></div>
          <div className="relative flex items-center justify-center h-full skew-x-[12deg] gap-2 px-3">
            <Trophy className="w-4 h-4 text-rose-300 group-hover:text-white transition-colors" />
            <span className="font-heading font-black text-sm tracking-widest uppercase text-rose-100 group-hover:text-white drop-shadow-lg">XẾP HẠNG</span>
          </div>
        </motion.button>

        {/* Shop Button */}
        <motion.button
          id="menu-btn-shop"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={openShop}
          className="relative w-full sm:w-40 h-12 skew-x-[-12deg] bg-gradient-to-r from-emerald-900/80 to-teal-900/80 border border-emerald-400/50 hover:border-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.2)] hover:shadow-[0_0_25px_rgba(52,211,153,0.5)] cursor-pointer overflow-hidden group"
        >
          <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-300"></div>
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-300 to-transparent opacity-50 group-hover:opacity-100"></div>
          <div className="relative flex items-center justify-center h-full skew-x-[12deg] gap-2 px-3">
            <Sparkles className="w-4 h-4 text-emerald-300 group-hover:text-white transition-colors" />
            <span className="font-heading font-black text-sm tracking-widest uppercase text-emerald-100 group-hover:text-white drop-shadow-lg">CỬA HÀNG</span>
          </div>
        </motion.button>
      </div>

      {/* Controls summary footer */}
      <div className="mt-12 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 font-mono bg-white/5 px-4 py-2 rounded-xl border border-white/10 z-10">
        <span className="flex items-center gap-1.5">
          <kbd className="px-2 py-0.5 rounded bg-black/50 border border-white/20 text-white font-bold">SPACE</kbd>
          hoặc
          <kbd className="px-2 py-0.5 rounded bg-black/50 border border-white/20 text-white font-bold">CLICK</kbd>
          để Nhảy / Bay
        </span>
        <span className="text-white/20">•</span>
        <span className="flex items-center gap-1.5">
          <kbd className="px-2 py-0.5 rounded bg-black/50 border border-white/20 text-white font-bold">Z</kbd>
          /
          <kbd className="px-2 py-0.5 rounded bg-black/50 border border-white/20 text-white font-bold">X</kbd>
          Lưu điểm Checkpoint
        </span>
        <span className="text-white/20">•</span>
        <span className="flex items-center gap-1.5">
          <kbd className="px-2 py-0.5 rounded bg-black/50 border border-white/20 text-white font-bold">ESC</kbd>
          Tạm Dừng
        </span>
      </div>
    </div>
  );
};

