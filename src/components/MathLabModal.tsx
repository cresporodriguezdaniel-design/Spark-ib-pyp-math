import React, { useState } from 'react';
import { StudentProfile } from '../types';
import { MATH_LAB_CURRICULUM } from '../data/mockData';
import { sounds } from '../services/sound';
import confetti from 'canvas-confetti';
import {
  X,
  Beaker,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Calculator,
  Compass,
  Ruler,
  BarChart3,
  Award,
  Lightbulb,
} from 'lucide-react';

interface MathLabModalProps {
  student: StudentProfile;
  onClose: () => void;
  onReward: (coins: number, xp: number) => void;
  onAwardBadge?: (badgeId: string) => void;
}

type CompetencyKey = 'numbers' | 'patterns' | 'measurement' | 'geometry' | 'data';

export const MathLabModal: React.FC<MathLabModalProps> = ({
  student,
  onClose,
  onReward,
  onAwardBadge,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CompetencyKey>('numbers');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [streak, setStreak] = useState(3);
  const [reflectionStrategy, setReflectionStrategy] = useState<string>('');

  const categoryList: { key: CompetencyKey; label: string; icon: React.ReactNode; activeBg: string }[] = [
    { key: 'numbers', label: '1. Numbers & Operations', icon: <Calculator className="w-4 h-4" />, activeBg: 'bg-[#f59e0b]' },
    { key: 'patterns', label: '2. Patterns & Functions', icon: <Sparkles className="w-4 h-4" />, activeBg: 'bg-[#e4a887]' },
    { key: 'measurement', label: '3. Measurement & Time', icon: <Ruler className="w-4 h-4" />, activeBg: 'bg-[#34d399]' },
    { key: 'geometry', label: '4. Shape & Space', icon: <Compass className="w-4 h-4" />, activeBg: 'bg-[#78b3ea]' },
    { key: 'data', label: '5. Data & Probability', icon: <BarChart3 className="w-4 h-4" />, activeBg: 'bg-[#fbbf24]' },
  ];

  const rawQuestions = MATH_LAB_CURRICULUM[selectedCategory] || [];

  // Randomize options and correctIndex for Math Lab questions so correct answer varies between a, b, c, d
  const questions = React.useMemo(() => {
    return rawQuestions.map((q) => {
      const originalCorrectText = q.options[q.correctIndex];
      const indexedOptions = q.options.map((opt, origIdx) => ({ opt, isCorrect: origIdx === q.correctIndex }));
      // Shuffle options randomly
      const shuffled = [...indexedOptions].sort(() => Math.random() - 0.5);
      const newOptions = shuffled.map((item) => item.opt);
      const newCorrectIndex = shuffled.findIndex((item) => item.isCorrect);

      return {
        ...q,
        options: newOptions,
        correctIndex: newCorrectIndex,
      };
    });
  }, [selectedCategory]);

  const activeQ = questions[currentQuestionIndex] || questions[0];

  const handleSelectOption = (idx: number) => {
    if (isAnswerChecked) return;
    sounds.playClick();
    setSelectedAnswer(idx);
  };

  const handleCheckAnswer = () => {
    if (selectedAnswer === null || isAnswerChecked) return;
    setIsAnswerChecked(true);

    const isCorrect = selectedAnswer === activeQ.correctIndex;
    if (isCorrect) {
      sounds.playSuccess();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
      setStreak((s) => s + 1);
      onReward(25, 50);
      onAwardBadge?.('badge-math-lab-pro');
    } else {
      sounds.playError();
      setStreak(0);
    }
  };

  const handleNextQuestion = () => {
    sounds.playClick();
    setSelectedAnswer(null);
    setIsAnswerChecked(false);
    setReflectionStrategy('');
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setCurrentQuestionIndex(0);
    }
  };

  const isCorrect = selectedAnswer === activeQ?.correctIndex;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#1e1b18]/65 backdrop-blur-xs font-game">
      <div className="relative w-full max-w-4xl h-[92vh] max-h-[760px] bg-[#fbf5eb] border-[3px] border-[#1e1b18] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[#1e1b18]">
        {/* Top Header */}
        <div className="px-5 py-3.5 bg-[#fde6c3] border-b-[2.5px] border-[#1e1b18] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#34d399] border-2 border-[#1e1b18] flex items-center justify-center shadow-xs">
              <Beaker className="w-5 h-5 text-[#1e1b18]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base sm:text-lg text-[#1e1b18] font-game">
                  Math Lab · Competency Laboratory
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#f59e0b] text-[#1e1b18] border-2 border-[#1e1b18]">
                  PYP {student.currentYear}
                </span>
              </div>
              <p className="text-xs text-[#5c4033] font-medium">
                Independent progressive inquiry · Unlockable rewards
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#fff7ea] border-2 border-[#1e1b18] rounded-xl text-[#1e1b18] text-xs font-bold">
              <span>🔥 Streak:</span>
              <span className="tabular-nums">{streak}</span>
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

        {/* Competency Horizontal Selector */}
        <div className="p-2 sm:p-3 bg-[#f3d5ab] border-b-[2.5px] border-[#1e1b18] flex items-center gap-2 overflow-x-auto shrink-0">
          {categoryList.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => {
                  sounds.playClick();
                  setSelectedCategory(cat.key);
                  setCurrentQuestionIndex(0);
                  setSelectedAnswer(null);
                  setIsAnswerChecked(false);
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border-2 border-[#1e1b18] cursor-pointer ${
                  isSelected
                    ? `${cat.activeBg} text-[#1e1b18] shadow-xs scale-[1.02]`
                    : 'bg-[#fff7ea] text-[#5c4033] hover:text-[#1e1b18] hover:bg-[#fde6c3]'
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Question & Practice Arena */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col justify-between bg-[#fbf5eb]">
          <div className="max-w-2xl mx-auto w-full">
            {/* Question Counter & PYP Badge */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-[#1e1b18] uppercase tracking-widest bg-[#fde68a] px-2.5 py-1 rounded-full border-2 border-[#1e1b18]">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <span className="text-xs font-bold text-[#5c4033] bg-[#fff7ea] px-2.5 py-1 rounded-full border-2 border-[#1e1b18]">
                Unit Link: {activeQ.pypUnit}
              </span>
            </div>

            {/* Inquiry Prompt Card */}
            <div className="p-5 rounded-2xl bg-[#fde6c3] border-2 border-[#1e1b18] mb-6 shadow-xs">
              <h3 className="text-sm font-bold text-[#5c4033] mb-1">{activeQ.title}</h3>
              <p className="text-base sm:text-lg font-black text-[#1e1b18] leading-relaxed">
                {activeQ.prompt}
              </p>
            </div>

            {/* Answer Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {activeQ.options.map((opt, idx) => {
                const isThisSelected = selectedAnswer === idx;
                let optionStyle =
                  'bg-[#fff7ea] border-[#1e1b18] hover:bg-[#fde6c3] text-[#1e1b18]';

                if (isAnswerChecked) {
                  if (idx === activeQ.correctIndex) {
                    optionStyle =
                      'bg-[#a7f3d0] border-[#1e1b18] text-[#065f46] ring-2 ring-[#10b981]';
                  } else if (isThisSelected) {
                    optionStyle =
                      'bg-[#fecdd3] border-[#1e1b18] text-[#9f1239] ring-2 ring-[#f43f5e]';
                  } else {
                    optionStyle = 'bg-[#f3d5ab]/60 border-[#1e1b18]/50 text-[#5c4033] opacity-60';
                  }
                } else if (isThisSelected) {
                  optionStyle =
                    'bg-[#fde68a] border-[#1e1b18] text-[#1e1b18] ring-2 ring-[#f59e0b] shadow-sm';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    disabled={isAnswerChecked}
                    className={`p-4 rounded-2xl border-2 text-left font-bold text-sm sm:text-base transition-all flex items-center justify-between gap-3 cursor-pointer ${optionStyle}`}
                  >
                    <span>{opt}</span>
                    <span className="w-6 h-6 rounded-full bg-[#fbf5eb] border border-[#1e1b18] flex items-center justify-center text-xs shrink-0 text-[#1e1b18]">
                      {String.fromCharCode(65 + idx)}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Pedagogical Explanation & Reflection */}
            {isAnswerChecked && (
              <div
                className={`p-4 rounded-2xl border-2 border-[#1e1b18] mb-6 animate-in fade-in slide-in-from-bottom-2 ${
                  isCorrect ? 'bg-[#d1fae5] text-[#065f46]' : 'bg-[#fde68a] text-[#1e1b18]'
                }`}
              >
                <div className="flex items-center gap-2 font-black text-sm mb-1.5">
                  {isCorrect ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-[#059669]" />
                      <span>Correct Answer! (+25 Coins, +50 XP)</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5 text-[#b45309]" />
                      <span>Check Your Strategy & Try Next</span>
                    </>
                  )}
                </div>
                <p className="text-xs sm:text-sm leading-relaxed text-[#1e1b18] font-medium">
                  {activeQ.explanation}
                </p>

                {/* Metacognitive Reflection Box */}
                <div className="mt-3 pt-3 border-t border-[#1e1b18]/20">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#1e1b18] mb-1">
                    <Lightbulb className="w-4 h-4 text-[#d97706]" />
                    <span>Inquiry Reflection (How did you solve it?):</span>
                  </div>
                  <input
                    type="text"
                    value={reflectionStrategy}
                    onChange={(e) => setReflectionStrategy(e.target.value)}
                    placeholder="Describe your reasoning and method..."
                    className="w-full px-3 py-1.5 bg-[#fff7ea] border-2 border-[#1e1b18] rounded-xl text-xs text-[#1e1b18] placeholder-[#5c4033]/60 outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Bottom Action Footer */}
          <div className="border-t-2 border-[#1e1b18]/20 pt-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-[#5c4033] font-bold">
              <Award className="w-4 h-4 text-[#d97706]" />
              <span>Correct solutions reward 25 coins and 50 XP</span>
            </div>

            <div className="flex items-center gap-3">
              {!isAnswerChecked ? (
                <button
                  onClick={handleCheckAnswer}
                  disabled={selectedAnswer === null}
                  className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border-2 border-[#1e1b18] ${
                    selectedAnswer !== null
                      ? 'bg-[#34d399] hover:bg-[#10b981] text-[#1e1b18] shadow-xs active:scale-95 cursor-pointer'
                      : 'bg-[#f3d5ab] text-[#5c4033]/60 cursor-not-allowed'
                  }`}
                >
                  Verify Answer
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-[#f59e0b] hover:bg-[#fbbf24] text-[#1e1b18] border-2 border-[#1e1b18] shadow-xs active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Next Challenge</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
