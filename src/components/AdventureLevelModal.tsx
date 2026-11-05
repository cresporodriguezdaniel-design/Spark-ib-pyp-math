import React, { useState } from 'react';
import { UnitOfInquiry, AdventureLevel, StudentProfile } from '../types';
import { FOREST_LEVELS } from '../data/mockData';
import { sounds } from '../services/sound';
import confetti from 'canvas-confetti';
import {
  X,
  CheckCircle,
  ArrowRight,
  HelpCircle,
  Trophy,
  TreePine,
  ShieldCheck,
  ChevronLeft,
} from 'lucide-react';

interface AdventureLevelModalProps {
  unit: UnitOfInquiry;
  student: StudentProfile;
  onClose: () => void;
  onLevelComplete: (
    levelId: string,
    rewardCoins: number,
    rewardXp: number,
    rewardItem?: string,
    badgeId?: string,
    rewardGems?: number
  ) => void;
}

export const AdventureLevelModal: React.FC<AdventureLevelModalProps> = ({
  unit,
  onClose,
  onLevelComplete,
}) => {
  const [levels, setLevels] = useState<AdventureLevel[]>(FOREST_LEVELS);
  const [selectedLevel, setSelectedLevel] = useState<AdventureLevel>(FOREST_LEVELS[2]);
  const [activeStep, setActiveStep] = useState<'intro' | 'play' | 'success'>('intro');
  const [mistakesCount, setMistakesCount] = useState<number>(0);
  const [worldCompletedGems, setWorldCompletedGems] = useState<number>(0);
  const [worldOverallScorePct, setWorldOverallScorePct] = useState<number>(95);

  // Interactive inputs per level
  const [fractionInput, setFractionInput] = useState<string>('1/2');
  const [bridgePerimeter, setBridgePerimeter] = useState<string>('');
  const [bridgeArea, setBridgeArea] = useState<string>('');
  const [statDifference, setStatDifference] = useState<string>('');
  const [statAverage, setStatAverage] = useState<string>('');
  const [calcOakTotal, setCalcOakTotal] = useState<string>('');
  const [calcWaterShare, setCalcWaterShare] = useState<string>('');
  const [bossAnswers, setBossAnswers] = useState<{ q1: string; q2: string; q3: string }>({
    q1: '',
    q2: '',
    q3: '',
  });

  const [feedback, setFeedback] = useState<{ success: boolean; msg: string } | null>(null);

  const startLevel = (lvl: AdventureLevel) => {
    sounds.playClick();
    setSelectedLevel(lvl);
    setActiveStep('play');
    setFeedback(null);
  };

  const handleVerify = () => {
    let isCorrect = false;
    let message = '';

    if (selectedLevel.levelNumber === 1) {
      if (fractionInput === '1/2' || fractionInput === '20') {
        isCorrect = true;
        message = 'Excellent distribution! Each deer family received their fair share of 20 apples (1/2 of 40).';
      } else {
        message = 'Check the fraction: half of 40 apples is represented as 1/2 or 20 apples.';
      }
    } else if (selectedLevel.levelNumber === 2) {
      const p = parseInt(bridgePerimeter.trim(), 10);
      const a = parseInt(bridgeArea.trim(), 10);
      if (p === 28 && a === 40) {
        isCorrect = true;
        message = 'Bridge restored successfully! Perimeter = 28m and Area = 40m². The animals can now cross safely.';
      } else {
        message = 'Remember: Perimeter = 10 + 10 + 4 + 4 = 28m. Area = 10 × 4 = 40m².';
      }
    } else if (selectedLevel.levelNumber === 3) {
      const diff = parseInt(statDifference.trim(), 10);
      const avg = parseInt(statAverage.trim(), 10);
      if (diff === 7 && avg === 11) {
        isCorrect = true;
        message = 'Census completed with scientific precision! 7 more deer on Tuesday, and an overall mean of 11 sightings.';
      } else {
        message = 'Check your math: 22 - 15 = 7 deer difference. Mean: (8 + 12 + 10 + 14) ÷ 4 = 44 ÷ 4 = 11.';
      }
    } else if (selectedLevel.levelNumber === 4) {
      const totalTrees = parseInt(calcOakTotal.trim(), 10);
      const waterPerZone = parseInt(calcWaterShare.trim(), 10);
      if (totalTrees === 120 && waterPerZone === 9) {
        isCorrect = true;
        message = 'Optimal resource logistics! 120 saplings planted and 9 liters allocated to each of the 6 nurseries.';
      } else {
        message = 'Review operations: 24 × 5 = 120 oak saplings, and 54 ÷ 6 = 9 liters per nursery.';
      }
    } else if (selectedLevel.levelNumber === 5) {
      if (bossAnswers.q1 === '60%' && bossAnswers.q2 === '120' && bossAnswers.q3 === '28') {
        isCorrect = true;
        message = 'YOU SAVED THE FOREST OF BALANCE! The Mother Tree has blossomed again through your mathematical reasoning.';
      } else {
        message = 'To restore the Mother Tree, all 3 environmental equilibrium parameters must be correct.';
      }
    }

    if (isCorrect) {
      sounds.playSuccess();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      setFeedback({ success: true, msg: message });

      const updatedLevels = levels.map((l) =>
        l.id === selectedLevel.id ? { ...l, completed: true } : l
      );
      setLevels(updatedLevels);

      const allLevelsDone = updatedLevels.every((l) => l.completed);
      const isFinishingWorld = selectedLevel.levelNumber === 5 || allLevelsDone;
      const computedScore = Math.max(75, 100 - mistakesCount * 5);
      const hasGoodOverallScore = computedScore >= 75;
      const allocatedGems = isFinishingWorld && hasGoodOverallScore ? 10 : 0;

      setWorldOverallScorePct(computedScore);
      setWorldCompletedGems(allocatedGems);

      let earnedBadgeId: string | undefined = undefined;
      if (selectedLevel.levelNumber === 1) earnedBadgeId = 'badge-fraction-master';
      else if (selectedLevel.levelNumber === 2) earnedBadgeId = 'badge-bridge-architect';
      else if (selectedLevel.levelNumber === 3) earnedBadgeId = 'badge-data-scientist';
      else if (selectedLevel.levelNumber === 4) earnedBadgeId = 'badge-resource-manager';
      else if (selectedLevel.levelNumber === 5) earnedBadgeId = 'badge-forest-guardian';

      onLevelComplete(
        selectedLevel.id,
        selectedLevel.rewardCoins,
        selectedLevel.rewardXp,
        selectedLevel.rewardItem,
        earnedBadgeId,
        allocatedGems
      );
      setTimeout(() => {
        setActiveStep('success');
      }, 1200);
    } else {
      sounds.playError();
      setMistakesCount((prev) => prev + 1);
      setFeedback({ success: false, msg: message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#1e1b18]/65 backdrop-blur-xs font-game">
      <div className="relative w-full max-w-4xl h-[92vh] max-h-[760px] bg-[#fbf5eb] border-[3px] border-[#1e1b18] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[#1e1b18]">
        {/* Modal Top Header */}
        <div className="px-5 py-3.5 bg-[#fde6c3] border-b-[2.5px] border-[#1e1b18] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{unit.icon}</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base sm:text-lg text-[#1e1b18]">
                  {unit.worldName}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#34d399] text-[#1e1b18] border-2 border-[#1e1b18]">
                  {unit.name}
                </span>
              </div>
              <p className="text-xs text-[#5c4033] font-medium">
                IB PYP Unit of Inquiry · Transdisciplinary Theme
              </p>
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

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col bg-[#fbf5eb]">
          {activeStep === 'intro' && (
            <div className="flex flex-col h-full justify-between">
              <div>
                {/* World Story Card */}
                <div className="p-4 rounded-2xl bg-[#d1fae5] border-2 border-[#1e1b18] mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-black text-[#065f46] mb-1 flex items-center gap-2">
                      <TreePine className="w-4 h-4" />
                      <span>The Forest Mission</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-[#1e1b18] font-medium leading-relaxed">
                      {unit.story}
                    </p>
                  </div>
                  <div className="shrink-0 px-3 py-2 rounded-xl bg-[#fff7ea] border-2 border-[#1e1b18] text-center shadow-xs">
                    <div className="text-[10px] font-black uppercase text-[#5c4033]">
                      World Mastery Bonus
                    </div>
                    <div className="text-sm font-black text-[#0369a1] flex items-center justify-center gap-1 mt-0.5">
                      <span>+10</span>
                      <span>💎</span>
                      <span>Gems</span>
                    </div>
                    <div className="text-[9px] font-bold text-[#047857]">
                      Finish World w/ Good Score
                    </div>
                  </div>
                </div>

                {/* Level Select List */}
                <h4 className="text-xs font-bold text-[#1e1b18] uppercase tracking-wider mb-3">
                  Available Inquiry Levels:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {levels.map((lvl) => {
                    const isSelected = selectedLevel.id === lvl.id;
                    return (
                      <div
                        key={lvl.id}
                        onClick={() => {
                          sounds.playClick();
                          setSelectedLevel(lvl);
                        }}
                        className={`p-3.5 rounded-2xl border-2 border-[#1e1b18] transition-all cursor-pointer flex flex-col justify-between shadow-xs ${
                          isSelected
                            ? 'bg-[#fde68a] ring-2 ring-[#f59e0b]'
                            : 'bg-[#fff7ea] hover:bg-[#fde6c3]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-extrabold text-[#b45309]">
                                Lvl {lvl.levelNumber}
                              </span>
                              {lvl.completed && (
                                <span className="flex items-center gap-1 text-[10px] text-[#065f46] font-bold bg-[#d1fae5] px-1.5 py-0.5 rounded-md border border-[#1e1b18]">
                                  <CheckCircle className="w-3 h-3" /> Completed
                                </span>
                              )}
                            </div>
                            <h5 className="font-black text-sm text-[#1e1b18]">
                              {lvl.title.replace(/^Level \d+ — /, '')}
                            </h5>
                            <p className="text-xs text-[#5c4033] font-medium mt-1 line-clamp-2">
                              {lvl.description}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-[#1e1b18]/20 flex items-center justify-between text-xs">
                          <span className="text-[#047857] font-bold">
                            {lvl.concept}
                          </span>
                          <span className="text-[#b45309] font-bold flex items-center gap-1">
                            +{lvl.rewardCoins} 🪙
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Start Selected Level CTA */}
              <div className="mt-6 pt-4 border-t-2 border-[#1e1b18]/20 flex items-center justify-between">
                <div>
                  <div className="text-xs text-[#5c4033] font-bold">Selected Level:</div>
                  <div className="text-sm font-black text-[#1e1b18]">
                    {selectedLevel.title}
                  </div>
                </div>

                <button
                  onClick={() => startLevel(selectedLevel)}
                  className="px-6 py-2.5 bg-[#34d399] hover:bg-[#10b981] text-[#1e1b18] border-2 border-[#1e1b18] font-black text-sm rounded-xl shadow-xs flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <span>Start Level</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {activeStep === 'play' && (
            <div className="flex flex-col h-full justify-between">
              <div>
                {/* Level Title & Breadcrumb */}
                <div className="flex items-center justify-between pb-3 border-b-2 border-[#1e1b18]/20 mb-4">
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setActiveStep('intro');
                    }}
                    className="flex items-center gap-1 text-xs font-bold text-[#5c4033] hover:text-[#1e1b18] cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" /> Back to level list
                  </button>
                  <span className="text-xs font-bold text-[#065f46] bg-[#d1fae5] px-2.5 py-1 rounded-full border-2 border-[#1e1b18]">
                    {selectedLevel.concept}
                  </span>
                </div>

                {/* Level 1: Fractions */}
                {selectedLevel.levelNumber === 1 && (
                  <div className="space-y-4">
                    <div className="p-4 bg-[#fde6c3] rounded-2xl border-2 border-[#1e1b18]">
                      <h4 className="font-black text-sm text-[#1e1b18] mb-2">
                        Apple Harvest Distribution for Deer
                      </h4>
                      <p className="text-xs text-[#5c4033] font-medium mb-4">
                        The harvest has yielded 40 fresh apples. The deer family needs exactly one half (1/2) of the harvest to stay healthy.
                      </p>

                      <div className="p-3 bg-[#fff7ea] rounded-xl border-2 border-[#1e1b18] flex flex-wrap gap-2 justify-center py-4 mb-4">
                        {Array.from({ length: 20 }).map((_, i) => (
                          <span key={i} className="text-2xl filter drop-shadow-xs animate-pulse">
                            🍎
                          </span>
                        ))}
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-3">
                        <label className="text-xs font-bold text-[#1e1b18]">
                          Select the fraction or quantity equivalent to 1/2 of 40:
                        </label>
                        <div className="flex gap-2 flex-wrap">
                          {['1/4 (10)', '1/2 (20)', '3/4 (30)', '2/2 (40)'].map((opt) => {
                            const val = opt.includes('1/2') ? '1/2' : opt;
                            return (
                              <button
                                key={opt}
                                onClick={() => {
                                  sounds.playClick();
                                  setFractionInput(val);
                                }}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 border-[#1e1b18] transition-all cursor-pointer ${
                                  fractionInput === val
                                    ? 'bg-[#f59e0b] text-[#1e1b18] shadow-xs'
                                    : 'bg-[#fff7ea] text-[#5c4033] hover:bg-[#f3d5ab]'
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Level 2: Bridge Measurement */}
                {selectedLevel.levelNumber === 2 && (
                  <div className="space-y-4">
                    <div className="p-4 bg-[#fde6c3] rounded-2xl border-2 border-[#1e1b18]">
                      <h4 className="font-black text-sm text-[#1e1b18] mb-2">
                        Rebuilding the River Bridge
                      </h4>
                      <p className="text-xs text-[#5c4033] font-medium mb-4">
                        The bridge blueprint requires a rectangular span of <strong className="text-[#1e1b18]">length = 10 meters</strong> and <strong className="text-[#1e1b18]">width = 4 meters</strong>. Find the perimeter of the guardrails and total timber area.
                      </p>

                      <div className="w-full h-36 bg-[#78b3ea]/40 rounded-xl border-2 border-[#1e1b18] flex items-center justify-center relative p-3 mb-4">
                        <div className="w-48 h-20 bg-[#f3d5ab] border-2 border-dashed border-[#1e1b18] rounded-lg flex flex-col items-center justify-center relative">
                          <span className="text-[11px] font-black text-[#1e1b18]">
                            Area = length × width
                          </span>
                          <span className="text-[10px] font-bold text-[#5c4033]">
                            10 m × 4 m
                          </span>
                          <div className="absolute -top-5 text-[10px] font-black text-[#1e1b18]">
                            Length: 10 m
                          </div>
                          <div className="absolute -right-14 text-[10px] font-black text-[#1e1b18]">
                            Width: 4 m
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-[#1e1b18] block mb-1">
                            Total Perimeter (10 + 10 + 4 + 4) in meters:
                          </label>
                          <input
                            type="number"
                            value={bridgePerimeter}
                            onChange={(e) => setBridgePerimeter(e.target.value)}
                            className="w-full px-3 py-2 bg-[#fff7ea] border-2 border-[#1e1b18] rounded-xl text-[#1e1b18] font-mono outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-[#1e1b18] block mb-1">
                            Total Deck Area (10 × 4) in m²:
                          </label>
                          <input
                            type="number"
                            value={bridgeArea}
                            onChange={(e) => setBridgeArea(e.target.value)}
                            className="w-full px-3 py-2 bg-[#fff7ea] border-2 border-[#1e1b18] rounded-xl text-[#1e1b18] font-mono outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Level 3: Census Statistics */}
                {selectedLevel.levelNumber === 3 && (
                  <div className="space-y-4">
                    <div className="p-4 bg-[#fde6c3] rounded-2xl border-2 border-[#1e1b18]">
                      <h4 className="font-black text-sm text-[#1e1b18] mb-2">
                        Wildlife Census & Data Handling
                      </h4>
                      <p className="text-xs text-[#5c4033] font-medium mb-3">
                        Rangers recorded deer sightings:
                        <strong className="text-[#1e1b18]"> Monday: 15 deer</strong> | <strong className="text-[#1e1b18]">Tuesday: 22 deer</strong>.
                        Additionally, in 4 forest clearings they counted: 8, 12, 10, and 14 foxes.
                      </p>

                      <div className="relative p-4 bg-[#fff7ea] rounded-xl border-2 border-[#1e1b18] mb-4 flex items-end justify-around gap-6 h-64 px-8 overflow-hidden">
                        <div className="w-20 flex flex-col items-center gap-1.5 z-10">
                          <span className="text-[11px] text-[#1e1b18] font-black">15</span>
                          <div className="w-full bg-[#34d399] border-2 border-[#1e1b18] rounded-t-lg h-[90px] shadow-xs"></div>
                          <span className="text-[11px] text-[#5c4033] font-black mt-1">Mon</span>
                        </div>
                        <div className="w-20 flex flex-col items-center gap-1.5 z-10">
                          <span className="text-[11px] text-[#1e1b18] font-black">22</span>
                          <div className="w-full bg-[#10b981] border-2 border-[#1e1b18] rounded-t-lg h-[135px] shadow-xs"></div>
                          <span className="text-[11px] text-[#5c4033] font-black mt-1">Tue</span>
                        </div>
                        <div className="w-20 flex flex-col items-center gap-1.5 z-10">
                          <span className="text-[11px] text-[#1e1b18] font-black">11 (Mean)</span>
                          <div className="w-full bg-[#78b3ea] border-2 border-[#1e1b18] rounded-t-lg h-[75px] shadow-xs"></div>
                          <span className="text-[11px] text-[#5c4033] font-black mt-1">Mean</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-[#1e1b18] block mb-1">
                            How many more deer were seen on Tuesday than Monday? (22 − 15):
                          </label>
                          <input
                            type="number"
                            value={statDifference}
                            onChange={(e) => setStatDifference(e.target.value)}
                            className="w-full px-3 py-2 bg-[#fff7ea] border-2 border-[#1e1b18] rounded-xl text-[#1e1b18] font-mono outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-[#1e1b18] block mb-1">
                            Calculate the mean fox count: (8 + 12 + 10 + 14) ÷ 4:
                          </label>
                          <input
                            type="number"
                            value={statAverage}
                            onChange={(e) => setStatAverage(e.target.value)}
                            className="w-full px-3 py-2 bg-[#fff7ea] border-2 border-[#1e1b18] rounded-xl text-[#1e1b18] font-mono outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Level 4: Operations & Resource Management */}
                {selectedLevel.levelNumber === 4 && (
                  <div className="space-y-4">
                    <div className="p-4 bg-[#fde6c3] rounded-2xl border-2 border-[#1e1b18]">
                      <h4 className="font-black text-sm text-[#1e1b18] mb-2">
                        Reforestation & Resource Allocation
                      </h4>
                      <p className="text-xs text-[#5c4033] font-medium mb-4">
                        The station received <strong className="text-[#1e1b18]">5 crates with 24 oak saplings each</strong>, and <strong className="text-[#1e1b18]">54 liters of pure water for 6 community nurseries</strong>.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-[#1e1b18] block mb-1">
                            Total saplings (24 × 5):
                          </label>
                          <input
                            type="number"
                            value={calcOakTotal}
                            onChange={(e) => setCalcOakTotal(e.target.value)}
                            className="w-full px-3 py-2 bg-[#fff7ea] border-2 border-[#1e1b18] rounded-xl text-[#1e1b18] font-mono outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-[#1e1b18] block mb-1">
                            Liters of water per nursery (54 ÷ 6):
                          </label>
                          <input
                            type="number"
                            value={calcWaterShare}
                            onChange={(e) => setCalcWaterShare(e.target.value)}
                            className="w-full px-3 py-2 bg-[#fff7ea] border-2 border-[#1e1b18] rounded-xl text-[#1e1b18] font-mono outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Level 5: Boss Mission */}
                {selectedLevel.levelNumber === 5 && (
                  <div className="space-y-4">
                    <div className="p-4 bg-[#fde68a] rounded-2xl border-2 border-[#1e1b18]">
                      <div className="flex items-center gap-2 mb-2">
                        <Trophy className="w-5 h-5 text-[#b45309]" />
                        <h4 className="font-extrabold text-sm text-[#1e1b18]">
                          Final Challenge: Awakening of the Mother Tree
                        </h4>
                      </div>
                      <p className="text-xs text-[#5c4033] font-medium mb-4">
                        Solve all 3 mathematical inquiry pillars to awaken the Mother Tree and earn the Guardian Badger companion:
                      </p>

                      <div className="space-y-3">
                        <div className="p-2.5 bg-[#fff7ea] rounded-xl border-2 border-[#1e1b18]">
                          <label className="text-xs font-bold text-[#1e1b18] block mb-1.5">
                            1. Pouch with 3 solar crystals and 2 lunar crystals (total 5). Probability of solar crystal:
                          </label>
                          <div className="flex gap-2">
                            {['60%', '40%', '50%', '20%'].map((opt) => (
                              <button
                                key={opt}
                                onClick={() => {
                                  sounds.playClick();
                                  setBossAnswers((prev) => ({ ...prev, q1: opt }));
                                }}
                                className={`px-2.5 py-1 text-xs font-bold rounded-lg border-2 border-[#1e1b18] cursor-pointer ${
                                  bossAnswers.q1 === opt
                                    ? 'bg-[#f59e0b] text-[#1e1b18]'
                                    : 'bg-[#fde6c3] text-[#5c4033]'
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="p-2.5 bg-[#fff7ea] rounded-xl border-2 border-[#1e1b18]">
                          <label className="text-xs font-bold text-[#1e1b18] block mb-1">
                            2. 5 crates × 24 saplings each = total saplings:
                          </label>
                          <input
                            type="text"
                            value={bossAnswers.q2}
                            onChange={(e) => {
                              const val = e.target.value;
                              setBossAnswers((prev) => ({ ...prev, q2: val }));
                            }}
                            placeholder="Enter total"
                            className="w-full px-3 py-1.5 bg-[#fbf5eb] border-2 border-[#1e1b18] rounded-lg text-xs text-[#1e1b18]"
                          />
                        </div>

                        <div className="p-2.5 bg-[#fff7ea] rounded-xl border-2 border-[#1e1b18]">
                          <label className="text-xs font-bold text-[#1e1b18] block mb-1">
                            3. Perimeter of the sanctuary fence (length 10m, width 4m):
                          </label>
                          <input
                            type="text"
                            value={bossAnswers.q3}
                            onChange={(e) => {
                              const val = e.target.value;
                              setBossAnswers((prev) => ({ ...prev, q3: val }));
                            }}
                            placeholder="Enter perimeter"
                            className="w-full px-3 py-1.5 bg-[#fbf5eb] border-2 border-[#1e1b18] rounded-lg text-xs text-[#1e1b18]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Feedback message */}
                {feedback && (
                  <div
                    className={`mt-4 p-3 rounded-xl border-2 border-[#1e1b18] text-xs sm:text-sm font-bold flex items-center gap-2 ${
                      feedback.success
                        ? 'bg-[#d1fae5] text-[#065f46]'
                        : 'bg-[#fecdd3] text-[#9f1239]'
                    }`}
                  >
                    {feedback.success ? (
                      <CheckCircle className="w-5 h-5 text-[#059669] shrink-0" />
                    ) : (
                      <HelpCircle className="w-5 h-5 text-[#e11d48] shrink-0" />
                    )}
                    <span>{feedback.msg}</span>
                  </div>
                )}
              </div>

              {/* Bottom Action verification */}
              <div className="mt-6 pt-4 border-t-2 border-[#1e1b18]/20 flex items-center justify-between">
                <button
                  onClick={() => {
                    sounds.playClick();
                    setActiveStep('intro');
                  }}
                  className="px-4 py-2 bg-[#f3d5ab] hover:bg-[#e8c496] text-[#1e1b18] text-xs font-bold rounded-xl border-2 border-[#1e1b18] cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  onClick={handleVerify}
                  className="px-6 py-2.5 bg-[#f59e0b] hover:bg-[#fbbf24] text-[#1e1b18] border-2 border-[#1e1b18] font-black text-sm rounded-xl shadow-xs flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify Solution</span>
                </button>
              </div>
            </div>
          )}

          {activeStep === 'success' && (
            <div className="flex flex-col items-center justify-center h-full text-center py-6">
              <div className="w-20 h-20 rounded-full bg-[#fde6c3] border-2 border-[#1e1b18] flex items-center justify-center mb-4 shadow-md">
                <Trophy className="w-10 h-10 text-[#d97706]" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-[#1e1b18] mb-2">
                {worldCompletedGems > 0 ? 'WORLD COMPLETED!' : 'LEVEL COMPLETED!'}
              </h3>
              <p className="text-sm text-[#5c4033] font-medium max-w-md mb-4">
                You applied mathematical reasoning to restore harmony to The Forest of Balance.
              </p>

              {worldCompletedGems > 0 && (
                <div className="mb-4 px-4 py-2.5 rounded-2xl bg-[#d1fae5] border-2 border-[#1e1b18] flex items-center gap-3 shadow-xs">
                  <span className="text-2xl">💎</span>
                  <div className="text-left">
                    <div className="text-xs font-black text-[#065f46]">
                      World Finished with High Distinction ({worldOverallScorePct}% Grade)!
                    </div>
                    <div className="text-[11px] font-bold text-[#1e1b18]">
                      +{worldCompletedGems} Gems allocated! Spend them in the Shop on any item or Special Items.
                    </div>
                  </div>
                </div>
              )}

              {/* Rewards Box */}
              <div className="p-4 bg-[#fde6c3] border-2 border-[#1e1b18] rounded-2xl flex flex-wrap items-center justify-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🪙</span>
                  <div className="text-left">
                    <div className="text-xs font-bold text-[#5c4033]">Coins</div>
                    <div className="text-base font-black text-[#b45309]">
                      +{selectedLevel.rewardCoins}
                    </div>
                  </div>
                </div>

                <div className="w-px h-8 bg-[#1e1b18]/25" />

                <div className="flex items-center gap-2">
                  <span className="text-2xl">⚡</span>
                  <div className="text-left">
                    <div className="text-xs font-bold text-[#5c4033]">Experience</div>
                    <div className="text-base font-black text-[#0369a1]">
                      +{selectedLevel.rewardXp} XP
                    </div>
                  </div>
                </div>

                {worldCompletedGems > 0 && (
                  <>
                    <div className="w-px h-8 bg-[#1e1b18]/25" />
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">💎</span>
                      <div className="text-left">
                        <div className="text-xs font-bold text-[#5c4033]">World Gems</div>
                        <div className="text-base font-black text-[#0369a1]">
                          +{worldCompletedGems} 💎
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {selectedLevel.rewardItem && (
                  <>
                    <div className="w-px h-8 bg-[#1e1b18]/25" />
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🦡</span>
                      <div className="text-left">
                        <div className="text-xs font-bold text-[#5c4033]">New Companion Pet!</div>
                        <div className="text-xs font-black text-[#047857]">
                          Guardian Badger
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    sounds.playClick();
                    setActiveStep('intro');
                  }}
                  className="px-5 py-2.5 bg-[#fff7ea] hover:bg-[#fde6c3] text-[#1e1b18] text-xs font-bold rounded-xl border-2 border-[#1e1b18] cursor-pointer"
                >
                  View Other Levels
                </button>
                <button
                  onClick={() => {
                    sounds.playClick();
                    onClose();
                  }}
                  className="px-6 py-2.5 bg-[#34d399] hover:bg-[#10b981] text-[#1e1b18] border-2 border-[#1e1b18] text-xs font-black rounded-xl shadow-xs cursor-pointer"
                >
                  Return to Island
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
