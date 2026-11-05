import React from 'react';
import {
  getAvatarImage,
  getAccessoryImage,
  getAvatarHeadAnchor,
  getAccessoryFitProfile,
} from '../data/mockData';

interface PixelAvatarProps {
  avatarId: string;
  hatId?: string;
  size?: number;
  animated?: boolean;
  flipHorizontal?: boolean;
  className?: string;
}

export const PixelAvatar: React.FC<PixelAvatarProps> = ({
  avatarId,
  hatId = 'none',
  size = 64,
  animated = false,
  flipHorizontal = false,
  className = '',
}) => {
  const imageSrc = getAvatarImage(avatarId);
  const accessorySrc = getAccessoryImage(hatId);
  const anchor = getAvatarHeadAnchor(avatarId);
  const profile = getAccessoryFitProfile(hatId);

  let hatStyle: React.CSSProperties | undefined;
  let wrapperTransform = flipHorizontal ? 'scaleX(-1)' : '';

  if (accessorySrc && profile) {
    const widthPct = anchor.headWidth * profile.widthMultiplier;
    const heightPct = widthPct / profile.aspectRatio;
    const leftPct = anchor.centerX + anchor.headWidth * profile.offsetX - widthPct / 2;
    const topPct = anchor.crownY - heightPct * profile.contactY;
    const rotateDeg = anchor.tiltDeg + profile.tiltOffsetDeg;

    hatStyle = {
      width: `${widthPct.toFixed(2)}%`,
      height: `${heightPct.toFixed(2)}%`,
      left: `${leftPct.toFixed(2)}%`,
      top: `${topPct.toFixed(2)}%`,
      transform: `rotate(${rotateDeg}deg)`,
      transformOrigin: `50% ${Math.round(profile.contactY * 100)}%`,
      imageRendering: 'pixelated',
    };

    // If a tall hat extends above the top of the avatar box, subtly scale & shift
    // the combined avatar+hat unit so the hat is never clipped by parent containers.
    if (topPct < 2) {
      const overflowTop = 2 - topPct;
      const scale = 100 / (100 + overflowTop * 1.05);
      const shiftDownPct = overflowTop * scale * 0.55;
      wrapperTransform = `${
        flipHorizontal ? 'scaleX(-1) ' : ''
      }translateY(${shiftDownPct.toFixed(2)}%) scale(${scale.toFixed(3)})`;
    }
  }

  const wrapperStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    transform: wrapperTransform || undefined,
    transformOrigin: '50% 50%',
  };

  return (
    <div
      style={{ width: size, height: size }}
      className={`relative inline-flex items-center justify-center select-none ${
        animated ? 'hover:scale-105 transition-transform' : ''
      } ${className}`}
    >
      <div style={wrapperStyle} className="relative w-full h-full">
        {/* Authentic Pixel Art Avatar Image */}
        <img
          src={imageSrc}
          alt="Student Avatar"
          className="w-full h-full object-contain pointer-events-none drop-shadow-sm"
          style={{ imageRendering: 'pixelated' }}
          loading="eager"
        />

        {/* Equipped Pixel Art Accessory Overlay */}
        {accessorySrc && hatStyle && (
          <img
            src={accessorySrc}
            alt="Accessory"
            style={hatStyle}
            className="absolute object-contain pointer-events-none drop-shadow-md"
          />
        )}
      </div>
    </div>
  );
};

