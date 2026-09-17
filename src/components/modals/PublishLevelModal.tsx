import React, { useState } from 'react';
import { useUIStore } from '../../store/uiStore.ts';
import { useEditorStore } from '../../store/editorStore.ts';
import { useAuthStore } from '../../store/authStore.ts';
import { DifficultyLevel } from '../../types/level.ts';
import { Share2, Sparkles, X, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export const PublishLevelModal: React.FC = () => {
  const { isPublishModalOpen, closePublishModal, showNotification } = useUIStore();
  const { levelData } = useEditorStore();
  const { user } = useAuthStore();

  const [title, setTitle] = useState('My Cyber Horizon');
  const [description, setDescription] = useState('An intense rhythmic obstacle course built with Web Studio.');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(DifficultyLevel.MEDIUM);
  const [starsReward, setStarsReward] = useState<number>(3);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isPublishModalOpen) return null;

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showNotification('Please provide a title for your level', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/levels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          difficulty,
          starsReward,
          creatorId: user.id,
          creatorName: user.name,
          isVerified: true,
          levelData,
        }),
      });

      if (res.ok) {
        showNotification('Level published to community successfully!', 'success');
        closePublishModal();
      } else {
        const data = await res.json();
        showNotification(data.error || 'Failed to publish level', 'error');
      }
    } catch {
      showNotification('Network error publishing level', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        id="publish-level-modal"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#121424] border border-white/15 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#171B2F]">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-[#FFE600]" />
            <h3 className="font-heading font-bold text-base text-white tracking-wide">PUBLISH TO COMMUNITY</h3>
          </div>
          <button
            id="btn-close-publish-modal"
            onClick={closePublishModal}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handlePublish} className="p-5 flex flex-col gap-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Level Title</label>
            <input
              id="input-level-title"
              type="text"
              required
              maxLength={40}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400 text-sm"
              placeholder="e.g. Neon Apocalypse"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Description</label>
            <textarea
              id="input-level-description"
              rows={3}
              maxLength={200}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400 resize-none"
              placeholder="Describe your rhythmic layout..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Difficulty</label>
              <select
                id="select-level-difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                className="w-full px-3 py-2 rounded-xl bg-[#171B2F] border border-white/10 text-white focus:outline-none focus:border-yellow-400"
              >
                <option value={DifficultyLevel.EASY}>Easy</option>
                <option value={DifficultyLevel.MEDIUM}>Medium</option>
                <option value={DifficultyLevel.HARD}>Hard</option>
                <option value={DifficultyLevel.DEMON}>Demon</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Stars Reward (1-10)</label>
              <input
                id="input-level-stars"
                type="number"
                min={1}
                max={10}
                value={starsReward}
                onChange={(e) => setStarsReward(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-yellow-400 font-mono"
              />
            </div>
          </div>

          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-emerald-300">
            <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Object count: {levelData.objects?.length || 0}. Ready to share worldwide!</span>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <button
              type="button"
              onClick={closePublishModal}
              className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              id="btn-confirm-publish"
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#FFE600] to-amber-500 text-black font-bold tracking-wide shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all"
            >
              {isSubmitting ? 'Publishing...' : 'Publish Level'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
