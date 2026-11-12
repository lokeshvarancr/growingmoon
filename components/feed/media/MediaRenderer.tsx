'use client';
import React, { useState } from 'react';
import type { MediaAttachment } from '@/types';
import SingleMedia from './SingleMedia';
import MultiImageGrid from './MultiImageGrid';
import FullscreenMediaViewer from './FullscreenMediaViewer';

type Props = {
  media: MediaAttachment[];
};

// Top-level dispatcher: picks the right layout for the media composition and
// owns the fullscreen viewer state shared by every layout below it.
export default function MediaRenderer({ media }: Props) {
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  if (!media || media.length === 0) return null;

  return (
    <>
      {media.length === 1 ? (
        <SingleMedia media={media[0]} onOpenViewer={() => setViewerIndex(0)} />
      ) : (
        <MultiImageGrid media={media} onOpenViewer={(i) => setViewerIndex(i)} />
      )}

      {viewerIndex !== null && (
        <FullscreenMediaViewer media={media} startIndex={viewerIndex} onClose={() => setViewerIndex(null)} />
      )}
    </>
  );
}
