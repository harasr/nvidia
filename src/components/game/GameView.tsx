import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from '../../game/core/GameEngine.ts';
import { EngineState } from '../../types/game.ts';
import { LevelMeta } from '../../types/level.ts';
import { useGameStore } from '../../store/gameStore.ts';
import { useUIStore } from '../../store/uiStore.ts';
import { useAuthStore } from '../../store/authStore.ts';
import { Play, RotateCcw, Flag, Pause, Trophy, ArrowRight, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GameViewProps {
  level: LevelMeta;
  onExit?: () => void;
}

export const GameView: React.FC<GameViewProps> = ({ level, onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const { setCurrentView, showNotification } = useUIStore();
  const { user, addStars } = useAuthStore();
  const { stats, updateStats, resetStats, settings } = useGameStore();

  const [engineState, setEngineState] = useState<EngineState>(EngineState.PLAYING);
  const [currentProgress, setCurrentProgress] = useState<number>(0);
  const [currentAttempts, setCurrentAttempts] = useState<number>(1);
  const [isPractice, setIsPractice] = useState<boolean>(false);
  const [fpsVal, setFpsVal] = useState<number>(60);
  const [completedAward, setCompletedAward] = useState<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    resetStats();
    setCurrentProgress(0);
    setCurrentAttempts(1);

    // Dynamic sizing based on canvas client container
    const width = canvas.parentElement?.clientWidth || 960;
    const height = Math.min(560, Math.max(380, Math.round(width * 0.52)));
    canvas.width = width;
    canvas.height = height;

    if (!level.levelData) {
      showNotification('Level data corrupted or outdated. Please clear cache.', 'error');
      return;
    }

    const engine = new GameEngine(canvas, {
      onStateChange: (st) => {
        setEngineState(st);
      },
      onProgressUpdate: (pct, att, time) => {
        setCurrentProgress(pct);
        setCurrentAttempts(att);
        updateStats({ percentage: pct, attempts: att, timeElapsed: time });
      },
      onDeath: (pct, att) => {
        // Send attempt score to backend
        fetch(`/api/levels/${level.id}/score`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            userName: user.name,
            percentage: pct,
            attempts: 1,
            timeElapsed: 0,
          }),
        }).catch(() => {});
      },
      onComplete: (attempts, time) => {
        // Submitting verified completion
        fetch(`/api/levels/${level.id}/score`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            userName: user.name,
            percentage: 100,
            attempts,
            timeElapsed: time,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.isFirstCompletion && data.starsAwarded > 0) {
              addStars(data.starsAwarded);
              setCompletedAward(data.starsAwarded);
              showNotification(`Level Complete! Earned ${data.starsAwarded} Stars!`, 'success');
            } else {
              setCompletedAward(0);
              showNotification('Level Complete!', 'success');
            }
          })
          .catch(() => {
            setCompletedAward(level.starsReward);
          });
      },
      onFpsUpdate: (f) => setFpsVal(f),
    });

    engine.loadLevel(level.levelData);
    engine.start();
    engineRef.current = engine;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape' || e.code === 'KeyP') {
        if (engine.state === EngineState.PLAYING) {
          engine.pause();
        } else if (engine.state === EngineState.PAUSED) {
          engine.resume();
        }
      } else if (e.code === 'KeyZ') {
        // Practice mode place checkpoint
        if (engine.isPracticing) {
          engine.setPracticeCheckpoint();
          showNotification('Checkpoint Set (Z)', 'info');
        }
      } else if (e.code === 'KeyX') {
        // Practice mode remove checkpoint
        if (engine.isPracticing) {
          engine.clearPracticeCheckpoint();
          showNotification('Checkpoint Cleared (X)', 'info');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      engine.destroy();
      engineRef.current = null;
    };
  }, [level.id]);

  const handleTogglePractice = () => {
    if (!engineRef.current) return;
    engineRef.current.togglePractice();
    setIsPractice(engineRef.current.isPracticing);
    if (engineRef.current.isPracticing) {
      showNotification('Practice Mode Enabled. Press Z to place checkpoint, X to remove.', 'info');
    } else {
      showNotification('Normal Mode Restored', 'info');
    }
  };

  const handleRestart = () => {
    if (!engineRef.current) return;
    engineRef.current.restart();
  };

  const handleResume = () => {
    if (!engineRef.current) return;
    engineRef.current.resume();
  };

  const handlePause = () => {
    if (!engineRef.current) return;
    engineRef.current.pause();
  };

  const handleExitLevel = () => {
    if (engineRef.current) {
      engineRef.current.destroy();
    }
    if (onExit) {
      onExit();
    } else {
      setCurrentView('LEVEL_SELECT');
    }
  };

  return (
    <div id="game-container" className="relative w-full max-w-5xl mx-auto flex flex-col items-center select-none py-2 px-2">
      {/* Top Level Info Header */}
      <div className="w-full flex items-center justify-between px-3 py-2 bg-[#121422] rounded-t-xl border-t border-x border-white/10">
        <div className="flex items-center gap-3">
          <button
            id="btn-game-back"
            onClick={handleExitLevel}
            className="px-2.5 py-1 text-xs font-semibold rounded-md bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors"
          >
            ← Exit
          </button>
          <div>
            <h2 className="text-sm md:text-base font-bold text-white font-heading tracking-wide flex items-center gap-2">
              {level.title}
              {isPractice && (
                <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  Practice
                </span>
              )}
            </h2>
            <p className="text-[11px] text-slate-400">Song: {level.songTitle} ({level.bpm} BPM)</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {settings.showFps && (
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/30">
              {fpsVal} FPS
            </span>
          )}

          <button
            id="btn-toggle-practice"
            onClick={handleTogglePractice}
            className={`p-1.5 rounded-lg border text-xs font-medium flex items-center gap-1 transition-all ${
              isPractice
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                : 'bg-white/5 text-slate-400 border-white/10 hover:text-white hover:bg-white/10'
            }`}
            title="Toggle Practice Mode (Place checkpoints with Z, remove with X)"
          >
            <Flag className="w-4 h-4" />
            <span className="hidden sm:inline">Practice</span>
          </button>

          <button
            id="btn-game-restart"
            onClick={handleRestart}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors"
            title="Restart Level"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            id="btn-game-pause"
            onClick={handlePause}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors"
            title="Pause Game (ESC / P)"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#181B2B] h-2.5 relative border-x border-white/10 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-[#00F0FF] via-[#9D00FF] to-[#00FF66]"
          style={{ width: `${currentProgress}%` }}
          transition={{ ease: 'linear', duration: 0.1 }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold text-white drop-shadow">
          {currentProgress}%
        </div>
      </div>

      {/* Canvas Area */}
      <div className="relative w-full bg-[#0D0E15] border-b border-x border-white/10 rounded-b-xl overflow-hidden shadow-2xl flex items-center justify-center">
        <canvas
          ref={canvasRef}
          id="game-canvas"
          className="w-full h-auto cursor-pointer block touch-none"
        />

        {/* In-Game Practice Mode Controls for Touch/Mobile */}
        {isPractice && engineState === EngineState.PLAYING && (
          <div className="absolute bottom-4 left-4 flex items-center gap-2 z-20 pointer-events-auto">
            <button
              id="btn-touch-place-checkpoint"
              onClick={() => {
                engineRef.current?.setPracticeCheckpoint();
                showNotification('Checkpoint Set', 'info');
              }}
              className="px-3 py-1.5 rounded-lg bg-emerald-500/80 hover:bg-emerald-400 text-black font-bold text-xs shadow-lg backdrop-blur active:scale-95 transition-transform"
            >
              + Checkpoint (Z)
            </button>
            <button
              id="btn-touch-del-checkpoint"
              onClick={() => {
                engineRef.current?.clearPracticeCheckpoint();
                showNotification('Checkpoint Cleared', 'info');
              }}
              className="px-3 py-1.5 rounded-lg bg-rose-500/80 hover:bg-rose-400 text-white font-bold text-xs shadow-lg backdrop-blur active:scale-95 transition-transform"
            >
              - Checkpoint (X)
            </button>
          </div>
        )}

        {/* Attempt Counter overlay */}
        <div className="absolute top-3 left-4 pointer-events-none font-heading text-xs tracking-widest text-white/70">
          ATTEMPT <span className="font-mono text-cyan-300 font-bold">{currentAttempts}</span>
        </div>

        {/* Mobile / Screen Tap Helper Prompt */}
        <div className="absolute bottom-3 right-4 pointer-events-none text-[11px] font-mono text-slate-400 bg-black/40 px-2.5 py-1 rounded backdrop-blur">
          CLICK / SPACE / TAP TO JUMP
        </div>

        {/* Pause Overlay */}
        <AnimatePresence>
          {engineState === EngineState.PAUSED && (
            <motion.div
              id="pause-menu-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-30 p-6"
            >
              <div className="bg-[#121424] border border-white/15 rounded-2xl p-6 max-w-sm w-full shadow-2xl flex flex-col items-center text-center">
                <h3 className="text-2xl font-bold font-heading text-white tracking-wider mb-2">GAME PAUSED</h3>
                <p className="text-xs text-slate-400 mb-6">Progress: {currentProgress}% | Attempt: {currentAttempts}</p>

                <div className="w-full flex flex-col gap-3">
                  <button
                    id="btn-pause-resume"
                    onClick={handleResume}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#00F0FF] to-[#0070F3] text-black font-bold text-sm tracking-wide shadow-lg shadow-cyan-500/25 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    RESUME
                  </button>

                  <button
                    id="btn-pause-restart"
                    onClick={handleRestart}
                    className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    RESTART
                  </button>

                  <button
                    id="btn-pause-practice"
                    onClick={handleTogglePractice}
                    className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-medium text-xs transition-all flex items-center justify-center gap-2"
                  >
                    <Flag className="w-3.5 h-3.5 text-emerald-400" />
                    {isPractice ? 'Exit Practice Mode' : 'Switch to Practice Mode'}
                  </button>

                  <button
                    id="btn-pause-exit"
                    onClick={handleExitLevel}
                    className="w-full py-2 text-rose-400 hover:text-rose-300 text-xs font-semibold transition-colors mt-2"
                  >
                    Exit to Menu
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Victory Level Complete Modal */}
        <AnimatePresence>
          {engineState === EngineState.LEVEL_COMPLETE && (
            <motion.div
              id="level-complete-modal"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center z-30 p-6"
            >
              <div className="bg-[#121424] border border-[#FFE600]/40 rounded-2xl p-7 max-w-md w-full shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center mb-4 shadow-lg shadow-amber-500/20">
                  <Trophy className="w-8 h-8 text-[#FFE600]" />
                </div>

                <h3 className="text-3xl font-black font-heading text-white tracking-wider mb-1">LEVEL COMPLETE!</h3>
                <p className="text-xs text-amber-300 font-medium mb-4">100% Verified Run</p>

                <div className="grid grid-cols-2 gap-3 w-full mb-6 text-left">
                  <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Attempts</span>
                    <span className="text-lg font-bold font-mono text-cyan-400">{currentAttempts}</span>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Reward</span>
                    <span className="text-lg font-bold font-mono text-amber-400">+{level.starsReward} Stars</span>
                  </div>
                </div>

                <div className="w-full flex items-center gap-3">
                  <button
                    id="btn-victory-replay"
                    onClick={handleRestart}
                    className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-semibold text-xs tracking-wide transition-all flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    REPLAY
                  </button>

                  <button
                    id="btn-victory-continue"
                    onClick={handleExitLevel}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#FFE600] to-amber-500 text-black font-bold text-xs tracking-wide shadow-lg shadow-amber-500/25 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                  >
                    CONTINUE
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
