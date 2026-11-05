export type Role = 'student' | 'teacher';

export type PYPYear = 'Y1' | 'Y2' | 'Y3' | 'Y4' | 'Y5';

export interface StudentProfile {
  id: string;
  name: string;
  avatarId: string;
  hatId: string;
  petId: string;
  level: number;
  xp: number;
  xpNext: number;
  coins: number;
  gems: number;
  unitStars: number;
  unlockedHats: string[];
  unlockedPets: string[];
  unlockedFurniture: string[];
  placedFurniture?: string[];
  unlockedBadges: string[];
  unlockedAvatars?: string[];
  hasPickedFreeAvatar?: boolean;
  hasPickedFreePet?: boolean;
  petNames?: Record<string, string>;
  currentYear: PYPYear;
  classId?: string;
  classCode?: string;
  roomFurniture: {
    bed: string;
    rug: string;
    desk: string;
    plant: string;
    extra: string;
  };
}

export interface Classroom {
  id: string;
  name: string;
  code: string;
  year: PYPYear;
  description: string;
  teacherName: string;
  createdAt: string;
}

export interface TeacherMessage {
  id: string;
  title: string;
  content: string;
  senderName: string;
  targetType: 'class' | 'student';
  targetClassId?: string;
  targetClassName?: string;
  targetStudentId?: string;
  targetStudentName?: string;
  createdAt: string;
  read?: boolean;
}

export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Badge {
  id: string;
  title: string;
  description: string;
  mathSkill: string;
  icon: string;
  category: 'adventure' | 'mathlab' | 'quickthinking' | 'pets' | 'mastery' | 'secret';
  rarity: BadgeRarity;
  unlocked: boolean;
  unlockedAt?: string;
  rewardCoins: number;
  rewardXp: number;
  isSecret?: boolean;
  secretHint?: string;
}

export interface Pet {
  id: string;
  name: string;
  species:
    | 'fox'
    | 'hedgehog'
    | 'turtle'
    | 'bunny'
    | 'ferret'
    | 'piglet'
    | 'frog'
    | 'raccoon'
    | 'platypus'
    | 'mouse'
    | 'squirrel'
    | 'badger';
  icon: string;
  image: string;
  price?: number;
  gemPrice?: number;
  isSpecial?: boolean;
  happiness: number; // 0 - 100
  level: number;
  unlocked: boolean;
  desc: string;
  accessory?: string;
}

export interface CosmeticItem {
  id: string;
  name: string;
  type: 'hat' | 'furniture' | 'food';
  icon: string;
  price: number;
  gemPrice?: number;
  isSpecial?: boolean;
  currency: 'coins' | 'gems';
  unlocked: boolean;
  desc: string;
}

export type UnitId = 
  | 'sharing-the-planet'
  | 'who-we-are'
  | 'where-we-are'
  | 'how-the-world-works'
  | 'how-we-organize'
  | 'how-we-express';

export interface UnitOfInquiry {
  id: UnitId;
  name: string;
  titleSpanish?: string;
  titleEnglish?: string;
  story: string;
  theme: string;
  icon: string;
  bgGradient: string;
  accentColor: string;
  worldName: string;
  completedLevels: number;
  totalLevels: number;
  locked: boolean;
}

export interface AdventureLevel {
  id: string;
  unitId: UnitId;
  levelNumber: number;
  title: string;
  concept: string;
  type: 'fraction' | 'measurement' | 'statistics' | 'operations' | 'boss';
  description: string;
  rewardCoins: number;
  rewardXp: number;
  rewardItem?: string;
  completed: boolean;
}

export interface MathHomeworkQuestion {
  id: string;
  question: string;
  type?: 'multiple_choice' | 'numeric' | 'text';
  options?: string[];
  correctAnswer: string;
  exampleAnswer: string; // Non-revealing example format (strictly different from actual answer)
  hint?: string;
  explanation?: string;
  unit?: string;
}

export interface HomeworkSubmission {
  studentId: string;
  studentName: string;
  avatarId?: string;
  submittedAt: string;
  gradeOutOf10: number;
  gradePct: number;
  correctCount: number;
  totalQuestions: number;
  studentMethod: string; // The prompt/work of what method of figuring it out the student used
  strategyCategory?: string;
  answers: Record<string, string>;
}

export interface HomeworkTask {
  id: string;
  title: string;
  unitId: UnitId;
  competency: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed';
  rewardCoins: number;
  rewardXp: number;
  assignedBy: string;
  targetType?: 'class' | 'student';
  targetClassId?: string;
  targetClassName?: string;
  targetStudentId?: string;
  targetStudentName?: string;
  questions?: MathHomeworkQuestion[];
  submission?: HomeworkSubmission;
}

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  category: 'mathlab' | 'adventure' | 'quickthinking' | 'pets';
  progress: number;
  total: number;
  rewardCoins: number;
  rewardXp: number;
  completed: boolean;
  claimed: boolean;
}

export interface StudentAnalytics {
  id: string;
  name: string;
  avatarId: string;
  classId?: string;
  accuracy: number;
  previousScores: number[]; // Historical baseline scores out of 10 (e.g. [3, 3, 3, 3])
  recentScores: number[];   // Most recent assessment scores out of 10 (e.g. [5, 5])
  completedMissions: number;
  homeworkStatus: 'on_track' | 'pending' | 'overdue';
  frequentMistake: string;
  streakDays: number;
  skills: {
    logicalReasoning: number;
    problemSolving: number;
    numericalThinking: number;
    patternRecognition: number;
    spatialReasoning: number;
    creativity: number;
    perseverance: number;
  };
}

