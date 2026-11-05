import React, { useEffect } from 'react';
import { Badge } from '../types';
import { sounds } from '../services/sound';
import confetti from 'canvas-confetti';
import { Sparkles, X } from 'lucide-react';

interface AchievementToastProps {
  badge: Badge | null;
  onDismiss: () => void;
}

export const AchievementToast: React.FC<AchievementToastProps> = ({
  badge,
  onDismiss,
}) => {
  useEffect(() => {
    if (!badge) return;

    sounds.playLevelUp();
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.2 },
    });

    const timer = setTimeout(() => {
      onDismiss();
    }, 4500);

    return () => clearTimeout(timer);
  }, [badge, onDismiss]);

  if (!badge) return null;

  return (
    <div className="fixed top-20 right-4 z-70 max-w-sm w-full bg-[#fde6c3] border-[3px] border-[#1e1b18] rounded-2xl shadow-2xl p-4 text-[#1e1b18] flex items-start gap-3 animate-in slide-in-from-top-6 duration-300 font-game">
      <div className="w-12 h-12 rounded-2xl bg-[#fff7ea] border-2 border-[#1e1b18] flex items-center justify-center text-3xl shadow-sm shrink-0">
        {badge.icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-[#b45309] uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" />
          <span>New Badge Unlocked!</span>
        </div>

        <h4 className="font-extrabold text-sm text-[#1e1b18] truncate mt-0.5 font-game">
          {badge.title}
        </h4>

        <p className="text-[11px] font-bold text-[#5c4033] truncate">
          {badge.mathSkill}
        </p>

        <div className="flex items-center gap-2 mt-1 text-[10px] font-bold">
          <span className="text-[#b45309]">+{badge.rewardCoins} 🪙</span>
          <span className="text-[#0369a1]">+{badge.rewardXp} XP</span>
        </div>
      </div>

      <button
        onClick={onDismiss}
        className="text-[#5c4033] hover:text-[#1e1b18] p-1 rounded-lg cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
