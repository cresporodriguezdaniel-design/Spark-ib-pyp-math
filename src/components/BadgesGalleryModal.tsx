import React, { useState } from 'react';
import { StudentProfile, Badge, BadgeRarity } from '../types';
import { BADGES_CATALOG } from '../data/mockData';
import { PixelAvatar } from './PixelAvatar';
import { sounds } from '../services/sound';
import {
  X,
  Trophy,
  Lock,
  CheckCircle,
  Sparkles,
  Filter,
} from 'lucide-react';

interface BadgesGalleryModalProps {
  student: StudentProfile;
  onClose: () => void;
}

export const BadgesGalleryModal: React.FC<BadgesGalleryModalProps> = ({
  student,
  onClose,
}) => {
  const [activeFilter, setActiveFilter] = useState<
    'all' | 'unlocked' | 'adventure' | 'mathlab' | 'quickthinking' | 'mastery' | 'secret'
  >('all');
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  // Map unlocked state from student profile
  const badgesWithStatus: Badge[] = BADGES_CATALOG.map((b) => ({
    ...b,
    unlocked: student.unlockedBadges.includes(b.id) || b.unlocked,
  }));

  const unlockedCount = badgesWithStatus.filter((b) => b.unlocked).length;
  const totalCount = badgesWithStatus.length;
  const completionPercentage = Math.round((unlockedCount / totalCount) * 100);

  const secretBadges = badgesWithStatus.filter((b) => b.isSecret || b.category === 'secret');
  const unlockedSecretsCount = secretBadges.filter((b) => b.unlocked).length;

  // Filtered badges
  const filteredBadges = badgesWithStatus.filter((b) => {
    if (activeFilter === 'unlocked') return b.unlocked;
    if (activeFilter === 'adventure') return b.category === 'adventure';
    if (activeFilter === 'mathlab') return b.category === 'mathlab';
    if (activeFilter === 'quickthinking') return b.category === 'quickthinking';
    if (activeFilter === 'mastery') return b.category === 'mastery' || b.category === 'pets';
    if (activeFilter === 'secret') return b.isSecret || b.category === 'secret';
    return true;
  });

  const getRarityBadge = (rarity: BadgeRarity) => {
    switch (rarity) {
      case 'legendary':
        return {
          label: 'LEGENDARY',
          cardBg: 'bg-[#fde68a]',
          pillBg: 'bg-[#f59e0b] text-[#1e1b18]',
        };
      case 'epic':
        return {
          label: 'EPIC',
          cardBg: 'bg-[#fde6c3]',
          pillBg: 'bg-[#e4a887] text-[#1e1b18]',
        };
      case 'rare':
        return {
          label: 'RARE',
          cardBg: 'bg-[#fff7ea]',
          pillBg: 'bg-[#78b3ea] text-[#1e1b18]',
        };
      case 'common':
      default:
        return {
          label: 'COMMON',
          cardBg: 'bg-[#fff7ea]',
          pillBg: 'bg-[#a7f3d0] text-[#1e1b18]',
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#1e1b18]/65 backdrop-blur-xs font-game">
      <div className="relative w-full max-w-4xl h-[92vh] max-h-[780px] bg-[#fbf5eb] border-[3px] border-[#1e1b18] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[#1e1b18]">
        {/* Top Header */}
        <div className="px-5 py-3.5 bg-[#fde6c3] border-b-[2.5px] border-[#1e1b18] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#f59e0b] border-2 border-[#1e1b18] flex items-center justify-center shadow-xs">
              <Trophy className="w-5 h-5 text-[#1e1b18]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base sm:text-lg text-[#1e1b18]">
                  Badges & Achievements Gallery
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#fff7ea] text-[#1e1b18] border-2 border-[#1e1b18]">
                  {unlockedCount} / {totalCount} ({completionPercentage}%)
                </span>
              </div>
              <p className="text-xs text-[#5c4033] font-medium">
                Mathematical inquiry medals earned across adventures and challenges
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 pl-2 pr-3 py-1 bg-[#fff7ea] rounded-xl border-2 border-[#1e1b18]">
              <PixelAvatar avatarId={student.avatarId} hatId={student.hatId} size={28} />
              <div className="text-left">
                <div className="text-[11px] font-bold text-[#1e1b18]">{student.name}</div>
                <div className="text-[9px] font-bold text-[#b45309]">Level {student.level}</div>
              </div>
            </div>

            <button
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="p-1.5 rounded-xl bg-[#f3d5ab] hover:bg-[#e8c496] text-[#1e1b18] transition-all border-2 border-[#1e1b18] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="p-2 sm:p-3 bg-[#f3d5ab] border-b-[2.5px] border-[#1e1b18] flex items-center gap-1.5 overflow-x-auto shrink-0 text-xs font-bold">
          <div className="flex items-center gap-1 text-[#1e1b18] px-2 mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span className="text-[10px] uppercase tracking-wider font-black">Filter:</span>
          </div>

          {[
            { id: 'all', label: `All Badges (${totalCount})` },
            { id: 'unlocked', label: `Unlocked (${unlockedCount})` },
            { id: 'adventure', label: 'Adventure' },
            { id: 'mathlab', label: 'Math Lab' },
            { id: 'quickthinking', label: 'Quick Thinking' },
            { id: 'mastery', label: 'Mastery & Pets' },
            { id: 'secret', label: `Secret Badges (${unlockedSecretsCount}/${secretBadges.length}) 🗝️` },
          ].map((tab) => {
            const isSelected = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  sounds.playClick();
                  setActiveFilter(tab.id as any);
                }}
                className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap border-2 border-[#1e1b18] cursor-pointer ${
                  isSelected
                    ? tab.id === 'secret'
                      ? 'bg-[#7c3aed] text-white font-extrabold shadow-xs border-[#4c1d95]'
                      : 'bg-[#f59e0b] text-[#1e1b18] font-extrabold shadow-xs'
                    : tab.id === 'secret'
                    ? 'bg-[#ede9fe] text-[#6d28d9] hover:bg-[#ddd6fe] hover:text-[#4c1d95]'
                    : 'bg-[#fff7ea] text-[#5c4033] hover:text-[#1e1b18] hover:bg-[#fde6c3]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="px-5 py-2.5 bg-[#fde6c3]/70 border-b-2 border-[#1e1b18] flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#d97706]" />
            <span className="text-[#1e1b18] text-xs font-bold">
              Mathematical Inquiry Collection of {student.name}:
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-36 sm:w-48 h-2.5 bg-[#d8b892] rounded-full overflow-hidden border border-[#1e1b18]">
              <div
                className="h-full bg-[#10b981] rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <span className="font-black text-[#1e1b18] text-xs">
              {unlockedCount} / {totalCount} ({completionPercentage}%)
            </span>
          </div>
        </div>

        {/* Medals Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 bg-[#fbf5eb]">
          {filteredBadges.map((badge) => {
            const rarityStyle = getRarityBadge(badge.rarity);
            const isUnlocked = badge.unlocked;
            const isSecret = badge.isSecret || badge.category === 'secret';
            const isSecretLocked = isSecret && !isUnlocked;

            return (
              <div
                key={badge.id}
                onClick={() => {
                  sounds.playClick();
                  setSelectedBadge(badge);
                }}
                className={`group relative p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between shadow-sm ${
                  isSecretLocked
                    ? 'bg-gradient-to-br from-[#2e1065]/10 via-[#fde6c3]/70 to-[#fbf5eb] border-dashed border-[#7c3aed]/70 hover:border-[#7c3aed] opacity-90 hover:scale-[1.01]'
                    : isSecret && isUnlocked
                    ? 'bg-gradient-to-br from-[#fde68a] via-[#fed7aa] to-[#fff7ea] border-[#b45309] shadow-md ring-2 ring-[#f59e0b]/40 hover:scale-[1.02]'
                    : isUnlocked
                    ? `${rarityStyle.cardBg} border-[#1e1b18] hover:scale-[1.02]`
                    : 'bg-[#f3d5ab]/60 border-[#1e1b18] opacity-65 hover:opacity-90'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    {isSecretLocked ? (
                      <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full border border-[#7c3aed] bg-[#7c3aed] text-white flex items-center gap-1">
                        <span>🗝️</span>
                        <span>SECRET BADGE</span>
                      </span>
                    ) : isSecret && isUnlocked ? (
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-full border border-[#4c1d95] bg-gradient-to-r from-[#7c3aed] to-[#d97706] text-white flex items-center gap-1 shadow-xs">
                        <span>🗝️</span>
                        <span>SECRET DISCOVERED!</span>
                      </span>
                    ) : (
                      <span
                        className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border border-[#1e1b18] ${
                          isUnlocked
                            ? rarityStyle.pillBg
                            : 'text-[#5c4033] bg-[#e8c496]'
                        }`}
                      >
                        {rarityStyle.label}
                      </span>
                    )}

                    {isUnlocked ? (
                      <span className="flex items-center gap-1 text-[10px] text-[#065f46] font-bold bg-[#d1fae5] px-2 py-0.5 rounded-full border border-[#1e1b18]">
                        <CheckCircle className="w-3 h-3" />
                        <span>Unlocked</span>
                      </span>
                    ) : isSecretLocked ? (
                      <span className="flex items-center gap-1 text-[10px] text-[#6d28d9] font-bold bg-[#ede9fe] px-2 py-0.5 rounded-full border border-[#7c3aed]/60">
                        <Lock className="w-3 h-3" />
                        <span>Undiscovered</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] text-[#5c4033] font-bold bg-[#e8c496] px-2 py-0.5 rounded-full border border-[#1e1b18]">
                        <Lock className="w-3 h-3" />
                        <span>Locked</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border-2 shadow-xs transition-transform group-hover:scale-110 ${
                        isSecretLocked
                          ? 'bg-[#ede9fe] border-[#7c3aed] text-[#7c3aed]'
                          : isUnlocked
                          ? 'bg-[#fff7ea] border-[#1e1b18]'
                          : 'bg-[#e8c496] border-[#1e1b18] filter grayscale'
                      }`}
                    >
                      {isSecretLocked ? '❓' : badge.icon}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="font-black text-sm truncate text-[#1e1b18]">
                        {isSecretLocked ? '??? (Secret Discovery)' : badge.title}
                      </h4>
                      <p className="text-[11px] font-bold text-[#b45309] truncate mt-0.5">
                        {isSecretLocked ? 'Secret Mathematical Exploration' : badge.mathSkill}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-[#5c4033] font-medium line-clamp-2 leading-relaxed mb-3">
                    {isSecretLocked
                      ? badge.secretHint || 'A mysterious secret waiting to be discovered as you progress in the game...'
                      : badge.description}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-[#1e1b18]/20 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[#b45309] font-bold">+{badge.rewardCoins} 🪙</span>
                    <span className="text-[#0369a1] font-bold">+{badge.rewardXp} XP</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#5c4033] group-hover:text-[#1e1b18] transition-colors">
                    {isSecretLocked ? 'Inspect Clue →' : 'View Details →'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Badge Detail Modal */}
        {selectedBadge && (
          <div className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-[#1e1b18]/65 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-md bg-[#fbf5eb] border-[3px] border-[#1e1b18] rounded-3xl p-6 shadow-2xl text-[#1e1b18] relative">
              <button
                onClick={() => setSelectedBadge(null)}
                className="absolute top-4 right-4 p-1.5 rounded-xl bg-[#f3d5ab] hover:bg-[#e8c496] text-[#1e1b18] border-2 border-[#1e1b18] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {selectedBadge.isSecret && !selectedBadge.unlocked ? (
                /* SECRET LOCKED DETAIL VIEW */
                <>
                  <div className="text-center mb-4">
                    <div className="w-20 h-20 rounded-2xl bg-[#ede9fe] border-2 border-[#7c3aed] flex items-center justify-center text-4xl mx-auto mb-3 shadow-md text-[#7c3aed]">
                      ❓
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#7c3aed] text-white border border-[#4c1d95] shadow-xs inline-flex items-center gap-1">
                      <span>🗝️</span>
                      <span>SECRET ACHIEVEMENT CLUE</span>
                    </span>
                    <h3 className="text-xl font-black text-[#1e1b18] mt-2">
                      ??? (Undiscovered Secret)
                    </h3>
                    <p className="text-xs text-[#7c3aed] font-bold mt-1">
                      Hidden Mathematical Challenge
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#ede9fe]/80 border-2 border-dashed border-[#7c3aed] mb-6 text-center">
                    <div className="text-[11px] font-black uppercase text-[#6d28d9] mb-1">
                      ✨ Secret Discovery Clue:
                    </div>
                    <p className="text-xs sm:text-sm text-[#4c1d95] font-medium italic leading-relaxed">
                      "{selectedBadge.secretHint || 'Keep exploring worlds, caring for your pets, experimenting with strategies, and solving challenges with high accuracy to uncover this secret!'}"
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#fde6c3] border-2 border-[#1e1b18] flex items-center justify-around mb-6 text-xs font-bold">
                    <div className="text-center">
                      <div className="text-[#5c4033] text-[10px]">Secret Bounty</div>
                      <div className="text-[#b45309] mt-0.5">+{selectedBadge.rewardCoins} Coins</div>
                    </div>
                    <div className="h-6 w-px bg-[#1e1b18]/25" />
                    <div className="text-center">
                      <div className="text-[#5c4033] text-[10px]">Experience</div>
                      <div className="text-[#0369a1] mt-0.5">+{selectedBadge.rewardXp} XP</div>
                    </div>
                    <div className="h-6 w-px bg-[#1e1b18]/25" />
                    <div className="text-center">
                      <div className="text-[#5c4033] text-[10px]">Status</div>
                      <div className="text-[#7c3aed]">🔒 Hidden</div>
                    </div>
                  </div>
                </>
              ) : (
                /* REGULAR OR UNLOCKED SECRET DETAIL VIEW */
                <>
                  <div className="text-center mb-4">
                    <div className="w-20 h-20 rounded-2xl bg-[#fde6c3] border-2 border-[#1e1b18] flex items-center justify-center text-4xl mx-auto mb-3 shadow-md">
                      {selectedBadge.icon}
                    </div>
                    {selectedBadge.isSecret ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-[#7c3aed] to-[#d97706] text-white border border-[#4c1d95] shadow-xs inline-flex items-center gap-1">
                        <span>🗝️</span>
                        <span>SECRET DISCOVERY UNVEILED!</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#f59e0b] text-[#1e1b18] border border-[#1e1b18]">
                        {selectedBadge.rarity.toUpperCase()}
                      </span>
                    )}
                    <h3 className="text-xl font-black text-[#1e1b18] mt-2">
                      {selectedBadge.title}
                    </h3>
                    <p className="text-xs text-[#b45309] font-bold mt-1">
                      {selectedBadge.mathSkill}
                    </p>
                  </div>

                  <p className="text-xs sm:text-sm text-[#5c4033] font-medium text-center leading-relaxed mb-6">
                    {selectedBadge.description}
                  </p>

                  <div className="p-3 rounded-2xl bg-[#fde6c3] border-2 border-[#1e1b18] flex items-center justify-around mb-6 text-xs font-bold">
                    <div className="text-center">
                      <div className="text-[#5c4033] text-[10px]">Reward</div>
                      <div className="text-[#b45309] mt-0.5">+{selectedBadge.rewardCoins} Coins</div>
                    </div>
                    <div className="h-6 w-px bg-[#1e1b18]/25" />
                    <div className="text-center">
                      <div className="text-[#5c4033] text-[10px]">Experience</div>
                      <div className="text-[#0369a1] mt-0.5">+{selectedBadge.rewardXp} XP</div>
                    </div>
                    <div className="h-6 w-px bg-[#1e1b18]/25" />
                    <div className="text-center">
                      <div className="text-[#5c4033] text-[10px]">Status</div>
                      <div className={selectedBadge.unlocked ? 'text-[#047857]' : 'text-[#5c4033]'}>
                        {selectedBadge.unlocked ? 'Unlocked ✓' : 'In Progress'}
                      </div>
                    </div>
                  </div>
                </>
              )}

              <button
                onClick={() => setSelectedBadge(null)}
                className="w-full py-3 bg-[#f59e0b] hover:bg-[#fbbf24] text-[#1e1b18] border-2 border-[#1e1b18] font-black rounded-xl text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
