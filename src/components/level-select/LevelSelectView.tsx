import React, { useEffect, useState } from 'react';
import { DifficultyLevel, LevelMeta } from '../../types/level.ts';
import { DEFAULT_LEVELS } from '../../data/defaultLevels.ts';
import { Search, Play, Star, Flame, Music, Users, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface LevelSelectViewProps {
  onSelectLevel: (level: LevelMeta) => void;
}

export const LevelSelectView: React.FC<LevelSelectViewProps> = ({ onSelectLevel }) => {
  const [levels, setLevels] = useState<LevelMeta[]>(DEFAULT_LEVELS);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    fetchLevels();
  }, [selectedDifficulty]);

  const fetchLevels = async () => {
    setLoading(true);
    try {
      let url = '/api/levels?limit=30';
      if (selectedDifficulty !== 'ALL') {
        url += `&difficulty=${selectedDifficulty}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.levels && data.levels.length > 0) {
          setLevels(data.levels);
        }
      }
    } catch {
      // Fallback to local default levels
      setLevels(DEFAULT_LEVELS);
    } finally {
      setLoading(false);
    }
  };

  const filteredLevels = levels.filter((lvl) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      lvl.title.toLowerCase().includes(q) ||
      lvl.creatorName.toLowerCase().includes(q) ||
      lvl.songTitle.toLowerCase().includes(q)
    );
  });

  const getDifficultyBadge = (diff: DifficultyLevel) => {
    switch (diff) {
      case DifficultyLevel.EASY:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">EASY</span>;
      case DifficultyLevel.MEDIUM:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">MEDIUM</span>;
      case DifficultyLevel.HARD:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">HARD</span>;
      case DifficultyLevel.DEMON:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600/30 text-rose-400 border border-rose-500/50 flex items-center gap-1">
            <Flame className="w-3 h-3 text-rose-500 fill-current" /> DEMON
          </span>
        );
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">NORMAL</span>;
    }
  };

  return (
    <div id="level-select-container" className="w-full max-w-5xl mx-auto py-4 px-3 flex flex-col gap-5">
      {/* Header with Search & Difficulty Pills */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#121424] p-4 rounded-2xl border border-white/10">
        <div>
          <h2 className="text-xl font-bold font-heading text-white tracking-wide">SELECT LEVEL</h2>
          <p className="text-xs text-slate-400">Jump, fly, and flip your way through rhythm hazards</p>
        </div>

        {/* Search input */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="search-level-input"
              type="text"
              placeholder="Search level or creator..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Difficulty filter chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {['ALL', 'EASY', 'MEDIUM', 'HARD', 'DEMON'].map((diff) => (
          <button
            key={diff}
            onClick={() => setSelectedDifficulty(diff)}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
              selectedDifficulty === diff
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-md shadow-cyan-500/20 font-bold'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
            }`}
          >
            {diff}
          </button>
        ))}
      </div>

      {/* Levels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLevels.map((lvl) => (
          <motion.div
            key={lvl.id}
            whileHover={{ y: -3 }}
            className="group bg-[#121424] rounded-2xl border border-white/10 p-5 flex flex-col justify-between shadow-xl hover:border-cyan-400/40 hover:shadow-cyan-500/10 transition-all cursor-pointer relative overflow-hidden"
            onClick={() => onSelectLevel(lvl)}
          >
            {/* Ambient subtle glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

            <div>
              {/* Header: Title & Difficulty */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-base font-bold font-heading text-white group-hover:text-cyan-300 transition-colors tracking-wide">
                  {lvl.title}
                </h3>
                {getDifficultyBadge(lvl.difficulty)}
              </div>

              {/* Description */}
              <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                {lvl.description}
              </p>
            </div>

            <div>
              {/* Song and Creator info */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pb-3 border-b border-white/10 mb-3">
                <div className="flex items-center gap-1.5 truncate">
                  <Music className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="truncate">{lvl.songTitle}</span>
                </div>
                <span className="font-mono text-cyan-300">{lvl.bpm} BPM</span>
              </div>

              {/* Bottom bar: Rewards & Play button */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-amber-300 text-xs font-bold font-mono">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>+{lvl.starsReward} Stars</span>
                </div>

                <button
                  id={`btn-play-level-${lvl.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectLevel(lvl);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#00F0FF] to-[#0070F3] text-black font-bold text-xs tracking-wider flex items-center gap-1.5 shadow-md shadow-cyan-500/30 group-hover:scale-105 active:scale-95 transition-all"
                >
                  <Play className="w-3 h-3 fill-current" />
                  PLAY
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
