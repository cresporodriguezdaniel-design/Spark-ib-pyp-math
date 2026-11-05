import React, { useState } from 'react';
import { StudentProfile, Pet } from '../types';
import { PixelAvatar } from './PixelAvatar';
import {
  ALL_16_AVATARS,
  AvatarDefinition,
  HATS_CATALOG,
  FOOD_ITEMS,
  FURNITURE_ITEMS,
  FURNITURE_ROOM_PLACEMENTS,
  PETS_COLLECTION,
  BADGES_CATALOG,
} from '../data/mockData';
import { sounds } from '../services/sound';
import confetti from 'canvas-confetti';
import {
  X,
  Shirt,
  Utensils,
  Armchair,
  Heart,
  ChevronRight,
  PawPrint,
  Trophy,
  Lock,
  Sparkles,
  Pencil,
  Check,
} from 'lucide-react';

interface RoomAndAvatarModalProps {
  student: StudentProfile;
  onClose: () => void;
  onUpdateStudent: (updated: Partial<StudentProfile>) => void;
  onOpenBadges?: () => void;
  onAwardBadge?: (badgeId: string) => void;
  initialTab?: 'dress' | 'feed' | 'decor' | 'pets' | 'badges';
}

export const RoomAndAvatarModal: React.FC<RoomAndAvatarModalProps> = ({
  student,
  onClose,
  onUpdateStudent,
  onOpenBadges,
  onAwardBadge,
  initialTab = 'dress',
}) => {
  const [activeTab, setActiveTab] = useState<'dress' | 'feed' | 'decor' | 'pets' | 'badges'>(
    initialTab
  );
  const [feedEffect, setFeedEffect] = useState<string | null>(null);
  const [feedCountInSession, setFeedCountInSession] = useState<number>(0);

  // Shop Payment Currency Selector: Gems can be used as an alternative currency on any item or for Special Items
  const [shopCurrency, setShopCurrency] = useState<'coins' | 'gems'>('coins');

  // Pets state: 1st pet is FREE to select; remaining pets purchased with coins or gems
  const [pets, setPets] = useState<Pet[]>(PETS_COLLECTION);
  const unlockedPets = student.unlockedPets || [];
  const hasPickedFreePet = student.hasPickedFreePet ?? unlockedPets.length > 0;
  const activePet = pets.find((p) => p.id === student.petId) || pets[0];

  // Custom pet naming state
  const petNames = student.petNames || {};
  const getPetDisplayName = (pet: Pet) => petNames[pet.id] || pet.name;

  const [namingPetId, setNamingPetId] = useState<string | null>(null);
  const [petNameInput, setPetNameInput] = useState<string>('');
  const [nameSavedBanner, setNameSavedBanner] = useState<string | null>(null);

  // Avatars state: student picks 1 for free; rest unlockable through store with Coins OR Gems
  const unlockedAvatars =
    student.unlockedAvatars && student.unlockedAvatars.length > 0
      ? student.unlockedAvatars
      : [student.avatarId || 'avatar-cat-4'];
  const hasPickedFree = student.hasPickedFreeAvatar ?? unlockedAvatars.length > 0;

  // Helper to compute Gem cost for any item
  const getAvatarGemCost = (avatar: AvatarDefinition) => Math.max(4, Math.round(avatar.price / 20));
  const getPetGemCost = (pet: Pet) => pet.gemPrice || Math.max(5, Math.round((pet.price || 120) / 20));
  const getHatGemCost = (hat: (typeof HATS_CATALOG)[0]) =>
    hat.gemPrice || Math.max(2, Math.round(hat.price / 25));
  const getFurnitureGemCost = (item: (typeof FURNITURE_ITEMS)[0]) =>
    item.gemPrice || Math.max(3, Math.round(item.price / 25));

  // Furniture state: all items blocked by default until purchased; once purchased, placed in room
  const unlockedFurniture = student.unlockedFurniture || [];
  const placedFurniture = (student.placedFurniture ?? unlockedFurniture).filter((id) =>
    unlockedFurniture.includes(id)
  );

  const handleAvatarClick = (avatar: AvatarDefinition) => {
    const isUnlocked = unlockedAvatars.includes(avatar.id) || student.avatarId === avatar.id;

    if (isUnlocked) {
      sounds.playClick();
      onUpdateStudent({ avatarId: avatar.id });
      return;
    }

    // Free first starter avatar pick
    if (!hasPickedFree) {
      sounds.playSuccess();
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
      onUpdateStudent({
        avatarId: avatar.id,
        unlockedAvatars: [...unlockedAvatars, avatar.id],
        hasPickedFreeAvatar: true,
      });
      return;
    }

    const gemCost = getAvatarGemCost(avatar);
    const useGems =
      shopCurrency === 'gems' || (student.coins < avatar.price && student.gems >= gemCost);

    if (useGems) {
      if (student.gems < gemCost) {
        sounds.playError();
        return;
      }
      sounds.playCoin();
      confetti({ particleCount: 35, spread: 55, origin: { y: 0.6 } });
      onUpdateStudent({
        gems: student.gems - gemCost,
        unlockedAvatars: [...unlockedAvatars, avatar.id],
        avatarId: avatar.id,
      });
      return;
    }

    // Unlock via store with coins
    if (student.coins < avatar.price) {
      sounds.playError();
      return;
    }

    sounds.playCoin();
    confetti({ particleCount: 35, spread: 55, origin: { y: 0.6 } });
    onUpdateStudent({
      coins: student.coins - avatar.price,
      unlockedAvatars: [...unlockedAvatars, avatar.id],
      avatarId: avatar.id,
    });
  };

  const handleSelectHat = (hatId: string) => {
    sounds.playClick();
    onUpdateStudent({ hatId });
  };

  const handleBuyHat = (item: (typeof HATS_CATALOG)[0]) => {
    const gemCost = getHatGemCost(item);
    // Special accessories or Gem currency mode can be bought with Gems (or Coins if preferred)
    const useGems =
      shopCurrency === 'gems' ||
      (item.isSpecial && student.gems >= gemCost) ||
      (student.coins < item.price && student.gems >= gemCost);

    if (useGems) {
      if (student.gems < gemCost) {
        sounds.playError();
        return;
      }
      sounds.playCoin();
      confetti({ particleCount: 35, spread: 55, origin: { y: 0.6 } });
      onUpdateStudent({
        gems: student.gems - gemCost,
        unlockedHats: [...student.unlockedHats, item.id],
        hatId: item.id,
      });
      return;
    }

    if (student.coins < item.price) {
      sounds.playError();
      return;
    }
    sounds.playCoin();
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
    onUpdateStudent({
      coins: student.coins - item.price,
      unlockedHats: [...student.unlockedHats, item.id],
      hatId: item.id,
    });
  };

  const handleFeedPet = (
    foodItem: (typeof FOOD_ITEMS)[0],
    currencyToUse: 'coins' | 'gems' = shopCurrency
  ) => {
    const gemCost = foodItem.gemPrice || Math.max(1, Math.round(foodItem.price / 20));

    if (currencyToUse === 'gems') {
      if (student.gems < gemCost) {
        sounds.playError();
        return;
      }
    } else {
      if (student.coins < foodItem.price) {
        sounds.playError();
        return;
      }
    }

    sounds.playPetPurr();
    const boost = foodItem.isSpecial ? 100 : foodItem.price;
    const xpGain = foodItem.isSpecial ? 75 : 25;

    // Track session feeds for secret badge
    const nextFeedCount = feedCountInSession + 1;
    setFeedCountInSession(nextFeedCount);
    if (nextFeedCount >= 3) {
      onAwardBadge?.('badge-secret-pet-feast');
    }

    setFeedEffect(
      `+${boost} Happiness · ${getPetDisplayName(activePet)} purrs happily! ❤️`
    );
    setTimeout(() => setFeedEffect(null), 2500);

    const updatedPets = pets.map((p) => {
      if (p.id === activePet.id) {
        return {
          ...p,
          happiness: foodItem.isSpecial ? 100 : Math.min(100, p.happiness + 20),
        };
      }
      return p;
    });
    setPets(updatedPets);

    if (currencyToUse === 'gems') {
      onUpdateStudent({
        gems: student.gems - gemCost,
        xp: student.xp + xpGain,
      });
    } else {
      onUpdateStudent({
        coins: student.coins - foodItem.price,
        xp: student.xp + xpGain,
      });
    }
  };

  const handleFurnitureClick = (item: (typeof FURNITURE_ITEMS)[0]) => {
    const isUnlocked = unlockedFurniture.includes(item.id);

    // If already purchased, toggle placing/removing it in the room
    if (isUnlocked) {
      sounds.playClick();
      const isCurrentlyPlaced = placedFurniture.includes(item.id);
      const nextPlaced = isCurrentlyPlaced
        ? placedFurniture.filter((id) => id !== item.id)
        : [...placedFurniture, item.id];
      onUpdateStudent({ placedFurniture: nextPlaced });

      // Check secret badge triggers
      if (nextPlaced.length >= 5) {
        onAwardBadge?.('badge-secret-pixel-artisan');
      }
      if (item.id === 'furn-2-5') {
        onAwardBadge?.('badge-secret-celestial-orbit');
      }
      return;
    }

    // Otherwise purchase first (blocked by default until purchased), then automatically add to room!
    const gemCost = getFurnitureGemCost(item);
    const useGems =
      shopCurrency === 'gems' ||
      (item.isSpecial && student.gems >= gemCost) ||
      (student.coins < item.price && student.gems >= gemCost);

    const nextPlaced = [...placedFurniture, item.id];
    if (nextPlaced.length >= 5) {
      onAwardBadge?.('badge-secret-pixel-artisan');
    }
    if (item.id === 'furn-2-5') {
      onAwardBadge?.('badge-secret-celestial-orbit');
    }

    if (useGems) {
      if (student.gems < gemCost) {
        sounds.playError();
        return;
      }
      sounds.playCoin();
      confetti({ particleCount: 35, spread: 55, origin: { y: 0.6 } });
      onUpdateStudent({
        gems: student.gems - gemCost,
        unlockedFurniture: [...unlockedFurniture, item.id],
        placedFurniture: nextPlaced,
      });
      return;
    }

    if (student.coins < item.price) {
      sounds.playError();
      return;
    }
    sounds.playCoin();
    confetti({ particleCount: 35, spread: 55, origin: { y: 0.6 } });
    onUpdateStudent({
      coins: student.coins - item.price,
      unlockedFurniture: [...unlockedFurniture, item.id],
      placedFurniture: nextPlaced,
    });
  };

  const handleRemoveAllFurniture = () => {
    sounds.playClick();
    onUpdateStudent({
      placedFurniture: [],
      roomFurniture: { bed: '', rug: '', desk: '', plant: '', extra: '' },
    });
  };

  const startNamingPet = (pet: Pet) => {
    setNamingPetId(pet.id);
    setPetNameInput(petNames[pet.id] || pet.name);
  };

  const handleSavePetName = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const targetPetId = namingPetId || activePet.id;
    const targetPet = pets.find((p) => p.id === targetPetId) || activePet;
    const trimmed = petNameInput.trim() || targetPet.name;

    sounds.playSuccess();
    const nextPetNames = {
      ...petNames,
      [targetPetId]: trimmed,
    };

    onUpdateStudent({
      petNames: nextPetNames,
    });

    if (Object.keys(nextPetNames).length >= 2) {
      onAwardBadge?.('badge-secret-name-of-wonder');
    }

    setNamingPetId(null);
    setNameSavedBanner(`Named "${trimmed}"!`);
    setTimeout(() => setNameSavedBanner(null), 2500);
  };

  const handleEquipOrUnlockPet = (pet: Pet) => {
    const isUnlocked = unlockedPets.includes(pet.id) || pet.unlocked;

    // 1. Already unlocked/purchased -> equip & allow naming
    if (isUnlocked) {
      sounds.playClick();
      onUpdateStudent({ petId: pet.id });
      startNamingPet(pet);
      return;
    }

    // 2. First pet is FREE to select!
    if (!hasPickedFreePet) {
      sounds.playSuccess();
      confetti({ particleCount: 45, spread: 65, origin: { y: 0.6 } });
      onUpdateStudent({
        petId: pet.id,
        unlockedPets: [...unlockedPets, pet.id],
        hasPickedFreePet: true,
      });
      startNamingPet(pet);
      return;
    }

    // 3. Subsequent pets purchased with Coins OR Gems
    const price = pet.price || 120;
    const gemCost = getPetGemCost(pet);
    const useGems =
      shopCurrency === 'gems' || (student.coins < price && student.gems >= gemCost);

    if (useGems) {
      if (student.gems < gemCost) {
        sounds.playError();
        return;
      }
      sounds.playCoin();
      confetti({ particleCount: 35, spread: 55, origin: { y: 0.6 } });
      onUpdateStudent({
        gems: student.gems - gemCost,
        unlockedPets: [...unlockedPets, pet.id],
        petId: pet.id,
        hasPickedFreePet: true,
      });
      startNamingPet(pet);
      return;
    }

    if (student.coins < price) {
      sounds.playError();
      return;
    }

    sounds.playCoin();
    confetti({ particleCount: 35, spread: 55, origin: { y: 0.6 } });
    onUpdateStudent({
      coins: student.coins - price,
      unlockedPets: [...unlockedPets, pet.id],
      petId: pet.id,
      hasPickedFreePet: true,
    });
    startNamingPet(pet);
  };

  const isActivePetUnlocked =
    unlockedPets.includes(activePet.id) || activePet.unlocked || hasPickedFreePet;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#1e1b18]/65 backdrop-blur-xs font-game">
      <div className="relative w-full max-w-4xl h-[92vh] max-h-[760px] bg-[#fbf5eb] border-[3px] border-[#1e1b18] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[#1e1b18]">
        {/* Top Header — Warm Map Parchment & Wood Palette + Dual Currency Selector */}
        <div className="px-5 py-3 bg-[#fde6c3] border-b-[2.5px] border-[#1e1b18] flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#f59e0b] border-2 border-[#1e1b18] flex items-center justify-center shadow-xs">
              <Shirt className="w-5 h-5 text-[#1e1b18]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base sm:text-lg text-[#1e1b18] font-game">
                  My Room · Sanctuary, Shop & Avatar
                </h2>
              </div>
              <p className="text-xs text-[#5c4033] font-medium">
                Use Coins (🪙) or Gems (💎) as alternative currency or for Special Items
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Interactive Shop Payment Currency Switcher: Coins vs Gems */}
            <div className="flex items-center gap-1 p-1 bg-[#f3d5ab] border-2 border-[#1e1b18] rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setShopCurrency('coins');
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  shopCurrency === 'coins'
                    ? 'bg-[#f59e0b] text-[#1e1b18] border border-[#1e1b18] shadow-xs'
                    : 'bg-[#fff7ea] text-[#5c4033] hover:bg-[#fde6c3]'
                }`}
                title="Click to pay with Coins in the Shop"
              >
                <span>🪙</span>
                <span className="tabular-nums">{student.coins.toLocaleString()}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setShopCurrency('gems');
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  shopCurrency === 'gems'
                    ? 'bg-[#78b3ea] text-[#1e1b18] border border-[#1e1b18] shadow-xs'
                    : 'bg-[#fff7ea] text-[#5c4033] hover:bg-[#fde6c3]'
                }`}
                title="Click to pay with Gems (Alternative Currency & Special Items)"
              >
                <span>💎</span>
                <span className="tabular-nums">{student.gems}</span>
              </button>
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

        {/* Navigation Tabs */}
        <div className="p-2 sm:p-3 bg-[#f3d5ab] border-b-[2.5px] border-[#1e1b18] flex items-center justify-between gap-2 shrink-0 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                sounds.playClick();
                setActiveTab('dress');
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border-2 border-[#1e1b18] cursor-pointer ${
                activeTab === 'dress'
                  ? 'bg-[#f59e0b] text-[#1e1b18] shadow-md scale-[1.02]'
                  : 'bg-[#fff7ea] text-[#5c4033] hover:bg-[#fde6c3] hover:text-[#1e1b18]'
              }`}
            >
              <Shirt className="w-4 h-4" />
              <span>Avatars & Wardrobe</span>
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                setActiveTab('feed');
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border-2 border-[#1e1b18] cursor-pointer ${
                activeTab === 'feed'
                  ? 'bg-[#f59e0b] text-[#1e1b18] shadow-md scale-[1.02]'
                  : 'bg-[#fff7ea] text-[#5c4033] hover:bg-[#fde6c3] hover:text-[#1e1b18]'
              }`}
            >
              <Utensils className="w-4 h-4" />
              <span>Feed Pets</span>
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                setActiveTab('decor');
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border-2 border-[#1e1b18] cursor-pointer ${
                activeTab === 'decor'
                  ? 'bg-[#78b3ea] text-[#1e1b18] shadow-md scale-[1.02]'
                  : 'bg-[#fff7ea] text-[#5c4033] hover:bg-[#fde6c3] hover:text-[#1e1b18]'
              }`}
            >
              <Armchair className="w-4 h-4" />
              <span>Furniture</span>
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                setActiveTab('pets');
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border-2 border-[#1e1b18] cursor-pointer ${
                activeTab === 'pets'
                  ? 'bg-[#34d399] text-[#1e1b18] shadow-md scale-[1.02]'
                  : 'bg-[#fff7ea] text-[#5c4033] hover:bg-[#fde6c3] hover:text-[#1e1b18]'
              }`}
            >
              <PawPrint className="w-4 h-4" />
              <span>Pets Sanctuary</span>
              {!hasPickedFreePet && (
                <span className="px-1.5 py-0.5 rounded-full bg-[#10b981] text-white text-[9px] font-black border border-[#1e1b18]">
                  1 FREE
                </span>
              )}
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                setActiveTab('badges');
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border-2 border-[#1e1b18] cursor-pointer ${
                activeTab === 'badges'
                  ? 'bg-[#f59e0b] text-[#1e1b18] shadow-md scale-[1.02]'
                  : 'bg-[#fff7ea] text-[#5c4033] hover:bg-[#fde6c3] hover:text-[#1e1b18]'
              }`}
            >
              <Trophy className="w-4 h-4 text-[#b45309]" />
              <span>Badges ({student.unlockedBadges?.length || 2})</span>
            </button>
          </div>

          <span className="text-[10px] font-black px-2.5 py-1 rounded-xl bg-[#fff7ea] border-2 border-[#1e1b18] text-[#1e1b18]">
            Shop Currency: {shopCurrency === 'gems' ? '💎 Gems Active' : '🪙 Coins Active'}
          </span>
        </div>

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#fbf5eb]">
          {/* Left / Top: Pixel Room Viewport */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="relative w-full aspect-[597/538] max-w-sm rounded-2xl overflow-hidden border-[3px] border-[#1e1b18] shadow-xl bg-[#2a1810] flex flex-col justify-between">
              {/* Layer 0 (z-0): Empty Room Background Image */}
              <img
                src="/assets/aistudio/Captura_de_pantalla_2026-11-05_112254_64788b8a.png"
                alt="My Cozy Room"
                className="absolute inset-0 z-0 w-full h-full object-fill pointer-events-none select-none"
                style={{ imageRendering: 'pixelated' }}
              />

              {/* Layer 1 (z-10): Purchased & Placed Furniture Items in Background (Exact Orientation & Position from Furnished Room Image) */}
              <div className="absolute inset-0 z-10 pointer-events-none select-none">
                {placedFurniture
                  .map((id) => ({
                    item: FURNITURE_ITEMS.find((f) => f.id === id),
                    placement: FURNITURE_ROOM_PLACEMENTS[id],
                  }))
                  .filter(
                    (entry): entry is { item: (typeof FURNITURE_ITEMS)[0]; placement: NonNullable<typeof entry.placement> } =>
                      Boolean(entry.item && entry.placement)
                  )
                  .sort((a, b) => a.placement.zIndex - b.placement.zIndex)
                  .map(({ item, placement }) =>
                    placement.roomImage ? (
                      <img
                        key={item.id}
                        src={placement.roomImage}
                        alt=""
                        className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none transition-opacity duration-200"
                        style={{
                          zIndex: placement.zIndex,
                          imageRendering: 'pixelated',
                        }}
                      />
                    ) : (
                      <img
                        key={item.id}
                        src={item.icon}
                        alt=""
                        className="absolute pointer-events-none select-none drop-shadow-[0_2px_3px_rgba(0,0,0,0.35)] transition-all duration-200"
                        style={{
                          left: `${placement.left}%`,
                          top: `${placement.top}%`,
                          width: `${placement.width}%`,
                          height: placement.height ? `${placement.height}%` : 'auto',
                          zIndex: placement.zIndex,
                          transform: placement.transform,
                          imageRendering: 'pixelated',
                        }}
                      />
                    )
                  )}
              </div>

              {/* Layer 3 (z-30): Top Notification Spacer */}
              <div className="relative z-30 p-2 flex justify-end">
                {/* Feed or Name Saved notification */}
                {(feedEffect || nameSavedBanner) && (
                  <div className="px-3 py-1 bg-[#fde6c3] border-2 border-[#1e1b18] text-[#1e1b18] rounded-full text-[11px] font-bold shadow-md animate-bounce">
                    {feedEffect || nameSavedBanner}
                  </div>
                )}
              </div>

              {/* Layer 2 (z-20): Foreground Floor Area — Avatar & Pet Resting in Front of All Furniture */}
              <div className="relative z-20 flex-1 flex items-end justify-center pb-2 px-4 translate-y-3">
                <div className="relative w-full flex items-end justify-center gap-4">
                  {/* Avatar Resting on the Wooden Floor & Facing the Pet */}
                  <div className="flex flex-col items-center">
                    <div className="drop-shadow-[0_6px_6px_rgba(0,0,0,0.5)]">
                      <PixelAvatar
                        avatarId={student.avatarId}
                        hatId={student.hatId}
                        size={96}
                        animated={true}
                        flipHorizontal={true}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-[#1e1b18] bg-[#fde6c3] px-2.5 py-0.5 rounded-full border-2 border-[#1e1b18] -mt-1 font-game shadow-sm">
                      {student.name}
                    </span>
                  </div>

                  {/* Active Pet Resting Beside Avatar & Facing the Student's Avatar */}
                  <div className="flex flex-col items-center mb-1">
                    <div className="animate-bounce">
                      <img
                        src={activePet.image}
                        alt={getPetDisplayName(activePet)}
                        className="w-16 h-16 object-contain drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)] pointer-events-none"
                        style={{ imageRendering: 'pixelated', transform: 'scaleX(-1)' }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        setActiveTab('pets');
                        startNamingPet(activePet);
                      }}
                      className="text-[9px] font-bold text-[#1e1b18] bg-[#fde6c3] hover:bg-[#f59e0b] px-2 py-0.5 rounded-full border-2 border-[#1e1b18] mt-0.5 font-game shadow-xs flex items-center gap-1 cursor-pointer transition-colors"
                      title="Click to name or rename your pet"
                    >
                      <span>{getPetDisplayName(activePet)}</span>
                      <Pencil className="w-2.5 h-2.5 text-[#5c4033]" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Layer 3 (z-30): Room Bottom Status Info */}
              <div className="relative z-30 m-2.5 flex items-center justify-between text-[11px] text-[#1e1b18] font-bold bg-[#fde6c3]/95 px-3 py-1.5 rounded-xl border-2 border-[#1e1b18] shadow-md">
                <span className="flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-600 fill-rose-600" />
                  <span>Pet Happiness: {activePet.happiness}%</span>
                </span>
                <span>Level {student.level}</span>
              </div>
            </div>
          </div>

          {/* Right / Bottom: Action Drawer / Wardrobe Selector */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            {/* TAB 1: DRESS */}
            {activeTab === 'dress' && (
              <div className="space-y-4">
                {/* 1. ALL 16 AVATAR CATS & DOGS (ICONS ONLY, NO NAMES) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-[#1e1b18] uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#d97706]" />
                      <span>Select Avatar (Pick 1 Free · Unlock with 🪙 or 💎):</span>
                    </h4>
                    <span className="text-[10px] font-black text-[#1e1b18] bg-[#fde6c3] px-2.5 py-0.5 rounded-full border-2 border-[#1e1b18]">
                      {unlockedAvatars.length} / {ALL_16_AVATARS.length} Owned
                    </span>
                  </div>

                  {/* 16 Avatar Buttons: Icons Only */}
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 bg-[#f3d5ab] p-2.5 rounded-2xl border-2 border-[#1e1b18]">
                    {ALL_16_AVATARS.map((avatar) => {
                      const isEquipped = student.avatarId === avatar.id;
                      const isUnlocked = unlockedAvatars.includes(avatar.id) || isEquipped;
                      const gemCost = getAvatarGemCost(avatar);

                      return (
                        <button
                          key={avatar.id}
                          type="button"
                          onClick={() => handleAvatarClick(avatar)}
                          className={`relative aspect-square rounded-2xl border-2 flex items-center justify-center p-1 transition-all group overflow-hidden cursor-pointer ${
                            isEquipped
                              ? 'bg-[#fde68a] border-[#1e1b18] ring-2 ring-[#f59e0b] shadow-md'
                              : isUnlocked
                              ? 'bg-[#fff7ea] border-[#1e1b18] hover:bg-[#fde6c3] shadow-xs'
                              : 'bg-[#e8c496]/80 border-[#5c4033]/60 hover:border-[#1e1b18] opacity-90'
                          }`}
                          title={
                            isEquipped
                              ? 'Equipped Avatar'
                              : isUnlocked
                              ? 'Click to Equip'
                              : !hasPickedFree
                              ? 'Click to Choose for FREE!'
                              : `Unlock for ${avatar.price} Coins or ${gemCost} Gems`
                          }
                        >
                          {/* ONLY THE ICON AS THE BUTTON */}
                          <img
                            src={avatar.image}
                            alt="Avatar"
                            className={`w-full h-full object-contain pointer-events-none drop-shadow-xs group-hover:scale-110 transition-transform ${
                              !isUnlocked && hasPickedFree ? 'opacity-75' : ''
                            }`}
                            style={{ imageRendering: 'pixelated' }}
                          />

                          {/* Equipped Badge Checkmark */}
                          {isEquipped && (
                            <div className="absolute top-1 right-1 w-4 h-4 bg-[#10b981] text-white border border-[#1e1b18] rounded-full flex items-center justify-center text-[9px] font-black shadow-xs">
                              ✓
                            </div>
                          )}

                          {/* Locked Store Badge (Coins or Gems) */}
                          {!isUnlocked && hasPickedFree && (
                            <div
                              className={`absolute inset-x-0 bottom-0 py-0.5 flex items-center justify-center gap-0.5 text-[8px] font-black text-[#1e1b18] border-t border-[#1e1b18] ${
                                shopCurrency === 'gems' ? 'bg-[#bae6fd]/95' : 'bg-[#fde6c3]/95'
                              }`}
                            >
                              <Lock className="w-2.5 h-2.5 text-[#5c4033]" />
                              <span>
                                {shopCurrency === 'gems' ? `${gemCost}💎` : `${avatar.price}🪙`}
                              </span>
                            </div>
                          )}

                          {/* Free First Pick Badge */}
                          {!isUnlocked && !hasPickedFree && (
                            <div className="absolute inset-x-0 bottom-0 bg-[#10b981] py-0.5 text-center text-[8px] font-black text-white uppercase tracking-wider border-t border-[#1e1b18]">
                              FREE
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. HATS & ACCESSORIES (NO ACCESSORY BUTTON + ALL 30 ICON-ONLY ACCESSORIES, INCLUDING SPECIAL GEM ITEMS) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-[#1e1b18] uppercase tracking-wider flex items-center gap-1.5">
                      <span>Hats & Accessories (Standard 🪙/💎 & Special 💎):</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => handleSelectHat('none')}
                      className={`px-3 py-1 rounded-xl text-[10px] font-black transition-all border-2 border-[#1e1b18] flex items-center gap-1.5 cursor-pointer ${
                        student.hatId === 'none' || !student.hatId
                          ? 'bg-[#f59e0b] text-[#1e1b18] shadow-sm'
                          : 'bg-[#fff7ea] hover:bg-[#fde6c3] text-[#5c4033]'
                      }`}
                      title="No Accessory"
                    >
                      <span>🚫</span>
                      <span>No Accessory</span>
                      {(student.hatId === 'none' || !student.hatId) && <span>✓</span>}
                    </button>
                  </div>

                  {/* All 30 Individual Accessories: Icons Only */}
                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 bg-[#f3d5ab] p-2.5 rounded-2xl border-2 border-[#1e1b18]">
                    {HATS_CATALOG.filter((hat) => hat.id !== 'none').map((hat) => {
                      const isEquipped = student.hatId === hat.id;
                      const isUnlocked =
                        student.unlockedHats.includes(hat.id) || hat.unlocked || isEquipped;
                      const gemCost = getHatGemCost(hat);
                      const showGemsBadge = shopCurrency === 'gems' || hat.isSpecial;

                      return (
                        <button
                          key={hat.id}
                          type="button"
                          onClick={() => {
                            if (isUnlocked) {
                              handleSelectHat(hat.id);
                            } else {
                              handleBuyHat(hat);
                            }
                          }}
                          className={`relative aspect-square rounded-2xl border-2 flex items-center justify-center p-1 transition-all group overflow-hidden cursor-pointer ${
                            isEquipped
                              ? 'bg-[#fde68a] border-[#1e1b18] ring-2 ring-[#f59e0b] shadow-md'
                              : isUnlocked
                              ? 'bg-[#fff7ea] border-[#1e1b18] hover:bg-[#fde6c3] shadow-xs'
                              : hat.isSpecial
                              ? 'bg-[#bae6fd]/75 border-[#0284c7] hover:border-[#1e1b18] opacity-95'
                              : 'bg-[#e8c496]/80 border-[#5c4033]/60 hover:border-[#1e1b18] opacity-90'
                          }`}
                          title={
                            isUnlocked
                              ? 'Click to Equip'
                              : hat.isSpecial
                              ? `Special Item: Unlock with ${gemCost} Gems or ${hat.price} Coins`
                              : `Unlock with ${hat.price} Coins or ${gemCost} Gems`
                          }
                        >
                          <img
                            src={hat.icon}
                            alt=""
                            className={`w-full h-full object-contain pointer-events-none drop-shadow-xs group-hover:scale-110 transition-transform ${
                              !isUnlocked ? 'opacity-75' : ''
                            }`}
                            style={{ imageRendering: 'pixelated' }}
                          />

                          {isEquipped && (
                            <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-[#f59e0b] text-[#1e1b18] border border-[#1e1b18] rounded-full flex items-center justify-center text-[9px] font-black shadow-xs">
                              ✓
                            </div>
                          )}

                          {!isUnlocked && (
                            <div
                              className={`absolute inset-x-0 bottom-0 py-0.5 flex items-center justify-center gap-0.5 text-[8px] font-black text-[#1e1b18] border-t border-[#1e1b18] ${
                                showGemsBadge ? 'bg-[#78b3ea]/95' : 'bg-[#fde6c3]/95'
                              }`}
                            >
                              <Lock className="w-2.5 h-2.5 text-[#1e1b18]" />
                              <span>{showGemsBadge ? `${gemCost}💎` : `${hat.price}🪙`}</span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: FEED */}
            {activeTab === 'feed' && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <img
                      src={activePet.image}
                      alt={getPetDisplayName(activePet)}
                      className="w-8 h-8 object-contain"
                      style={{ imageRendering: 'pixelated' }}
                    />
                    <h4 className="text-xs font-bold text-[#1e1b18] uppercase tracking-wider">
                      Healthy Treat Menu for {getPetDisplayName(activePet)}:
                    </h4>
                  </div>
                  <p className="text-xs text-[#5c4033] mb-4 font-medium">
                    Feed your companion using Coins (🪙) or Gems (💎) as an alternative currency, or treat them to Special Starlight Nectar!
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {FOOD_ITEMS.map((food) => {
                      const gemCost = food.gemPrice || 1;
                      return (
                        <div
                          key={food.id}
                          className={`p-3 border-2 border-[#1e1b18] rounded-2xl flex items-center justify-between transition-all shadow-xs ${
                            food.isSpecial
                              ? 'bg-[#fde68a] ring-1 ring-[#f59e0b]'
                              : 'bg-[#fff7ea] hover:bg-[#fde6c3]'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-3xl shrink-0">{food.icon}</span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-[#1e1b18] truncate">
                                  {food.name}
                                </span>
                                {food.isSpecial && (
                                  <span className="px-1.5 py-0.5 rounded-md bg-[#78b3ea] text-[#1e1b18] border border-[#1e1b18] text-[8px] font-black uppercase shrink-0">
                                    Special
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] font-bold text-[#047857]">
                                {food.desc}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => handleFeedPet(food, 'coins')}
                              disabled={student.coins < food.price}
                              className="px-2.5 py-1.5 bg-[#f59e0b] hover:bg-[#fbbf24] disabled:opacity-40 text-[#1e1b18] font-bold text-xs rounded-xl border-2 border-[#1e1b18] flex items-center gap-1 shadow-xs cursor-pointer"
                              title={`Buy with ${food.price} Coins`}
                            >
                              <span>{food.price}</span>
                              <span>🪙</span>
                            </button>
                            <button
                              onClick={() => handleFeedPet(food, 'gems')}
                              disabled={student.gems < gemCost}
                              className="px-2.5 py-1.5 bg-[#78b3ea] hover:bg-[#60a5fa] disabled:opacity-40 text-[#1e1b18] font-bold text-xs rounded-xl border-2 border-[#1e1b18] flex items-center gap-1 shadow-xs cursor-pointer"
                              title={`Buy with ${gemCost} Gems`}
                            >
                              <span>{gemCost}</span>
                              <span>💎</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: DECOR (ICON-ONLY FURNITURE ELEMENTS + REMOVE ALL FURNITURE BUTTON) */}
            {activeTab === 'decor' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h4 className="text-xs font-bold text-[#1e1b18] uppercase tracking-wider flex items-center gap-1.5">
                    <Armchair className="w-3.5 h-3.5 text-[#b45309]" />
                    <span>Room Furniture (Unlock with 🪙 or 💎):</span>
                  </h4>

                  <button
                    type="button"
                    onClick={handleRemoveAllFurniture}
                    className={`px-3 py-1 rounded-xl text-[10px] font-black transition-all border-2 border-[#1e1b18] flex items-center gap-1.5 cursor-pointer ${
                      placedFurniture.length === 0
                        ? 'bg-[#f59e0b] text-[#1e1b18] shadow-sm'
                        : 'bg-[#fff7ea] hover:bg-[#fde6c3] text-[#5c4033]'
                    }`}
                    title="Remove All Furniture from Room"
                  >
                    <span>🚫</span>
                    <span>Remove All Furniture</span>
                    {placedFurniture.length === 0 && <span>✓</span>}
                  </button>
                </div>

                {/* All Individual Furniture Elements: Icons Only, No Text Explaining Type */}
                <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 bg-[#f3d5ab] p-2.5 rounded-2xl border-2 border-[#1e1b18] max-h-[410px] overflow-y-auto">
                  {FURNITURE_ITEMS.map((item) => {
                    const isUnlocked = unlockedFurniture.includes(item.id);
                    const isPlaced = isUnlocked && placedFurniture.includes(item.id);
                    const gemCost = getFurnitureGemCost(item);
                    const showGemsBadge = shopCurrency === 'gems' || item.isSpecial;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleFurnitureClick(item)}
                        className={`relative aspect-square rounded-2xl border-2 flex items-center justify-center p-1.5 transition-all group overflow-hidden cursor-pointer ${
                          isPlaced
                            ? 'bg-[#fde68a] border-[#1e1b18] ring-2 ring-[#f59e0b] shadow-md'
                            : isUnlocked
                            ? 'bg-[#fff7ea] border-[#1e1b18] hover:bg-[#fde6c3] shadow-xs'
                            : item.isSpecial
                            ? 'bg-[#bae6fd]/75 border-[#0284c7] hover:border-[#1e1b18] opacity-95'
                            : 'bg-[#e8c496]/80 border-[#5c4033]/60 hover:border-[#1e1b18] opacity-90'
                        }`}
                        title={
                          isPlaced
                            ? 'Placed in Room (Click to Remove)'
                            : isUnlocked
                            ? 'Owned (Click to Place in Room)'
                            : `Locked · Purchase for ${item.price} Coins or ${gemCost} Gems`
                        }
                      >
                        <img
                          src={item.icon}
                          alt=""
                          className={`w-full h-full object-contain pointer-events-none drop-shadow-xs group-hover:scale-110 transition-transform ${
                            !isUnlocked ? 'opacity-75' : ''
                          }`}
                          style={{ imageRendering: 'pixelated' }}
                        />

                        {/* Placed in Room Checkmark */}
                        {isPlaced && (
                          <div className="absolute top-1 right-1 w-4 h-4 bg-[#10b981] text-white border border-[#1e1b18] rounded-full flex items-center justify-center text-[9px] font-black shadow-xs">
                            ✓
                          </div>
                        )}

                        {/* Unlocked but Not Currently Placed Indicator */}
                        {isUnlocked && !isPlaced && (
                          <div className="absolute top-1 right-1 w-4 h-4 bg-[#fff7ea] text-[#1e1b18] border border-[#1e1b18] rounded-full flex items-center justify-center text-[10px] font-black shadow-xs">
                            +
                          </div>
                        )}

                        {/* Locked Price Badge (Blocked by Default Until Purchased) */}
                        {!isUnlocked && (
                          <div
                            className={`absolute inset-x-0 bottom-0 py-0.5 flex items-center justify-center gap-0.5 text-[8px] font-black text-[#1e1b18] border-t border-[#1e1b18] ${
                              showGemsBadge ? 'bg-[#78b3ea]/95' : 'bg-[#fde6c3]/95'
                            }`}
                          >
                            <Lock className="w-2.5 h-2.5 text-[#1e1b18]" />
                            <span>{showGemsBadge ? `${gemCost}💎` : `${item.price}🪙`}</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 4: PETS (1ST PET FREE TO SELECT + CUSTOM PET NAMING + COINS OR GEMS) */}
            {activeTab === 'pets' && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-[#1e1b18] uppercase tracking-wider flex items-center gap-1.5">
                      <PawPrint className="w-3.5 h-3.5 text-[#059669]" />
                      <span>
                        {!hasPickedFreePet
                          ? 'Choose Your 1st Companion Pet for FREE!'
                          : `Your Animal Companions (Unlock with 🪙 Coins or 💎 Gems):`}
                      </span>
                    </h4>
                    <span className="text-[10px] font-black text-[#1e1b18] bg-[#fde6c3] px-2.5 py-0.5 rounded-full border-2 border-[#1e1b18]">
                      {pets.filter((p) => unlockedPets.includes(p.id) || p.unlocked).length} / {pets.length} Unlocked
                    </span>
                  </div>

                  {/* Active Pet Info & Custom Naming Box (Available once first pet is selected or purchased) */}
                  {isActivePetUnlocked ? (
                    <div className="mb-3 p-3 rounded-2xl bg-[#fde6c3] border-2 border-[#1e1b18] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[#fff7ea] border-2 border-[#1e1b18] flex items-center justify-center p-1 shrink-0">
                          <img
                            src={activePet.image}
                            alt={getPetDisplayName(activePet)}
                            className="w-full h-full object-contain"
                            style={{ imageRendering: 'pixelated' }}
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-[#1e1b18]">
                              {getPetDisplayName(activePet)}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#34d399] text-[#1e1b18] border border-[#1e1b18]">
                              Active Pet
                            </span>
                          </div>
                          <p className="text-[10px] text-[#5c4033] mt-0.5">{activePet.desc}</p>
                        </div>
                      </div>

                      {/* Name / Rename Pet Input Form */}
                      <form
                        onSubmit={handleSavePetName}
                        className="flex items-center gap-1.5 w-full sm:w-auto"
                      >
                        <input
                          type="text"
                          maxLength={20}
                          value={
                            namingPetId === activePet.id
                              ? petNameInput
                              : petNames[activePet.id] ?? activePet.name
                          }
                          onFocus={() => {
                            if (namingPetId !== activePet.id) {
                              startNamingPet(activePet);
                            }
                          }}
                          onChange={(e) => {
                            if (namingPetId !== activePet.id) {
                              setNamingPetId(activePet.id);
                            }
                            setPetNameInput(e.target.value);
                          }}
                          placeholder="Name your pet..."
                          aria-label="Name your pet"
                          className="w-full sm:w-36 px-2.5 py-1.5 rounded-xl bg-[#fff7ea] border-2 border-[#1e1b18] text-xs font-bold text-[#1e1b18] placeholder-[#5c4033]/60 focus:outline-none focus:ring-2 focus:ring-[#f59e0b]"
                        />
                        <button
                          type="submit"
                          className="px-3 py-1.5 rounded-xl bg-[#f59e0b] hover:bg-[#fbbf24] text-[#1e1b18] font-black text-xs border-2 border-[#1e1b18] flex items-center gap-1 shrink-0 cursor-pointer shadow-xs"
                          title="Save Pet Name"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Name Pet</span>
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="mb-3 p-3 rounded-2xl bg-[#d1fae5] border-2 border-[#1e1b18] flex items-center justify-between text-xs font-bold text-[#065f46]">
                      <span>🎁 Your first pet is FREE! Click any pet below to adopt and name it.</span>
                    </div>
                  )}

                  {/* Quick Icon Grid for all 12 Pets */}
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 bg-[#f3d5ab] p-3 rounded-2xl border-2 border-[#1e1b18]">
                    {pets.map((pet) => {
                      const isUnlocked = unlockedPets.includes(pet.id) || pet.unlocked;
                      const isEquipped = isUnlocked && student.petId === pet.id;
                      const price = pet.price || 120;
                      const gemCost = getPetGemCost(pet);
                      const customName = getPetDisplayName(pet);

                      return (
                        <button
                          key={pet.id}
                          type="button"
                          onClick={() => handleEquipOrUnlockPet(pet)}
                          className={`relative aspect-square rounded-2xl border-2 flex flex-col items-center justify-center p-1.5 transition-all group overflow-hidden cursor-pointer ${
                            isEquipped
                              ? 'bg-[#a7f3d0] border-[#1e1b18] ring-2 ring-[#059669] shadow-md'
                              : isUnlocked
                              ? 'bg-[#fff7ea] border-[#1e1b18] hover:bg-[#fde6c3] shadow-xs'
                              : 'bg-[#e8c496]/80 border-[#5c4033]/60 hover:border-[#1e1b18] opacity-90'
                          }`}
                          title={
                            isEquipped
                              ? `${customName} (Equipped · Click to Rename)`
                              : isUnlocked
                              ? `${customName} · Click to Equip & Name`
                              : !hasPickedFreePet
                              ? `Select ${pet.name} for FREE!`
                              : `Purchase ${pet.name} for ${price} Coins or ${gemCost} Gems`
                          }
                        >
                          <img
                            src={pet.image}
                            alt={customName}
                            className={`w-4/5 h-4/5 object-contain pointer-events-none drop-shadow-xs group-hover:scale-110 transition-transform ${
                              !isUnlocked && hasPickedFreePet ? 'opacity-75' : ''
                            }`}
                            style={{ imageRendering: 'pixelated' }}
                          />

                          {/* Equipped Checkmark */}
                          {isEquipped && (
                            <div className="absolute top-1 right-1 w-4 h-4 bg-[#10b981] text-white border border-[#1e1b18] rounded-full flex items-center justify-center text-[9px] font-black shadow-xs">
                              ✓
                            </div>
                          )}

                          {/* Unlocked Pet Name Label */}
                          {isUnlocked && (
                            <div className="absolute inset-x-0 bottom-0 bg-[#fde6c3]/95 py-0.5 px-1 text-center text-[8px] font-black text-[#1e1b18] truncate border-t border-[#1e1b18]">
                              {customName}
                            </div>
                          )}

                          {/* Free First Pet Badge */}
                          {!isUnlocked && !hasPickedFreePet && (
                            <div className="absolute inset-x-0 bottom-0 bg-[#10b981] py-0.5 text-center text-[8px] font-black text-white uppercase tracking-wider border-t border-[#1e1b18]">
                              FREE
                            </div>
                          )}

                          {/* Store Coin / Gem Price Badge after Free Pet Picked */}
                          {!isUnlocked && hasPickedFreePet && (
                            <div
                              className={`absolute inset-x-0 bottom-0 py-0.5 flex items-center justify-center gap-0.5 text-[8px] font-black text-[#1e1b18] border-t border-[#1e1b18] ${
                                shopCurrency === 'gems' ? 'bg-[#78b3ea]/95' : 'bg-[#fde6c3]/95'
                              }`}
                            >
                              <Lock className="w-2.5 h-2.5 text-[#1e1b18]" />
                              <span>
                                {shopCurrency === 'gems' ? `${gemCost}💎` : `${price}🪙`}
                              </span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: BADGES */}
            {activeTab === 'badges' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#1e1b18] uppercase tracking-wider">
                    Badges & Mastery Medals ({student.unlockedBadges?.length || 2} / {BADGES_CATALOG.length}):
                  </h4>
                  {onOpenBadges && (
                    <button
                      onClick={() => {
                        sounds.playClick();
                        onOpenBadges();
                      }}
                      className="text-xs text-[#b45309] hover:text-[#1e1b18] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span>Open Full Gallery</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                  {BADGES_CATALOG.map((b) => {
                    const isUnlocked = student.unlockedBadges?.includes(b.id) || b.unlocked;
                    const isSecret = b.isSecret || b.category === 'secret';

                    if (isSecret && !isUnlocked) {
                      return (
                        <div
                          key={b.id}
                          className="p-3 rounded-2xl border-2 border-dashed border-purple-800/40 bg-purple-100/40 flex items-start gap-3 transition-all"
                        >
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 border-2 border-purple-800/40 bg-purple-200/50">
                            ❓
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h5 className="font-bold text-xs text-purple-950 truncate">??? (Secret Badge)</h5>
                              <span className="text-[9px] uppercase font-black text-purple-700 bg-purple-200/70 px-1.5 py-0.5 rounded-full">
                                Hidden
                              </span>
                            </div>
                            <div className="text-[10px] font-bold text-purple-800/80 truncate">Mysterious Discovery</div>
                            <p className="text-[10px] text-purple-900/90 italic line-clamp-1 mt-0.5">
                              {b.secretHint || 'A secret hidden medal waiting to be discovered!'}
                            </p>
                            <div className="mt-1 flex items-center gap-2 text-[9px] font-bold">
                              <span className="text-[#b45309]">+{b.rewardCoins} 🪙</span>
                              <span className="text-[#0369a1]">+{b.rewardXp} XP</span>
                              <span className="ml-auto text-purple-700">🗝️ Secret</span>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={b.id}
                        className={`p-3 rounded-2xl border-2 flex items-start gap-3 transition-all ${
                          isUnlocked
                            ? isSecret
                              ? 'bg-amber-100/90 border-purple-800 shadow-xs'
                              : 'bg-[#fde6c3] border-[#1e1b18] shadow-xs'
                            : 'bg-[#f3d5ab]/60 border-[#5c4033]/50 opacity-60'
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center text-2xl shrink-0 border-2 border-[#1e1b18] ${
                            isUnlocked ? 'bg-[#fff7ea]' : 'bg-[#e8c496] grayscale'
                          }`}
                        >
                          {b.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h5 className="font-bold text-xs text-[#1e1b18] truncate">
                              {b.title}
                              {isSecret && isUnlocked && ' 🗝️'}
                            </h5>
                            <span className="text-[9px] uppercase font-extrabold text-[#b45309]">
                              {b.rarity}
                            </span>
                          </div>
                          <div className="text-[10px] font-bold text-[#5c4033] truncate">{b.mathSkill}</div>
                          <p className="text-[10px] text-[#5c4033] line-clamp-1 mt-0.5">
                            {b.description}
                          </p>
                          <div className="mt-1 flex items-center gap-2 text-[9px] font-bold">
                            <span className="text-[#b45309]">+{b.rewardCoins} 🪙</span>
                            <span className="text-[#0369a1]">+{b.rewardXp} XP</span>
                            <span className={`ml-auto ${isUnlocked ? 'text-[#047857]' : 'text-[#5c4033]'}`}>
                              {isUnlocked ? (isSecret ? '🗝️ Discovered' : '✓ Unlocked') : '🔒 Locked'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
