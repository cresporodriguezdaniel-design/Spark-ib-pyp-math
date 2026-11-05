import React, { useState } from 'react';
import { ThreePlanetHero } from './ThreePlanetHero';
import { sounds } from '../services/sound';
import { PixelAvatar } from './PixelAvatar';
import { ALL_16_AVATARS, PETS_COLLECTION } from '../data/mockData';
import { PYPYear, Classroom } from '../types';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  User,
  GraduationCap,
  ArrowRight,
  Lock,
  Mail,
  Eye,
  EyeOff,
  CheckCircle2,
  BookOpen,
  School,
  AlertCircle,
  UserPlus,
  LogIn,
  PawPrint,
  Compass,
  ChevronLeft,
} from 'lucide-react';

export interface StudentOnboardingData {
  isNewAccount?: boolean;
  petId?: string;
  petName?: string;
  currentYear?: PYPYear;
  classId?: string;
  classCode?: string;
}

interface TitleAndLoginScreenProps {
  classes?: Classroom[];
  onLoginStudent: (
    studentName: string,
    avatarId?: string,
    hatId?: string,
    onboarding?: StudentOnboardingData
  ) => void;
  onLoginTeacher: () => void;
}

interface DemoAccount {
  role: 'student' | 'teacher';
  name: string;
  email: string;
  password: string;
  avatarId?: string;
  hatId?: string;
  grade?: string;
  subtitle?: string;
  classId?: string;
}

const DEMO_STUDENTS: DemoAccount[] = [
  {
    role: 'student',
    name: 'Carolina Gomez',
    email: 'carolina@school.edu',
    password: 'spark2026',
    avatarId: 'avatar-cat-4',
    hatId: 'none',
    grade: 'Y4 (Grade 4)',
    subtitle: 'Level 12 · Class 4A',
    classId: 'class-4a',
  },
  {
    role: 'student',
    name: 'Mateo Fernandez',
    email: 'mateo@school.edu',
    password: 'spark2026',
    avatarId: 'avatar-dog-4',
    hatId: 'none',
    grade: 'Y4 (Grade 4)',
    subtitle: 'Level 8 · Class 4A',
    classId: 'class-4a',
  },
  {
    role: 'student',
    name: 'Sofia Valenzuela',
    email: 'sofia@school.edu',
    password: 'spark2026',
    avatarId: 'avatar-cat-7',
    hatId: 'none',
    grade: 'Y4 (Grade 4)',
    subtitle: 'Level 15 · Class 4A',
    classId: 'class-4a',
  },
];

const DEMO_TEACHER: DemoAccount = {
  role: 'teacher',
  name: 'Prof. Diego Martinez',
  email: 'prof.martinez@school.edu',
  password: 'teacher2026',
  subtitle: 'PYP Math & Inquiry Coordinator',
};

export const TitleAndLoginScreen: React.FC<TitleAndLoginScreenProps> = ({
  classes = [],
  onLoginStudent,
  onLoginTeacher,
}) => {
  // 'choice' lets user pick Log In vs Create New Account upfront, or switch via tabs in 'authForm'
  const [loginStep, setLoginStep] = useState<
    'choice' | 'authForm' | 'onboardingStarter' | 'welcomeStudent'
  >('choice');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<'student' | 'teacher'>('student');

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('carolina@school.edu');
  const [password, setPassword] = useState('spark2026');
  const [selectedYear, setSelectedYear] = useState<PYPYear>('Y4');
  const [selectedClassId, setSelectedClassId] = useState<string>(
    classes[0]?.id || 'class-4a'
  );
  const [classCodeInput, setClassCodeInput] = useState<string>(
    classes[0]?.code || 'SPARK-4A'
  );
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Registered custom accounts during session
  const [registeredAccounts, setRegisteredAccounts] = useState<DemoAccount[]>([]);

  // Selected student state for transition & new-student starter selection
  const [currentStudentName, setCurrentStudentName] = useState('Carolina');
  const [currentAvatarId, setCurrentAvatarId] = useState('avatar-cat-4');
  const [currentHatId, setCurrentHatId] = useState('none');
  const [starterPetId, setStarterPetId] = useState<string>(PETS_COLLECTION[0].id);
  const [starterPetCustomName, setStarterPetCustomName] = useState<string>(
    PETS_COLLECTION[0].name
  );
  const [isNewStudentRegistration, setIsNewStudentRegistration] = useState(false);

  const years: PYPYear[] = ['Y1', 'Y2', 'Y3', 'Y4', 'Y5'];

  const handleChooseInitialAction = (
    chosenMode: 'login' | 'register',
    chosenRole: 'student' | 'teacher'
  ) => {
    sounds.playClick();
    setAuthMode(chosenMode);
    setRole(chosenRole);
    setErrorMessage('');

    if (chosenMode === 'register') {
      setFullName('');
      setEmail('');
      setPassword('');
    } else {
      if (chosenRole === 'teacher') {
        setEmail(DEMO_TEACHER.email);
        setPassword(DEMO_TEACHER.password);
      } else {
        setEmail(DEMO_STUDENTS[0].email);
        setPassword(DEMO_STUDENTS[0].password);
      }
    }

    setLoginStep('authForm');
  };

  const handleAuthModeSwitch = (newMode: 'login' | 'register') => {
    sounds.playClick();
    setAuthMode(newMode);
    setErrorMessage('');
    if (newMode === 'register') {
      setFullName('');
      setEmail('');
      setPassword('');
    } else {
      if (role === 'teacher') {
        setEmail(DEMO_TEACHER.email);
        setPassword(DEMO_TEACHER.password);
      } else {
        setEmail(DEMO_STUDENTS[0].email);
        setPassword(DEMO_STUDENTS[0].password);
      }
    }
  };

  const handleRoleChange = (newRole: 'student' | 'teacher') => {
    sounds.playClick();
    setRole(newRole);
    setErrorMessage('');
    if (authMode === 'login') {
      if (newRole === 'teacher') {
        setEmail(DEMO_TEACHER.email);
        setPassword(DEMO_TEACHER.password);
      } else {
        setEmail(DEMO_STUDENTS[0].email);
        setPassword(DEMO_STUDENTS[0].password);
      }
    }
  };

  const handleSelectDemoStudent = (demo: DemoAccount) => {
    sounds.playClick();
    setAuthMode('login');
    setEmail(demo.email);
    setPassword(demo.password);
    setErrorMessage('');
    setCurrentStudentName(demo.name.split(' ')[0]);
    if (demo.avatarId) setCurrentAvatarId(demo.avatarId);
    if (demo.hatId) setCurrentHatId(demo.hatId);
  };

  const handleSelectDemoTeacher = () => {
    sounds.playClick();
    setAuthMode('login');
    setEmail(DEMO_TEACHER.email);
    setPassword(DEMO_TEACHER.password);
    setErrorMessage('');
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (authMode === 'register' && !fullName.trim()) {
      sounds.playError();
      setErrorMessage(
        role === 'student'
          ? 'Please enter the student name to create an account.'
          : 'Please enter the teacher name to create an account.'
      );
      return;
    }

    if (!email.trim()) {
      sounds.playError();
      setErrorMessage('Please enter your school email.');
      return;
    }

    if (!password.trim() || password.trim().length < 4) {
      sounds.playError();
      setErrorMessage('Please enter a password (at least 4 characters).');
      return;
    }

    setErrorMessage('');

    // REGISTRATION FLOW
    if (authMode === 'register') {
      const cleanName = fullName.trim();
      const newAcc: DemoAccount = {
        role,
        name: cleanName,
        email: email.trim(),
        password: password.trim(),
        avatarId: 'avatar-cat-4',
        hatId: 'none',
        grade: `${selectedYear}`,
      };
      setRegisteredAccounts((prev) => [...prev, newAcc]);

      if (role === 'teacher') {
        sounds.playSuccess();
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        onLoginTeacher();
        return;
      }

      // Student Registration -> Open Starter Animal & Pet Selection Window!
      sounds.playSuccess();
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      setCurrentStudentName(cleanName.split(' ')[0]);
      setCurrentAvatarId(ALL_16_AVATARS[0].id);
      setCurrentHatId('none');
      setStarterPetId(PETS_COLLECTION[0].id);
      setStarterPetCustomName(PETS_COLLECTION[0].name);
      setIsNewStudentRegistration(true);
      setLoginStep('onboardingStarter');
      return;
    }

    // LOGIN FLOW
    if (role === 'teacher') {
      sounds.playSuccess();
      onLoginTeacher();
      return;
    }

    // Student Login flow:
    sounds.playClick();
    setIsNewStudentRegistration(false);

    const allStudents = [...DEMO_STUDENTS, ...registeredAccounts.filter((a) => a.role === 'student')];
    const matched = allStudents.find(
      (s) => s.email.toLowerCase() === email.trim().toLowerCase()
    );

    let resolvedName = currentStudentName;
    let resolvedAvatar = currentAvatarId;
    let resolvedHat = currentHatId;

    if (matched) {
      resolvedName = matched.name.split(' ')[0];
      resolvedAvatar = matched.avatarId || 'avatar-cat-4';
      resolvedHat = matched.hatId || 'none';
    } else {
      const userPart = email.split('@')[0].split('.')[0];
      resolvedName = userPart.charAt(0).toUpperCase() + userPart.slice(1);
    }

    setCurrentStudentName(resolvedName);
    setCurrentAvatarId(resolvedAvatar);
    setCurrentHatId(resolvedHat);

    setLoginStep('welcomeStudent');
  };

  const handleCompleteStarterOnboarding = () => {
    sounds.playSuccess();
    confetti({ particleCount: 65, spread: 70, origin: { y: 0.6 } });
    const chosenPet =
      PETS_COLLECTION.find((p) => p.id === starterPetId) || PETS_COLLECTION[0];
    const finalPetName = starterPetCustomName.trim() || chosenPet.name;

    const matchedClassByCode = classes.find(
      (c) => c.code.toUpperCase() === classCodeInput.trim().toUpperCase()
    );
    const resolvedClassId = matchedClassByCode?.id || selectedClassId;
    const resolvedClassCode =
      matchedClassByCode?.code ||
      classes.find((c) => c.id === selectedClassId)?.code ||
      'SPARK-4A';

    onLoginStudent(currentStudentName, currentAvatarId, 'none', {
      isNewAccount: true,
      petId: starterPetId,
      petName: finalPetName,
      currentYear: selectedYear,
      classId: resolvedClassId,
      classCode: resolvedClassCode,
    });
  };

  const handleEnterWorld = () => {
    sounds.playSuccess();
    const matchedClassByCode = classes.find(
      (c) => c.code.toUpperCase() === classCodeInput.trim().toUpperCase()
    );
    const resolvedClassId = matchedClassByCode?.id || selectedClassId;
    const resolvedClassCode =
      matchedClassByCode?.code ||
      classes.find((c) => c.id === selectedClassId)?.code ||
      'SPARK-4A';

    onLoginStudent(currentStudentName, currentAvatarId, currentHatId, {
      isNewAccount: isNewStudentRegistration,
      classId: resolvedClassId,
      classCode: resolvedClassCode,
    });
  };

  const selectedStarterPetObj =
    PETS_COLLECTION.find((p) => p.id === starterPetId) || PETS_COLLECTION[0];

  return (
    <div className="relative w-screen h-screen bg-[#070e1b] overflow-hidden flex flex-col justify-between select-none font-game">
      {/* Subtle Starfield background */}
      <div className="absolute inset-0 pointer-events-none opacity-50 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-950 to-slate-950" />

      {/* Top Banner */}
      <header className="relative z-20 px-6 sm:px-10 py-4 flex items-center justify-between border-b border-slate-900/80 bg-slate-950/40 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-lg shadow-amber-500/30 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-slate-950 fill-slate-950" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wider bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent font-game">
              SPARK
            </h1>
            <p className="text-[10px] sm:text-[11px] text-amber-400/80 font-medium tracking-widest uppercase">
              IB PYP Mathematics Adventure Platform
            </p>
          </div>
        </div>

        <div className="text-right text-xs text-slate-400 font-medium hidden sm:flex items-center gap-2">
          <School className="w-4 h-4 text-amber-400" />
          <span>Primary Education (Years 1–5) · International Baccalaureate (IB PYP)</span>
        </div>
      </header>

      {/* Main Hero Container */}
      <main className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-center px-4 sm:px-12 py-3 gap-6 lg:gap-12 overflow-y-auto">
        {/* Left Side: 3D Earth Planet with Orbiting Golden Prism Star (hidden on small screens during starter onboarding to give full space) */}
        <div
          className={`${
            loginStep === 'onboardingStarter' ? 'hidden xl:flex' : 'flex'
          } flex-1 w-full max-w-md flex-col items-center justify-center`}
        >
          <div className="relative w-[240px] h-[240px] sm:w-[340px] sm:h-[340px] lg:w-[380px] lg:h-[380px] overflow-auto">
            <ThreePlanetHero
              onPlanetClick={loginStep === 'welcomeStudent' ? handleEnterWorld : () => {}}
            />
          </div>
          <p className="mt-2 text-xs text-slate-400 text-center font-medium">
            {loginStep === 'welcomeStudent'
              ? '🪐 Click the rotating planet or the button to begin'
              : 'Explore mathematical worlds and care for your adventure companions'}
          </p>
        </div>

        {/* Right Side: Initial Choice / Auth Form / Starter Companion Onboarding / Welcome Card */}
        <div
          className={`w-full ${
            loginStep === 'onboardingStarter' ? 'max-w-2xl' : 'max-w-md'
          }`}
        >
          {/* STEP 0: INITIAL CHOICE — LOG IN OR CREATE NEW ACCOUNT (STUDENT & TEACHER) */}
          {loginStep === 'choice' && (
            <div className="bg-[#fbf5eb] border-[3px] border-[#1e1b18] rounded-3xl p-6 sm:p-7 shadow-2xl text-[#1e1b18] transition-all font-game">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] border border-[#1e1b18]"></span>
                  <span className="text-xs font-black uppercase tracking-wider text-[#b45309]">
                    Welcome to SPARK Portal
                  </span>
                </div>
                <span className="text-[11px] font-bold text-[#5c4033]">IB World School</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1e1b18] mb-1">
                Get Started
              </h2>
              <p className="text-xs text-[#5c4033] font-medium mb-5">
                Choose your role and whether you want to log in with an existing account or create a new account:
              </p>

              {/* Role Selection: Student vs Teacher */}
              <div className="mb-5">
                <label className="block text-[11px] font-black uppercase tracking-wider text-[#5c4033] mb-2">
                  1. Select Your Role:
                </label>
                <div className="grid grid-cols-2 gap-2.5 p-1.5 bg-[#f3d5ab] rounded-2xl border-2 border-[#1e1b18]">
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setRole('student');
                    }}
                    className={`py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all border-2 cursor-pointer ${
                      role === 'student'
                        ? 'bg-[#f59e0b] text-[#1e1b18] border-[#1e1b18] shadow-sm'
                        : 'bg-[#fff7ea] text-[#5c4033] border-transparent hover:bg-[#fde6c3]'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>Student</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setRole('teacher');
                    }}
                    className={`py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all border-2 cursor-pointer ${
                      role === 'teacher'
                        ? 'bg-[#78b3ea] text-[#1e1b18] border-[#1e1b18] shadow-sm'
                        : 'bg-[#fff7ea] text-[#5c4033] border-transparent hover:bg-[#fde6c3]'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Teacher / Faculty</span>
                  </button>
                </div>
              </div>

              {/* Action Selection: Log In vs Create New Account */}
              <div className="space-y-3">
                <label className="block text-[11px] font-black uppercase tracking-wider text-[#5c4033]">
                  2. Choose an Option ({role === 'student' ? 'Student' : 'Teacher'}):
                </label>

                <button
                  type="button"
                  onClick={() => handleChooseInitialAction('login', role)}
                  className="w-full p-4 rounded-2xl bg-[#fde6c3] hover:bg-[#f59e0b] border-2 border-[#1e1b18] flex items-center justify-between transition-all group cursor-pointer shadow-sm"
                >
                  <div className="flex items-center gap-3.5 text-left">
                    <div className="w-11 h-11 rounded-xl bg-[#f59e0b] group-hover:bg-[#fff7ea] border-2 border-[#1e1b18] flex items-center justify-center shrink-0">
                      <LogIn className="w-5 h-5 text-[#1e1b18]" />
                    </div>
                    <div>
                      <div className="text-sm font-black text-[#1e1b18]">
                        Log In to Existing Account
                      </div>
                      <div className="text-xs text-[#5c4033] group-hover:text-[#1e1b18] font-medium">
                        {role === 'student'
                          ? 'Access your saved progress, room, pets, and assignments'
                          : 'Access the Teacher Dashboard, class analytics, and unit locks'}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-[#1e1b18] shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => handleChooseInitialAction('register', role)}
                  className="w-full p-4 rounded-2xl bg-[#d1fae5] hover:bg-[#34d399] border-2 border-[#1e1b18] flex items-center justify-between transition-all group cursor-pointer shadow-sm"
                >
                  <div className="flex items-center gap-3.5 text-left">
                    <div className="w-11 h-11 rounded-xl bg-[#34d399] group-hover:bg-[#fff7ea] border-2 border-[#1e1b18] flex items-center justify-center shrink-0">
                      <UserPlus className="w-5 h-5 text-[#1e1b18]" />
                    </div>
                    <div>
                      <div className="text-sm font-black text-[#1e1b18]">
                        Create a New Account
                      </div>
                      <div className="text-xs text-[#065f46] group-hover:text-[#1e1b18] font-medium">
                        {role === 'student'
                          ? 'Register as a new student, choose your 1st animal & pet, and take the quick tour!'
                          : 'Register a new Teacher / Faculty account for your classroom'}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-[#1e1b18] shrink-0" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 1: AUTH FORM (LOG IN OR CREATE ACCOUNT FOR STUDENT & TEACHER) */}
          {loginStep === 'authForm' && (
            <div className="bg-[#fbf5eb] border-[3px] border-[#1e1b18] rounded-3xl p-6 sm:p-7 shadow-2xl text-[#1e1b18] transition-all font-game">
              {/* Top Back & Mode Switcher */}
              <div className="flex items-center justify-between mb-3">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setLoginStep('choice');
                  }}
                  className="text-xs font-bold text-[#5c4033] hover:text-[#1e1b18] flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <span className="text-[11px] font-bold text-[#5c4033]">IB World School</span>
              </div>

              {/* Log In vs Create Account Tabs */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-[#f3d5ab] rounded-2xl border-2 border-[#1e1b18] mb-4">
                <button
                  type="button"
                  onClick={() => handleAuthModeSwitch('login')}
                  className={`py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    authMode === 'login'
                      ? 'bg-[#f59e0b] text-[#1e1b18] border-2 border-[#1e1b18] shadow-xs'
                      : 'text-[#5c4033] hover:text-[#1e1b18]'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Log In</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAuthModeSwitch('register')}
                  className={`py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    authMode === 'register'
                      ? 'bg-[#34d399] text-[#1e1b18] border-2 border-[#1e1b18] shadow-xs'
                      : 'text-[#5c4033] hover:text-[#1e1b18]'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Create Account</span>
                </button>
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#1e1b18] mb-1">
                {authMode === 'login'
                  ? role === 'student'
                    ? 'Student Log In'
                    : 'Teacher Log In'
                  : role === 'student'
                  ? 'Create Student Account'
                  : 'Create Teacher Account'}
              </h2>
              <p className="text-xs text-[#5c4033] font-medium mb-4">
                {authMode === 'login'
                  ? 'Sign in with your school email and password:'
                  : role === 'student'
                  ? 'Complete your registration to choose your starter avatar, pet, and begin the interactive tour:'
                  : 'Register your faculty credentials to manage students and IB PYP inquiry units:'}
              </p>

              {/* Role Selector Tabs (Student / Teacher) */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-[#f3d5ab] rounded-2xl border-2 border-[#1e1b18] mb-4">
                <button
                  type="button"
                  onClick={() => handleRoleChange('student')}
                  className={`py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    role === 'student'
                      ? 'bg-[#fde68a] text-[#1e1b18] border-2 border-[#1e1b18] shadow-xs'
                      : 'text-[#5c4033] hover:text-[#1e1b18]'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleChange('teacher')}
                  className={`py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    role === 'teacher'
                      ? 'bg-[#78b3ea] text-[#1e1b18] border-2 border-[#1e1b18] shadow-xs'
                      : 'text-[#5c4033] hover:text-[#1e1b18]'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Teacher / Faculty</span>
                </button>
              </div>

              {/* Auth Form */}
              <form onSubmit={handleAuthSubmit} className="space-y-3.5">
                {authMode === 'register' && (
                  <div>
                    <label className="block text-xs font-bold text-[#1e1b18] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#b45309]" />
                      <span>{role === 'student' ? 'Student Full Name' : 'Teacher Full Name'}</span>
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        setErrorMessage('');
                      }}
                      placeholder={role === 'student' ? 'Student Full Name' : 'Teacher Full Name'}
                      className="w-full px-3.5 py-2 bg-[#fff7ea] border-2 border-[#1e1b18] rounded-xl text-sm text-[#1e1b18] placeholder-[#5c4033]/50 font-bold outline-none focus:ring-2 focus:ring-[#f59e0b]"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[#1e1b18] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#b45309]" />
                    <span>{role === 'student' ? 'Student Email' : 'Teacher Email'}</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5c4033]">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrorMessage('');
                      }}
                      placeholder={
                        role === 'student' ? 'student@school.edu' : 'teacher@school.edu'
                      }
                      className="w-full pl-10 pr-4 py-2 bg-[#fff7ea] border-2 border-[#1e1b18] rounded-xl text-sm text-[#1e1b18] placeholder-[#5c4033]/50 font-bold outline-none focus:ring-2 focus:ring-[#f59e0b]"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-[#1e1b18] uppercase tracking-wider flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-[#b45309]" />
                      <span>Password</span>
                    </label>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5c4033]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setErrorMessage('');
                      }}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2 bg-[#fff7ea] border-2 border-[#1e1b18] rounded-xl text-sm text-[#1e1b18] tracking-widest placeholder-[#5c4033]/50 font-mono outline-none focus:ring-2 focus:ring-[#f59e0b]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#5c4033] hover:text-[#1e1b18] cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Grade Year selector when registering a new Student */}
                {authMode === 'register' && role === 'student' && (
                  <div>
                    <label className="block text-xs font-bold text-[#1e1b18] uppercase tracking-wider mb-1">
                      Select PYP Grade Year:
                    </label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {years.map((y) => (
                        <button
                          key={y}
                          type="button"
                          onClick={() => {
                            sounds.playClick();
                            setSelectedYear(y);
                          }}
                          className={`py-1.5 rounded-xl text-xs font-black border-2 border-[#1e1b18] transition-all cursor-pointer ${
                            selectedYear === y
                              ? 'bg-[#f59e0b] text-[#1e1b18] shadow-xs'
                              : 'bg-[#fff7ea] text-[#5c4033] hover:bg-[#fde6c3]'
                          }`}
                        >
                          {y}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Join Teacher's Class (Available for Students) */}
                {role === 'student' && classes.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-[#fde6c3] border-2 border-[#1e1b18] space-y-2">
                    <label className="block text-[11px] font-black text-[#1e1b18] uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <School className="w-3.5 h-3.5 text-[#b45309]" />
                        <span>Join Teacher Classroom:</span>
                      </span>
                      <span className="text-[10px] font-mono text-[#b45309]">
                        Code: {classCodeInput}
                      </span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      <select
                        value={selectedClassId}
                        onChange={(e) => {
                          const cid = e.target.value;
                          setSelectedClassId(cid);
                          const found = classes.find((c) => c.id === cid);
                          if (found) setClassCodeInput(found.code);
                        }}
                        className="px-2.5 py-1.5 bg-[#fff7ea] border-2 border-[#1e1b18] rounded-xl text-xs font-bold text-[#1e1b18] outline-none"
                      >
                        {classes.map((cls) => (
                          <option key={cls.id} value={cls.id}>
                            {cls.name} ({cls.code})
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={classCodeInput}
                        onChange={(e) => {
                          const val = e.target.value.toUpperCase();
                          setClassCodeInput(val);
                          const found = classes.find((c) => c.code.toUpperCase() === val);
                          if (found) setSelectedClassId(found.id);
                        }}
                        placeholder="Class Code"
                        className="px-2.5 py-1.5 bg-[#fff7ea] border-2 border-[#1e1b18] rounded-xl text-xs font-mono font-bold text-[#1e1b18] uppercase outline-none"
                      />
                    </div>
                  </div>
                )}

                {errorMessage && (
                  <div className="p-2.5 rounded-xl bg-[#fecdd3] border-2 border-[#1e1b18] text-[#9f1239] text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-[#e11d48]" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {authMode === 'login' && (
                  <div className="flex items-center justify-between text-xs text-[#5c4033] pt-0.5 font-medium">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-[#1e1b18] text-[#f59e0b] focus:ring-0"
                      />
                      <span>Remember credentials</span>
                    </label>
                    <span className="text-[11px]">Encrypted Session</span>
                  </div>
                )}

                <button
                  type="submit"
                  className={`w-full py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 border-2 border-[#1e1b18] shadow-md transition-all transform hover:scale-[1.01] active:scale-98 cursor-pointer ${
                    authMode === 'register'
                      ? 'bg-[#34d399] hover:bg-[#10b981] text-[#1e1b18]'
                      : role === 'student'
                      ? 'bg-[#f59e0b] hover:bg-[#fbbf24] text-[#1e1b18]'
                      : 'bg-[#78b3ea] hover:bg-[#60a5fa] text-[#1e1b18]'
                  }`}
                >
                  <span>
                    {authMode === 'register'
                      ? role === 'student'
                        ? 'CREATE ACCOUNT & CHOOSE COMPANIONS'
                        : 'CREATE TEACHER ACCOUNT'
                      : role === 'student'
                      ? 'LOG IN AS STUDENT'
                      : 'ENTER TEACHER DASHBOARD'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Demo Accounts Helper (Only in Login Mode) */}
              {authMode === 'login' && (
                <div className="mt-4 pt-3 border-t-2 border-[#1e1b18]/20">
                  <div className="text-[11px] font-black text-[#5c4033] uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Quick Demo Profiles:</span>
                    <span className="text-[10px] text-[#b45309]">Click to autofill</span>
                  </div>

                  {role === 'student' ? (
                    <div className="grid grid-cols-3 gap-1.5">
                      {DEMO_STUDENTS.map((demo) => {
                        const isSelected = email.toLowerCase() === demo.email.toLowerCase();
                        return (
                          <button
                            key={demo.email}
                            type="button"
                            onClick={() => handleSelectDemoStudent(demo)}
                            className={`p-2 rounded-xl border-2 border-[#1e1b18] text-left flex flex-col items-center text-center transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#fde68a] text-[#1e1b18]'
                                : 'bg-[#fff7ea] text-[#5c4033] hover:bg-[#fde6c3]'
                            }`}
                          >
                            <div className="w-8 h-8 rounded-lg bg-[#fde6c3] border border-[#1e1b18] flex items-center justify-center overflow-hidden mb-1">
                              <PixelAvatar avatarId={demo.avatarId!} hatId={demo.hatId} size={28} />
                            </div>
                            <span className="text-[11px] font-bold truncate w-full text-[#1e1b18]">
                              {demo.name.split(' ')[0]}
                            </span>
                            <span className="text-[9px] text-[#5c4033] truncate w-full">
                              {demo.subtitle?.split('·')[0]}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSelectDemoTeacher}
                      className="w-full p-2.5 rounded-xl bg-[#fff7ea] hover:bg-[#fde6c3] border-2 border-[#1e1b18] text-left flex items-center justify-between transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#78b3ea] border border-[#1e1b18] flex items-center justify-center text-[#1e1b18]">
                          <GraduationCap className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#1e1b18]">
                            {DEMO_TEACHER.name}
                          </div>
                          <div className="text-[10px] text-[#5c4033] font-mono">
                            {DEMO_TEACHER.email}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold bg-[#fde6c3] text-[#1e1b18] px-2 py-0.5 rounded-md border border-[#1e1b18]">
                        PYP Faculty
                      </span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 2 (NEW STUDENT REGISTRATION): CHOOSE FIRST ANIMAL AVATAR & FIRST COMPANION PET */}
          {loginStep === 'onboardingStarter' && (
            <div className="bg-[#fbf5eb] border-[3px] border-[#1e1b18] rounded-3xl p-5 sm:p-6 shadow-2xl text-[#1e1b18] font-game max-h-[84vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-[#1e1b18]/20">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#34d399] border-2 border-[#1e1b18] flex items-center justify-center text-xl shadow-xs">
                    🎉
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-[#1e1b18]">
                      Welcome, {currentStudentName}! Choose Your Companions
                    </h2>
                    <p className="text-xs text-[#5c4033] font-medium">
                      Select your 1st Animal Avatar and your 1st Companion Pet for FREE before entering SPARK Island
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#f59e0b] text-[#1e1b18] border-2 border-[#1e1b18] text-xs font-black shrink-0">
                  {selectedYear}
                </span>
              </div>

              {/* 1. Pick First Animal Avatar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#1e1b18] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#d97706]" />
                    <span>1. Choose Your First Animal Avatar (16 Dogs & Cats):</span>
                  </h3>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#d1fae5] text-[#065f46] border border-[#1e1b18]">
                    FREE STARTER PICK
                  </span>
                </div>

                <div className="grid grid-cols-8 gap-1.5 bg-[#f3d5ab] p-2.5 rounded-2xl border-2 border-[#1e1b18]">
                  {ALL_16_AVATARS.map((avatar) => {
                    const isSelected = currentAvatarId === avatar.id;
                    return (
                      <button
                        key={avatar.id}
                        type="button"
                        onClick={() => {
                          sounds.playClick();
                          setCurrentAvatarId(avatar.id);
                        }}
                        className={`relative aspect-square rounded-xl border-2 flex items-center justify-center p-1 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#fde68a] border-[#1e1b18] ring-2 ring-[#f59e0b] scale-105 shadow-sm'
                            : 'bg-[#fff7ea] border-[#1e1b18]/60 hover:bg-[#fde6c3]'
                        }`}
                      >
                        <img
                          src={avatar.image}
                          alt="Avatar option"
                          className="w-full h-full object-contain pointer-events-none"
                          style={{ imageRendering: 'pixelated' }}
                        />
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#10b981] text-white border border-[#1e1b18] rounded-full flex items-center justify-center text-[9px] font-black">
                            ✓
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Pick First Companion Pet + Name It */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#1e1b18] flex items-center gap-1.5">
                    <PawPrint className="w-4 h-4 text-[#059669]" />
                    <span>2. Choose & Name Your First Pet (12 Pets):</span>
                  </h3>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#d1fae5] text-[#065f46] border border-[#1e1b18]">
                    1ST PET FREE
                  </span>
                </div>

                <div className="grid grid-cols-6 gap-2 bg-[#f3d5ab] p-2.5 rounded-2xl border-2 border-[#1e1b18] mb-3">
                  {PETS_COLLECTION.map((pet) => {
                    const isSelected = starterPetId === pet.id;
                    return (
                      <button
                        key={pet.id}
                        type="button"
                        onClick={() => {
                          sounds.playClick();
                          setStarterPetId(pet.id);
                          setStarterPetCustomName(pet.name);
                        }}
                        className={`relative aspect-square rounded-xl border-2 flex flex-col items-center justify-center p-1 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#a7f3d0] border-[#1e1b18] ring-2 ring-[#059669] scale-105 shadow-sm'
                            : 'bg-[#fff7ea] border-[#1e1b18]/60 hover:bg-[#fde6c3]'
                        }`}
                        title={pet.name}
                      >
                        <img
                          src={pet.image}
                          alt={pet.name}
                          className="w-4/5 h-4/5 object-contain pointer-events-none"
                          style={{ imageRendering: 'pixelated' }}
                        />
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#10b981] text-white border border-[#1e1b18] rounded-full flex items-center justify-center text-[9px] font-black">
                            ✓
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Selected Pair Preview + Pet Name Input */}
                <div className="p-3.5 rounded-2xl bg-[#fde6c3] border-2 border-[#1e1b18] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center -space-x-2">
                      <div className="w-12 h-12 rounded-xl bg-[#fff7ea] border-2 border-[#1e1b18] flex items-center justify-center z-10">
                        <PixelAvatar
                          avatarId={currentAvatarId}
                          hatId="none"
                          size={42}
                          flipHorizontal={true}
                        />
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-[#fff7ea] border-2 border-[#1e1b18] flex items-center justify-center p-1">
                        <img
                          src={selectedStarterPetObj.image}
                          alt={selectedStarterPetObj.name}
                          className="w-full h-full object-contain"
                          style={{ imageRendering: 'pixelated', transform: 'scaleX(-1)' }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-black text-[#1e1b18]">
                        {currentStudentName} & {starterPetCustomName || selectedStarterPetObj.name}
                      </div>
                      <div className="text-[10px] text-[#5c4033] font-medium">
                        {selectedStarterPetObj.desc}
                      </div>
                    </div>
                  </div>

                  <div className="w-full sm:w-52">
                    <label className="block text-[10px] font-black uppercase text-[#5c4033] mb-1">
                      Name Your Pet:
                    </label>
                    <input
                      type="text"
                      maxLength={20}
                      value={starterPetCustomName}
                      onChange={(e) => setStarterPetCustomName(e.target.value)}
                      placeholder="Enter pet name..."
                      className="w-full px-3 py-1.5 rounded-xl bg-[#fff7ea] border-2 border-[#1e1b18] text-xs font-bold text-[#1e1b18] outline-none focus:ring-2 focus:ring-[#f59e0b]"
                    />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCompleteStarterOnboarding}
                className="w-full py-3.5 bg-[#f59e0b] hover:bg-[#fbbf24] text-[#1e1b18] border-2 border-[#1e1b18] font-black text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01] active:scale-95 cursor-pointer"
              >
                <Compass className="w-5 h-5" />
                <span>ENTER SPARK ISLAND & START INTERACTIVE TUTORIAL</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 3: WELCOME BACK CARD (EXISTING STUDENT LOGIN) */}
          {loginStep === 'welcomeStudent' && (
            <div className="bg-[#fbf5eb] border-[3px] border-[#1e1b18] rounded-3xl p-6 sm:p-8 shadow-2xl text-center text-[#1e1b18] font-game">
              <div className="w-20 h-20 rounded-2xl bg-[#fde6c3] border-2 border-[#1e1b18] flex items-center justify-center mx-auto mb-4 overflow-hidden shadow-md">
                <PixelAvatar avatarId={currentAvatarId} hatId={currentHatId} size={64} />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d1fae5] border-2 border-[#1e1b18] text-[#065f46] text-[11px] font-bold mb-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>School Credentials Verified</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1e1b18] mb-2">
                Welcome back, {currentStudentName}!
              </h2>
              <p className="text-xs sm:text-sm text-[#5c4033] font-medium mb-5 leading-relaxed max-w-sm mx-auto">
                Your companion guides and mathematical inquiry worlds await you in{' '}
                <strong className="text-[#1e1b18]">SPARK Island</strong>.
              </p>

              <div className="p-4 bg-[#fde6c3] border-2 border-[#1e1b18] rounded-2xl mb-6 flex flex-col items-center gap-1">
                <span className="text-xs font-black text-[#1e1b18]">
                  Click the rotating planet or the button below:
                </span>
                <span className="text-[11px] text-[#5c4033] font-medium">
                  Ready to explore, discover, solve, and grow?
                </span>
              </div>

              <button
                onClick={handleEnterWorld}
                className="w-full py-4 bg-[#f59e0b] hover:bg-[#fbbf24] text-[#1e1b18] border-2 border-[#1e1b18] font-black text-sm sm:text-base rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                <span>ENTER THE WORLD</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  sounds.playClick();
                  setLoginStep('choice');
                }}
                className="mt-4 text-xs font-bold text-[#5c4033] hover:text-[#1e1b18] underline transition-colors cursor-pointer"
              >
                Switch user or create a new account
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 py-3 px-6 sm:px-10 text-center text-xs text-slate-500 border-t border-slate-900 bg-slate-950/60 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          <span>SPARK · Educational Innovation · IB Primary Years Programme</span>
        </div>
        <div className="text-[11px] text-slate-400">
          Secure student & teacher authentication · Log In or Create New Account
        </div>
      </footer>
    </div>
  );
};
