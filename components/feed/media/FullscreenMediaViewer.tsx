'use client';
import React, { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import type { MediaAttachment } from '@/types';
import { detectVideoProvider, getEmbedUrl, getVideoPosterUrl } from './mediaHelpers';

type Props = {
  media: MediaAttachment[];
  startIndex: number;
  onClose: () => void;
};

// Shared full-screen viewer — carousels through images AND plays video slides
// inline (embed or native player). Used for the lightbox and for any post
// that mixes images with video, where video always plays in this theater view.
export default function FullscreenMediaViewer({ media, startIndex, onClose }: Props) {
  const [index, setIndex] = useState(startIndex);
  const current = media[index];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setIndex((i) => (i - 1 + media.length) % media.length);
      if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % media.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [media.length, onClose]);

  if (!current) return null;
  const isVideo = current.type === 'video';
  const provider = isVideo ? detectVideoProvider(current.url) : 'file';
  const embedUrl = isVideo ? getEmbedUrl(current.url, provider) : null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 !mt-0 bg-[#0E0D0C]/92 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      data-testid="media-viewer-modal"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute top-4 left-4 right-4 flex items-center justify-between text-white text-xs z-10"
      >
        <span
          data-testid="media-viewer-counter"
          className="font-bold bg-white text-gray-900 px-3.5 py-1 rounded-md text-xs shadow-md"
        >
          {index + 1} of {media.length}
        </span>
        <button
          type="button"
          data-testid="media-viewer-close"
          onClick={onClose}
          className="p-2 bg-white text-gray-900 rounded-md hover:scale-105 transition-transform shadow-md cursor-pointer"
          title="Close (Esc)"
          aria-label="Close viewer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {media.length > 1 && (
        <button
          type="button"
          data-testid="media-viewer-prev"
          onClick={(e) => {
            e.stopPropagation();
            setIndex((i) => (i - 1 + media.length) % media.length);
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white text-gray-900 rounded-md hover:scale-110 transition-all z-10 shadow-md cursor-pointer"
          title="Previous"
          aria-label="Previous media"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}

      <div
        onClick={(e) => e.stopPropagation()}
        className="max-w-5xl w-full max-h-[85vh] flex items-center justify-center overflow-hidden"
      >
        {isVideo ? (
          provider === 'unknown' ? (
            <div className="flex flex-col items-center gap-3 text-white/85 text-center p-10">
              <ExternalLink className="w-8 h-8" />
              <p className="text-sm font-medium">Preview unavailable for this link.</p>
              <a
                href={current.url}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="media-viewer-external-link"
                className="text-sm font-semibold underline"
              >
                Open original video ↗
              </a>
            </div>
          ) : embedUrl ? (
            <div className="w-full aspect-video max-h-[80vh]">
              <iframe
                src={embedUrl}
                title="Video playback"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0 rounded-lg"
              />
            </div>
          ) : (
            <video
              src={current.url}
              poster={getVideoPosterUrl(current)}
              className="max-w-full max-h-[80vh] rounded-lg"
              controls
              autoPlay
              playsInline
              data-testid="media-viewer-video"
            />
          )
        ) : (
          <img
            src={current.url}
            alt={current.alt || 'Full view'}
            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl animate-slide-up"
          />
        )}
      </div>

      {media.length > 1 && (
        <button
          type="button"
          data-testid="media-viewer-next"
          onClick={(e) => {
            e.stopPropagation();
            setIndex((i) => (i + 1) % media.length);
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white text-gray-900 rounded-md hover:scale-110 transition-all z-10 shadow-md cursor-pointer"
          title="Next"
          aria-label="Next media"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
