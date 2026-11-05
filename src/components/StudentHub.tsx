import React, { useState } from 'react';
import { StudentProfile, UnitOfInquiry, PYPYear, Classroom } from '../types';
import { PixelAvatar } from './PixelAvatar';
import { sounds } from '../services/sound';
import confetti from 'canvas-confetti';
import {
  Volume2,
  VolumeX,
  Settings,
  LogOut,
  X,
  Lock,
  CheckCircle2,
  Lightbulb,
  HelpCircle,
  ArrowRight,
  ChevronLeft,
  School,
} from 'lucide-react';

interface StudentHubProps {
  student: StudentProfile;
  units?: UnitOfInquiry[];
  classes?: Classroom[];
  onJoinClass?: (codeOrClassId: string) => boolean;
  onUpdateStudent: (updated: Partial<StudentProfile>) => void;
  onSelectUnit: (unit: UnitOfInquiry) => void;
  onOpenMathLab: () => void;
  onOpenQuickThinking: () => void;
  onOpenRoom: () => void;
  onOpenHomework: () => void;
  onOpenDailyQuests?: () => void;
  onOpenPets: () => void;
  onOpenBadges: () => void;
  showTutorial?: boolean;
  onCloseTutorial?: () => void;
  onStartTutorial?: () => void;
  onLogout: () => void;
}

export const StudentHub: React.FC<StudentHubProps> = ({
  student,
  units,
  classes = [],
  onJoinClass,
  onUpdateStudent,
  onSelectUnit,
  onOpenMathLab,
  onOpenQuickThinking,
  onOpenRoom,
  onOpenHomework,
  onOpenDailyQuests,
  onOpenPets,
  onOpenBadges,
  showTutorial = false,
  onCloseTutorial,
  onStartTutorial,
  onLogout,
}) => {
  const [muted, setMuted] = useState(sounds.getMuted());
  const [hoveredUnit, setHoveredUnit] = useState<UnitOfInquiry | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCompanionDialogueOpen, setIsCompanionDialogueOpen] = useState(false);
  const [isCastleModalOpen, setIsCastleModalOpen] = useState(false);
  const [lockedUnitModal, setLockedUnitModal] = useState<UnitOfInquiry | null>(null);
  const [companionTipIndex, setCompanionTipIndex] = useState(0);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [joinFeedback, setJoinFeedback] = useState<string | null>(null);

  const tutorialSteps = [
    {
      title: '1. Your Student Profile & Level',
      areaLabel: 'Top-Left Profile Card',
      icon: '👤',
      description:
        'Here you can see your Animal Avatar, Name, active PYP Grade Year (Y1–Y5), current Level, and XP progress bar. Click your profile card anytime to visit your Cozy Room and Wardrobe!',
      highlightStyle: { left: '0.8%', top: '1.1%', width: '19.5%', height: '8.8%' },
    },
    {
      title: '2. Coins, Gems & Inquiry Stars',
      areaLabel: 'Top-Center Currency Bar',
      icon: '🪙',
      description:
        'As you solve mathematical challenges, you earn Coins (🪙) to adopt new pets, buy hats, food, and room furniture, plus Spark Gems (💎) and Inquiry Stars (⭐) as you complete worlds!',
      highlightStyle: { left: '31.2%', top: '1.0%', width: '38.4%', height: '6.8%' },
    },
    {
      title: '3. The 6 IB PYP Inquiry Worlds',
      areaLabel: 'Island Regions on the Map',
      icon: '🌍',
      description:
        'SPARK Island has 6 transdisciplinary IB PYP worlds. Start your adventure in "Sharing the Planet" (unlocked!) to solve real-world math story missions. Locked worlds have a lock icon and are unlocked by your teacher.',
      highlightStyle: { left: '64.0%', top: '59.0%', width: '19.5%', height: '21.5%' },
    },
    {
      title: '4. Right-Side Learning & Room Dock',
      areaLabel: 'Right Action Buttons',
      icon: '🧪',
      description:
        'Use the 4 buttons on the right to practice at your own pace: "Math Lab" (5 math competencies), "Quick Thinking" (timed speed math), "My Room & Avatar" (customize your room, hats & pets), and "Homework" (teacher assignments).',
      highlightStyle: { left: '89.7%', top: '12.0%', width: '10.1%', height: '53.0%' },
    },
    {
      title: '5. Pets Sanctuary & Daily Quests',
      areaLabel: 'Bottom-Left Buttons',
      icon: '🐾',
      description:
        'In the bottom-left corner, click "Pets" to feed, care for, and name your animal companions, or click "Daily Quest" to complete daily mathematical challenges for bonus XP and Coins!',
      highlightStyle: { left: '0.8%', top: '87.2%', width: '29.8%', height: '9.6%' },
    },
    {
      title: '6. Badges, Settings & Homework Inbox',
      areaLabel: 'Top-Right Utility Buttons',
      icon: '🏆',
      description:
        'In the top-right corner, click the Trophy (🏆) to view your unlocked Badges, the Gear (⚙️) to change your PYP Grade Year (Y1–Y5) or audio settings, and the Envelope (✉️) to check your Homework Inbox.',
      highlightStyle: { left: '82.6%', top: '1.0%', width: '17.1%', height: '8.9%' },
    },
  ];

  const toggleSound = () => {
    const isM = sounds.toggleMute();
    setMuted(isM);
  };

  const handleYearChange = (year: PYPYear) => {
    sounds.playClick();
    onUpdateStudent({ currentYear: year });
  };

  const years: PYPYear[] = ['Y1', 'Y2', 'Y3', 'Y4', 'Y5'];

  const companionTips = [
    `Welcome, ${student.name}! I recommend beginning in 'Sharing the Planet' or exploring the Math Lab.`,
    'Did you know solving challenges in Quick Thinking sharpens your mental math agility and earns bonus XP?',
    'Click on the Pets button in the lower-left corner to feed and nurture your animal companions!',
    'Click on the Daily Quest button next to Pets to complete daily mathematical challenges, or open Homework on the right dock for teacher assignments!',
  ];

  const handleNextTip = () => {
    sounds.playClick();
    setCompanionTipIndex((prev) => (prev + 1) % companionTips.length);
  };

  const xpPercent = Math.min(100, Math.round((student.xp / student.xpNext) * 100));

  // Exact pixel-measured outer border coordinates normalized to 1663 x 946 map image (/assets/aistudio/image_c7b50cb5.png)
  const unitHotspots: Record<
    string,
    {
      plaque: { left: string; top: string; width: string; height: string };
      landmark: { left: string; top: string; width: string; height: string };
      label: string;
      icon: string;
    }
  > = {
    'who-we-are': {
      // px=[329,249..532,300] (204x52)
      plaque: { left: '19.78%', top: '26.32%', width: '12.27%', height: '5.50%' },
      landmark: { left: '17.50%', top: '14.50%', width: '15.50%', height: '17.30%' },
      label: 'About Us',
      icon: '🧭',
    },
    'how-we-express': {
      // px=[215,442..455,508] (241x67)
      plaque: { left: '12.93%', top: '46.72%', width: '14.49%', height: '7.08%' },
      landmark: { left: '9.20%', top: '34.50%', width: '18.80%', height: '19.30%' },
      label: 'How We Express Ourselves',
      icon: '🎨',
    },
    'how-we-organize': {
      // px=[333,654..590,720] (258x67)
      plaque: { left: '20.02%', top: '69.13%', width: '15.51%', height: '7.08%' },
      landmark: { left: '17.50%', top: '56.50%', width: '18.50%', height: '19.70%' },
      label: 'How We Organize Ourselves',
      icon: '🏛️',
    },
    'where-we-are': {
      // px=[1123,257..1371,326] (249x70)
      plaque: { left: '67.53%', top: '27.17%', width: '14.97%', height: '7.40%' },
      landmark: { left: '66.50%', top: '16.00%', width: '16.50%', height: '18.50%' },
      label: 'Where We Are in Place and Time',
      icon: '⏳',
    },
    'how-the-world-works': {
      // px=[1153,455..1368,525] (216x71)
      plaque: { left: '69.33%', top: '48.10%', width: '12.99%', height: '7.51%' },
      landmark: { left: '67.50%', top: '36.50%', width: '17.00%', height: '19.10%' },
      label: 'How the World Works',
      icon: '⚡',
    },
    'sharing-the-planet': {
      // px=[1118,689..1351,755] (234x67)
      plaque: { left: '67.23%', top: '72.83%', width: '14.07%', height: '7.08%' },
      landmark: { left: '64.50%', top: '59.50%', width: '19.00%', height: '20.40%' },
      label: 'Sharing the Planet',
      icon: '🌳',
    },
  };

  const handleUnitClick = (unit: UnitOfInquiry) => {
    sounds.playClick();
    if (unit.locked) {
      sounds.playError();
      setLockedUnitModal(unit);
      return;
    }
    onSelectUnit(unit);
  };

  return (
    <div className="relative w-screen h-screen flex flex-col items-center justify-center bg-[#fdf5eb] overflow-hidden font-game select-none text-[#1e1b18]">
      {/* MAIN MAP CANVAS (1663 x 946) */}
      <main className="relative w-full h-full flex items-center justify-center overflow-hidden bg-[#78b3ea] p-0 sm:p-2">
        {/* Aspect Ratio Lock for Pixel-Perfect Overlay Alignment (1663 : 946) */}
        <div className="relative aspect-[1663/946] w-full max-h-full max-w-[calc(100vh*1663/946)] flex items-center justify-center shadow-2xl rounded-2xl overflow-hidden bg-[#78b3ea] border-2 border-amber-900/20">
          {/* Authentic Map Image requested by user */}
          <img
            src="/assets/aistudio/image_c7b50cb5.png"
            alt="SPARK - Island of Inquiry"
            className="w-full h-full object-fill pointer-events-none select-none"
          />

          {/* =========================================================================
              1. TOP-LEFT CORNER: STUDENT PROFILE BUTTON
                 Height and length match the exact height and length of the inner elements
             ========================================================================= */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onOpenRoom();
            }}
            className="absolute left-[1.08%] top-[1.48%] w-fit h-fit inline-flex items-stretch gap-2 p-0 rounded-xl bg-[#fde6c3] border-[2.5px] border-[#1e1b18] shadow-md cursor-pointer hover:ring-2 hover:ring-amber-400 transition-all transform hover:scale-[1.02] active:scale-95 group z-20 overflow-visible"
            title="Student Profile · Click to open Wardrobe, Room & Avatar"
          >
            {/* Student Avatar Box (Defines exact height on the left) */}
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-l-[9px] bg-[#fff2e6] border-r-2 border-[#1e1b18] flex items-center justify-center shrink-0">
              <PixelAvatar avatarId={student.avatarId} hatId={student.hatId} size={38} />
            </div>

            {/* Profile Info & XP Bar (Defines exact length and matches height) */}
            <div className="flex flex-col justify-between py-0.5 pr-2.5 min-w-[125px] sm:min-w-[145px] text-left font-game">
              <div className="flex items-center justify-between gap-1.5 leading-none">
                <span className="font-bold text-xs sm:text-sm text-[#1e1b18] truncate font-game">
                  {student.name}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="px-1.5 py-0.5 rounded-md bg-[#f59e0b] text-[#1e1b18] text-[9px] sm:text-[10px] font-bold border border-[#1e1b18] shrink-0 font-game leading-none">
                    {student.currentYear}
                  </span>
                  <span className="px-1.5 py-0.5 rounded-md bg-[#e4a887] text-[#1e1b18] text-[9px] sm:text-[10px] font-bold border border-[#1e1b18] shrink-0 font-game leading-none">
                    Lv. {student.level}
                  </span>
                </div>
              </div>

              {/* Live XP Progress Bar at the bottom edge of the profile content */}
              <div className="w-full">
                <div className="flex justify-between items-center text-[8px] sm:text-[9px] font-bold text-[#1e1b18] leading-none mb-0.5 font-game">
                  <span>XP</span>
                  <span>
                    {student.xp} / {student.xpNext}
                  </span>
                </div>
                <div className="w-full h-2 bg-[#d8b892] rounded-full overflow-hidden border border-[#1e1b18]">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${xpPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </button>

          {/* =========================================================================
              2. TOP-CENTER CURRENCY PLAQUES (EXACT BOUNDS ON NEW MAP)
                 Coins: px=[529,14..724,68] -> left: 31.81%, top: 1.48%, w: 11.79%, h: 5.81%
                 Gems:  px=[760,14..943,68] -> left: 45.70%, top: 1.48%, w: 11.06%, h: 5.81%
                 Stars: px=[978,14..1148,68] -> left: 58.81%, top: 1.48%, w: 10.28%, h: 5.81%
             ========================================================================= */}
          <div
            className="absolute left-[31.81%] top-[1.48%] w-[11.79%] h-[5.81%] rounded-full flex items-center justify-center pl-[2.8%] cursor-default z-20 font-game"
            title="Coins collected in adventures and lab inquiries"
          >
            <span className="font-bold text-xs sm:text-sm md:text-base text-[#1e1b18] font-game leading-none tracking-tight">
              {student.coins.toLocaleString()}
            </span>
          </div>

          <div
            className="absolute left-[45.70%] top-[1.48%] w-[11.06%] h-[5.81%] rounded-full flex items-center justify-center pl-[2.6%] cursor-default z-20 font-game"
            title="Spark Gems earned from inquiry milestones"
          >
            <span className="font-bold text-xs sm:text-sm md:text-base text-[#1e1b18] font-game leading-none tracking-tight">
              {student.gems}
            </span>
          </div>

          <div
            className="absolute left-[58.81%] top-[1.48%] w-[10.28%] h-[5.81%] rounded-full flex items-center justify-center pl-[2.6%] cursor-default z-20 font-game"
            title="Inquiry Stars earned across IB PYP worlds"
          >
            <span className="font-bold text-xs sm:text-sm md:text-base text-[#1e1b18] font-game leading-none tracking-tight">
              {student.unitStars}
            </span>
          </div>

          {/* =========================================================================
              3. TOP-RIGHT ACTION BUTTONS (EXACT OUTER EDGES)
                 Trophy:   px=[1382,14..1459,88] -> left: 83.10%, top: 1.48%, w: 4.69%, h: 7.93%
                 Settings: px=[1479,14..1555,88] -> left: 88.94%, top: 1.48%, w: 4.63%, h: 7.93%
                 Mail:     px=[1576,14..1653,88] -> left: 94.77%, top: 1.48%, w: 4.69%, h: 7.93%
             ========================================================================= */}
          {/* Trophy -> Badges Gallery */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onOpenBadges();
            }}
            className="absolute left-[83.10%] top-[1.48%] w-[4.69%] h-[7.93%] rounded-[26%] cursor-pointer transition-all transform hover:scale-105 active:scale-95 hover:ring-3 hover:ring-amber-400/90 z-20"
            title="Badges & Achievements Gallery"
            aria-label="Badges"
          >
            <span className="sr-only">Badges</span>
          </button>

          {/* Settings Gear */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setIsSettingsOpen(true);
            }}
            className="absolute left-[88.94%] top-[1.48%] w-[4.63%] h-[7.93%] rounded-[26%] cursor-pointer transition-all transform hover:scale-105 active:scale-95 hover:ring-3 hover:ring-amber-400/90 z-20"
            title="Game Settings & Audio"
            aria-label="Settings"
          >
            <span className="sr-only">Settings</span>
          </button>

          {/* Mail Envelope -> Homework */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onOpenHomework();
            }}
            className="absolute left-[94.77%] top-[1.48%] w-[4.69%] h-[7.93%] rounded-[26%] cursor-pointer transition-all transform hover:scale-105 active:scale-95 hover:ring-3 hover:ring-amber-400/90 z-20"
            title="Homework Inbox"
            aria-label="Homework Inbox"
          >
            <span className="sr-only">Homework Inbox</span>
          </button>

          {/* =========================================================================
              4. CENTER CASTLE BANNER: "SPARK"
                 px=[610,99..1020,231] -> left: 36.68%, top: 10.47%, w: 24.71%, h: 14.06%
             ========================================================================= */}
          <button
            type="button"
            onClick={() => {
              sounds.playSuccess();
              confetti({ particleCount: 50, spread: 70 });
              setIsCastleModalOpen(true);
            }}
            className="absolute left-[36.68%] top-[10.47%] w-[24.71%] h-[14.06%] rounded-[28px] cursor-pointer hover:ring-3 hover:ring-amber-400/70 transition-all z-20"
            title="SPARK Castle: Overview & Quest Progress"
            aria-label="SPARK Castle"
          />

          {/* =========================================================================
              5. RIGHT-SIDE DOCK BUTTONS (EXACT OUTER EDGES)
                 Math Lab:       px=[1500,118..1653,244] -> left: 90.20%, top: 12.47%, w: 9.26%, h: 13.42%
                 Quick Thinking: px=[1500,250..1653,368] -> left: 90.20%, top: 26.43%, w: 9.26%, h: 12.58%
                 My Room:        px=[1500,377..1653,498] -> left: 90.20%, top: 39.85%, w: 9.26%, h: 12.90%
                 Homework:       px=[1500,507..1653,608] -> left: 90.20%, top: 53.59%, w: 9.26%, h: 10.78%
             ========================================================================= */}
          {/* 1. Math Lab */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onOpenMathLab();
            }}
            className="absolute left-[90.20%] top-[12.47%] w-[9.26%] h-[13.42%] rounded-[22%] cursor-pointer transition-all transform hover:scale-105 active:scale-95 hover:ring-3 hover:ring-emerald-400/90 z-20"
            title="Math Lab: Competency Laboratory"
            aria-label="Math Lab"
          >
            <span className="sr-only">Math Lab</span>
          </button>

          {/* 2. Quick Thinking */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onOpenQuickThinking();
            }}
            className="absolute left-[90.20%] top-[26.43%] w-[9.26%] h-[12.58%] rounded-[22%] cursor-pointer transition-all transform hover:scale-105 active:scale-95 hover:ring-3 hover:ring-amber-400/90 z-20"
            title="Quick Thinking: Timed Calculation Challenge"
            aria-label="Quick Thinking"
          >
            <span className="sr-only">Quick Thinking</span>
          </button>

          {/* 3. My Room & Avatar */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onOpenRoom();
            }}
            className="absolute left-[90.20%] top-[39.85%] w-[9.26%] h-[12.90%] rounded-[22%] cursor-pointer transition-all transform hover:scale-105 active:scale-95 hover:ring-3 hover:ring-orange-400/90 z-20"
            title="My Room & Avatar: Wardrobe, Pets & Furniture"
            aria-label="My Room & Avatar"
          >
            <span className="sr-only">My Room & Avatar</span>
          </button>

          {/* 4. Homework (Separated from Daily Quests) */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onOpenHomework();
            }}
            className="absolute left-[90.20%] top-[53.59%] w-[9.26%] h-[10.78%] rounded-[22%] cursor-pointer transition-all transform hover:scale-105 active:scale-95 hover:ring-3 hover:ring-indigo-400/90 z-20"
            title="Homework Assignments"
            aria-label="Homework"
          >
            <span className="sr-only">Homework</span>
          </button>

          {/* =========================================================================
              6. BOTTOM-LEFT BUTTONS: PETS & DAILY QUEST (EXACT OUTER EDGES)
                 Pets:        px=[18,831..254,910]  -> left: 1.08%, top: 87.84%, w: 14.25%, h: 8.46%
                 Daily Quest: px=[269,831..500,910] -> left: 16.18%, top: 87.84%, w: 13.95%, h: 8.46%
             ========================================================================= */}
          {/* Pets Button */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onOpenPets();
            }}
            className="absolute left-[1.08%] top-[87.84%] w-[14.25%] h-[8.46%] rounded-[24px] cursor-pointer transition-all transform hover:scale-105 active:scale-95 hover:ring-3 hover:ring-amber-400/90 z-20"
            title="Pets Sanctuary: Adopt, feed, and care for companion pets"
            aria-label="Pets"
          >
            <span className="sr-only">Pets</span>
          </button>

          {/* Daily Quest Button (Relocated Quests Function) */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              if (onOpenDailyQuests) {
                onOpenDailyQuests();
              } else {
                onOpenHomework();
              }
            }}
            className="absolute left-[16.18%] top-[87.84%] w-[13.95%] h-[8.46%] rounded-[24px] cursor-pointer transition-all transform hover:scale-105 active:scale-95 hover:ring-3 hover:ring-amber-400/90 z-20"
            title="Daily Quests: Complete daily mathematical challenges"
            aria-label="Daily Quest"
          >
            <span className="sr-only">Daily Quest</span>
          </button>

          {/* =========================================================================
              7. THE 6 PYP INQUIRY UNIT REGIONS (EXACT PLAQUE EDGES & ICON-ONLY LOCK)
                 - IF LOCKED: ONLY LOCK ICON (NO WORDS)
                 - IF UNLOCKED: NO ICON AT ALL
             ========================================================================= */}
          {(units || []).map((unit) => {
            const spot = unitHotspots[unit.id];
            if (!spot) return null;

            return (
              <React.Fragment key={unit.id}>
                {/* Landmark clickable hotspot */}
                <div
                  style={{
                    left: spot.landmark.left,
                    top: spot.landmark.top,
                    width: spot.landmark.width,
                    height: spot.landmark.height,
                  }}
                  className="absolute rounded-3xl cursor-pointer z-10 transition-all"
                  onMouseEnter={() => setHoveredUnit(unit)}
                  onMouseLeave={() => setHoveredUnit(null)}
                  onClick={() => handleUnitClick(unit)}
                  title={`${unit.name} ${unit.locked ? '(Locked - Teacher Access Required)' : ''}`}
                />

                {/* Plaque Button (Coincides with exact outer edges on the map) */}
                <button
                  type="button"
                  style={{
                    left: spot.plaque.left,
                    top: spot.plaque.top,
                    width: spot.plaque.width,
                    height: spot.plaque.height,
                  }}
                  className={`absolute rounded-[20px] cursor-pointer z-20 transition-all transform hover:scale-105 active:scale-95 ${
                    unit.locked
                      ? 'hover:ring-3 hover:ring-rose-400/90'
                      : 'hover:ring-3 hover:ring-emerald-400/90'
                  }`}
                  onMouseEnter={() => setHoveredUnit(unit)}
                  onMouseLeave={() => setHoveredUnit(null)}
                  onClick={() => handleUnitClick(unit)}
                  aria-label={unit.name}
                >
                  {/* ONLY THE LOCK ICON WHEN LOCKED (NO WORDS) */}
                  {unit.locked && (
                    <div className="absolute -top-2.5 -right-2.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#fde6c3] border-2 border-[#1e1b18] shadow-md flex items-center justify-center pointer-events-none">
                      <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1e1b18] stroke-[2.5]" />
                    </div>
                  )}
                </button>
              </React.Fragment>
            );
          })}

          {/* =========================================================================
              8. CENTER-BOTTOM COMPANION (CAT & BLUE BIRD) & "!" BUBBLE
                 Exclamation Bubble: px=[777,695..840,755] -> left: 46.72%, top: 73.47%, w: 3.85%, h: 6.45%
             ========================================================================= */}
          {/* "!" Bubble */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setIsCompanionDialogueOpen(!isCompanionDialogueOpen);
            }}
            className="absolute left-[46.72%] top-[73.47%] w-[3.85%] h-[6.45%] rounded-full cursor-pointer z-30 transition-transform hover:scale-110 active:scale-95 hover:ring-3 hover:ring-amber-400/90"
            title="Talk to your companion guide"
            aria-label="Companion Guide"
          />

          {/* Companions on the dock */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setIsCompanionDialogueOpen(!isCompanionDialogueOpen);
            }}
            className="absolute left-[43.00%] top-[80.80%] w-[13.00%] h-[14.80%] rounded-2xl cursor-pointer z-20 hover:ring-2 hover:ring-amber-400/60 transition-all"
            title="Companion Guide: Mochi & Pipsqueak"
            aria-label="Companions"
          />

          {/* Companion Speech Balloon Dialog */}
          {isCompanionDialogueOpen && (
            <div className="absolute left-[33%] top-[56%] z-40 max-w-sm bg-[#fbf5eb] border-[3px] border-[#1e1b18] rounded-3xl p-4 shadow-2xl text-[#1e1b18] animate-in fade-in zoom-in-95 font-game">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-1.5 text-xs font-black text-[#1e1b18]">
                  <span>🐱</span>
                  <span>Mochi, Your Expedition Guide</span>
                </div>
                <button
                  onClick={() => setIsCompanionDialogueOpen(false)}
                  className="p-0.5 text-[#5c4033] hover:text-[#1e1b18] rounded-md cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-xs text-[#5c4033] leading-relaxed font-medium mb-3">
                {companionTips[companionTipIndex]}
              </p>

              <div className="flex items-center justify-between pt-2 border-t-2 border-[#1e1b18]/20">
                <button
                  onClick={handleNextTip}
                  className="text-[11px] font-bold text-[#b45309] hover:text-[#1e1b18] flex items-center gap-1 cursor-pointer"
                >
                  <Lightbulb className="w-3 h-3" />
                  <span>Next Tip</span>
                </button>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setIsCompanionDialogueOpen(false);
                      setTutorialStep(0);
                      onStartTutorial?.();
                    }}
                    className="px-2.5 py-1 bg-[#34d399] hover:bg-[#10b981] text-[#1e1b18] border-2 border-[#1e1b18] text-[11px] font-bold rounded-xl shadow-xs cursor-pointer"
                  >
                    Tour Guide
                  </button>
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setIsCompanionDialogueOpen(false);
                      const unit = (units || []).find((u) => u.id === 'sharing-the-planet');
                      if (unit) onSelectUnit(unit);
                    }}
                    className="px-2.5 py-1 bg-[#f59e0b] hover:bg-[#fbbf24] text-[#1e1b18] border-2 border-[#1e1b18] text-[11px] font-bold rounded-xl shadow-xs cursor-pointer"
                  >
                    Play Forest
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              9. HOVER PREVIEW CARD FOR UNITS
             ========================================================================= */}
          {hoveredUnit && !showTutorial && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-40 p-4 bg-[#fde6c3] border-[3px] border-[#1e1b18] rounded-2xl shadow-2xl text-[#1e1b18] max-w-md pointer-events-none transition-all">
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="text-2xl">{hoveredUnit.icon}</span>
                <div>
                  <h4 className="text-sm sm:text-base font-black text-[#1e1b18] font-game">
                    {hoveredUnit.name}
                  </h4>
                  <p className="text-[11px] font-bold text-[#5c4033]">{hoveredUnit.worldName}</p>
                </div>
              </div>
              <p className="text-xs text-[#5c4033] line-clamp-2 leading-relaxed mb-2 font-medium">
                {hoveredUnit.story}
              </p>
              <div className="pt-2 border-t-2 border-[#1e1b18]/25 flex items-center justify-between text-[11px] text-[#1e1b18] font-bold">
                <span>
                  Levels: {hoveredUnit.completedLevels} / {hoveredUnit.totalLevels}
                </span>
                {hoveredUnit.locked ? (
                  <span className="text-rose-700 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>Locked (Teacher Access Required)</span>
                  </span>
                ) : (
                  <span className="text-[#047857]">Click to Play</span>
                )}
              </div>
            </div>
          )}

          {/* =========================================================================
              9B. INTERACTIVE STUDENT INTERFACE TUTORIAL OVERLAY (ON NEW ACCOUNT CREATION)
             ========================================================================= */}
          {showTutorial && (
            <div className="absolute inset-0 z-50 bg-[#1e1b18]/45 flex items-center justify-center p-4">
              {/* Highlighted Area Spotlight Frame on the Map */}
              <div
                style={tutorialSteps[tutorialStep]?.highlightStyle}
                className="absolute rounded-3xl border-4 border-[#f59e0b] ring-4 ring-[#fde68a]/90 bg-[#fde68a]/20 pointer-events-none transition-all duration-300 animate-pulse shadow-[0_0_0_9999px_rgba(30,27,24,0.45)]"
              />

              {/* Tutorial Explanation Card */}
              <div className="relative z-10 w-full max-w-md bg-[#fbf5eb] border-[3px] border-[#1e1b18] rounded-3xl p-5 sm:p-6 shadow-2xl text-[#1e1b18] font-game animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-3 mb-3 border-b-2 border-[#1e1b18]/20">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-[#f59e0b] border-2 border-[#1e1b18] flex items-center justify-center text-xl shadow-xs">
                      {tutorialSteps[tutorialStep]?.icon}
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#b45309] block">
                        Interactive Island Tour · Step {tutorialStep + 1} of {tutorialSteps.length}
                      </span>
                      <h3 className="text-base sm:text-lg font-black text-[#1e1b18]">
                        {tutorialSteps[tutorialStep]?.title}
                      </h3>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setTutorialStep(0);
                      onCloseTutorial?.();
                    }}
                    className="p-1 rounded-xl bg-[#f3d5ab] hover:bg-[#e8c496] text-[#1e1b18] border-2 border-[#1e1b18] cursor-pointer"
                    title="Skip Tutorial"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="mb-3">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#fde6c3] border border-[#1e1b18] text-[10px] font-black text-[#5c4033] mb-2">
                    📍 {tutorialSteps[tutorialStep]?.areaLabel}
                  </span>
                  <p className="text-xs sm:text-sm text-[#1e1b18] font-medium leading-relaxed">
                    {tutorialSteps[tutorialStep]?.description}
                  </p>
                </div>

                {/* Step Progress Dots */}
                <div className="flex items-center justify-center gap-1.5 my-3">
                  {tutorialSteps.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        setTutorialStep(idx);
                      }}
                      className={`h-2.5 rounded-full border border-[#1e1b18] transition-all cursor-pointer ${
                        idx === tutorialStep
                          ? 'w-6 bg-[#f59e0b]'
                          : 'w-2.5 bg-[#d8b892] hover:bg-[#fde6c3]'
                      }`}
                      aria-label={`Step ${idx + 1}`}
                    />
                  ))}
                </div>

                {/* Navigation Controls */}
                <div className="flex items-center justify-between pt-3 border-t-2 border-[#1e1b18]/20">
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setTutorialStep(0);
                      onCloseTutorial?.();
                    }}
                    className="text-xs font-bold text-[#5c4033] hover:text-[#1e1b18] underline cursor-pointer"
                  >
                    Skip Tour
                  </button>

                  <div className="flex items-center gap-2">
                    {tutorialStep > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          sounds.playClick();
                          setTutorialStep((prev) => prev - 1);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#fff7ea] hover:bg-[#fde6c3] text-[#1e1b18] border-2 border-[#1e1b18] text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>Previous</span>
                      </button>
                    )}

                    {tutorialStep < tutorialSteps.length - 1 ? (
                      <button
                        type="button"
                        onClick={() => {
                          sounds.playClick();
                          setTutorialStep((prev) => prev + 1);
                        }}
                        className="px-4 py-1.5 rounded-xl bg-[#f59e0b] hover:bg-[#fbbf24] text-[#1e1b18] border-2 border-[#1e1b18] text-xs font-black flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        <span>Next</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          sounds.playSuccess();
                          confetti({ particleCount: 50, spread: 60 });
                          setTutorialStep(0);
                          onCloseTutorial?.();
                        }}
                        className="px-4 py-1.5 rounded-xl bg-[#34d399] hover:bg-[#10b981] text-[#1e1b18] border-2 border-[#1e1b18] text-xs font-black flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Finish Tour & Play!</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* =========================================================================
          10. LOCKED UNIT MODAL (Teacher Access Enforced)
         ========================================================================= */}
      {lockedUnitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1e1b18]/65 backdrop-blur-xs p-4 font-game">
          <div className="w-full max-w-md bg-[#fbf5eb] border-[3px] border-[#1e1b18] rounded-3xl p-6 shadow-2xl text-[#1e1b18] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-[#1e1b18]/20">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#fde6c3] border-2 border-[#1e1b18] text-[#1e1b18] flex items-center justify-center text-xl">
                  🔒
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#1e1b18] font-game">
                    Inquiry World Locked
                  </h3>
                  <p className="text-xs text-rose-700 font-bold">
                    Teacher Access Required
                  </p>
                </div>
              </div>
              <button
                onClick={() => setLockedUnitModal(null)}
                className="p-1 rounded-xl bg-[#f3d5ab] hover:bg-[#e8c496] text-[#1e1b18] border-2 border-[#1e1b18] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-[#5c4033] leading-relaxed mb-4 font-medium">
              <strong className="text-[#1e1b18]">{lockedUnitModal.name}</strong> is currently locked. To access this region, complete your active assignments in <strong className="text-[#1e1b18]">Sharing the Planet</strong>, or ask your teacher to grant access in the Teacher Dashboard.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t-2 border-[#1e1b18]/20">
              <button
                onClick={() => setLockedUnitModal(null)}
                className="px-4 py-2 bg-[#f59e0b] hover:bg-[#fbbf24] text-[#1e1b18] border-2 border-[#1e1b18] font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          11. SPARK CASTLE MODAL (Grand Quest Overview)
         ========================================================================= */}
      {isCastleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1e1b18]/65 backdrop-blur-xs p-4 font-game">
          <div className="w-full max-w-lg bg-[#fbf5eb] border-[3px] border-[#1e1b18] rounded-3xl p-6 shadow-2xl text-[#1e1b18] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-[#1e1b18]/20">
              <div className="flex items-center gap-2.5">
                <span className="text-3xl">🏰</span>
                <div>
                  <h3 className="text-lg font-black text-[#1e1b18] font-game">
                    SPARK Castle
                  </h3>
                  <p className="text-xs text-[#5c4033] font-bold">
                    IB PYP Mathematical Inquiry Kingdom
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCastleModalOpen(false)}
                className="p-1.5 rounded-xl bg-[#f3d5ab] hover:bg-[#e8c496] text-[#1e1b18] border-2 border-[#1e1b18] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 mb-4 max-h-[50vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-2.5">
                {(units || []).map((u) => {
                  const isStarted = u.completedLevels > 0;
                  return (
                    <div
                      key={u.id}
                      onClick={() => {
                        setIsCastleModalOpen(false);
                        handleUnitClick(u);
                      }}
                      className={`p-3 rounded-2xl border-2 border-[#1e1b18] shadow-xs cursor-pointer transition-all flex items-center gap-2.5 ${
                        u.locked
                          ? 'bg-[#e8c496]/60 opacity-80'
                          : 'bg-[#fff7ea] hover:bg-[#fde6c3]'
                      }`}
                    >
                      <span className="text-2xl">{u.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-black text-[#1e1b18] truncate">
                          {u.name}
                        </div>
                        <div className="text-[10px] font-bold text-[#5c4033]">
                          {u.locked ? 'Locked' : `${u.completedLevels} / ${u.totalLevels} levels`}
                        </div>
                      </div>
                      {u.locked ? (
                        <Lock className="w-3.5 h-3.5 text-[#5c4033] shrink-0" />
                      ) : isStarted ? (
                        <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-[#1e1b18] shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t-2 border-[#1e1b18]/20 text-xs">
              <span className="font-bold text-[#1e1b18]">
                Inquiry Stars: {student.unitStars} / 6 Worlds
              </span>
              <button
                onClick={() => {
                  setIsCastleModalOpen(false);
                  const first = (units || []).find((u) => !u.locked);
                  if (first) onSelectUnit(first);
                }}
                className="px-4 py-2 bg-[#f59e0b] hover:bg-[#fbbf24] text-[#1e1b18] border-2 border-[#1e1b18] font-black rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Continue Adventure
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          12. GAME SETTINGS & AUDIO MODAL
         ========================================================================= */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1e1b18]/65 backdrop-blur-xs p-4 font-game">
          <div className="w-full max-w-sm bg-[#fbf5eb] border-[3px] border-[#1e1b18] rounded-3xl p-6 shadow-2xl text-[#1e1b18] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-[#1e1b18]/20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#f59e0b] border-2 border-[#1e1b18] flex items-center justify-center">
                  <Settings className="w-4 h-4 text-[#1e1b18]" />
                </div>
                <h3 className="text-lg font-black text-[#1e1b18]">Game Settings</h3>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="p-1 rounded-xl bg-[#f3d5ab] hover:bg-[#e8c496] text-[#1e1b18] border-2 border-[#1e1b18] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* PYP Grade Year Selector (Y1 - Y5) */}
              <div className="p-3 rounded-2xl bg-[#fde6c3] border-2 border-[#1e1b18] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-black text-[#1e1b18]">PYP Grade Level</div>
                    <div className="text-[10px] font-medium text-[#5c4033]">
                      Select active IB PYP year (displayed on your profile)
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-[#f59e0b] text-[#1e1b18] border-2 border-[#1e1b18] text-xs font-black">
                    {student.currentYear}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {years.map((y) => {
                    const isActive = student.currentYear === y;
                    return (
                      <button
                        key={y}
                        type="button"
                        onClick={() => handleYearChange(y)}
                        className={`py-1.5 rounded-xl text-xs font-bold font-game transition-all cursor-pointer border-2 border-[#1e1b18] ${
                          isActive
                            ? 'bg-[#f59e0b] text-[#1e1b18] shadow-xs scale-105'
                            : 'bg-[#fff7ea] hover:bg-[#f3d5ab] text-[#5c4033]'
                        }`}
                      >
                        {y}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Teacher Classroom Enrollment & Join Code */}
              <div className="p-3 rounded-2xl bg-[#fde6c3] border-2 border-[#1e1b18] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <School className="w-4 h-4 text-[#b45309]" />
                    <span className="text-xs font-black text-[#1e1b18]">My Classroom</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-[#78b3ea] text-[#1e1b18] border border-[#1e1b18] text-[10px] font-black font-mono">
                    {student.classCode || 'SPARK-4A'}
                  </span>
                </div>
                {classes.length > 0 && (
                  <select
                    value={student.classId || classes[0].id}
                    onChange={(e) => {
                      if (onJoinClass) {
                        onJoinClass(e.target.value);
                        sounds.playSuccess();
                        setJoinFeedback('Classroom updated!');
                        setTimeout(() => setJoinFeedback(null), 2000);
                      }
                    }}
                    className="w-full px-2.5 py-1.5 bg-[#fff7ea] border-2 border-[#1e1b18] rounded-xl text-xs font-bold text-[#1e1b18] outline-none"
                  >
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} ({cls.code})
                      </option>
                    ))}
                  </select>
                )}
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                    placeholder="Join Code"
                    className="flex-1 px-2.5 py-1 bg-[#fff7ea] border-2 border-[#1e1b18] rounded-xl text-xs font-mono font-bold text-[#1e1b18] uppercase outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!joinCodeInput.trim() || !onJoinClass) return;
                      const ok = onJoinClass(joinCodeInput.trim());
                      if (ok) {
                        sounds.playSuccess();
                        setJoinFeedback('Joined classroom!');
                        setJoinCodeInput('');
                      } else {
                        sounds.playError();
                        setJoinFeedback('Code not found');
                      }
                      setTimeout(() => setJoinFeedback(null), 2000);
                    }}
                    className="px-3 py-1 bg-[#34d399] hover:bg-[#10b981] text-[#1e1b18] border-2 border-[#1e1b18] rounded-xl text-xs font-black cursor-pointer"
                  >
                    Join
                  </button>
                </div>
                {joinFeedback && (
                  <div className="text-[11px] font-bold text-[#065f46] text-center">
                    {joinFeedback}
                  </div>
                )}
              </div>

              {/* Sound Toggle */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#fde6c3] border-2 border-[#1e1b18]">
                <div className="flex items-center gap-3">
                  {muted ? (
                    <VolumeX className="w-5 h-5 text-rose-700" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-[#047857]" />
                  )}
                  <div>
                    <div className="text-xs font-black text-[#1e1b18]">Sound Effects</div>
                    <div className="text-[10px] font-medium text-[#5c4033]">Synthesized Web Audio</div>
                  </div>
                </div>
                <button
                  onClick={toggleSound}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border-2 border-[#1e1b18] cursor-pointer ${
                    muted
                      ? 'bg-[#f3d5ab] text-rose-800'
                      : 'bg-[#34d399] text-[#1e1b18]'
                  }`}
                >
                  {muted ? 'Muted' : 'Active'}
                </button>
              </div>

              {/* Replay Interactive Interface Tutorial Button */}
              <button
                onClick={() => {
                  sounds.playClick();
                  setIsSettingsOpen(false);
                  setTutorialStep(0);
                  onStartTutorial?.();
                }}
                className="w-full py-2 px-3 bg-[#d1fae5] hover:bg-[#34d399] border-2 border-[#1e1b18] text-xs font-bold rounded-xl text-[#1e1b18] flex items-center justify-center gap-2 cursor-pointer"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Replay Interface Tutorial</span>
              </button>

              {/* Sound Test Button */}
              <button
                onClick={() => sounds.playLevelUp()}
                className="w-full py-2 px-3 bg-[#fff7ea] hover:bg-[#fde6c3] border-2 border-[#1e1b18] text-xs font-bold rounded-xl text-[#1e1b18] flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>🔔 Test Chime Sound</span>
              </button>

              {/* Log out */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    sounds.playClick();
                    setIsSettingsOpen(false);
                    onLogout();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#e4a887] hover:bg-[#f43f5e] hover:text-white border-2 border-[#1e1b18] text-xs font-bold flex items-center justify-center gap-2 transition-colors text-[#1e1b18] cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out / Switch Account</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
