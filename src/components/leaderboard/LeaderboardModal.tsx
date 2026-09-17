import React, { useEffect, useState } from 'react';
import { useUIStore } from '../../store/uiStore.ts';
import { useAuthStore } from '../../store/authStore.ts';
import { Trophy, Star, Medal, Crown, Flame, Sparkles, X, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, collection, query, orderBy, limit, handleFirestoreError, OperationType } from '../../lib/firebase.ts';
import { onSnapshot } from 'firebase/firestore';

export const LeaderboardModal: React.FC = () => {
  const { isLeaderboardOpen, closeLeaderboard } = useUIStore();
  const { user } = useAuthStore();
  const [globalList, setGlobalList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let unsubscribe: () => void;

    if (isLeaderboardOpen) {
      setLoading(true);
      
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, orderBy('stars', 'desc'), limit(10));
        
        unsubscribe = onSnapshot(q, (snapshot) => {
          const leaderData = snapshot.docs.map((doc, index) => ({
            userId: doc.id,
            rank: index + 1,
            name: doc.data().name || 'Unknown Player',
            stars: doc.data().stars || 0,
            completedLevels: doc.data().completedLevelsCount || 0,
          }));
          
          setGlobalList(leaderData);
          setLoading(false);
        }, (error) => {
          handleFirestoreError(error, OperationType.LIST, 'users');
          setLoading(false);
        });
      } catch (err) {
        console.error("Failed to setup real-time leaderboard", err);
        setLoading(false);
      }
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isLeaderboardOpen]);

  if (!isLeaderboardOpen) return null;

  const top1 = globalList[0];
  const top2 = globalList[1];
  const top3 = globalList[2];
  const restTop = globalList.slice(3, 10);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <motion.div
        id="leaderboard-modal"
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-[#101222] border border-cyan-500/30 rounded-3xl w-full max-w-xl shadow-[0_0_50px_rgba(0,240,255,0.15)] overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Cinematic Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-[#14182E] to-[#1E1435]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Trophy className="w-4 h-4 text-[#FFE600]" />
            </div>
            <div>
              <h3 className="font-heading font-black text-lg text-white tracking-wider flex items-center gap-2">
                GLOBAL TOP 10 CHAMPIONS
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  LIVE
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Official Rhythm Leaderboard • Made by Thanh</p>
            </div>
          </div>
          <button
            id="btn-close-leaderboard"
            onClick={closeLeaderboard}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-4">
          {/* Top 3 Podium Cards */}
          {globalList.length >= 3 && (
            <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-4 pb-2 items-end">
              {/* #2 Silver */}
              {top2 && (
                <div className="flex flex-col items-center bg-white/5 border border-slate-400/30 rounded-2xl p-3 text-center relative hover:scale-[1.02] transition-transform">
                  <div className="w-6 h-6 rounded-full bg-slate-300 text-black font-black text-xs flex items-center justify-center mb-1 shadow-md">
                    2
                  </div>
                  <Medal className="w-6 h-6 text-slate-300 mb-1" />
                  <span className="font-bold text-xs text-white truncate max-w-full block font-heading">
                    {top2.name}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] font-mono text-amber-300 font-bold mt-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{top2.stars}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono mt-0.5">{top2.completedLevels} Clears</span>
                </div>
              )}

              {/* #1 Gold Champion */}
              {top1 && (
                <div className="flex flex-col items-center bg-gradient-to-b from-amber-500/20 to-amber-900/10 border-2 border-amber-400 rounded-2xl p-3 sm:p-4 text-center relative -translate-y-2 shadow-xl shadow-amber-500/15 hover:scale-[1.03] transition-transform">
                  <div className="absolute -top-3 w-7 h-7 rounded-full bg-amber-400 text-black font-black text-xs flex items-center justify-center shadow-lg ring-2 ring-[#0D0E15]">
                    <Crown className="w-4 h-4 fill-black" />
                  </div>
                  <Trophy className="w-8 h-8 text-[#FFE600] mt-1 mb-1 animate-pulse" />
                  <span className="font-extrabold text-sm text-white truncate max-w-full block font-heading">
                    {top1.name}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-mono text-amber-300 font-black mt-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{top1.stars} Stars</span>
                  </div>
                  <span className="text-[10px] text-amber-200/80 font-mono mt-0.5">{top1.completedLevels} Clears</span>
                </div>
              )}

              {/* #3 Bronze */}
              {top3 && (
                <div className="flex flex-col items-center bg-white/5 border border-amber-700/40 rounded-2xl p-3 text-center relative hover:scale-[1.02] transition-transform">
                  <div className="w-6 h-6 rounded-full bg-amber-700 text-white font-black text-xs flex items-center justify-center mb-1 shadow-md">
                    3
                  </div>
                  <Medal className="w-6 h-6 text-amber-600 mb-1" />
                  <span className="font-bold text-xs text-white truncate max-w-full block font-heading">
                    {top3.name}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] font-mono text-amber-300 font-bold mt-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{top3.stars}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono mt-0.5">{top3.completedLevels} Clears</span>
                </div>
              )}
            </div>
          )}

          {/* Ranks 4 to 10 List */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider px-1">
              Top 4 — Top 10 Contenders
            </span>

            {restTop.map((entry) => (
              <div
                key={entry.userId}
                className="flex items-center justify-between p-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 text-center font-mono font-bold text-slate-400 text-xs">
                    #{entry.rank}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center font-mono text-[10px] text-cyan-400 font-bold">
                      {entry.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="font-semibold text-slate-200">{entry.name}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 font-mono">
                  <span className="text-[11px] text-slate-400 hidden sm:inline">
                    {entry.completedLevels} Cleared
                  </span>
                  <div className="flex items-center gap-1 text-amber-300 font-bold">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{entry.stars}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* User's Current Score Status Bar */}
          <div className="mt-2 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <UserCheck className="w-4 h-4 text-cyan-400" />
              <div>
                <span className="font-bold text-white block">Your Ranking Record: {user.name}</span>
                <span className="text-[11px] text-cyan-300/80">
                  {user.stars} Stars • {user.secretCoins} Secret Coins
                </span>
              </div>
            </div>

            <button
              onClick={closeLeaderboard}
              className="px-3 py-1.5 rounded-xl bg-cyan-400 text-black font-bold text-xs hover:brightness-110 active:scale-95"
            >
              Play to Climb!
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
