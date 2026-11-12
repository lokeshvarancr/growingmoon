/* ── Growing Moon — Shared Media Intelligence Helpers ──────────────────── */
import type { MediaAttachment } from '@/types';

export type VideoProvider = 'youtube' | 'vimeo' | 'loom' | 'file' | 'unknown';

export function getYouTubeId(url?: string): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?.*v=|shorts\/))([\w-]{11})/i
  );
  return match ? match[1] : null;
}

export function getVimeoId(url?: string): string | null {
  if (!url) return null;
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  return match ? match[1] : null;
}

export function getLoomId(url?: string): string | null {
  if (!url) return null;
  const match = url.match(/loom\.com\/share\/([\w-]+)/i);
  return match ? match[1] : null;
}

// Identifies the video provider so we can embed, label and gracefully degrade
export function detectVideoProvider(url?: string): VideoProvider {
  if (!url) return 'file';
  if (getYouTubeId(url)) return 'youtube';
  if (getVimeoId(url)) return 'vimeo';
  if (getLoomId(url)) return 'loom';
  if (/^https?:\/\//i.test(url) && !/\.(mp4|webm|mov|m3u8)(\?|$)/i.test(url)) return 'unknown';
  return 'file';
}

export function getEmbedUrl(url: string, provider: VideoProvider): string | null {
  if (provider === 'youtube') {
    const id = getYouTubeId(url);
    return id ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1` : null;
  }
  if (provider === 'vimeo') {
    const id = getVimeoId(url);
    return id ? `https://player.vimeo.com/video/${id}?autoplay=1` : null;
  }
  if (provider === 'loom') {
    const id = getLoomId(url);
    return id ? `https://www.loom.com/embed/${id}?autoplay=1` : null;
  }
  return null;
}

export function getVideoDomain(url?: string): string {
  if (!url) return 'External link';
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'External link';
  }
}

export function getVideoPosterUrl(media: { url: string; thumbnail?: string }): string {
  if (media.thumbnail) return media.thumbnail;
  const ytId = getYouTubeId(media.url);
  if (ytId) return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
  return 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80';
}

// Deterministic placeholder aspect ratios — avoids layout shift since we don't
// store the media's exact natural width/height, only a coarse orientation.
export const ASPECT_BY_ORIENTATION: Record<string, string> = {
  portrait: 'aspect-[4/5]',
  landscape: 'aspect-[16/9]',
  square: 'aspect-square',
};

// Picks the most visually interesting tile to feature as the "hero" in a
// multi-image composition — prefers a portrait shot for editorial contrast.
export function pickHeroIndex(mediaList: MediaAttachment[]): number {
  const idx = mediaList.findIndex((m) => m.orientation === 'portrait');
  return idx >= 0 ? idx : 0;
}

export function hasAnyVideo(mediaList: MediaAttachment[]): boolean {
  return mediaList.some((m) => m.type === 'video');
}
