'use client';
import React, { useState } from 'react';
import { Play, Maximize2, ExternalLink } from 'lucide-react';
import type { MediaAttachment } from '@/types';
import {
  detectVideoProvider,
  getEmbedUrl,
  getVideoPosterUrl,
  getVideoDomain,
  ASPECT_BY_ORIENTATION,
} from './mediaHelpers';

type Props = {
  media: MediaAttachment;
  onOpenViewer: () => void;
};

// A single portrait image reads tall & contained; a single landscape image
// reads wide & full-bleed; a single video plays inline on click, with a small
// expand control that hands off to the fullscreen theater viewer.
export default function SingleMedia({ media, onOpenViewer }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const isVideo = media.type === 'video';
  const orientation = media.orientation || 'landscape';
  const isPortrait = orientation === 'portrait';
  const aspect = ASPECT_BY_ORIENTATION[orientation] || ASPECT_BY_ORIENTATION.landscape;
  const provider = isVideo ? detectVideoProvider(media.url) : 'file';
  const embedUrl = isVideo && isPlaying ? getEmbedUrl(media.url, provider) : null;
  const posterUrl = isVideo ? getVideoPosterUrl(media) : media.url;

  const containerClasses = `mt-4 rounded-lg overflow-hidden bg-gray-950 relative select-none ${aspect} ${
    isPortrait ? 'w-full max-w-[380px] mx-auto' : 'w-full'
  }`;

  if (isVideo && isPlaying) {
    return (
      <div className={containerClasses} data-testid="single-media-video-player">
        {provider === 'unknown' ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/80 px-6 text-center">
            <ExternalLink className="w-6 h-6" />
            <p className="text-xs font-medium">Preview unavailable for this link.</p>
            <a
              href={media.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold underline text-white"
            >
              Open original video ↗
            </a>
          </div>
        ) : embedUrl ? (
          <iframe
            src={embedUrl}
            title="Video playback"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-0"
          />
        ) : (
          <video
            src={media.url}
            poster={posterUrl}
            className="w-full h-full object-cover"
            playsInline
            controls
            autoPlay
          />
        )}
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <img
        src={posterUrl}
        alt={media.alt || 'Post media'}
        loading="lazy"
        decoding="async"
        onClick={() => (isVideo ? setIsPlaying(true) : onOpenViewer())}
        data-testid="single-media-image"
        className="w-full h-full object-cover cursor-pointer transition-transform duration-500 hover:scale-[1.02]"
      />

      {isVideo && (
        <>
          <button
            type="button"
            onClick={() => setIsPlaying(true)}
            data-testid="single-media-play-button"
            aria-label="Play video"
            className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/10 transition-colors cursor-pointer"
          >
            <span className="w-14 h-14 rounded-full bg-white/95 text-gm-ink flex items-center justify-center shadow-xl">
              <Play className="w-6 h-6 fill-current translate-x-0.5" />
            </span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenViewer();
            }}
            data-testid="single-media-fullscreen-button"
            title="Watch fullscreen"
            aria-label="Watch fullscreen"
            className="absolute top-3 right-3 w-8 h-8 rounded-md bg-black/55 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md transition-colors cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          {provider !== 'file' && (
            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/55 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wide">
              {provider === 'youtube'
                ? 'YouTube'
                : provider === 'vimeo'
                ? 'Vimeo'
                : provider === 'loom'
                ? 'Loom'
                : getVideoDomain(media.url)}
            </span>
          )}
        </>
      )}
    </div>
  );
}
