import React from 'react';
import { useUIStore } from '../../store/uiStore.ts';
import { useGameStore } from '../../store/gameStore.ts';
import { Settings as SettingsIcon, Volume2, Sparkles, Monitor, X, Keyboard } from 'lucide-react';
import { motion } from 'motion/react';

export const SettingsModal: React.FC = () => {
  const { isSettingsOpen, closeSettings } = useUIStore();
  const { settings, updateSettings } = useGameStore();

  if (!isSettingsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        id="settings-modal"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#121424] border border-white/15 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#171B2F]">
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-cyan-400" />
            <h3 className="font-heading font-bold text-base text-white tracking-wide">SETTINGS</h3>
          </div>
          <button
            id="btn-close-settings"
            onClick={closeSettings}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4 text-xs">
          {/* Audio volume */}
          <div className="flex flex-col gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-cyan-400" /> Music & Beat Synthesizer
              </span>
              <span className="font-mono text-cyan-300 font-bold">{Math.round(settings.musicVolume * 100)}%</span>
            </div>
            <input
              id="slider-music-volume"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.musicVolume}
              onChange={(e) => updateSettings({ musicVolume: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Graphics & FPS */}
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-cyan-400" />
              <div>
                <span className="text-slate-200 font-semibold block">Show FPS Counter</span>
                <span className="text-[11px] text-slate-400">Displays current refresh rate in HUD</span>
              </div>
            </div>
            <button
              id="toggle-show-fps"
              onClick={() => updateSettings({ showFps: !settings.showFps })}
              className={`w-11 h-6 rounded-full transition-colors relative p-1 ${
                settings.showFps ? 'bg-cyan-500' : 'bg-white/10'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.showFps ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <div>
                <span className="text-slate-200 font-semibold block">Particle Pooling FX</span>
                <span className="text-[11px] text-slate-400">Puff dust, thruster flames, and portal rings</span>
              </div>
            </div>
            <button
              id="toggle-particles"
              onClick={() => updateSettings({ particlesEnabled: !settings.particlesEnabled })}
              className={`w-11 h-6 rounded-full transition-colors relative p-1 ${
                settings.particlesEnabled ? 'bg-purple-500' : 'bg-white/10'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.particlesEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Controls Reference */}
          <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex flex-col gap-2">
            <span className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Keyboard className="w-4 h-4 text-amber-400" /> Keybindings
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 font-mono">
              <div>SPACE / CLICK / UP: Jump</div>
              <div>ESC / P: Pause Game</div>
              <div>Z: Place Checkpoint</div>
              <div>X: Remove Checkpoint</div>
            </div>
          </div>

          <button
            id="btn-settings-close-done"
            onClick={closeSettings}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold tracking-wide mt-2"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
};
