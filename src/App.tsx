/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  StudentProfile,
  UnitOfInquiry,
  HomeworkTask,
  Badge,
  Classroom,
  StudentAnalytics,
  TeacherMessage,
  HomeworkSubmission,
} from './types';
import {
  INITIAL_STUDENT,
  INITIAL_HOMEWORK,
  PYP_UNITS,
  BADGES_CATALOG,
  INITIAL_CLASSES,
  CLASS_STUDENTS_ANALYTICS,
  INITIAL_MESSAGES,
} from './data/mockData';
import { TitleAndLoginScreen } from './components/TitleAndLoginScreen';
import { StudentHub } from './components/StudentHub';
import { TeacherDashboard } from './components/TeacherDashboard';
import { AdventureLevelModal } from './components/AdventureLevelModal';
import { MathLabModal } from './components/MathLabModal';
import { QuickThinkingModal } from './components/QuickThinkingModal';
import { RoomAndAvatarModal } from './components/RoomAndAvatarModal';
import { HomeworkModal } from './components/HomeworkModal';
import { BadgesGalleryModal } from './components/BadgesGalleryModal';
import { AchievementToast } from './components/AchievementToast';
import { sounds } from './services/sound';
import confetti from 'canvas-confetti';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'title' | 'student' | 'teacher'>('title');
  const [student, setStudent] = useState<StudentProfile>(INITIAL_STUDENT);
  const [classes, setClasses] = useState<Classroom[]>(INITIAL_CLASSES);
  const [studentsAnalytics, setStudentsAnalytics] = useState<StudentAnalytics[]>(
    CLASS_STUDENTS_ANALYTICS
  );
  const [homeworkList, setHomeworkList] = useState<HomeworkTask[]>(INITIAL_HOMEWORK);
  const [messagesList, setMessagesList] = useState<TeacherMessage[]>(INITIAL_MESSAGES);
  const [unitsList, setUnitsList] = useState<UnitOfInquiry[]>(PYP_UNITS);

  const handleToggleUnitLock = (unitId: string, locked: boolean) => {
    setUnitsList((prev) =>
      prev.map((u) => (u.id === unitId ? { ...u, locked } : u))
    );
  };

  // Active Modals
  const [selectedUnit, setSelectedUnit] = useState<UnitOfInquiry | null>(null);
  const [isMathLabOpen, setIsMathLabOpen] = useState(false);
  const [isQuickThinkingOpen, setIsQuickThinkingOpen] = useState(false);
  const [isRoomOpen, setIsRoomOpen] = useState(false);
  const [roomInitialTab, setRoomInitialTab] = useState<
    'dress' | 'feed' | 'decor' | 'pets' | 'badges'
  >('dress');
  const [isHomeworkOpen, setIsHomeworkOpen] = useState(false);
  const [homeworkModalMode, setHomeworkModalMode] = useState<'homework' | 'quests'>('homework');
  const [isBadgesOpen, setIsBadgesOpen] = useState(false);
  const [newlyUnlockedBadge, setNewlyUnlockedBadge] = useState<Badge | null>(null);
  const [showTutorial, setShowTutorial] = useState<boolean>(false);

  // Student Profile Updates & Level Ups
  const handleUpdateStudent = (updated: Partial<StudentProfile>) => {
    setStudent((prev) => {
      const next = { ...prev, ...updated };
      // Check level up
      if (next.xp >= next.xpNext) {
        sounds.playLevelUp();
        confetti({ particleCount: 70, spread: 60 });
        next.level += 1;
        next.xp -= next.xpNext;
        next.xpNext = Math.floor(next.xpNext * 1.25);
        next.coins += 100;
        next.gems += 5;
      }

      // Check Secret Badges triggers
      if (
        next.gems >= 25 &&
        !next.unlockedBadges.includes('badge-secret-golden-gem-vault')
      ) {
        setTimeout(() => handleAwardBadge('badge-secret-golden-gem-vault'), 300);
      }
      if (
        next.unlockedBadges.length >= 25 &&
        !next.unlockedBadges.includes('badge-secret-spark-archmage')
      ) {
        setTimeout(() => handleAwardBadge('badge-secret-spark-archmage'), 300);
      }

      return next;
    });
  };

  // Join or Switch Classroom (by Class ID or Class Join Code)
  const handleJoinClass = (codeOrClassId: string): boolean => {
    const clean = codeOrClassId.trim();
    const matched = classes.find(
      (c) => c.id === clean || c.code.toUpperCase() === clean.toUpperCase()
    );
    if (!matched) return false;

    handleUpdateStudent({
      classId: matched.id,
      classCode: matched.code,
    });

    // Also update or add this student in studentsAnalytics so they appear in the Teacher Dashboard under this class
    setStudentsAnalytics((prev) => {
      const existingIdx = prev.findIndex(
        (s) => s.name.toLowerCase() === student.name.toLowerCase()
      );
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = {
          ...copy[existingIdx],
          classId: matched.id,
          avatarId: student.avatarId,
        };
        return copy;
      } else {
        const newStudentAnalytics: StudentAnalytics = {
          id: `stud-${Date.now()}`,
          name: student.name,
          avatarId: student.avatarId,
          classId: matched.id,
          accuracy: 85,
          previousScores: [7.0, 7.3, 7.6],
          recentScores: [8.2, 8.5, 8.8],
          completedMissions: 4,
          homeworkStatus: 'on_track',
          frequentMistake: 'Fraction Equivalence',
          streakDays: 3,
          skills: {
            logicalReasoning: 85,
            problemSolving: 83,
            numericalThinking: 84,
            patternRecognition: 82,
            spatialReasoning: 86,
            creativity: 80,
            perseverance: 84,
          },
        };
        return [...prev, newStudentAnalytics];
      }
    });

    return true;
  };

  const handleCreateClass = (newClass: Classroom) => {
    setClasses((prev) => [...prev, newClass]);
  };

  const handleReward = (coins: number, xp: number) => {
    handleUpdateStudent({
      coins: student.coins + coins,
      xp: student.xp + xp,
    });
  };

  // Badge Awarding System
  const handleAwardBadge = (badgeId: string) => {
    if (student.unlockedBadges.includes(badgeId)) return;

    const badge = BADGES_CATALOG.find((b) => b.id === badgeId);
    if (!badge) return;

    const newUnlocked = [...student.unlockedBadges, badgeId];
    handleUpdateStudent({
      unlockedBadges: newUnlocked,
      coins: student.coins + badge.rewardCoins,
      xp: student.xp + badge.rewardXp,
    });

    setNewlyUnlockedBadge(badge);
  };

  const handleLevelComplete = (
    levelId: string,
    rewardCoins: number,
    rewardXp: number,
    rewardItem?: string,
    badgeId?: string,
    rewardGems: number = 0
  ) => {
    const updates: Partial<StudentProfile> = {
      coins: student.coins + rewardCoins,
      xp: student.xp + rewardXp,
      gems: student.gems + rewardGems,
      unitStars: Math.min(6, student.unitStars + 1),
    };

    if (rewardItem && !student.unlockedPets.includes(rewardItem)) {
      updates.unlockedPets = [...student.unlockedPets, rewardItem];
      updates.petId = rewardItem;
    }

    if (badgeId && !student.unlockedBadges.includes(badgeId)) {
      updates.unlockedBadges = [...student.unlockedBadges, badgeId];
      const badge = BADGES_CATALOG.find((b) => b.id === badgeId);
      if (badge) {
        setNewlyUnlockedBadge(badge);
      }
    }

    if (selectedUnit) {
      setUnitsList((prev) =>
        prev.map((u) =>
          u.id === selectedUnit.id
            ? { ...u, completedLevels: Math.min(u.totalLevels, u.completedLevels + 1) }
            : u
        )
      );
    }

    handleUpdateStudent(updates);
  };

  const handleCompleteHomework = (
    taskId: string,
    coins: number,
    xp: number,
    submission?: HomeworkSubmission
  ) => {
    setHomeworkList((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, status: 'completed', submission: submission || t.submission }
          : t
      )
    );

    if (submission) {
      // Secret Badge 1: Flawless Inquiry (10/10 perfect homework score)
      if (submission.gradeOutOf10 >= 9.8) {
        handleAwardBadge('badge-secret-pure-perfection');
      }

      // Secret Badge 2: Midnight Scholar (studying after 8 PM or before 6 AM)
      const currentHour = new Date().getHours();
      if (currentHour >= 20 || currentHour < 6) {
        handleAwardBadge('badge-secret-midnight-inquiry');
      }

      // Secret Badge 3: Polymath's Lens (if inquiry method note has diverse thought steps)
      if (
        submission.studentMethod &&
        (submission.studentMethod.length > 20 || submission.studentMethod.includes(','))
      ) {
        handleAwardBadge('badge-secret-tri-method');
      }

      // Live-update student analytics in Teacher Dashboard with new homework assessment grade
      setStudentsAnalytics((prev) =>
        prev.map((st) => {
          if (
            st.id === submission.studentId ||
            st.name.toLowerCase() === submission.studentName.toLowerCase()
          ) {
            const updatedRecent = [...st.recentScores, submission.gradeOutOf10];
            const newAccuracy = Math.round(
              (st.accuracy * st.completedMissions + submission.gradePct) /
                (st.completedMissions + 1)
            );
            return {
              ...st,
              recentScores: updatedRecent,
              accuracy: Math.min(100, Math.max(0, newAccuracy)),
              completedMissions: st.completedMissions + 1,
              homeworkStatus: 'on_track' as const,
            };
          }
          return st;
        })
      );
    }

    handleReward(coins, xp);
  };

  const handleAssignNewHomework = (newTask: HomeworkTask) => {
    setHomeworkList((prev) => [newTask, ...prev]);
  };

  const handleSendNewMessage = (newMsg: TeacherMessage) => {
    setMessagesList((prev) => [newMsg, ...prev]);
  };

  const handleMarkMessageRead = (msgId: string) => {
    setMessagesList((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, read: true } : m))
    );
  };

  return (
    <div
      className="w-screen h-screen overflow-hidden bg-slate-950 font-sans text-slate-100"
    >
      {/* 1. Title / Login Screen */}
      {currentScreen === 'title' && (
        <TitleAndLoginScreen
          classes={classes}
          onLoginStudent={(name, avatarId, hatId, onboarding) => {
            const targetClassId = onboarding?.classId || classes[0]?.id || 'class-4a';
            const targetClassCode =
              onboarding?.classCode ||
              classes.find((c) => c.id === targetClassId)?.code ||
              'SPARK-4A';

            const updates: Partial<StudentProfile> = {
              name,
              classId: targetClassId,
              classCode: targetClassCode,
            };
            if (avatarId) {
              updates.avatarId = avatarId;
              updates.unlockedAvatars = [avatarId];
              updates.hasPickedFreeAvatar = true;
            }
            if (hatId) updates.hatId = hatId;

            if (onboarding?.isNewAccount) {
              const chosenPetId = onboarding.petId || 'pet-fox';
              updates.petId = chosenPetId;
              updates.unlockedPets = [chosenPetId];
              updates.hasPickedFreePet = true;
              updates.petNames = onboarding.petName
                ? { [chosenPetId]: onboarding.petName }
                : {};
              updates.currentYear = onboarding.currentYear || 'Y4';
              updates.level = 1;
              updates.xp = 0;
              updates.xpNext = 200;
              updates.coins = 250;
              updates.gems = 15;
              updates.unitStars = 1;
              updates.unlockedFurniture = [];
              updates.placedFurniture = [];
              setShowTutorial(true);
            } else {
              setShowTutorial(false);
            }

            // Sync student into studentsAnalytics for the joined class so the teacher sees them immediately
            setStudentsAnalytics((prev) => {
              const existingIdx = prev.findIndex(
                (s) => s.name.toLowerCase() === name.toLowerCase()
              );
              if (existingIdx >= 0) {
                const copy = [...prev];
                copy[existingIdx] = {
                  ...copy[existingIdx],
                  classId: targetClassId,
                  avatarId: avatarId || copy[existingIdx].avatarId,
                };
                return copy;
              } else {
                const newStudent: StudentAnalytics = {
                  id: `stud-${Date.now()}`,
                  name,
                  avatarId: avatarId || 'avatar-cat-4',
                  classId: targetClassId,
                  accuracy: 84,
                  previousScores: [6.8, 7.2, 7.5],
                  recentScores: [8.0, 8.4, 8.7],
                  completedMissions: 3,
                  homeworkStatus: 'on_track',
                  frequentMistake: 'Measurement Units',
                  streakDays: 2,
                  skills: {
                    logicalReasoning: 83,
                    problemSolving: 82,
                    numericalThinking: 82,
                    patternRecognition: 80,
                    spatialReasoning: 85,
                    creativity: 78,
                    perseverance: 84,
                  },
                };
                return [...prev, newStudent];
              }
            });

            handleUpdateStudent(updates);
            setCurrentScreen('student');
          }}
          onLoginTeacher={() => {
            setCurrentScreen('teacher');
          }}
        />
      )}

      {/* 2. Main Student Hub (SPARK Island) */}
      {currentScreen === 'student' && (
        <StudentHub
          student={student}
          units={unitsList}
          classes={classes}
          onJoinClass={handleJoinClass}
          onUpdateStudent={handleUpdateStudent}
          onSelectUnit={(unit) => setSelectedUnit(unit)}
          onOpenMathLab={() => setIsMathLabOpen(true)}
          onOpenQuickThinking={() => setIsQuickThinkingOpen(true)}
          onOpenRoom={() => {
            setRoomInitialTab('dress');
            setIsRoomOpen(true);
          }}
          onOpenPets={() => {
            setRoomInitialTab('pets');
            setIsRoomOpen(true);
          }}
          onOpenBadges={() => setIsBadgesOpen(true)}
          onOpenHomework={() => {
            setHomeworkModalMode('homework');
            setIsHomeworkOpen(true);
          }}
          onOpenDailyQuests={() => {
            setHomeworkModalMode('quests');
            setIsHomeworkOpen(true);
          }}
          showTutorial={showTutorial}
          onCloseTutorial={() => setShowTutorial(false)}
          onStartTutorial={() => setShowTutorial(true)}
          onLogout={() => setCurrentScreen('title')}
        />
      )}

      {/* 3. Teacher Dashboard */}
      {currentScreen === 'teacher' && (
        <TeacherDashboard
          units={unitsList}
          classes={classes}
          students={studentsAnalytics}
          messagesList={messagesList}
          homeworkList={homeworkList}
          onCreateClass={handleCreateClass}
          onUpdateStudents={setStudentsAnalytics}
          onToggleUnitLock={handleToggleUnitLock}
          onBackToStudent={() => setCurrentScreen('title')}
          onAssignNewHomework={handleAssignNewHomework}
          onSendNewMessage={handleSendNewMessage}
        />
      )}

      {/* MODAL 1: Adventure Unit & Playable Levels */}
      {selectedUnit && (
        <AdventureLevelModal
          unit={selectedUnit}
          student={student}
          onClose={() => setSelectedUnit(null)}
          onLevelComplete={handleLevelComplete}
        />
      )}

      {/* MODAL 2: Math Lab Independent Competency Gym */}
      {isMathLabOpen && (
        <MathLabModal
          student={student}
          onClose={() => setIsMathLabOpen(false)}
          onReward={handleReward}
          onAwardBadge={handleAwardBadge}
        />
      )}

      {/* MODAL 3: Quick Thinking Kahoot Mode */}
      {isQuickThinkingOpen && (
        <QuickThinkingModal
          onClose={() => setIsQuickThinkingOpen(false)}
          onReward={handleReward}
          onAwardBadge={handleAwardBadge}
        />
      )}

      {/* MODAL 4: Room, Avatar & Pets Customization */}
      {isRoomOpen && (
        <RoomAndAvatarModal
          student={student}
          onClose={() => setIsRoomOpen(false)}
          onUpdateStudent={handleUpdateStudent}
          onAwardBadge={handleAwardBadge}
          onOpenBadges={() => {
            setIsRoomOpen(false);
            setIsBadgesOpen(true);
          }}
          initialTab={roomInitialTab}
        />
      )}

      {/* MODAL 5: Homework & Teacher Messages OR Daily Quests */}
      {isHomeworkOpen && (
        <HomeworkModal
          tasks={homeworkList}
          messages={messagesList}
          studentName={student.name}
          studentClassId={student.classId}
          classes={classes}
          onJoinClass={handleJoinClass}
          onMarkMessageRead={handleMarkMessageRead}
          mode={homeworkModalMode}
          onClose={() => setIsHomeworkOpen(false)}
          onCompleteTask={handleCompleteHomework}
          onClaimQuest={(questId, coins, xp) => handleReward(coins, xp)}
        />
      )}

      {/* MODAL 6: Badges & Medals Gallery */}
      {isBadgesOpen && (
        <BadgesGalleryModal
          student={student}
          onClose={() => setIsBadgesOpen(false)}
        />
      )}

      {/* TOAST: Newly Unlocked Achievement Notification */}
      {AchievementToast && (
        <AchievementToast
          badge={newlyUnlockedBadge}
          onDismiss={() => setNewlyUnlockedBadge(null)}
        />
      )}
    </div>
  );
}
