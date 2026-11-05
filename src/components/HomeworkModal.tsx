import React, { useState } from 'react';
import {
  HomeworkTask,
  DailyQuest,
  TeacherMessage,
  Classroom,
  MathHomeworkQuestion,
  HomeworkSubmission,
} from '../types';
import { sounds } from '../services/sound';
import confetti from 'canvas-confetti';
import {
  X,
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  Star,
  MessageSquare,
  Users,
  UserCheck,
  School,
  Send,
  HelpCircle,
  Brain,
  Lightbulb,
  Check,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

interface HomeworkModalProps {
  tasks: HomeworkTask[];
  messages?: TeacherMessage[];
  quests?: DailyQuest[];
  studentName?: string;
  studentClassId?: string;
  classes?: Classroom[];
  onJoinClass?: (codeOrClassId: string) => boolean;
  onMarkMessageRead?: (msgId: string) => void;
  onClose: () => void;
  onCompleteTask: (
    taskId: string,
    coins: number,
    xp: number,
    submission?: HomeworkSubmission
  ) => void;
  onClaimQuest?: (questId: string, coins: number, xp: number) => void;
  mode?: 'homework' | 'quests';
}

const STRATEGY_PRESETS = [
  'Place Value Decomposition',
  'Visual Bar Model / Diagram',
  'Inverse Operations & Verification',
  'Mental Math & Number Line',
  'Step-by-step Standard Algorithm',
];

export const getTaskQuestions = (task: HomeworkTask): MathHomeworkQuestion[] => {
  if (task.questions && task.questions.length > 0) return task.questions;
  if (
    task.competency.toLowerCase().includes('measurement') ||
    task.title.toLowerCase().includes('area') ||
    task.title.toLowerCase().includes('bridge')
  ) {
    return [
      {
        id: `${task.id}-q1`,
        question: 'Calculate the perimeter of a rectangle with length 15 meters and width 4 meters:',
        type: 'numeric',
        correctAnswer: '38',
        unit: 'meters',
        exampleAnswer: 'Sample Format: For a 6m × 2m rectangle, perimeter = 16m (Do not copy this sample)',
        hint: 'Perimeter = 2 × (Length + Width)',
      },
      {
        id: `${task.id}-q2`,
        question: 'Calculate the area of the same rectangle (length 15 m, width 4 m):',
        type: 'numeric',
        correctAnswer: '60',
        unit: 'm²',
        exampleAnswer: 'Sample Format: For a 6m × 2m rectangle, area = 12 m² (Do not copy this sample)',
        hint: 'Area = Length × Width',
      },
      {
        id: `${task.id}-q3`,
        question: 'If you have 5 wooden planks of 8 meters each, what is their combined length?',
        type: 'numeric',
        correctAnswer: '40',
        unit: 'meters',
        exampleAnswer: 'Sample Format: 3 planks of 4m = 12m (Sample format only)',
        hint: 'Multiply the quantity of planks by the length of each plank.',
      },
    ];
  }
  return [
    {
      id: `${task.id}-q1`,
      question: 'Decompose the number 5,640 into thousands, hundreds, tens, and ones:',
      type: 'multiple_choice',
      options: ['5,000 + 600 + 40', '500 + 60 + 4', '5,000 + 60 + 400', '50,000 + 640'],
      correctAnswer: '5,000 + 600 + 40',
      exampleAnswer: 'Sample Format: For 2,380 write 2,000 + 300 + 80 (Sample format only)',
      hint: 'Break each digit into its positional value.',
    },
    {
      id: `${task.id}-q2`,
      question: 'Calculate: 35 × 4 = ?',
      type: 'numeric',
      correctAnswer: '140',
      exampleAnswer: 'Sample Format: 25 × 3 = 75 (Sample format only)',
      hint: '(30 × 4) + (5 × 4) = 120 + 20',
    },
    {
      id: `${task.id}-q3`,
      question: 'What is 72 divided by 8?',
      type: 'numeric',
      correctAnswer: '9',
      exampleAnswer: 'Sample Format: 56 ÷ 7 = 8 (Sample format only)',
      hint: 'Recall the 8 times multiplication table.',
    },
  ];
};

export const HomeworkModal: React.FC<HomeworkModalProps> = ({
  tasks,
  messages = [],
  quests: initialQuests,
  studentName = 'Carolina',
  studentClassId = 'class-4a',
  classes = [],
  onJoinClass,
  onMarkMessageRead,
  onClose,
  onCompleteTask,
  onClaimQuest,
  mode = 'homework',
}) => {
  const [homeworkSubTab, setHomeworkSubTab] = useState<'tasks' | 'messages'>('tasks');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [showJoinClassForm, setShowJoinClassForm] = useState(false);
  const [joinStatusMsg, setJoinStatusMsg] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Homework Solver State
  const [solvingTask, setSolvingTask] = useState<HomeworkTask | null>(null);
  const [studentAnswers, setStudentAnswers] = useState<Record<string, string>>({});
  const [selectedStrategy, setSelectedStrategy] = useState<string>(STRATEGY_PRESETS[0]);
  const [studentMethodWork, setStudentMethodWork] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<{
    task: HomeworkTask;
    submission: HomeworkSubmission;
  } | null>(null);

  // Inspect completed submission state
  const [inspectingSubmissionTask, setInspectingSubmissionTask] = useState<HomeworkTask | null>(null);

  const [dailyQuests, setDailyQuests] = useState<DailyQuest[]>(
    initialQuests || [
      {
        id: 'quest-1',
        title: 'Complete 2 Math Lab Challenges',
        description: 'Solve mathematical inquiries in the laboratory gym to hone your analytical skills.',
        category: 'mathlab',
        progress: 1,
        total: 2,
        rewardCoins: 40,
        rewardXp: 80,
        completed: false,
        claimed: false,
      },
      {
        id: 'quest-2',
        title: 'Explore Sharing the Planet',
        description: 'Complete or replay an inquiry level in the Forest of Balance to restore ecosystem harmony.',
        category: 'adventure',
        progress: 2,
        total: 2,
        rewardCoins: 50,
        rewardXp: 100,
        completed: true,
        claimed: false,
      },
      {
        id: 'quest-3',
        title: 'Speed Sprint in Quick Thinking',
        description: 'Answer 5 rapid mental calculations correctly in the Quick Thinking challenge.',
        category: 'quickthinking',
        progress: 3,
        total: 5,
        rewardCoins: 35,
        rewardXp: 70,
        completed: false,
        claimed: false,
      },
      {
        id: 'quest-4',
        title: 'Care for Your Companion Pet',
        description: 'Feed your active companion pet a tasty healthy snack to boost their happiness.',
        category: 'pets',
        progress: 1,
        total: 1,
        rewardCoins: 25,
        rewardXp: 50,
        completed: true,
        claimed: false,
      },
    ]
  );

  const currentClassroom = classes.find((c) => c.id === studentClassId);

  // Filter tasks that belong to this student's class OR are assigned directly to this student
  const relevantTasks = tasks.filter((t) => {
    if (!t.targetType) return true;
    if (t.targetType === 'class') {
      return !t.targetClassId || t.targetClassId === studentClassId;
    }
    if (t.targetType === 'student') {
      return (
        t.targetStudentName?.toLowerCase() === studentName.toLowerCase() ||
        t.targetStudentId === 'stud-1'
      );
    }
    return true;
  });

  // Filter teacher messages that belong to this student's class OR are sent directly to this student
  const relevantMessages = messages.filter((m) => {
    if (m.targetType === 'class') {
      return !m.targetClassId || m.targetClassId === studentClassId;
    }
    if (m.targetType === 'student') {
      return (
        m.targetStudentName?.toLowerCase() === studentName.toLowerCase() ||
        m.targetStudentId === 'stud-1'
      );
    }
    return true;
  });

  const unreadMessagesCount = relevantMessages.filter((m) => !m.read).length;

  const handleStartSolving = (task: HomeworkTask) => {
    sounds.playClick();
    const questions = getTaskQuestions(task);
    setSolvingTask({ ...task, questions });
    setStudentAnswers({});
    setSelectedStrategy(STRATEGY_PRESETS[0]);
    setStudentMethodWork('');
    setValidationError(null);
    setSubmissionResult(null);
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setStudentAnswers((prev) => ({ ...prev, [questionId]: value }));
    setValidationError(null);
  };

  const handleSubmitHomework = () => {
    if (!solvingTask) return;
    const questions = solvingTask.questions || getTaskQuestions(solvingTask);

    // Validate all questions answered
    for (const q of questions) {
      const ans = studentAnswers[q.id]?.trim();
      if (!ans) {
        sounds.playError();
        setValidationError('Please answer all math questions before submitting your homework.');
        return;
      }
    }

    // Validate method/reasoning explanation
    if (!studentMethodWork.trim() || studentMethodWork.trim().length < 8) {
      sounds.playError();
      setValidationError(
        'Please write a brief prompt of the method you used to figure out your answers so your teacher can review it.'
      );
      return;
    }

    // Evaluate answers
    let correctCount = 0;
    questions.forEach((q) => {
      const studentAns = (studentAnswers[q.id] || '').trim().toLowerCase();
      const expectedAns = q.correctAnswer.trim().toLowerCase();
      if (studentAns === expectedAns) {
        correctCount++;
      } else {
        // Also accept numeric match if numerical
        const sNum = parseFloat(studentAns);
        const eNum = parseFloat(expectedAns);
        if (!isNaN(sNum) && !isNaN(eNum) && Math.abs(sNum - eNum) < 0.001) {
          correctCount++;
        }
      }
    });

    const totalQuestions = questions.length;
    const gradeOutOf10 = Math.round((correctCount / totalQuestions) * 10 * 10) / 10;
    const gradePct = Math.round((correctCount / totalQuestions) * 100);

    const submission: HomeworkSubmission = {
      studentId: 'stud-1',
      studentName: studentName || 'Carolina Gomez',
      avatarId: 'cat-orange',
      submittedAt: 'Just now',
      gradeOutOf10,
      gradePct,
      correctCount,
      totalQuestions,
      studentMethod: `${selectedStrategy}: ${studentMethodWork.trim()}`,
      strategyCategory: selectedStrategy,
      answers: studentAnswers,
    };

    sounds.playSuccess();
    confetti({ particleCount: 60, spread: 65, origin: { y: 0.6 } });

    // Save submission result to display review modal
    setSubmissionResult({ task: solvingTask, submission });
  };

  const handleConfirmSubmission = () => {
    if (!submissionResult) return;
    const { task, submission } = submissionResult;
    onCompleteTask(task.id, task.rewardCoins, task.rewardXp, submission);
    setSolvingTask(null);
    setSubmissionResult(null);
  };

  const handleClaimQuest = (quest: DailyQuest) => {
    if (!quest.completed || quest.claimed) return;
    sounds.playCoin();
    confetti({ particleCount: 40, spread: 55, origin: { y: 0.6 } });
    setDailyQuests((prev) =>
      prev.map((q) => (q.id === quest.id ? { ...q, claimed: true } : q))
    );
    if (onClaimQuest) {
      onClaimQuest(quest.id, quest.rewardCoins, quest.rewardXp);
    } else {
      onCompleteTask(quest.id, quest.rewardCoins, quest.rewardXp);
    }
  };

  const handleJoinClassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim() || !onJoinClass) return;
    const ok = onJoinClass(joinCodeInput.trim());
    if (ok) {
      sounds.playSuccess();
      confetti({ particleCount: 40, spread: 50 });
      setJoinStatusMsg({
        type: 'success',
        text: 'Successfully joined the classroom!',
      });
      setJoinCodeInput('');
      setTimeout(() => {
        setShowJoinClassForm(false);
        setJoinStatusMsg(null);
      }, 1500);
    } else {
      sounds.playError();
      setJoinStatusMsg({
        type: 'error',
        text: 'Class code not found. Try SPARK-4A or SPARK-4B.',
      });
    }
  };

  const isQuestsMode = mode === 'quests';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#1e1b18]/65 backdrop-blur-xs font-game">
      <div className="relative w-full max-w-2xl bg-[#fbf5eb] border-[3px] border-[#1e1b18] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[#1e1b18]">
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#fde6c3] border-b-[2.5px] border-[#1e1b18] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#f59e0b] border-2 border-[#1e1b18] flex items-center justify-center shadow-xs">
              {isQuestsMode ? (
                <Star className="w-5 h-5 text-[#1e1b18]" />
              ) : solvingTask ? (
                <Brain className="w-5 h-5 text-[#1e1b18]" />
              ) : (
                <BookOpen className="w-5 h-5 text-[#1e1b18]" />
              )}
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg text-[#1e1b18] font-game">
                {isQuestsMode
                  ? 'Daily Quests'
                  : solvingTask
                  ? `Math Assignment · ${solvingTask.title}`
                  : 'Classroom Homework & Messages'}
              </h2>
              <p className="text-xs text-[#5c4033] font-medium">
                {isQuestsMode
                  ? 'Complete daily mathematical challenges to claim bonus coins and XP'
                  : solvingTask
                  ? 'Solve all math questions and record your method before submitting to your teacher'
                  : 'Assigned tasks & direct messages from your teacher for your class or you personally'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              if (solvingTask) {
                setSolvingTask(null);
                setSubmissionResult(null);
              } else if (inspectingSubmissionTask) {
                setInspectingSubmissionTask(null);
              } else {
                onClose();
              }
            }}
            className="p-1.5 rounded-xl bg-[#f3d5ab] hover:bg-[#e8c496] text-[#1e1b18] transition-all border-2 border-[#1e1b18] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[78vh] overflow-y-auto font-game bg-[#fbf5eb]">
          {/* VIEW A: INTERACTIVE HOMEWORK MATH SOLVER */}
          {solvingTask && !submissionResult && (
            <div className="space-y-4">
              {/* Task Header info */}
              <div className="p-3.5 bg-[#fde6c3] border-2 border-[#1e1b18] rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xs">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-[#fde68a] px-2 py-0.5 rounded-md border border-[#1e1b18]">
                      {solvingTask.competency}
                    </span>
                    <span className="text-xs text-[#5c4033] font-bold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Due: {solvingTask.dueDate}</span>
                    </span>
                  </div>
                  <h3 className="font-black text-sm sm:text-base text-[#1e1b18]">{solvingTask.title}</h3>
                  <p className="text-xs text-[#5c4033] font-medium">
                    Assigned by: <span className="font-bold text-[#1e1b18]">{solvingTask.assignedBy}</span>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right text-xs font-bold">
                    <div className="text-[#b45309]">+{solvingTask.rewardCoins} 🪙</div>
                    <div className="text-[#0369a1]">+{solvingTask.rewardXp} XP</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setSolvingTask(null);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#fff7ea] hover:bg-[#f3d5ab] text-[#1e1b18] border-2 border-[#1e1b18] text-xs font-bold cursor-pointer"
                  >
                    Back to List
                  </button>
                </div>
              </div>

              {/* Notice Banner */}
              <div className="p-3 bg-[#e0f2fe] border-2 border-[#0284c7] rounded-2xl flex items-start gap-2.5 text-xs text-[#0369a1]">
                <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-black">Teacher Grading Notice: </span>
                  You must answer all math questions and provide your method prompt. Your calculated grade
                  (Objective Score) and reasoning will be recorded for your teacher to review.
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                {(solvingTask.questions || getTaskQuestions(solvingTask)).map((q, idx) => {
                  const studentVal = studentAnswers[q.id] || '';

                  return (
                    <div
                      key={q.id}
                      className="p-4 rounded-2xl bg-[#fff7ea] border-2 border-[#1e1b18] space-y-3 shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-[#5c4033] uppercase tracking-wide">
                          Question {idx + 1} of {(solvingTask.questions || []).length}
                        </span>
                        {q.hint && (
                          <span className="text-[11px] text-[#059669] font-bold flex items-center gap-1">
                            <Lightbulb className="w-3.5 h-3.5" />
                            <span>Hint: {q.hint}</span>
                          </span>
                        )}
                      </div>

                      <div className="text-sm font-black text-[#1e1b18]">{q.question}</div>



                      {/* Question Answer Inputs */}
                      {q.type === 'multiple_choice' && q.options ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {q.options.map((opt) => {
                            const isSelected = studentVal === opt;
                            return (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => {
                                  sounds.playClick();
                                  handleAnswerChange(q.id, opt);
                                }}
                                className={`p-2.5 rounded-xl text-xs font-bold border-2 transition-all text-left flex items-center justify-between cursor-pointer ${
                                  isSelected
                                    ? 'bg-[#f59e0b] text-[#1e1b18] border-[#1e1b18] shadow-xs'
                                    : 'bg-[#fbf5eb] hover:bg-[#fde6c3] text-[#1e1b18] border-[#1e1b18]/40'
                                }`}
                              >
                                <span>{opt}</span>
                                {isSelected && <Check className="w-4 h-4 text-[#1e1b18]" />}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="text"
                            value={studentVal}
                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                            placeholder="Type your final answer..."
                            className="flex-1 px-3 py-2 rounded-xl bg-[#fbf5eb] border-2 border-[#1e1b18] text-xs font-bold text-[#1e1b18] outline-none focus:ring-2 focus:ring-[#f59e0b]"
                          />
                          {q.unit && (
                            <span className="text-xs font-black text-[#5c4033] px-2 py-1 rounded-lg bg-[#fde6c3] border border-[#1e1b18]">
                              {q.unit}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Prompt / Method of Figuring It Out Section */}
              <div className="p-4 rounded-2xl bg-[#fff7ea] border-2 border-[#1e1b18] space-y-3 shadow-xs">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#78b3ea] border-2 border-[#1e1b18] flex items-center justify-center">
                    <Brain className="w-4 h-4 text-[#1e1b18]" />
                  </div>
                  <div>
                    <h4 className="font-black text-xs sm:text-sm text-[#1e1b18]">
                      Your Method & Reasoning (Prompt for Teacher)
                    </h4>
                    <p className="text-[11px] text-[#5c4033] font-medium">
                      Select your problem-solving strategy and write down how you figured out your answers.
                    </p>
                  </div>
                </div>

                {/* Strategy tags */}
                <div className="flex flex-wrap gap-1.5">
                  {STRATEGY_PRESETS.map((strat) => (
                    <button
                      key={strat}
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        setSelectedStrategy(strat);
                      }}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border-2 transition-all cursor-pointer ${
                        selectedStrategy === strat
                          ? 'bg-[#f59e0b] text-[#1e1b18] border-[#1e1b18] shadow-xs'
                          : 'bg-[#fbf5eb] hover:bg-[#fde6c3] text-[#5c4033] border-[#1e1b18]/30'
                      }`}
                    >
                      {strat}
                    </button>
                  ))}
                </div>

                {/* Written Prompt / Work */}
                <div>
                  <textarea
                    rows={3}
                    value={studentMethodWork}
                    onChange={(e) => {
                      setStudentMethodWork(e.target.value);
                      setValidationError(null);
                    }}
                    placeholder="Describe step-by-step how you figured out the answers..."
                    className="w-full px-3 py-2 rounded-xl bg-[#fbf5eb] border-2 border-[#1e1b18] text-xs font-medium text-[#1e1b18] outline-none focus:ring-2 focus:ring-[#f59e0b] resize-none"
                  />
                  <div className="text-right text-[10px] text-[#5c4033] font-bold mt-1">
                    Strategy: <span className="text-[#b45309] font-black">{selectedStrategy}</span>
                  </div>
                </div>
              </div>

              {/* Validation Error */}
              {validationError && (
                <div className="p-3 rounded-2xl bg-[#fecdd3] border-2 border-[#e11d48] text-xs font-bold text-[#9f1239] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setSolvingTask(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#fff7ea] hover:bg-[#f3d5ab] text-[#1e1b18] border-2 border-[#1e1b18] text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitHomework}
                  className="px-5 py-2.5 rounded-xl bg-[#34d399] hover:bg-[#10b981] text-[#1e1b18] border-2 border-[#1e1b18] text-xs font-black shadow-xs flex items-center gap-2 cursor-pointer transition-all transform active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Submit Homework & Calculate Grade</span>
                </button>
              </div>
            </div>
          )}

          {/* VIEW B: SUBMISSION CONFIRMATION / GRADE RESULT MODAL */}
          {submissionResult && (
            <div className="p-5 rounded-2xl bg-[#fde6c3] border-2 border-[#1e1b18] space-y-4 shadow-md text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#34d399] border-2 border-[#1e1b18] flex items-center justify-center text-2xl shadow-xs">
                🎓
              </div>

              <div>
                <h3 className="text-lg font-black text-[#1e1b18]">Homework Submitted!</h3>
                <p className="text-xs text-[#5c4033] font-medium">
                  Your solutions and reasoning have been recorded for your teacher's analytics interface.
                </p>
              </div>

              {/* Grade Callout (Objective Score only) */}
              <div className="p-4 rounded-2xl bg-[#fff7ea] border-2 border-[#1e1b18] max-w-sm mx-auto space-y-2">
                <div className="text-xs font-black uppercase text-[#5c4033] tracking-wider">
                  Assigned Grade (Objective Score)
                </div>
                <div className="text-3xl font-black text-[#059669]">
                  {submissionResult.submission.gradeOutOf10.toFixed(1)} / 10
                </div>
                <div className="text-xs font-bold text-[#1e1b18]">
                  Accuracy: {submissionResult.submission.gradePct}% ({submissionResult.submission.correctCount} of{' '}
                  {submissionResult.submission.totalQuestions} questions correct)
                </div>
              </div>

              {/* Reasoning prompt preview */}
              <div className="p-3 rounded-2xl bg-[#fff7ea] border-2 border-[#1e1b18] text-left text-xs space-y-1">
                <div className="font-black text-[#5c4033] uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5 text-[#b45309]" />
                  <span>Student Reasoning Prompt sent to Teacher:</span>
                </div>
                <p className="font-medium text-[#1e1b18] italic bg-[#fbf5eb] p-2.5 rounded-xl border border-[#1e1b18]/20">
                  "{submissionResult.submission.studentMethod}"
                </p>
              </div>

              {/* Rewards */}
              <div className="flex items-center justify-center gap-4 text-xs font-black">
                <span className="px-3 py-1.5 rounded-xl bg-[#fef3c7] border border-[#1e1b18] text-[#b45309]">
                  +{submissionResult.task.rewardCoins} 🪙 Coins Earned
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-[#e0f2fe] border border-[#1e1b18] text-[#0369a1]">
                  +{submissionResult.task.rewardXp} XP Gained
                </span>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleConfirmSubmission}
                  className="px-6 py-2.5 rounded-xl bg-[#f59e0b] hover:bg-[#fbbf24] text-[#1e1b18] border-2 border-[#1e1b18] text-xs font-black shadow-xs cursor-pointer transition-all transform active:scale-95"
                >
                  Done · Return to Tasks
                </button>
              </div>
            </div>
          )}

          {/* VIEW C: INSPECT PAST COMPLETED SUBMISSION */}
          {inspectingSubmissionTask && !solvingTask && !submissionResult && (
            <div className="p-4 rounded-2xl bg-[#fff7ea] border-2 border-[#1e1b18] space-y-3 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b-2 border-[#1e1b18]/15">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-[#059669]">
                    Completed Homework Inspection
                  </div>
                  <h3 className="font-black text-sm text-[#1e1b18]">{inspectingSubmissionTask.title}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setInspectingSubmissionTask(null)}
                  className="px-3 py-1 rounded-xl bg-[#fde6c3] border border-[#1e1b18] text-xs font-bold cursor-pointer"
                >
                  Close Review
                </button>
              </div>

              {inspectingSubmissionTask.submission ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-[#d1fae5] border-2 border-[#059669] flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-black uppercase text-[#065f46]">
                        Grade (Objective Score)
                      </div>
                      <div className="text-xl font-black text-[#065f46]">
                        {inspectingSubmissionTask.submission.gradeOutOf10.toFixed(1)} / 10 (
                        {inspectingSubmissionTask.submission.gradePct}%)
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#065f46]">
                      Submitted: {inspectingSubmissionTask.submission.submittedAt}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#fbf5eb] border-2 border-[#1e1b18] space-y-1.5">
                    <div className="text-[10px] font-black uppercase text-[#5c4033] flex items-center gap-1.5">
                      <Brain className="w-3.5 h-3.5 text-[#b45309]" />
                      <span>Student's Reasoning Prompt for Teacher:</span>
                    </div>
                    <p className="text-xs text-[#1e1b18] font-medium italic">
                      "{inspectingSubmissionTask.submission.studentMethod}"
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-[#5c4033] font-medium py-3 text-center">
                  Task completed directly.
                </div>
              )}
            </div>
          )}

          {/* VIEW D: NORMAL HOMEWORK & TEACHER MESSAGES (When not solving) */}
          {!solvingTask && !submissionResult && !isQuestsMode && (
            <div className="space-y-4">
              {/* Student Classroom Bar & Join Class Option */}
              <div className="p-3.5 rounded-2xl bg-[#fde6c3] border-2 border-[#1e1b18] flex flex-col gap-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#78b3ea] border-2 border-[#1e1b18] flex items-center justify-center">
                      <School className="w-4 h-4 text-[#1e1b18]" />
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-wider text-[#5c4033]">
                        Enrolled Classroom
                      </div>
                      <div className="text-xs sm:text-sm font-black text-[#1e1b18] flex items-center gap-2">
                        <span>{currentClassroom ? currentClassroom.name : 'Class 4A'}</span>
                        {currentClassroom && (
                          <span className="px-2 py-0.5 rounded-md bg-[#fff7ea] border border-[#1e1b18] text-[10px] font-mono text-[#b45309]">
                            Code: {currentClassroom.code}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setShowJoinClassForm(!showJoinClassForm);
                      setJoinStatusMsg(null);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#fff7ea] hover:bg-[#f59e0b] text-[#1e1b18] border-2 border-[#1e1b18] text-xs font-black transition-all cursor-pointer shadow-2xs"
                  >
                    {showJoinClassForm ? 'Cancel' : 'Join / Switch Class'}
                  </button>
                </div>

                {showJoinClassForm && (
                  <div className="pt-2.5 border-t-2 border-[#1e1b18]/15 space-y-2.5">
                    <form onSubmit={handleJoinClassSubmit} className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={joinCodeInput}
                        onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                        placeholder="Enter Teacher Class Code"
                        className="flex-1 px-3 py-1.5 rounded-xl bg-[#fff7ea] border-2 border-[#1e1b18] text-xs font-bold text-[#1e1b18] uppercase outline-none focus:ring-2 focus:ring-[#f59e0b]"
                      />
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-xl bg-[#34d399] hover:bg-[#10b981] text-[#1e1b18] border-2 border-[#1e1b18] text-xs font-black cursor-pointer"
                      >
                        Join by Code
                      </button>
                    </form>

                    {classes.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-black text-[#5c4033] uppercase mr-1">
                          Available Classes:
                        </span>
                        {classes.map((cls) => {
                          const isCurrent = cls.id === studentClassId;
                          return (
                            <button
                              key={cls.id}
                              type="button"
                              onClick={() => {
                                if (onJoinClass) {
                                  onJoinClass(cls.id);
                                  sounds.playSuccess();
                                  setShowJoinClassForm(false);
                                }
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border border-[#1e1b18] cursor-pointer transition-all ${
                                isCurrent
                                  ? 'bg-[#f59e0b] text-[#1e1b18]'
                                  : 'bg-[#fff7ea] hover:bg-[#fde68a] text-[#5c4033]'
                              }`}
                            >
                              {cls.name} ({cls.code})
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {joinStatusMsg && (
                      <div
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border border-[#1e1b18] ${
                          joinStatusMsg.type === 'success'
                            ? 'bg-[#d1fae5] text-[#065f46]'
                            : 'bg-[#fecdd3] text-[#9f1239]'
                        }`}
                      >
                        {joinStatusMsg.text}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Sub-tab Switcher: Tasks vs Teacher Messages */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-[#f3d5ab] rounded-2xl border-2 border-[#1e1b18]">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setHomeworkSubTab('tasks');
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    homeworkSubTab === 'tasks'
                      ? 'bg-[#f59e0b] text-[#1e1b18] border-2 border-[#1e1b18] shadow-2xs'
                      : 'text-[#5c4033] hover:text-[#1e1b18]'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Homework Tasks ({relevantTasks.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setHomeworkSubTab('messages');
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    homeworkSubTab === 'messages'
                      ? 'bg-[#78b3ea] text-[#1e1b18] border-2 border-[#1e1b18] shadow-2xs'
                      : 'text-[#5c4033] hover:text-[#1e1b18]'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Teacher Messages ({relevantMessages.length})</span>
                  {unreadMessagesCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black border border-[#1e1b18]">
                      {unreadMessagesCount}
                    </span>
                  )}
                </button>
              </div>

              {/* SUB-TAB 1: HOMEWORK TASKS */}
              {homeworkSubTab === 'tasks' && (
                <div className="space-y-3">
                  {relevantTasks.length === 0 ? (
                    <div className="text-center py-10 text-[#5c4033] text-sm font-medium">
                      No pending homework tasks assigned to your class or you yet. Check back soon!
                    </div>
                  ) : (
                    relevantTasks.map((task) => {
                      const isCompleted = task.status === 'completed';
                      const isPersonal = task.targetType === 'student';
                      const submission = task.submission;

                      return (
                        <div
                          key={task.id}
                          className={`p-4 rounded-2xl border-2 border-[#1e1b18] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs ${
                            isCompleted
                              ? 'bg-[#f3d5ab]/60 opacity-90'
                              : 'bg-[#fff7ea] hover:bg-[#fde6c3]'
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="text-[10px] font-black text-[#1e1b18] uppercase tracking-wider bg-[#fde68a] px-2 py-0.5 rounded-md border border-[#1e1b18]">
                                {task.competency}
                              </span>
                              <span
                                className={`text-[10px] font-black px-2 py-0.5 rounded-md border border-[#1e1b18] flex items-center gap-1 ${
                                  isPersonal
                                    ? 'bg-[#a7f3d0] text-[#065f46]'
                                    : 'bg-[#bae6fd] text-[#075985]'
                                }`}
                              >
                                {isPersonal ? (
                                  <>
                                    <UserCheck className="w-3 h-3" />
                                    <span>Personal Task ({task.targetStudentName || studentName})</span>
                                  </>
                                ) : (
                                  <>
                                    <Users className="w-3 h-3" />
                                    <span>Class Task ({task.targetClassName || 'Your Class'})</span>
                                  </>
                                )}
                              </span>
                              <span className="text-xs text-[#5c4033] font-bold flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{task.dueDate}</span>
                              </span>
                            </div>

                            <h4 className="font-black text-sm text-[#1e1b18]">{task.title}</h4>
                            <p className="text-xs text-[#5c4033] mt-0.5 font-medium">
                              Assigned by:{' '}
                              <span className="font-bold text-[#1e1b18]">{task.assignedBy}</span>
                            </p>

                            {/* If completed, show student's Grade and Prompt */}
                            {isCompleted && submission && (
                              <div className="mt-2 p-2 rounded-xl bg-[#d1fae5]/80 border border-[#059669] text-xs">
                                <div className="flex items-center gap-2 font-black text-[#065f46]">
                                  <span>Grade: {submission.gradeOutOf10.toFixed(1)}/10</span>
                                  <span>({submission.gradePct}%)</span>
                                </div>
                                <div className="text-[11px] text-[#065f46] italic line-clamp-1 mt-0.5">
                                  Method: "{submission.studentMethod}"
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                            <div className="text-right text-xs font-bold">
                              <div className="text-[#b45309]">+{task.rewardCoins} 🪙</div>
                              <div className="text-[#0369a1]">+{task.rewardXp} XP</div>
                            </div>

                            {isCompleted ? (
                              <div className="flex items-center gap-2">
                                <span className="px-3 py-1.5 bg-[#d1fae5] text-[#065f46] font-bold text-xs rounded-xl flex items-center gap-1.5 border-2 border-[#1e1b18]">
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span>Completed</span>
                                </span>
                                {submission && (
                                  <button
                                    type="button"
                                    onClick={() => setInspectingSubmissionTask(task)}
                                    className="p-1.5 rounded-xl bg-[#fff7ea] hover:bg-[#fde6c3] text-[#1e1b18] border-2 border-[#1e1b18] text-xs font-bold cursor-pointer"
                                    title="View Grade & Method"
                                  >
                                    <FileCheck className="w-4 h-4 text-[#059669]" />
                                  </button>
                                )}
                              </div>
                            ) : (
                              <button
                                onClick={() => handleStartSolving(task)}
                                className="px-4 py-2 bg-[#f59e0b] hover:bg-[#fbbf24] text-[#1e1b18] border-2 border-[#1e1b18] font-black text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all transform active:scale-95 cursor-pointer"
                              >
                                <span>Do Homework</span>
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* SUB-TAB 2: TEACHER MESSAGES */}
              {homeworkSubTab === 'messages' && (
                <div className="space-y-3">
                  {relevantMessages.length === 0 ? (
                    <div className="text-center py-10 text-[#5c4033] text-sm font-medium">
                      No messages from your teacher yet.
                    </div>
                  ) : (
                    relevantMessages.map((msg) => {
                      const isPersonal = msg.targetType === 'student';
                      return (
                        <div
                          key={msg.id}
                          onClick={() => {
                            if (!msg.read && onMarkMessageRead) {
                              onMarkMessageRead(msg.id);
                            }
                          }}
                          className={`p-4 rounded-2xl border-2 border-[#1e1b18] transition-all space-y-2 shadow-xs cursor-pointer ${
                            msg.read ? 'bg-[#fff7ea]' : 'bg-[#fde68a]/80 ring-2 ring-[#f59e0b]'
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] font-black px-2 py-0.5 rounded-md border border-[#1e1b18] flex items-center gap-1 ${
                                  isPersonal
                                    ? 'bg-[#a7f3d0] text-[#065f46]'
                                    : 'bg-[#bae6fd] text-[#075985]'
                                }`}
                              >
                                {isPersonal ? (
                                  <>
                                    <UserCheck className="w-3 h-3" />
                                    <span>Direct to You ({msg.targetStudentName || studentName})</span>
                                  </>
                                ) : (
                                  <>
                                    <Users className="w-3 h-3" />
                                    <span>Class Announcement ({msg.targetClassName || 'Class'})</span>
                                  </>
                                )}
                              </span>
                              {!msg.read && (
                                <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black border border-[#1e1b18]">
                                  NEW
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] font-bold text-[#5c4033]">
                              {msg.createdAt}
                            </span>
                          </div>

                          <h4 className="font-black text-sm text-[#1e1b18] flex items-center gap-1.5">
                            <Send className="w-3.5 h-3.5 text-[#b45309]" />
                            <span>{msg.title}</span>
                          </h4>

                          <p className="text-xs text-[#1e1b18] leading-relaxed bg-[#fbf5eb] p-3 rounded-xl border border-[#1e1b18]/30 font-medium">
                            {msg.content}
                          </p>

                          <div className="flex items-center justify-between text-[11px] text-[#5c4033] font-bold pt-1">
                            <span>From: {msg.senderName}</span>
                            {msg.read ? (
                              <span className="text-[#059669] flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Read
                              </span>
                            ) : (
                              <span className="text-[#b45309] underline">Click to mark as read</span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          )}

          {/* VIEW E: DAILY QUESTS ONLY */}
          {!solvingTask && !submissionResult && isQuestsMode && (
            <div className="space-y-3">
              <div className="p-3 bg-[#fde6c3] border-2 border-[#1e1b18] rounded-2xl flex items-center justify-between text-xs text-[#1e1b18]">
                <span className="flex items-center gap-2 font-bold">
                  <span>⭐</span>
                  <span>Daily Inquiry Quests refresh daily. Complete them to earn bonus coins and XP!</span>
                </span>
              </div>

              {dailyQuests.map((quest) => {
                const isReadyToClaim = quest.completed && !quest.claimed;
                const percent = Math.min(100, Math.round((quest.progress / quest.total) * 100));

                return (
                  <div
                    key={quest.id}
                    className={`p-4 rounded-2xl border-2 border-[#1e1b18] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs ${
                      quest.claimed
                        ? 'bg-[#f3d5ab]/60 opacity-75'
                        : isReadyToClaim
                        ? 'bg-[#fde68a] ring-2 ring-[#f59e0b]'
                        : 'bg-[#fff7ea] hover:bg-[#fde6c3]'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black text-[#1e1b18] uppercase tracking-wider bg-[#78b3ea]/40 px-2 py-0.5 rounded-md border border-[#1e1b18]">
                          {quest.category}
                        </span>
                        <span className="text-xs text-[#5c4033] font-bold">
                          Progress: {quest.progress} / {quest.total}
                        </span>
                      </div>

                      <h4 className="font-black text-sm text-[#1e1b18]">{quest.title}</h4>
                      <p className="text-xs text-[#5c4033] mt-0.5 font-medium">{quest.description}</p>

                      {/* Progress bar */}
                      <div className="w-full max-w-xs h-2.5 bg-[#d8b892] rounded-full mt-2 overflow-hidden border border-[#1e1b18]">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            quest.completed ? 'bg-[#10b981]' : 'bg-[#f59e0b]'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-right text-xs font-bold">
                        <div className="text-[#b45309]">+{quest.rewardCoins} 🪙</div>
                        <div className="text-[#0369a1]">+{quest.rewardXp} XP</div>
                      </div>

                      {quest.claimed ? (
                        <span className="px-3 py-1.5 bg-[#d1fae5] text-[#065f46] font-bold text-xs rounded-xl flex items-center gap-1.5 border-2 border-[#1e1b18]">
                          <CheckCircle2 className="w-4 h-4 text-[#059669]" />
                          <span>Claimed</span>
                        </span>
                      ) : isReadyToClaim ? (
                        <button
                          onClick={() => handleClaimQuest(quest)}
                          className="px-4 py-2 bg-[#f59e0b] hover:bg-[#fbbf24] text-[#1e1b18] border-2 border-[#1e1b18] font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>Claim Reward</span>
                        </button>
                      ) : (
                        <span className="px-3 py-1.5 bg-[#f3d5ab] text-[#5c4033] font-bold text-xs rounded-xl border-2 border-[#1e1b18] flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>In Progress</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
