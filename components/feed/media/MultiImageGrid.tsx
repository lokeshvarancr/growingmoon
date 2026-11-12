'use client';
import React from 'react';
import { Play } from 'lucide-react';
import type { MediaAttachment } from '@/types';
import { pickHeroIndex, getVideoPosterUrl } from './mediaHelpers';

function Tile({
  m,
  onClick,
  badge,
  testId,
}: {
  m: MediaAttachment;
  onClick: () => void;
  badge?: number;
  testId: string;
}) {
  const isVideo = m.type === 'video';
  const src = isVideo ? getVideoPosterUrl(m) : m.url;
  return (
    <div
      onClick={onClick}
      data-testid={testId}
      className="relative h-full w-full min-h-0 overflow-hidden bg-gray-100 cursor-pointer group/tile"
    >
      <img
        src={src}
        alt={m.alt || 'Post media'}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover group-hover/tile:scale-[1.03] transition-transform duration-500"
      />
      {isVideo && !badge && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/15">
          <span className="w-9 h-9 rounded-full bg-white/90 text-gm-ink flex items-center justify-center shadow-md">
            <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
          </span>
        </div>
      )}
      {badge !== undefined && badge > 0 && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-sm">
          +{badge}
        </div>
      )}
    </div>
  );
}

type Props = {
  media: MediaAttachment[];
  onOpenViewer: (index: number) => void;
};

// Intelligent multi-image / mixed-media composition. Orientation decides the
// hero tile; 5+ items never render all at once — a curated preview of 4 tiles
// shows, with the exact hidden count surfaced on the last tile.
export default function MultiImageGrid({ media, onOpenViewer }: Props) {
  const n = media.length;

  if (n === 2) {
    const bothPortrait = media[0].orientation === 'portrait' && media[1].orientation === 'portrait';
    const bothLandscape = media[0].orientation === 'landscape' && media[1].orientation === 'landscape';
    const mixed = !bothPortrait && !bothLandscape;
    return (
      <div
        className={`mt-4 rounded-lg overflow-hidden w-full ${
          bothPortrait ? 'aspect-[4/3] sm:aspect-[16/11]' : 'aspect-[16/10]'
        }`}
      >
        <div className={`grid gap-1 h-full min-h-0 ${mixed ? 'grid-cols-[1.15fr_1fr]' : 'grid-cols-2'}`}>
          {media.map((m, i) => (
            <Tile key={m.id || i} m={m} onClick={() => onOpenViewer(i)} testId={`media-grid-tile-${i}`} />
          ))}
        </div>
      </div>
    );
  }

  if (n === 3) {
    const heroIdx = pickHeroIndex(media);
    const others = media.map((_, i) => i).filter((i) => i !== heroIdx);
    return (
      <div className="mt-4 rounded-lg overflow-hidden aspect-[16/10] sm:aspect-[16/9] w-full">
        <div className="grid grid-cols-2 gap-1 h-full min-h-0">
          <Tile m={media[heroIdx]} onClick={() => onOpenViewer(heroIdx)} testId={`media-grid-tile-${heroIdx}`} />
          <div className="grid grid-rows-2 gap-1 h-full min-h-0">
            {others.map((i) => (
              <Tile key={media[i].id || i} m={media[i]} onClick={() => onOpenViewer(i)} testId={`media-grid-tile-${i}`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 4 images: fully visible balanced grid, nothing hidden.
  // 5+ images: hero + 3 supporting tiles (4 visible total); the remainder is
  // surfaced as an exact "+N" count on the last tile — never silently dropped.
  const heroIdx = pickHeroIndex(media);
  const remainingIdxs = media.map((_, i) => i).filter((i) => i !== heroIdx).slice(0, 3);
  const hiddenCount = n - (1 + remainingIdxs.length);

  return (
    <div className="mt-4 rounded-lg overflow-hidden aspect-[16/10] sm:aspect-[16/9] w-full">
      <div className="grid grid-cols-5 gap-1 h-full min-h-0">
        <div className="col-span-3 h-full min-h-0">
          <Tile m={media[heroIdx]} onClick={() => onOpenViewer(heroIdx)} testId={`media-grid-tile-${heroIdx}`} />
        </div>
        <div className="col-span-2 grid grid-rows-3 gap-1 h-full min-h-0">
          {remainingIdxs.map((i, idx) => (
            <Tile
              key={media[i].id || i}
              m={media[i]}
              onClick={() => onOpenViewer(i)}
              testId={`media-grid-tile-${i}`}
              badge={idx === remainingIdxs.length - 1 && hiddenCount > 0 ? hiddenCount : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
