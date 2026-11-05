import React, { useState } from 'react';
import { StudentProfile } from '../types';
import { sounds } from '../services/sound';
import {
  Sparkles,
  Trophy,
  ChevronUp,
  Award,
  Zap,
  Star,
  Info,
} from 'lucide-react';

interface ProgressTrackerProps {
  student: StudentProfile;
  compact?: boolean;
  onOpenRoom?: () => void;
  onOpenBadges?: () => void;
  className?: string;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  student,
  compact = false,
  onOpenRoom,
  onOpenBadges,
  className = '',
}) => {
  const [showDetails, setShowDetails] = useState(false);

  // Calculate XP percentage safely
  const xpCurrent = Math.max(0, student.xp);
  const xpTarget = Math.max(1, student.xpNext);
  const progressPercent = Math.min(100, Math.round((xpCurrent / xpTarget) * 100));
  const xpRemaining = Math.max(0, xpTarget - xpCurrent);

  return (
    <div className={`relative flex items-center gap-3 select-none ${className}`}>
      {/* Level Badge with subtle pulse */}
      <div
        onClick={() => {
          sounds.playClick();
          setShowDetails(!showDetails);
        }}
        className="relative flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-600/30 to-yellow-500/20 hover:from-amber-600/40 hover:to-yellow-500/30 border border-amber-400/50 rounded-xl cursor-pointer shadow-sm transition-all transform hover:scale-105 active:scale-95 shrink-0"
        title="View level progression details"
      >
        <div className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-pixel text-[9px] flex items-center justify-center font-black shadow-inner">
          ★
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] uppercase font-bold text-amber-300/80 leading-none">
            Level
          </span>
          <span className="text-xs sm:text-sm font-extrabold text-amber-300 font-pixel leading-tight">
            {student.level}
          </span>
        </div>
      </div>

      {/* Animated XP Experience Bar */}
      <div className="flex flex-col gap-1 min-w-[130px] sm:min-w-[190px] md:min-w-[220px]">
        <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-slate-300 leading-none">
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-cyan-400 fill-cyan-400 animate-pulse" />
            <span className="text-cyan-300 font-mono">
              {xpCurrent} / {xpTarget} XP
            </span>
          </div>
          <span className="text-amber-400 font-mono">{progressPercent}%</span>
        </div>

        {/* The Track & Animated Fill */}
        <div className="relative w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-700/80 shadow-inner group cursor-pointer"
             onClick={() => setShowDetails(!showDetails)}>
          {/* Animated gradient progress fill */}
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 transition-all duration-700 ease-out relative rounded-full"
            style={{ width: `${progressPercent}%` }}
          >
            {/* Shimmer overlay highlight */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
          </div>
        </div>
      </div>

      {/* Coin Counter */}
      <div
        className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 rounded-xl hover:bg-amber-500/20 transition-all shrink-0 cursor-default"
        title="Star coins earned in quests and Math Lab"
      >
        <span className="text-base sm:text-lg filter drop-shadow animate-bounce">🪙</span>
        <div className="flex flex-col">
          <span className="text-[8px] uppercase font-bold text-amber-400/70 hidden sm:block leading-none">
            Coins
          </span>
          <span className="font-extrabold text-amber-300 text-xs sm:text-sm tabular-nums font-mono">
            {student.coins.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Gem Counter */}
      <div
        className="flex items-center gap-1.5 px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-xl hover:bg-cyan-500/20 transition-all shrink-0 cursor-default"
        title="Spark Gems for exclusive cosmetic rewards"
      >
        <span className="text-base sm:text-lg filter drop-shadow">💎</span>
        <div className="flex flex-col">
          <span className="text-[8px] uppercase font-bold text-cyan-400/70 hidden sm:block leading-none">
            Gems
          </span>
          <span className="font-extrabold text-cyan-300 text-xs sm:text-sm tabular-nums font-mono">
            {student.gems}
          </span>
        </div>
      </div>

      {/* Badges / Medals button */}
      <button
        onClick={() => {
          sounds.playClick();
          onOpenBadges?.();
        }}
        className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-amber-500/20 to-yellow-500/10 hover:from-amber-500/30 hover:to-yellow-500/20 border border-amber-400/40 rounded-xl transition-all shrink-0 cursor-pointer shadow-sm group"
        title="View Badges & Achievements Gallery"
      >
        <span className="text-base sm:text-lg filter drop-shadow group-hover:scale-110 transition-transform">🏅</span>
        <div className="flex flex-col text-left">
          <span className="text-[8px] uppercase font-bold text-amber-300/80 hidden sm:block leading-none">
            Badges
          </span>
          <span className="font-extrabold text-amber-300 text-xs sm:text-sm tabular-nums font-mono">
            {student.unlockedBadges?.length || 2}
          </span>
        </div>
      </button>

      {/* Unit Stars */}
      {!compact && (
        <div
          className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 bg-purple-500/10 border border-purple-500/30 rounded-xl hover:bg-purple-500/20 transition-all shrink-0 cursor-default"
          title="Completed IB PYP Unit of Inquiry Stars"
        >
          <span className="text-base sm:text-lg filter drop-shadow">⭐</span>
          <div className="flex flex-col">
            <span className="text-[8px] uppercase font-bold text-purple-400/70 leading-none">
              Units
            </span>
            <span className="font-extrabold text-purple-300 text-xs sm:text-sm tabular-nums font-mono">
              {student.unitStars} / 6
            </span>
          </div>
        </div>
      )}

      {/* Info Popover on Click / Hover */}
      {showDetails && (
        <div className="absolute top-12 right-0 sm:left-0 sm:right-auto z-50 w-72 p-4 bg-slate-900 border-2 border-amber-400/70 rounded-2xl shadow-2xl text-slate-100 text-xs animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2.5">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Progression to Level {student.level + 1}</span>
            </div>
            <button
              onClick={() => setShowDetails(false)}
              className="text-slate-400 hover:text-white text-xs px-1"
            >
              ✕
            </button>
          </div>

          <p className="text-slate-300 text-[11px] mb-3 leading-relaxed">
            You need <strong className="text-cyan-300">{xpRemaining} XP</strong> to reach <strong>Level {student.level + 1}</strong>.
          </p>

          <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1.5 mb-3">
            <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
              Level-Up Rewards:
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-200">
              <span>🪙</span>
              <span>+100 Star Coins</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-200">
              <span>💎</span>
              <span>+5 Spark Gems</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-200">
              <span>🎁</span>
              <span>New cosmetic item for your room</span>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 flex items-center justify-between">
            <span>Earn XP in Math Lab or by completing quests!</span>
          </div>
        </div>
      )}
    </div>
  );
};
