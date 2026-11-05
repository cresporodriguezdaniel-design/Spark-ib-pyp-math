import React, { useState, useEffect } from 'react';
import { QUICK_THINKING_QUESTIONS } from '../data/mockData';
import { sounds } from '../services/sound';
import confetti from 'canvas-confetti';
import {
  X,
  Zap,
  Timer,
  Trophy,
  RotateCcw,
  Flame,
} from 'lucide-react';

interface QuickThinkingModalProps {
  onClose: () => void;
  onReward: (coins: number, xp: number) => void;
  onAwardBadge?: (badgeId: string) => void;
}

interface ShuffledQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number;
  time: number;
}

// Function to generate randomized questions where the correct response position
// alternates randomly across the 4 color positions (0: Red, 1: Blue, 2: Yellow, 3: Green)
// and never stays fixed at the red position.
const prepareShuffledQuestions = (): ShuffledQuestion[] => {
  let lastCorrectPos = -1;

  // Shuffle question pool so each run starts with fresh variety
  const questionsCopy = [...QUICK_THINKING_QUESTIONS].sort(() => Math.random() - 0.5);

  return questionsCopy.map((q) => {
    const originalCorrectText = q.options[q.correct];
    const incorrectOptions = q.options.filter((_, idx) => idx !== q.correct);

    // Shuffle incorrect options randomly
    const shuffledIncorrect = [...incorrectOptions].sort(() => Math.random() - 0.5);

    // Pick a new position in [0, 1, 2, 3] that differs from the previous question's position
    // strictly ensuring the correct answer alternates across Red, Blue, Yellow, and Green.
    const candidates = [0, 1, 2, 3].filter((pos) => pos !== lastCorrectPos);
    const newCorrectPos = candidates[Math.floor(Math.random() * candidates.length)];
    lastCorrectPos = newCorrectPos;

    // Distribute into the 4 slots: correct answer placed at newCorrectPos
    const newOptions: string[] = new Array(4);
    newOptions[newCorrectPos] = originalCorrectText;
    let incIdx = 0;
    for (let i = 0; i < 4; i++) {
      if (i !== newCorrectPos) {
        newOptions[i] = shuffledIncorrect[incIdx++];
      }
    }

    return {
      id: q.id,
      question: q.question,
      options: newOptions,
      correct: newCorrectPos,
      time: q.time,
    };
  });
};

export const QuickThinkingModal: React.FC<QuickThinkingModalProps> = ({
  onClose,
  onReward,
  onAwardBadge,
}) => {
  const [questions, setQuestions] = useState<ShuffledQuestion[]>(() => prepareShuffledQuestions());
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);

  const activeQuestion = questions[currentIdx] || questions[0];

  // Timer effect
  useEffect(() => {
    if (gameOver || isAnswered) return;

    if (timeLeft <= 0) {
      handleTimeOut();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 4 && t > 1) {
          sounds.playTick();
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isAnswered, gameOver]);

  const handleTimeOut = () => {
    sounds.playError();
    setIsAnswered(true);
    setSelectedOpt(-1);
    setStreak(0);
    setTimeout(() => {
      moveToNext();
    }, 2000);
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOpt(idx);
    setIsAnswered(true);

    const isCorrect = idx === activeQuestion.correct;
    if (isCorrect) {
      sounds.playSuccess();
      const points = 100 + timeLeft * 10;
      setScore((s) => s + points);
      setStreak((st) => {
        const next = st + 1;
        if (next >= 5) {
          onAwardBadge?.('badge-quick-thinker');
        }
        if (next >= 7 || (timeLeft >= 12 && next >= 3)) {
          onAwardBadge?.('badge-secret-speed-of-light');
        }
        return next;
      });
    } else {
      sounds.playError();
      setStreak(0);
    }

    setTimeout(() => {
      moveToNext();
    }, 1600);
  };

  const moveToNext = () => {
    if (currentIdx + 1 < questions.length) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      setTimeLeft(questions[nextIdx]?.time || 15);
      setIsAnswered(false);
      setSelectedOpt(null);
    } else {
      setGameOver(true);
      sounds.playLevelUp();
      confetti({ particleCount: 70, spread: 80 });
      onReward(Math.floor(score / 5), Math.floor(score / 3));
    }
  };

  const restartGame = () => {
    sounds.playClick();
    const freshQuestions = prepareShuffledQuestions();
    setQuestions(freshQuestions);
    setCurrentIdx(0);
    setScore(0);
    setStreak(0);
    setTimeLeft(freshQuestions[0]?.time || 15);
    setIsAnswered(false);
    setSelectedOpt(null);
    setGameOver(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#1e1b18]/65 backdrop-blur-xs font-game">
      <div className="relative w-full max-w-2xl bg-[#fbf5eb] border-[3px] border-[#1e1b18] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[#1e1b18]">
        {/* Top Header */}
        <div className="px-5 py-3.5 bg-[#fde6c3] border-b-[2.5px] border-[#1e1b18] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#f59e0b] border-2 border-[#1e1b18] flex items-center justify-center shadow-xs">
              <Zap className="w-5 h-5 text-[#1e1b18]" />
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg text-[#1e1b18]">
                Quick Thinking · Speed Challenge
              </h2>
              <p className="text-xs text-[#5c4033] font-medium">
                Timed mental calculation & pattern recognition
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

        {/* Content Arena */}
        <div className="p-4 sm:p-8 flex-1 flex flex-col justify-between bg-[#fbf5eb]">
          {!gameOver ? (
            <>
              {/* Stats Bar */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#1e1b18] bg-[#fde6c3] px-3 py-1 rounded-xl border-2 border-[#1e1b18]">
                    <Trophy className="w-4 h-4 text-[#d97706]" />
                    <span>Score: {score}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#1e1b18] bg-[#fde68a] px-3 py-1 rounded-xl border-2 border-[#1e1b18]">
                    <Flame className="w-4 h-4 text-[#ea580c]" />
                    <span>Streak: {streak}</span>
                  </div>
                </div>

                {/* Circular / Pill Timer */}
                <div
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-2xl font-mono text-sm font-black border-2 border-[#1e1b18] transition-all ${
                    timeLeft <= 4
                      ? 'bg-[#f43f5e] text-white animate-pulse'
                      : 'bg-[#fde6c3] text-[#1e1b18]'
                  }`}
                >
                  <Timer className="w-4 h-4" />
                  <span>{timeLeft}s</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2.5 bg-[#d8b892] rounded-full mb-6 overflow-hidden border border-[#1e1b18]">
                <div
                  className="h-full bg-[#f59e0b] transition-all duration-300"
                  style={{
                    width: `${((currentIdx + 1) / questions.length) * 100}%`,
                  }}
                />
              </div>

              {/* Question Box */}
              <div className="p-6 sm:p-8 rounded-3xl bg-[#fde6c3] border-2 border-[#1e1b18] text-center mb-6 shadow-xs">
                <span className="text-xs font-black text-[#b45309] uppercase tracking-widest block mb-2">
                  Question {currentIdx + 1} of {questions.length}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-[#1e1b18] leading-relaxed">
                  {activeQuestion.question}
                </h3>
              </div>

              {/* 4 Map-Palette Answer Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-4">
                {activeQuestion.options.map((opt, idx) => {
                  const colors = [
                    'bg-[#e4a887] hover:bg-[#d99570] text-[#1e1b18]',
                    'bg-[#78b3ea] hover:bg-[#5fa0de] text-[#1e1b18]',
                    'bg-[#fbbf24] hover:bg-[#f59e0b] text-[#1e1b18]',
                    'bg-[#34d399] hover:bg-[#10b981] text-[#1e1b18]',
                  ];

                  let btnStyle = `${colors[idx % 4]} border-2 border-[#1e1b18] shadow-sm`;

                  if (isAnswered) {
                    if (idx === activeQuestion.correct) {
                      btnStyle = 'bg-[#10b981] border-[3px] border-[#1e1b18] text-white scale-[1.02] ring-4 ring-[#34d399]/50';
                    } else if (selectedOpt === idx) {
                      btnStyle = 'bg-[#f43f5e] border-2 border-[#1e1b18] text-white opacity-90';
                    } else {
                      btnStyle = 'bg-[#f3d5ab]/60 border-2 border-[#1e1b18]/40 text-[#5c4033] opacity-50';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswered}
                      className={`p-4 sm:p-5 rounded-2xl font-black text-base sm:text-lg transition-all transform active:scale-95 flex items-center justify-between cursor-pointer ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      <span className="w-7 h-7 rounded-xl bg-[#fff7ea]/80 border border-[#1e1b18] text-[#1e1b18] flex items-center justify-center text-xs">
                        {['▲', '◆', '●', '■'][idx]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            /* Game Over Results */
            <div className="text-center py-6 animate-in fade-in zoom-in-95">
              <div className="w-20 h-20 bg-[#fde6c3] text-[#1e1b18] rounded-3xl border-2 border-[#1e1b18] flex items-center justify-center mx-auto mb-4 text-4xl shadow-md">
                🏆
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-[#1e1b18] mb-1">
                Challenge Complete!
              </h3>
              <p className="text-xs text-[#5c4033] font-medium mb-6">
                Outstanding mental calculation agility!
              </p>

              <div className="max-w-xs mx-auto p-4 bg-[#fde6c3] border-2 border-[#1e1b18] rounded-2xl mb-6 space-y-2 text-xs">
                <div className="flex justify-between font-bold">
                  <span className="text-[#5c4033]">Final Score:</span>
                  <span className="text-[#1e1b18] font-mono text-sm">{score} pts</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="text-[#5c4033]">Coins Earned:</span>
                  <span className="text-[#b45309] font-mono text-sm">+{Math.floor(score / 5)} 🪙</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="text-[#5c4033]">Experience:</span>
                  <span className="text-[#0369a1] font-mono text-sm">+{Math.floor(score / 3)} XP</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={restartGame}
                  className="px-5 py-2.5 rounded-xl bg-[#fff7ea] hover:bg-[#fde6c3] text-[#1e1b18] font-bold text-xs flex items-center gap-2 border-2 border-[#1e1b18] transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Play Again</span>
                </button>

                <button
                  onClick={() => {
                    sounds.playClick();
                    onClose();
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#f59e0b] hover:bg-[#fbbf24] text-[#1e1b18] border-2 border-[#1e1b18] font-black text-xs shadow-sm transition-all cursor-pointer"
                >
                  Claim Rewards & Return
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
