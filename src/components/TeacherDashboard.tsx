import React, { useState } from 'react';
import {
  StudentAnalytics,
  HomeworkTask,
  UnitOfInquiry,
  Classroom,
  TeacherMessage,
  PYPYear,
} from '../types';
import {
  CLASS_STUDENTS_ANALYTICS,
  PYP_UNITS,
  INITIAL_CLASSES,
  INITIAL_MESSAGES,
} from '../data/mockData';
import { PixelAvatar } from './PixelAvatar';
import { SparkRadarChart } from './SparkRadarChart';
import { sounds } from '../services/sound';
import {
  GraduationCap,
  Users,
  BarChart,
  BookPlus,
  Zap,
  Shield,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Lock,
  Unlock,
  PlusCircle,
  RotateCcw,
  X,
  MessageSquare,
  Send,
  School,
  UserPlus,
  Copy,
  Check,
  Sparkles,
  Clock,
  User,
} from 'lucide-react';

interface TeacherDashboardProps {
  units?: UnitOfInquiry[];
  classes?: Classroom[];
  students?: StudentAnalytics[];
  homeworkList?: HomeworkTask[];
  messagesList?: TeacherMessage[];
  onToggleUnitLock?: (unitId: string, locked: boolean) => void;
  onCreateClass?: (newClass: Classroom, seedSampleStudents?: boolean) => void;
  onUpdateStudents?: (updated: StudentAnalytics[]) => void;
  onBackToStudent: () => void;
  onAssignNewHomework: (task: HomeworkTask) => void;
  onSendNewMessage?: (msg: TeacherMessage) => void;
}

export interface ImprovementMetrics {
  baselineAvg: number;
  recentAvg: number;
  cumulativeAvg: number;
  objectiveScorePct: number;
  pointDelta: number;
  improvementPct: number;
  isSignificant: boolean;
  tierLabel: string;
  tierColor: string;
  pedagogicalSummary: string;
}

export function calculateStudentImprovement(
  previousScores: number[],
  recentScores: number[]
): ImprovementMetrics {
  const safePrev = previousScores.length > 0 ? previousScores : [1];
  const safeRecent = recentScores.length > 0 ? recentScores : safePrev;
  const allScores = [...safePrev, ...safeRecent];

  const baselineAvg =
    safePrev.reduce((sum, val) => sum + val, 0) / safePrev.length;
  const recentAvg =
    safeRecent.reduce((sum, val) => sum + val, 0) / safeRecent.length;
  const cumulativeAvg =
    allScores.reduce((sum, val) => sum + val, 0) / allScores.length;

  const objectiveScorePct = Math.round(recentAvg * 100) / 10;
  const pointDelta = recentAvg - baselineAvg;
  const improvementPct =
    baselineAvg > 0
      ? Math.round(((recentAvg - baselineAvg) / baselineAvg) * 1000) / 10
      : 0;

  const isSignificant = improvementPct >= 25;

  let tierLabel = 'Steady Progress';
  let tierColor = 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
  let pedagogicalSummary =
    'Consistent upward progression relative to personal baseline.';

  if (improvementPct >= 25) {
    tierLabel = 'Significant Improvement';
    tierColor =
      'bg-emerald-500/20 text-emerald-300 border-emerald-400/60 shadow-sm shadow-emerald-500/20';
    pedagogicalSummary = `Major developmental leap! Grade (Objective score) rose from ${baselineAvg.toFixed(
      1
    )}/10 to ${recentAvg.toFixed(1)}/10 (+${improvementPct.toFixed(
      1
    )}% Improvement Percentage).`;
  } else if (improvementPct >= 10) {
    tierLabel = 'Strong Growth';
    tierColor = 'bg-teal-500/20 text-teal-300 border-teal-500/40';
    pedagogicalSummary = `Solid growth (+${improvementPct.toFixed(
      1
    )}%) above historical baseline of ${baselineAvg.toFixed(
      1
    )}/10, reaching a Grade of ${recentAvg.toFixed(1)}/10 (${objectiveScorePct.toFixed(0)}%).`;
  } else if (improvementPct > 0) {
    tierLabel = 'Steady Mastery';
    tierColor = 'bg-sky-500/20 text-sky-300 border-sky-500/40';
    pedagogicalSummary = `High objective accuracy (${recentAvg.toFixed(
      1
    )}/10) with +${improvementPct.toFixed(
      1
    )}% improvement percentage.`;
  } else if (improvementPct === 0) {
    tierLabel = 'Stable Baseline';
    tierColor = 'bg-slate-700/40 text-slate-300 border-slate-600';
    pedagogicalSummary = 'Performing at the exact personal baseline average.';
  } else {
    tierLabel = 'Needs Support';
    tierColor = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    pedagogicalSummary = `Recent Grade (${recentAvg.toFixed(
      1
    )}/10) dipped below previous baseline (${baselineAvg.toFixed(
      1
    )}/10). Targeted scaffolding recommended.`;
  }

  return {
    baselineAvg,
    recentAvg,
    cumulativeAvg,
    objectiveScorePct,
    pointDelta,
    improvementPct,
    isSignificant,
    tierLabel,
    tierColor,
    pedagogicalSummary,
  };
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  units = PYP_UNITS,
  classes: propClasses,
  students: propStudents,
  homeworkList = [],
  messagesList: propMessages,
  onToggleUnitLock,
  onCreateClass,
  onUpdateStudents,
  onBackToStudent,
  onAssignNewHomework,
  onSendNewMessage,
}) => {
  const [localClasses, setLocalClasses] = useState<Classroom[]>(INITIAL_CLASSES);
  const [localStudents, setLocalStudents] = useState<StudentAnalytics[]>(
    CLASS_STUDENTS_ANALYTICS
  );
  const [localMessages, setLocalMessages] =
    useState<TeacherMessage[]>(INITIAL_MESSAGES);

  const classes = propClasses || localClasses;
  const allStudents = propStudents || localStudents;
  const messages = propMessages || localMessages;

  const updateStudentsList = (next: StudentAnalytics[]) => {
    setLocalStudents(next);
    if (onUpdateStudents) {
      onUpdateStudents(next);
    }
  };

  // Active Classroom Selection
  const [activeClassId, setActiveClassId] = useState<string>(
    classes[0]?.id || 'class-4a'
  );
  const activeClass =
    classes.find((c) => c.id === activeClassId) || classes[0];

  // Create New Class Modal / Drawer State
  const [isCreateClassOpen, setIsCreateClassOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassYear, setNewClassYear] = useState<PYPYear>('Y4');
  const [newClassCode, setNewClassCode] = useState('');
  const [newClassDesc, setNewClassDesc] = useState('');
  const [seedSampleStudents, setSeedSampleStudents] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Enroll Student into Active Class Modal State
  const [isEnrollStudentOpen, setIsEnrollStudentOpen] = useState(false);
  const [newStudentNameInput, setNewStudentNameInput] = useState('');

  const [activeTab, setActiveTab] = useState<
    'students' | 'analytics' | 'assign' | 'quickSession' | 'unitPermissions'
  >('students');

  const [sortBy, setSortBy] = useState<'improvement' | 'objective'>(
    'improvement'
  );

  // Filter students belonging to the currently selected class
  const classStudents = allStudents.filter(
    (s) => (s.classId || 'class-4a') === activeClassId
  );

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    classStudents[0]?.id || null
  );
  const [newScoreInput, setNewScoreInput] = useState<number>(5);

  // Task & Message Composer State (Targeted to Specific Class OR Specific Student)
  const [composerMode, setComposerMode] = useState<'homework' | 'message'>(
    'homework'
  );
  const [targetType, setTargetType] = useState<'class' | 'student'>('class');
  const [targetClassId, setTargetClassId] = useState<string>(activeClassId);
  const [targetStudentId, setTargetStudentId] = useState<string>(
    allStudents[0]?.id || 'stud-1'
  );

  // Homework fields
  const [hwTitle, setHwTitle] = useState(
    'Equivalent Fractions and Bar Graph Practice'
  );
  const [hwUnit, setHwUnit] = useState('sharing-the-planet');
  const [hwCompetency, setHwCompetency] = useState('Fractions & Statistics');
  const [hwDueDate, setHwDueDate] = useState('This Friday, 5:00 PM');
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null);

  // Message fields
  const [msgTitle, setMsgTitle] = useState(
    'Encouragement & Inquiry Tips for This Week'
  );
  const [msgContent, setMsgContent] = useState(
    'Great effort on your recent mathematical challenges! Remember to review fraction equivalences in the Math Lab before our next session.'
  );

  // Quick Thinking live session state
  const [sessionPin, setSessionPin] = useState('SPARK-4821');
  const [sessionActive, setSessionActive] = useState(false);

  const handleSelectClass = (classId: string) => {
    sounds.playClick();
    setActiveClassId(classId);
    setTargetClassId(classId);
    const studentsInNextClass = allStudents.filter(
      (s) => (s.classId || 'class-4a') === classId
    );
    setSelectedStudentId(studentsInNextClass[0]?.id || null);
  };

  const handleOpenCreateClass = () => {
    sounds.playClick();
    const nextNum = classes.length + 1;
    setNewClassName(`Class 4${String.fromCharCode(64 + nextNum)} — PYP Math Inquiry`);
    setNewClassCode(`SPARK-4${String.fromCharCode(64 + nextNum)}`);
    setNewClassYear('Y4');
    setNewClassDesc('IB PYP Mathematics & Transdisciplinary Inquiry Group');
    setSeedSampleStudents(true);
    setIsCreateClassOpen(true);
  };

  const handleCreateClassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    sounds.playSuccess();

    const cleanCode =
      newClassCode.trim().toUpperCase() ||
      `SPARK-${Math.floor(100 + Math.random() * 900)}`;
    const newClassObj: Classroom = {
      id: `class-${Date.now()}`,
      name: newClassName.trim(),
      code: cleanCode,
      year: newClassYear,
      description:
        newClassDesc.trim() ||
        `IB PYP ${newClassYear} Classroom · Join Code: ${cleanCode}`,
      teacherName: 'Prof. Martinez',
      createdAt: 'Just Created',
    };

    if (onCreateClass) {
      onCreateClass(newClassObj, seedSampleStudents);
    } else {
      setLocalClasses((prev) => [...prev, newClassObj]);
      if (seedSampleStudents) {
        const sampleGroup: StudentAnalytics[] = [
          {
            id: `stud-${Date.now()}-1`,
            name: 'Leo Santamaria',
            avatarId: 'avatar-dog-1',
            classId: newClassObj.id,
            accuracy: 60,
            previousScores: [3, 3.5, 3.5, 4],
            recentScores: [5.5, 6],
            completedMissions: 5,
            homeworkStatus: 'on_track',
            frequentMistake: 'Comparing fractions with unlike denominators',
            streakDays: 4,
            skills: {
              logicalReasoning: 64,
              problemSolving: 62,
              numericalThinking: 64,
              patternRecognition: 60,
              spatialReasoning: 66,
              creativity: 58,
              perseverance: 62,
            },
          },
          {
            id: `stud-${Date.now()}-2`,
            name: 'Martina Pardo',
            avatarId: 'avatar-cat-3',
            classId: newClassObj.id,
            accuracy: 85,
            previousScores: [6.5, 7, 7, 7.5],
            recentScores: [8.5, 8.5],
            completedMissions: 7,
            homeworkStatus: 'on_track',
            frequentMistake: 'Converting area units (m² vs cm²)',
            streakDays: 6,
            skills: {
              logicalReasoning: 86,
              problemSolving: 85,
              numericalThinking: 86,
              patternRecognition: 88,
              spatialReasoning: 89,
              creativity: 82,
              perseverance: 84,
            },
          },
        ];
        updateStudentsList([...allStudents, ...sampleGroup]);
      }
    }

    setActiveClassId(newClassObj.id);
    setTargetClassId(newClassObj.id);
    setIsCreateClassOpen(false);
  };

  const handleEnrollStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentNameInput.trim()) return;
    sounds.playSuccess();

    const newSt: StudentAnalytics = {
      id: `stud-${Date.now()}`,
      name: newStudentNameInput.trim(),
      avatarId: 'avatar-cat-2',
      classId: activeClassId,
      accuracy: 70,
      previousScores: [4, 4.5, 5, 5],
      recentScores: [6.5, 7],
      completedMissions: 4,
      homeworkStatus: 'on_track',
      frequentMistake: 'Multi-step word problem place value alignment',
      streakDays: 3,
      skills: {
        logicalReasoning: 72,
        problemSolving: 70,
        numericalThinking: 72,
        patternRecognition: 70,
        spatialReasoning: 75,
        creativity: 66,
        perseverance: 70,
      },
    };

    const nextList = [...allStudents, newSt];
    updateStudentsList(nextList);
    setSelectedStudentId(newSt.id);
    setNewStudentNameInput('');
    setIsEnrollStudentOpen(false);
  };

  const handleCopyCode = (code: string) => {
    sounds.playClick();
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleQuickActionForStudent = (
    student: StudentAnalytics,
    mode: 'homework' | 'message'
  ) => {
    sounds.playClick();
    setComposerMode(mode);
    setTargetType('student');
    setTargetStudentId(student.id);
    if (student.classId) {
      setTargetClassId(student.classId);
    }
    setActiveTab('assign');
  };

  const handleQuickActionForClass = (
    cls: Classroom,
    mode: 'homework' | 'message'
  ) => {
    sounds.playClick();
    setComposerMode(mode);
    setTargetType('class');
    setTargetClassId(cls.id);
    setActiveTab('assign');
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playSuccess();

    const targetCls = classes.find((c) => c.id === targetClassId) || activeClass;
    const targetSt = allStudents.find((s) => s.id === targetStudentId);

    const newTask: HomeworkTask = {
      id: 'hw-' + Date.now(),
      title: hwTitle,
      unitId: hwUnit as any,
      competency: hwCompetency,
      dueDate: hwDueDate,
      status: 'pending',
      rewardCoins: 70,
      rewardXp: 140,
      assignedBy: 'Prof. Martinez',
      targetType,
      targetClassId: targetType === 'class' ? targetCls?.id : targetSt?.classId,
      targetClassName:
        targetType === 'class'
          ? targetCls?.name
          : classes.find((c) => c.id === targetSt?.classId)?.name,
      targetStudentId: targetType === 'student' ? targetSt?.id : undefined,
      targetStudentName: targetType === 'student' ? targetSt?.name : undefined,
      questions: [
        {
          id: `q-${Date.now()}-1`,
          question: `Inquiry Application for ${hwTitle}: Calculate (36 × 5) + 20 using place value decomposition:`,
          type: 'numeric',
          correctAnswer: '200',
          exampleAnswer: 'Sample Format: (20 × 4) + 10 = 90 (Do not copy this sample)',
          hint: 'Calculate (30 × 5) + (6 × 5) = 150 + 30 = 180, then add 20.',
        },
        {
          id: `q-${Date.now()}-2`,
          question: `Which fraction represents half of a 4/4 whole unit in ${hwCompetency}?`,
          type: 'multiple_choice',
          options: ['2/4', '1/4', '3/4', '4/8'],
          correctAnswer: '2/4',
          exampleAnswer: 'Sample Format: 3/6 represents one half (sample format only)',
          hint: 'Divide the 4 parts equally into 2 halves.',
        },
      ],
    };

    onAssignNewHomework(newTask);
    const recipientLabel =
      targetType === 'class'
        ? `Class "${targetCls?.name}"`
        : `Student "${targetSt?.name}"`;
    setAssignSuccess(`Homework task assigned to ${recipientLabel}!`);
    setTimeout(() => setAssignSuccess(null), 3500);
  };

  const handleSendMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgTitle.trim() || !msgContent.trim()) return;
    sounds.playSuccess();

    const targetCls = classes.find((c) => c.id === targetClassId) || activeClass;
    const targetSt = allStudents.find((s) => s.id === targetStudentId);

    const newMsg: TeacherMessage = {
      id: 'msg-' + Date.now(),
      title: msgTitle.trim(),
      content: msgContent.trim(),
      senderName: 'Prof. Martinez',
      targetType,
      targetClassId: targetType === 'class' ? targetCls?.id : targetSt?.classId,
      targetClassName:
        targetType === 'class'
          ? targetCls?.name
          : classes.find((c) => c.id === targetSt?.classId)?.name,
      targetStudentId: targetType === 'student' ? targetSt?.id : undefined,
      targetStudentName: targetType === 'student' ? targetSt?.name : undefined,
      createdAt: 'Just Now',
      read: false,
    };

    setLocalMessages((prev) => [newMsg, ...prev]);
    if (onSendNewMessage) {
      onSendNewMessage(newMsg);
    }

    const recipientLabel =
      targetType === 'class'
        ? `Class "${targetCls?.name}"`
        : `Student "${targetSt?.name}"`;
    setAssignSuccess(`Message sent directly to ${recipientLabel}!`);
    setTimeout(() => setAssignSuccess(null), 3500);
  };

  const startQuickThinkingSession = () => {
    sounds.playSuccess();
    const randomPin = 'SPARK-' + Math.floor(1000 + Math.random() * 9000);
    setSessionPin(randomPin);
    setSessionActive(true);
  };

  // Record a new recent score (out of 10) for a student to see live improvement %
  const handleAddRecentScore = (studentId: string, scoreOutOfTen: number) => {
    sounds.playSuccess();
    const clamped = Math.max(0, Math.min(10, scoreOutOfTen));
    const next = allStudents.map((st) => {
      if (st.id !== studentId) return st;
      const updatedRecent = [...st.recentScores, clamped];
      const recentAvg =
        updatedRecent.reduce((s, v) => s + v, 0) / updatedRecent.length;
      return {
        ...st,
        recentScores: updatedRecent,
        accuracy: Math.round(recentAvg * 10),
        completedMissions: st.completedMissions + 1,
      };
    });
    updateStudentsList(next);
  };

  // Apply the 3/10 -> 5/10 benchmark preset on the selected student
  const handleApplyThreeToFiveExample = (studentId: string) => {
    sounds.playSuccess();
    const next = allStudents.map((st) => {
      if (st.id !== studentId) return st;
      return {
        ...st,
        previousScores: [3, 3, 3, 3],
        recentScores: [5, 5],
        accuracy: 50,
      };
    });
    updateStudentsList(next);
  };

  const handleResetStudentScores = () => {
    sounds.playClick();
    updateStudentsList(CLASS_STUDENTS_ANALYTICS);
  };

  // Enrich & sort students in the ACTIVE CLASS
  const enrichedStudents = classStudents
    .map((st) => ({
      student: st,
      metrics: calculateStudentImprovement(st.previousScores, st.recentScores),
    }))
    .sort((a, b) => {
      if (sortBy === 'improvement') {
        return b.metrics.improvementPct - a.metrics.improvementPct;
      }
      return b.metrics.objectiveScorePct - a.metrics.objectiveScorePct;
    });

  // Class-level aggregate statistics for the ACTIVE CLASS
  const avgClassImprovement =
    enrichedStudents.length > 0
      ? enrichedStudents.reduce(
          (acc, item) => acc + item.metrics.improvementPct,
          0
        ) / enrichedStudents.length
      : 0;

  const avgClassObjectivePct =
    enrichedStudents.length > 0
      ? enrichedStudents.reduce(
          (acc, item) => acc + item.metrics.objectiveScorePct,
          0
        ) / enrichedStudents.length
      : 0;

  const significantCount = enrichedStudents.filter(
    (item) => item.metrics.isSignificant
  ).length;

  const topImprover = [...enrichedStudents].sort(
    (a, b) => b.metrics.improvementPct - a.metrics.improvementPct
  )[0];

  // Dynamic Class Competency Averages (from students in the active class)
  const classSkillAverages = {
    logicalReasoning:
      classStudents.length > 0
        ? Math.round(
            classStudents.reduce((s, st) => s + st.skills.logicalReasoning, 0) /
              classStudents.length
          )
        : 0,
    problemSolving:
      classStudents.length > 0
        ? Math.round(
            classStudents.reduce((s, st) => s + st.skills.problemSolving, 0) /
              classStudents.length
          )
        : 0,
    numericalThinking:
      classStudents.length > 0
        ? Math.round(
            classStudents.reduce((s, st) => s + st.skills.numericalThinking, 0) /
              classStudents.length
          )
        : 0,
    patternRecognition:
      classStudents.length > 0
        ? Math.round(
            classStudents.reduce((s, st) => s + st.skills.patternRecognition, 0) /
              classStudents.length
          )
        : 0,
    spatialReasoning:
      classStudents.length > 0
        ? Math.round(
            classStudents.reduce((s, st) => s + st.skills.spatialReasoning, 0) /
              classStudents.length
          )
        : 0,
    creativity:
      classStudents.length > 0
        ? Math.round(
            classStudents.reduce((s, st) => s + st.skills.creativity, 0) /
              classStudents.length
          )
        : 0,
    perseverance:
      classStudents.length > 0
        ? Math.round(
            classStudents.reduce((s, st) => s + st.skills.perseverance, 0) /
              classStudents.length
          )
        : 0,
  };

  const selectedStudentData = enrichedStudents.find(
    (item) => item.student.id === selectedStudentId
  );

  // Build SVG Evolution Chart coordinates for the selected student
  const renderStudentEvolutionSvg = (
    prevScores: number[],
    recScores: number[],
    baselineAvg: number
  ) => {
    const combined = [
      ...prevScores.map((s, i) => ({
        label: `P${i + 1}`,
        score: s,
        type: 'prev' as const,
      })),
      ...recScores.map((s, i) => ({
        label: `R${i + 1}`,
        score: s,
        type: 'recent' as const,
      })),
    ];
    const W = 420;
    const H = 145;
    const padL = 32;
    const padR = 20;
    const padT = 18;
    const padB = 26;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;

    const getX = (idx: number) =>
      combined.length <= 1
        ? padL + plotW / 2
        : padL + (idx / (combined.length - 1)) * plotW;
    const getY = (scoreOutOf10: number) =>
      padT + plotH - (Math.max(0, Math.min(10, scoreOutOf10)) / 10) * plotH;

    const points = combined.map((pt, i) => ({
      ...pt,
      x: getX(i),
      y: getY(pt.score),
    }));

    const linePath = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(' ');

    const areaPath =
      points.length > 1
        ? `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${(
            padT + plotH
          ).toFixed(1)} L ${points[0].x.toFixed(1)} ${(padT + plotH).toFixed(
            1
          )} Z`
        : '';

    const baselineY = getY(baselineAvg);

    return (
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-36 overflow-visible select-none"
      >
        <defs>
          <linearGradient id="evoAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines (0, 5, 10) */}
        {[0, 5, 10].map((val) => {
          const y = getY(val);
          return (
            <g key={val}>
              <line
                x1={padL}
                y1={y}
                x2={W - padR}
                y2={y}
                stroke="#1e293b"
                strokeWidth="1"
              />
              <text
                x={padL - 6}
                y={y + 3}
                textAnchor="end"
                className="fill-slate-500 text-[9px] font-bold"
              >
                {val}/10
              </text>
            </g>
          );
        })}

        {/* Baseline average dashed line */}
        <line
          x1={padL}
          y1={baselineY}
          x2={W - padR}
          y2={baselineY}
          stroke="#f59e0b"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
        <text
          x={W - padR - 2}
          y={baselineY - 4}
          textAnchor="end"
          className="fill-amber-400 text-[8px] font-bold"
        >
          Baseline Avg ({baselineAvg.toFixed(1)}/10)
        </text>

        {/* Shaded evolution area */}
        {areaPath && <path d={areaPath} fill="url(#evoAreaGrad)" />}

        {/* Evolution curve line */}
        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke="#34d399"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Data points & labels */}
        {points.map((p, idx) => (
          <g key={`${p.label}-${idx}`}>
            <circle
              cx={p.x}
              cy={p.y}
              r={p.type === 'recent' ? 5 : 4}
              className={
                p.type === 'recent'
                  ? 'fill-emerald-400 stroke-slate-950 stroke-2'
                  : 'fill-slate-400 stroke-slate-950 stroke-2'
              }
            />
            <text
              x={p.x}
              y={p.y - 8}
              textAnchor="middle"
              className={`text-[9px] font-black ${
                p.type === 'recent' ? 'fill-emerald-300' : 'fill-slate-300'
              }`}
            >
              {p.score}
            </text>
            <text
              x={p.x}
              y={padT + plotH + 14}
              textAnchor="middle"
              className={`text-[9px] font-bold ${
                p.type === 'recent' ? 'fill-emerald-400' : 'fill-slate-500'
              }`}
            >
              {p.label}
            </text>
          </g>
        ))}
      </svg>
    );
  };

  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-100 flex flex-col font-game overflow-hidden">
      {/* Teacher Navigation Bar */}
      <header className="h-16 px-6 bg-slate-900 border-b border-indigo-500/30 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sounds.playClick();
              onBackToStudent();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Log Out</span>
          </button>

          <div className="h-6 w-px bg-slate-800 mx-2" />

          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-400 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-sm font-black text-indigo-300 tracking-wide">
                SPARK · Teacher Classroom & Analytics Hub
              </h1>
              <p className="text-[10px] text-slate-400">
                Manage Classes, Inspect Student Evolution Graphs, & Send Targeted Tasks or Messages
              </p>
            </div>
          </div>
        </div>

        {/* Teacher profile */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
            <Shield className="w-3.5 h-3.5" />
            <span>GDPR Student Privacy Active</span>
          </span>
          <div className="text-right text-xs">
            <div className="font-bold text-slate-200">Prof. Martinez</div>
            <div className="text-[10px] text-slate-400">Mathematics Coordinator</div>
          </div>
        </div>
      </header>

      {/* CLASSROOM SELECTOR & CLASS CREATION BAR */}
      <div className="px-6 py-3 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-black uppercase tracking-wider text-indigo-300 flex items-center gap-1.5 mr-1">
            <School className="w-4 h-4 text-indigo-400" />
            <span>Active Class:</span>
          </span>

          {classes.map((cls) => {
            const count = allStudents.filter(
              (s) => (s.classId || 'class-4a') === cls.id
            ).length;
            const isSelected = cls.id === activeClassId;
            return (
              <button
                key={cls.id}
                onClick={() => handleSelectClass(cls.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/20'
                    : 'bg-slate-800/90 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span>{cls.name}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                    isSelected
                      ? 'bg-indigo-950/70 text-indigo-200'
                      : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  {cls.year} · {count} Students
                </span>
              </button>
            );
          })}

          <button
            onClick={handleOpenCreateClass}
            className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400 shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Class</span>
          </button>
        </div>

        {/* Active Class Join Code & Quick Actions */}
        {activeClass && (
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-950 border border-amber-500/40 text-xs">
              <span className="text-slate-400 font-medium">Student Join Code:</span>
              <span className="font-mono font-black text-amber-300 tracking-wider">
                {activeClass.code}
              </span>
              <button
                onClick={() => handleCopyCode(activeClass.code)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                title="Copy Class Join Code for Students"
              >
                {copiedCode === activeClass.code ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            <button
              onClick={() => {
                sounds.playClick();
                setIsEnrollStudentOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              title="Add or enroll a student into this class"
            >
              <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
              <span>Add Student</span>
            </button>

            <button
              onClick={() => handleQuickActionForClass(activeClass, 'homework')}
              className="px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <BookPlus className="w-3.5 h-3.5" />
              <span>Task for Class</span>
            </button>

            <button
              onClick={() => handleQuickActionForClass(activeClass, 'message')}
              className="px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Message Class</span>
            </button>
          </div>
        )}
      </div>

      {/* CREATE NEW CLASS MODAL */}
      {isCreateClassOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-slate-900 border-2 border-indigo-500/50 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                  <School className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    Create New Classroom
                  </h3>
                  <p className="text-xs text-slate-400">
                    Students can join this class using its Join Code or Class Selector
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateClassOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateClassSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Class Name
                </label>
                <input
                  type="text"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="Class Name"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-indigo-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    PYP Grade Year
                  </label>
                  <select
                    value={newClassYear}
                    onChange={(e) => setNewClassYear(e.target.value as PYPYear)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-indigo-400"
                  >
                    {(['Y1', 'Y2', 'Y3', 'Y4', 'Y5'] as PYPYear[]).map((y) => (
                      <option key={y} value={y}>
                        {y} (Primary Grade {y.replace('Y', '')})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Student Join Code
                  </label>
                  <input
                    type="text"
                    value={newClassCode}
                    onChange={(e) => setNewClassCode(e.target.value.toUpperCase())}
                    placeholder="SPARK-4C"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-amber-500/50 rounded-xl text-sm font-mono font-bold text-amber-300 outline-none focus:border-amber-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Class Description
                </label>
                <input
                  type="text"
                  value={newClassDesc}
                  onChange={(e) => setNewClassDesc(e.target.value)}
                  placeholder="Brief description of this classroom group..."
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-indigo-400"
                />
              </div>

              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={seedSampleStudents}
                  onChange={(e) => setSeedSampleStudents(e.target.checked)}
                  className="rounded border-slate-700 text-indigo-600"
                />
                <span>
                  Include initial demo students so class statistics and evolution charts are immediately populated
                </span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateClassOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-lg cursor-pointer"
                >
                  Create Classroom
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD / ENROLL STUDENT MODAL */}
      {isEnrollStudentOpen && activeClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-slate-900 border-2 border-indigo-500/50 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-white">
                  Add Student to {activeClass.name}
                </h3>
                <p className="text-xs text-slate-400">
                  Students can also join automatically using code{' '}
                  <strong className="text-amber-300 font-mono">
                    {activeClass.code}
                  </strong>
                </p>
              </div>
              <button
                onClick={() => setIsEnrollStudentOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEnrollStudentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Student Full Name
                </label>
                <input
                  type="text"
                  value={newStudentNameInput}
                  onChange={(e) => setNewStudentNameInput(e.target.value)}
                  placeholder="Student Full Name"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-indigo-400"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEnrollStudentOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-lg cursor-pointer"
                >
                  Enroll in Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sub-nav Tabs */}
      <div className="px-6 py-2 bg-slate-900/60 border-b border-slate-800 flex items-center gap-2 overflow-x-auto shrink-0">
        <button
          onClick={() => {
            sounds.playClick();
            setActiveTab('students');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
            activeTab === 'students'
              ? 'bg-indigo-600 text-white border-indigo-400 shadow'
              : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>
            {activeClass?.name || 'Class'} · Students & Evolution ({classStudents.length})
          </span>
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setActiveTab('analytics');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
            activeTab === 'analytics'
              ? 'bg-indigo-600 text-white border-indigo-400 shadow'
              : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
          }`}
        >
          <BarChart className="w-4 h-4" />
          <span>Class Competency & Score Analytics</span>
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setActiveTab('assign');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
            activeTab === 'assign'
              ? 'bg-indigo-600 text-white border-indigo-400 shadow'
              : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
          }`}
        >
          <BookPlus className="w-4 h-4" />
          <span>Create Task or Send Message (Class / Student)</span>
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setActiveTab('unitPermissions');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
            activeTab === 'unitPermissions'
              ? 'bg-emerald-600 text-white border-emerald-400 shadow'
              : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Unit Lock Permissions</span>
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setActiveTab('quickSession');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
            activeTab === 'quickSession'
              ? 'bg-amber-600 text-white border-amber-400 shadow'
              : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Live Session (Quick Thinking)</span>
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6 overscroll-contain">
        {/* TAB 0: UNIT LOCK PERMISSIONS */}
        {activeTab === 'unitPermissions' && (
          <div className="space-y-6 animate-in fade-in overflow-y-auto">
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl overflow-y-auto">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Lock className="w-5 h-5 text-emerald-400" />
                  <span>IB PYP Inquiry Worlds · Access & Lock Controls</span>
                </h3>
                <span className="text-xs text-slate-400">
                  Controls which regions students can access from their map
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-6">
                Locked regions show a lock icon on the student map and prevent entry until unlocked here by the teacher.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {units.map((unit) => (
                  <div
                    key={unit.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      unit.locked
                        ? 'bg-slate-950/80 border-rose-500/30'
                        : 'bg-slate-950/90 border-emerald-500/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{unit.icon}</span>
                        <div>
                          <h4 className="text-sm font-black text-white">{unit.name}</h4>
                          <p className="text-[10px] text-slate-400">{unit.worldName}</p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          unit.locked
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}
                      >
                        {unit.locked ? 'Locked' : 'Unlocked'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 mb-4 leading-relaxed">
                      {unit.story}
                    </p>

                    <button
                      onClick={() => {
                        sounds.playClick();
                        if (onToggleUnitLock) {
                          onToggleUnitLock(unit.id, !unit.locked);
                        }
                      }}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        unit.locked
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30'
                          : 'bg-rose-600/80 hover:bg-rose-600 text-white shadow-md shadow-rose-600/30'
                      }`}
                    >
                      {unit.locked ? (
                        <>
                          <Unlock className="w-3.5 h-3.5" />
                          <span>Unlock for Students</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>Lock Unit</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: ACTIVE CLASS STATISTICS + INDIVIDUAL STUDENT EVOLUTION & COMPETENCY INSPECTOR */}
        {activeTab === 'students' && (
          <div className="space-y-6 overflow-y-auto">
            {/* Active Class Banner */}
            {activeClass && (
              <div className="p-4 bg-slate-900/90 border border-indigo-500/30 rounded-2xl flex flex-wrap items-center justify-between gap-3 overflow-y-auto">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[10px] font-black uppercase">
                      {activeClass.year} Classroom
                    </span>
                    <h2 className="text-base sm:text-lg font-black text-white">
                      {activeClass.name}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {activeClass.description} · Click on any student below to inspect their individual evolution graph and full competency statistics.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">
                    Enrolled Students:{' '}
                    <strong className="text-white">{classStudents.length}</strong>
                  </span>
                </div>
              </div>
            )}

            {/* CLASS KPI Summary Cards (For the Active Class) */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-900 border border-amber-500/40 rounded-2xl">
                <div className="text-xs text-amber-300 font-bold">
                  Class Grade (Objective Score)
                </div>
                <div className="text-2xl font-black text-amber-300 mt-1 flex items-baseline gap-1.5">
                  <span>{(avgClassObjectivePct / 10).toFixed(1)}/10</span>
                  <span className="text-sm font-bold text-slate-300">
                    ({avgClassObjectivePct.toFixed(1)}%)
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Average grade across all student math assessments
                </div>
              </div>

              <div className="p-4 bg-slate-900 border border-emerald-500/40 rounded-2xl">
                <div className="text-xs text-emerald-300 font-bold">
                  Class Improvement Score (%)
                </div>
                <div className="text-2xl font-black text-emerald-400 mt-1 flex items-center gap-1.5">
                  <TrendingUp className="w-5 h-5" />
                  <span>
                    {avgClassImprovement >= 0 ? '+' : ''}
                    {avgClassImprovement.toFixed(1)}%
                  </span>
                </div>
                <div className="text-[10px] text-emerald-400 mt-1">
                  {significantCount} of {classStudents.length} students with ≥ +25% leap
                </div>
              </div>

              <div className="p-4 bg-slate-900 border border-indigo-500/40 rounded-2xl">
                <div className="text-xs text-indigo-300 font-bold">
                  Enrolled Students
                </div>
                <div className="text-2xl font-black text-white mt-1 flex items-baseline gap-1.5">
                  <span>{classStudents.length}</span>
                  <span className="text-xs font-bold text-indigo-300">Active</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Class Code: <span className="font-mono text-amber-300">{activeClass?.code}</span>
                </div>
              </div>

              {topImprover ? (
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                  <div className="text-xs text-slate-400 font-bold">
                    Top Growth Student
                  </div>
                  <div className="text-base font-black text-white mt-1 truncate">
                    {topImprover.student.name} (+
                    {topImprover.metrics.improvementPct.toFixed(1)}%)
                  </div>
                  <div className="text-[10px] text-amber-300 mt-1">
                    Baseline: {topImprover.metrics.baselineAvg.toFixed(1)}/10 → Current Grade:{' '}
                    {topImprover.metrics.recentAvg.toFixed(1)}/10
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                  <div className="text-xs text-slate-400 font-bold">
                    Class Status
                  </div>
                  <div className="text-sm font-bold text-slate-300 mt-1">
                    No students enrolled yet
                  </div>
                  <div className="text-[10px] text-amber-300 mt-1">
                    Share code {activeClass?.code} for students to join
                  </div>
                </div>
              )}
            </div>

            {/* CLICKED STUDENT: COMPLETE INDIVIDUAL STATISTICS, EVOLUTION GRAPH & INDIVIDUAL COMPETENCY BREAKDOWN */}
            {selectedStudentData && (
              <div className="p-5 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border-2 border-indigo-500/50 rounded-3xl shadow-2xl space-y-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-slate-950 border-2 border-indigo-400/60 flex items-center justify-center overflow-hidden shrink-0">
                      <PixelAvatar
                        avatarId={selectedStudentData.student.avatarId}
                        size={48}
                      />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase border border-indigo-500/30">
                          Individual Student Profile
                        </span>
                        <h3 className="text-base sm:text-xl font-black text-white">
                          {selectedStudentData.student.name}
                        </h3>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-black border ${selectedStudentData.metrics.tierColor}`}
                        >
                          {selectedStudentData.metrics.isSignificant ? '🚀 ' : ''}
                          {selectedStudentData.metrics.tierLabel}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">
                        {selectedStudentData.metrics.pedagogicalSummary}
                      </p>
                    </div>
                  </div>

                  {/* Quick Actions for this Specific Student */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() =>
                        handleQuickActionForStudent(
                          selectedStudentData.student,
                          'homework'
                        )
                      }
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <BookPlus className="w-3.5 h-3.5" />
                      <span>Assign Task to {selectedStudentData.student.name.split(' ')[0]}</span>
                    </button>

                    <button
                      onClick={() =>
                        handleQuickActionForStudent(
                          selectedStudentData.student,
                          'message'
                        )
                      }
                      className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-black flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Send Message to {selectedStudentData.student.name.split(' ')[0]}</span>
                    </button>

                    <button
                      onClick={() =>
                        handleApplyThreeToFiveExample(selectedStudentData.student.id)
                      }
                      className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all cursor-pointer"
                      title="Simulate a student who consistently scored 3/10 and recently scored 5/10"
                    >
                      Simulate 3/10 → 5/10 (+66.7%)
                    </button>

                    <button
                      onClick={handleResetStudentScores}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                      title="Reset all student scores to default"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset</span>
                    </button>

                    <button
                      onClick={() => setSelectedStudentId(null)}
                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
                      title="Close detail view"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* INDIVIDUAL STUDENT KPI CARDS (Grade, Improvement %, History, and Misconception) */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-950/90 border-2 border-amber-500/50">
                    <div className="text-[11px] font-bold text-amber-300">
                      Student Grade (Objective Score)
                    </div>
                    <div className="text-xl font-black text-amber-300 mt-0.5">
                      {selectedStudentData.metrics.recentAvg.toFixed(1)}/10{' '}
                      <span className="text-xs text-slate-300">
                        ({selectedStudentData.metrics.objectiveScorePct.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Class Avg: {(avgClassObjectivePct / 10).toFixed(1)}/10 (
                      {avgClassObjectivePct.toFixed(1)}%)
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-emerald-500/40">
                    <div className="text-[11px] font-bold text-emerald-300">
                      Student Improvement Score (%)
                    </div>
                    <div className="text-xl font-black text-emerald-400 mt-0.5 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      <span>
                        {selectedStudentData.metrics.improvementPct >= 0 ? '+' : ''}
                        {selectedStudentData.metrics.improvementPct.toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Prev Baseline: {selectedStudentData.metrics.baselineAvg.toFixed(1)}/10 · Class Avg:{' '}
                      {avgClassImprovement >= 0 ? '+' : ''}
                      {avgClassImprovement.toFixed(1)}%
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-indigo-500/40">
                    <div className="text-[11px] font-bold text-indigo-300">
                      Assessment Trajectory
                    </div>
                    <div className="text-sm font-black text-white mt-1">
                      [{selectedStudentData.student.previousScores.map((s) => `${s}/10`).join(', ')}] → [
                      {selectedStudentData.student.recentScores.map((s) => `${s}/10`).join(', ')}]
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Delta: {selectedStudentData.metrics.pointDelta >= 0 ? '+' : ''}
                      {selectedStudentData.metrics.pointDelta.toFixed(1)} pts
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800">
                    <div className="text-[11px] font-bold text-slate-400">
                      Missions, Streak & Misconception
                    </div>
                    <div className="text-sm font-black text-white mt-0.5">
                      🔥 {selectedStudentData.student.streakDays}d Streak ·{' '}
                      {selectedStudentData.student.completedMissions} Missions
                    </div>
                    <div className="text-[10px] text-amber-300 truncate mt-1">
                      Focus: {selectedStudentData.student.frequentMistake}
                    </div>
                  </div>
                </div>

                {/* 3-Column Deep Dive: 1. Evolution Line Graph, 2. Individual IB PYP Competency Breakdown, 3. Score Logger */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* 1. EVOLUTION GRAPH (Gráfica de Evolución) */}
                  <div className="lg:col-span-5 p-4 rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                          <TrendingUp className="w-4 h-4" />
                          <span>Student Evolution Graph (P1–R{selectedStudentData.student.recentScores.length})</span>
                        </span>
                        <span className="text-[10px] text-slate-400">
                          P = Previous · R = Recent
                        </span>
                      </div>

                      {renderStudentEvolutionSvg(
                        selectedStudentData.student.previousScores,
                        selectedStudentData.student.recentScores,
                        selectedStudentData.metrics.baselineAvg
                      )}
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                      <span>
                        Baseline Avg:{' '}
                        <strong className="text-slate-200">
                          {selectedStudentData.metrics.baselineAvg.toFixed(1)}/10
                        </strong>
                      </span>
                      <span>
                        Current Grade:{' '}
                        <strong className="text-amber-300">
                          {selectedStudentData.metrics.recentAvg.toFixed(1)}/10 (
                          {selectedStudentData.metrics.objectiveScorePct.toFixed(0)}%)
                        </strong>
                      </span>
                      <span>
                        Improvement:{' '}
                        <strong className="text-emerald-400">
                          +{selectedStudentData.metrics.improvementPct.toFixed(1)}%
                        </strong>
                      </span>
                    </div>
                  </div>

                  {/* 2. INDIVIDUAL STUDENT SPARK FRAMEWORK RADAR CHART */}
                  <div className="lg:col-span-4 p-4 rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-col justify-center items-center">
                    <SparkRadarChart
                      skills={selectedStudentData.student.skills}
                      classAverages={classSkillAverages}
                      title={`${selectedStudentData.student.name.split(' ')[0]}'s SPARK Profile Radar`}
                    />
                  </div>

                  {/* 3. RECORD NEW SCORE & FORMULA SUMMARY */}
                  <div className="lg:col-span-3 p-4 rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-black uppercase tracking-wider text-indigo-300 mb-1">
                        Log New Assessment Score
                      </div>
                      <p className="text-[11px] text-slate-400 mb-3">
                        Add a new score (out of 10) for {selectedStudentData.student.name} to update their Evolution Graph and Class Statistics:
                      </p>

                      <div className="flex items-center gap-2 mb-3">
                        <input
                          type="range"
                          min={0}
                          max={10}
                          step={0.5}
                          value={newScoreInput}
                          onChange={(e) =>
                            setNewScoreInput(parseFloat(e.target.value))
                          }
                          className="flex-1 accent-indigo-500 cursor-pointer"
                        />
                        <span className="px-2.5 py-1 rounded-xl bg-slate-900 border border-indigo-500/40 text-xs font-black text-indigo-300 min-w-[54px] text-center">
                          {newScoreInput}/10
                        </span>
                      </div>

                      <div className="text-[10px] text-slate-400 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800/80 space-y-1 mb-3">
                        <div>
                          <span className="text-amber-300 font-bold">Grade:</span>{' '}
                          {selectedStudentData.metrics.recentAvg.toFixed(1)}/10 (
                          {selectedStudentData.metrics.objectiveScorePct.toFixed(0)}%)
                        </div>
                        <div>
                          <span className="text-emerald-300 font-bold">Improvement:</span>{' '}
                          {selectedStudentData.metrics.improvementPct >= 0 ? '+' : ''}
                          {selectedStudentData.metrics.improvementPct.toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        handleAddRecentScore(
                          selectedStudentData.student.id,
                          newScoreInput
                        )
                      }
                      className="w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl text-xs shadow-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Log {newScoreInput}/10 Score</span>
                    </button>
                  </div>
                </div>

                {/* 4. STUDENT HOMEWORK SUBMISSIONS & REASONING METHOD PROMPT */}
                {(() => {
                  const studentSubs = homeworkList.filter(
                    (hw) =>
                      hw.submission &&
                      (hw.submission.studentId === selectedStudentData.student.id ||
                        hw.submission.studentName.toLowerCase() ===
                          selectedStudentData.student.name.toLowerCase() ||
                        (selectedStudentData.student.id === 'stud-1' &&
                          hw.submission.studentId === 'stud-1'))
                  );

                  return (
                    <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BookPlus className="w-4 h-4 text-amber-400" />
                          <h4 className="text-xs font-black uppercase tracking-wider text-amber-300">
                            Math Homework Submissions & Reasoning Methods ({studentSubs.length})
                          </h4>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          Live assessment grades & student strategy prompts
                        </span>
                      </div>

                      {studentSubs.length === 0 ? (
                        <div className="text-xs text-slate-400 font-medium py-3 text-center bg-slate-900/60 rounded-xl border border-slate-800">
                          No homework submitted by this student yet. Assigned tasks will appear here once solved.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {studentSubs.map((hw) => {
                            const sub = hw.submission!;
                            return (
                              <div
                                key={hw.id}
                                className="p-3.5 rounded-xl bg-slate-900 border border-indigo-500/30 space-y-2"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <div className="text-xs font-bold text-white">{hw.title}</div>
                                    <div className="text-[10px] text-slate-400">
                                      Competency: {hw.competency} · Submitted: {sub.submittedAt}
                                    </div>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black">
                                      Grade: {sub.gradeOutOf10.toFixed(1)}/10
                                    </span>
                                    <div className="text-[10px] text-emerald-400 font-bold mt-0.5">
                                      {sub.gradePct}% Accuracy
                                    </div>
                                  </div>
                                </div>

                                {/* Student Reasoning / Strategy Prompt */}
                                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                                  <div className="text-[10px] font-black uppercase text-amber-300 flex items-center gap-1">
                                    <Zap className="w-3 h-3 text-amber-400" />
                                    <span>Method of Figuring It Out (Student's Prompt):</span>
                                  </div>
                                  <p className="text-xs text-slate-200 italic font-medium leading-relaxed">
                                    "{sub.studentMethod}"
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Students table for the Active Class */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-black text-white text-base">
                    {activeClass?.name} · Student Roster & Evaluation Matrix
                  </h3>
                  <p className="text-xs text-slate-400">
                    Click any student row to open their individual Evolution Graph, Competency Breakdown, and Direct Task/Message actions
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-400">Sort by:</span>
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setSortBy('improvement');
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      sortBy === 'improvement'
                        ? 'bg-emerald-600 text-white border-emerald-400'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                    }`}
                  >
                    Improvement Score (%)
                  </button>
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setSortBy('objective');
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      sortBy === 'objective'
                        ? 'bg-amber-600 text-white border-amber-400'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                    }`}
                  >
                    Grade (Objective Score)
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/60 text-slate-400 font-bold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Grade (Objective Score out of 10 & %)</th>
                      <th className="py-3 px-4">Improvement Score (% vs. Baseline)</th>
                      <th className="py-3 px-4">Homework & Reasoning Prompt</th>
                      <th className="py-3 px-4">Frequent Misconception</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {enrichedStudents.map(({ student: st, metrics }) => {
                      const isSelected = st.id === selectedStudentId;
                      const studentHw = homeworkList.find(
                        (h) =>
                          h.submission &&
                          (h.submission.studentId === st.id ||
                            h.submission.studentName.toLowerCase() ===
                              st.name.toLowerCase() ||
                            (st.id === 'stud-1' && h.submission.studentId === 'stud-1'))
                      );

                      return (
                        <tr
                          key={st.id}
                          onClick={() => {
                            sounds.playClick();
                            setSelectedStudentId(st.id);
                          }}
                          className={`transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-950/40 hover:bg-indigo-950/60'
                              : 'hover:bg-slate-800/40'
                          }`}
                        >
                          <td className="py-3 px-4 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-slate-950 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                              <PixelAvatar avatarId={st.avatarId} size={30} />
                            </div>
                            <div>
                              <div className="font-bold text-white text-sm">{st.name}</div>
                              <div className="text-[10px] text-slate-400">
                                🔥 {st.streakDays}d streak · {st.completedMissions} missions
                              </div>
                            </div>
                          </td>

                          {/* 1. Grade (Objective Score out of 10 & %) */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-sm font-black px-2.5 py-0.5 rounded-lg border ${
                                  metrics.objectiveScorePct >= 85
                                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                    : metrics.objectiveScorePct >= 65
                                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                    : 'bg-slate-800 text-slate-200 border-slate-700'
                                }`}
                              >
                                {metrics.recentAvg.toFixed(1)}/10 (
                                {metrics.objectiveScorePct.toFixed(0)}%)
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1">
                              Prev Baseline: {metrics.baselineAvg.toFixed(1)}/10 · All-Time Avg:{' '}
                              {metrics.cumulativeAvg.toFixed(1)}/10
                            </div>
                          </td>

                          {/* 2. Improvement Score (% vs. Baseline) */}
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`text-sm font-black flex items-center gap-1 ${
                                  metrics.improvementPct >= 25
                                    ? 'text-emerald-400'
                                    : metrics.improvementPct > 0
                                    ? 'text-teal-300'
                                    : 'text-rose-400'
                                }`}
                              >
                                <TrendingUp className="w-4 h-4" />
                                {metrics.improvementPct >= 0 ? '+' : ''}
                                {metrics.improvementPct.toFixed(1)}%
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${metrics.tierColor}`}
                              >
                                {metrics.isSignificant ? '🚀 ' : ''}
                                {metrics.tierLabel}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1">
                              [{st.previousScores.map((s) => `${s}/10`).join(', ')}] → [
                              {st.recentScores.map((s) => `${s}/10`).join(', ')}]
                            </div>
                          </td>

                          {/* 3. Homework & Reasoning Prompt */}
                          <td className="py-3 px-4 max-w-xs">
                            {studentHw?.submission ? (
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-black text-[10px]">
                                    Grade: {studentHw.submission.gradeOutOf10.toFixed(1)}/10
                                  </span>
                                  <span className="text-[10px] text-slate-400 truncate">
                                    {studentHw.title}
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-300 italic truncate mt-1">
                                  Method: "{studentHw.submission.studentMethod}"
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-500 text-[11px] font-medium">
                                {st.homeworkStatus === 'pending'
                                  ? 'Homework pending'
                                  : 'No submissions yet'}
                              </span>
                            )}
                          </td>

                          {/* Homework status */}
                          <td className="py-3 px-4">
                            {st.homeworkStatus === 'on_track' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                On Track
                              </span>
                            )}
                            {st.homeworkStatus === 'pending' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                Pending
                              </span>
                            )}
                            {st.homeworkStatus === 'overdue' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                Overdue
                              </span>
                            )}
                          </td>

                          {/* Frequent Misconception */}
                          <td className="py-3 px-4 text-slate-300 max-w-xs">
                            <div className="flex items-center gap-1.5 text-amber-300/90">
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                              <span className="truncate">{st.frequentMistake}</span>
                            </div>
                          </td>

                          {/* Inspect / Task / Message Buttons */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  sounds.playClick();
                                  setSelectedStudentId(st.id);
                                }}
                                className="px-2.5 py-1 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 font-bold text-[11px] transition-all cursor-pointer"
                              >
                                Evolution & Stats
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuickActionForStudent(st, 'message');
                                }}
                                className="p-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-600 text-sky-300 hover:text-white border border-sky-500/30 cursor-pointer"
                                title={`Send Message to ${st.name}`}
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CLASS COMPETENCY & GROWTH ANALYTICS (For Active Class) */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 overflow-y-auto">
            {/* SPARK Competency Framework Breakdown for Active Class */}
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl overflow-y-auto">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
                <div>
                  <h3 className="text-base font-black text-white mb-1">
                    {activeClass?.name} · SPARK Competency Framework Analysis
                  </h3>
                  <p className="text-xs text-slate-400">
                    SPARK — A System for the Development of Mathematical Skills and Aptitudes · Calculated from all {classStudents.length} students in {activeClass?.name}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-xs font-black text-amber-300">
                  Class Grade: {(avgClassObjectivePct / 10).toFixed(1)}/10 ({avgClassObjectivePct.toFixed(1)}%)
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-5 flex justify-center">
                  <SparkRadarChart
                    skills={classSkillAverages}
                    title={`${activeClass?.name} Average Radar`}
                  />
                </div>

                <div className="lg:col-span-7 space-y-3">
                  {[
                    {
                      name: 'Logical and Mathematical Reasoning (Establishes relationships, constructs logical arguments)',
                      pct: classSkillAverages.logicalReasoning,
                      color: 'bg-indigo-400',
                    },
                    {
                      name: 'Problem-Solving (Understands problem, selects strategies, finds solutions)',
                      pct: classSkillAverages.problemSolving,
                      color: 'bg-emerald-400',
                    },
                    {
                      name: 'Numerical Thinking (Understands numbers, magnitudes and operations)',
                      pct: classSkillAverages.numericalThinking,
                      color: 'bg-amber-400',
                    },
                    {
                      name: 'Pattern Recognition and Abstract Thinking (Identifies regularities, discovers general rules)',
                      pct: classSkillAverages.patternRecognition,
                      color: 'bg-cyan-400',
                    },
                    {
                      name: 'Visualization and Spatial Reasoning (Interprets and manipulates shapes and spatial relationships)',
                      pct: classSkillAverages.spatialReasoning,
                      color: 'bg-purple-400',
                    },
                    {
                      name: 'Creativity and Divergent Thinking (Generates ideas, explores multiple strategies, designs original solutions)',
                      pct: classSkillAverages.creativity,
                      color: 'bg-pink-400',
                    },
                    {
                      name: 'Perseverance, Autonomy and Metacognition (Faces challenges, reflects on learning, improves strategies)',
                      pct: classSkillAverages.perseverance,
                      color: 'bg-rose-400',
                    },
                  ].map((strand) => (
                    <div key={strand.name}>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-slate-300">{strand.name}</span>
                        <span className="text-white">{strand.pct}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5">
                        <div
                          className={`h-full ${strand.color} rounded-full transition-all duration-700`}
                          style={{ width: `${strand.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Grade vs Improvement Comparison Card */}
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    <span>
                      {activeClass?.name} · Grade (Objective Score) vs. Improvement Percentage (%)
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Click any student card below to open their individual Evolution Graph & Competency Profile
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {enrichedStudents.map(({ student: st, metrics }) => {
                  return (
                    <div
                      key={st.id}
                      onClick={() => {
                        sounds.playClick();
                        setSelectedStudentId(st.id);
                        setActiveTab('students');
                      }}
                      className="p-3.5 rounded-xl bg-slate-950/70 hover:bg-slate-950 border border-slate-800 hover:border-indigo-500/40 transition-all cursor-pointer"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-white text-sm">{st.name}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${metrics.tierColor}`}
                          >
                            {metrics.isSignificant ? '🚀 ' : ''}
                            {metrics.tierLabel}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs">
                          <span className="text-amber-300 font-bold">
                            Grade:{' '}
                            <strong>
                              {metrics.recentAvg.toFixed(1)}/10 (
                              {metrics.objectiveScorePct.toFixed(0)}%)
                            </strong>
                          </span>
                          <span className="text-emerald-400 font-bold">
                            Improvement: <strong>+{metrics.improvementPct.toFixed(1)}%</strong>
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                            <span>Grade (Objective Score)</span>
                            <span className="text-amber-300 font-bold">
                              {metrics.recentAvg.toFixed(1)}/10 (
                              {metrics.objectiveScorePct.toFixed(0)}%)
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-400 rounded-full"
                              style={{ width: `${metrics.objectiveScorePct}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                            <span>Improvement Percentage</span>
                            <span className="text-emerald-400 font-bold">
                              +{metrics.improvementPct.toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-400 rounded-full"
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.max(0, metrics.improvementPct)
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CREATE HOMEWORK TASK OR SEND MESSAGE (FOR SPECIFIC CLASS OR SPECIFIC STUDENT) */}
        {activeTab === 'assign' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto">
            {/* Left Column: Composer Form */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 overflow-y-auto">
              <div>
                <h3 className="text-lg font-black text-white mb-1">
                  Classroom & Student Communications Hub
                </h3>
                <p className="text-xs text-slate-400">
                  Create an Inquiry Homework Task or send a Direct Message to a specific class or an individual student
                </p>
              </div>

              {/* 1. Mode Toggle: Create Task vs Send Message */}
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-950 rounded-2xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setComposerMode('homework');
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    composerMode === 'homework'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <BookPlus className="w-4 h-4" />
                  <span>Create Homework Task</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setComposerMode('message');
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    composerMode === 'message'
                      ? 'bg-sky-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Send Direct Message</span>
                </button>
              </div>

              {/* 2. Recipient Selector: Specific Class vs Specific Student */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <label className="block text-xs font-black uppercase tracking-wider text-indigo-300">
                  Select Target Recipient (Specific Class or Specific Student):
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setTargetType('class');
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      targetType === 'class'
                        ? 'bg-indigo-500/20 text-indigo-200 border-indigo-400'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    <School className="w-4 h-4" />
                    <span>Specific Class</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setTargetType('student');
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      targetType === 'student'
                        ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>Specific Student</span>
                  </button>
                </div>

                {targetType === 'class' ? (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">
                      Target Classroom:
                    </label>
                    <select
                      value={targetClassId}
                      onChange={(e) => setTargetClassId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white font-bold outline-none focus:border-indigo-400"
                    >
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name} (Code: {cls.code})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">
                      Target Individual Student:
                    </label>
                    <select
                      value={targetStudentId}
                      onChange={(e) => setTargetStudentId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white font-bold outline-none focus:border-emerald-400"
                    >
                      {allStudents.map((st) => {
                        const clsName =
                          classes.find((c) => c.id === (st.classId || 'class-4a'))
                            ?.name || 'Class 4A';
                        return (
                          <option key={st.id} value={st.id}>
                            {st.name} — {clsName}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}
              </div>

              {/* 3A. Homework Task Form */}
              {composerMode === 'homework' ? (
                <form onSubmit={handleCreateAssignment} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                      Assignment Title
                    </label>
                    <input
                      type="text"
                      value={hwTitle}
                      onChange={(e) => setHwTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-indigo-400"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                        Inquiry World Unit
                      </label>
                      <select
                        value={hwUnit}
                        onChange={(e) => setHwUnit(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-indigo-400"
                      >
                        {units.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                        Competency Focus
                      </label>
                      <input
                        type="text"
                        value={hwCompetency}
                        onChange={(e) => setHwCompetency(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-indigo-400"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                      Due Date
                    </label>
                    <input
                      type="text"
                      value={hwDueDate}
                      onChange={(e) => setHwDueDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-indigo-400"
                      required
                    />
                  </div>

                  {assignSuccess && (
                    <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span>{assignSuccess}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl text-sm shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <BookPlus className="w-4 h-4" />
                    <span>
                      {targetType === 'class'
                        ? `Assign Homework to ${
                            classes.find((c) => c.id === targetClassId)?.name || 'Class'
                          }`
                        : `Assign Homework to ${
                            allStudents.find((s) => s.id === targetStudentId)?.name ||
                            'Student'
                          }`}
                    </span>
                  </button>
                </form>
              ) : (
                /* 3B. Direct Message Form */
                <form onSubmit={handleSendMessageSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                      Message Subject
                    </label>
                    <input
                      type="text"
                      value={msgTitle}
                      onChange={(e) => setMsgTitle(e.target.value)}
                      placeholder="Great Improvement on Fractions"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-sky-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                      Message Content
                    </label>
                    <textarea
                      rows={4}
                      value={msgContent}
                      onChange={(e) => setMsgContent(e.target.value)}
                      placeholder="Write your message, feedback, or guidance for the class or specific student..."
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-sky-400"
                      required
                    />
                  </div>

                  {assignSuccess && (
                    <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span>{assignSuccess}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-black rounded-xl text-sm shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>
                      {targetType === 'class'
                        ? `Send Message to ${
                            classes.find((c) => c.id === targetClassId)?.name || 'Class'
                          }`
                        : `Send Message to ${
                            allStudents.find((s) => s.id === targetStudentId)?.name ||
                            'Student'
                          }`}
                    </span>
                  </button>
                </form>
              )}
            </div>

            {/* Right Column: Live History of Assigned Tasks & Sent Messages */}
            <div className="lg:col-span-5 space-y-4">
              {/* Sent Messages Feed */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-white flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-sky-400" />
                    <span>Sent Messages ({messages.length})</span>
                  </h4>
                  <span className="text-[10px] text-slate-400">
                    Visible in Student Inbox
                  </span>
                </div>

                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                            m.targetType === 'student'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          }`}
                        >
                          {m.targetType === 'student'
                            ? `👤 Student: ${m.targetStudentName}`
                            : `🏫 Class: ${m.targetClassName}`}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {m.createdAt}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-white">{m.title}</div>
                      <p className="text-[11px] text-slate-400 line-clamp-2">
                        {m.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assigned Homework Tasks Feed */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-white flex items-center gap-2">
                    <BookPlus className="w-4 h-4 text-indigo-400" />
                    <span>Assigned Homework Tasks ({homeworkList.length})</span>
                  </h4>
                  <span className="text-[10px] text-slate-400">
                    Class & Individual Tasks
                  </span>
                </div>

                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {homeworkList.map((hw) => (
                    <div
                      key={hw.id}
                      className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                            hw.targetType === 'student'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          }`}
                        >
                          {hw.targetType === 'student'
                            ? `👤 Student: ${hw.targetStudentName}`
                            : `🏫 Class: ${hw.targetClassName || 'All Classes'}`}
                        </span>
                        <span className="text-[10px] text-amber-300 font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{hw.dueDate}</span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-xs font-bold text-white">{hw.title}</div>
                        {hw.submission ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black shrink-0">
                            Grade: {hw.submission.gradeOutOf10.toFixed(1)}/10
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-bold">
                            Pending
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Competency: {hw.competency} · +{hw.rewardCoins} 🪙 / +
                        {hw.rewardXp} XP
                      </div>
                      {hw.submission && (
                        <div className="text-[10px] text-emerald-300/90 italic bg-slate-900/90 p-2 rounded-lg border border-emerald-500/30">
                          <span className="font-bold text-amber-300 not-italic block">Student Method Prompt:</span>
                          "{hw.submission.studentMethod}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: QUICK THINKING LIVE SESSION */}
        {activeTab === 'quickSession' && (
          <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-6">
            <div>
              <div className="w-14 h-14 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Zap className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-white">
                Live Classroom Quick Thinking Challenge ({activeClass?.name})
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Host a live classroom Kahoot-style math quiz on the projector. Students join using the PIN from their devices.
              </p>
            </div>

            <div className="p-6 bg-slate-950 border-2 border-amber-500/50 rounded-2xl inline-block">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                Classroom PIN
              </div>
              <div className="text-3xl sm:text-4xl font-mono font-black text-amber-300 tracking-wider">
                {sessionPin}
              </div>
            </div>

            <div>
              <button
                onClick={startQuickThinkingSession}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-2xl text-sm shadow-xl transition-all cursor-pointer"
              >
                {sessionActive ? 'Regenerate Game PIN' : 'Start Live Session'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
