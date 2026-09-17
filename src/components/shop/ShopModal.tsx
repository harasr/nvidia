import React from 'react';
import { useUIStore } from '../../store/uiStore.ts';
import { useAuthStore } from '../../store/authStore.ts';
import { X, Lock, Unlock, Check, Sparkles, Coins } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const SKINS = [
  { id: 'skin_default', name: 'Mặc Định', color: '#00F0FF', cost: 0, icon: '⬛', stats: 'Tốc độ bay cơ bản' },
  { id: 'skin_gold', name: 'Hoàng Kim', color: '#FFE600', cost: 50, icon: '🟨', stats: 'X2 Tiền Thưởng' },
  { id: 'skin_demon', name: 'Ác Quỷ', color: '#FF003C', cost: 100, icon: '🟥', stats: 'Kháng 1 lần chạm gai' },
  { id: 'skin_neon', name: 'Neon Tím', color: '#9D00FF', cost: 150, icon: '🟪', stats: 'Hệ số điểm +15%' },
  { id: 'skin_emerald', name: 'Ngọc Bích', color: '#00FF66', cost: 200, icon: '🟩', stats: 'Hút Coin từ xa' },
];

export const ShopModal: React.FC = () => {
  const { isShopOpen, closeShop, showNotification } = useUIStore();
  const { user, unlockSkin, equipSkin } = useAuthStore();

  if (!isShopOpen) return null;

  const handleUnlock = (skinId: string, cost: number) => {
    if (user.secretCoins < cost) {
      showNotification('Không đủ Coins!', 'error');
      return;
    }
    const success = unlockSkin(skinId, cost);
    if (success) {
      showNotification('Mua skin thành công!', 'success');
      equipSkin(skinId);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-[#0B0F19] border border-amber-500/30 rounded-3xl w-full max-w-2xl shadow-[0_0_50px_rgba(255,215,0,0.15)] overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-4 border-b border-amber-500/20 flex items-center justify-between bg-gradient-to-r from-[#141008] to-[#251A05]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Sparkles className="w-5 h-5 text-[#FFE600]" />
              </div>
              <div>
                <h3 className="font-heading font-black text-xl text-amber-100 tracking-wider flex items-center gap-2 drop-shadow-md">
                  CỬA HÀNG SKIN
                </h3>
                <p className="text-[11px] text-amber-400/70 font-mono">Trang bị ngoại trang siêu cấp</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-xl border border-amber-500/30">
                <Coins className="w-4 h-4 text-amber-400" />
                <span className="text-amber-100 font-mono font-bold">{user.secretCoins}</span>
              </div>
              <button
                onClick={closeShop}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Grid */}
          <div className="p-4 sm:p-6 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-4">
            {SKINS.map((skin) => {
              const isUnlocked = user.unlockedSkins?.includes(skin.id);
              const isEquipped = user.equippedSkin === skin.id;

              return (
                <div 
                  key={skin.id}
                  className={`relative p-4 rounded-2xl border transition-all flex flex-col items-center justify-center gap-3 ${
                    isEquipped 
                      ? 'bg-amber-500/10 border-amber-400 shadow-[0_0_20px_rgba(255,215,0,0.2)]' 
                      : isUnlocked 
                        ? 'bg-white/5 border-white/20 hover:bg-white/10 hover:border-cyan-400/50 cursor-pointer'
                        : 'bg-black/40 border-white/5 opacity-80'
                  }`}
                  onClick={() => {
                    if (isUnlocked && !isEquipped) equipSkin(skin.id);
                  }}
                >
                  <div 
                    className="w-16 h-16 flex items-center justify-center text-4xl rounded-xl shadow-lg"
                    style={{ backgroundColor: skin.color + '20', border: `2px solid ${skin.color}` }}
                  >
                    {skin.icon}
                  </div>
                  <div className="text-center mt-2">
                    <h4 className="font-heading font-bold text-sm text-white">{skin.name}</h4>
                    <p className="text-[10px] font-mono text-cyan-300 mt-0.5">{skin.stats}</p>
                  </div>
                  
                  {isEquipped ? (
                    <div className="flex items-center gap-1 text-amber-400 text-xs font-bold font-mono">
                      <Check className="w-3.5 h-3.5" />
                      ĐANG DÙNG
                    </div>
                  ) : isUnlocked ? (
                    <div className="flex items-center gap-1 text-cyan-400 text-xs font-bold font-mono">
                      <Unlock className="w-3.5 h-3.5" />
                      CÓ SẴN
                    </div>
                  ) : (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleUnlock(skin.id, skin.cost); }}
                      className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-black px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-colors"
                    >
                      <Lock className="w-3 h-3" />
                      {skin.cost} Coins
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
