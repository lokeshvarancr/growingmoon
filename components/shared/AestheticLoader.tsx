'use client';
import React from 'react';

type AestheticLoaderProps = {
  title?: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
};

export function MoonPhase({ px = 44 }: { px?: number }) {
  return (
    <span
      className="relative inline-block rounded-full overflow-hidden bg-gradient-to-br from-[#FFF3E2] via-[#F6CFA6] to-gm-accent shadow-[0_0_40px_-6px_rgb(var(--gm-accent-rgb)/0.6)]"
      style={{ width: px, height: px }}
      aria-hidden
    >
      <span className="absolute inset-0 rounded-full bg-gm-ivory animate-moon-wax" />
    </span>
  );
}

export default function AestheticLoader({
  title = 'Bringing your journey...',
  subtitle = 'Connecting with the community ahead of you.',
  size = 'md',
  fullScreen = false,
}: AestheticLoaderProps) {
  const containerClasses = fullScreen
    ? 'min-h-[70vh] flex flex-col items-center justify-center p-6 text-center select-none'
    : 'py-14 sm:py-20 flex flex-col items-center justify-center p-6 text-center select-none';

  const px = size === 'sm' ? 30 : size === 'lg' ? 64 : 46;

  return (
    <div className={`${containerClasses} animate-fade-in`} role="status" aria-live="polite" data-testid="aesthetic-loader">
      <div className="relative mb-6 flex items-center justify-center">
        <span className="absolute rounded-full border border-dashed border-gm-ink/15 animate-[spin_14s_linear_infinite]" style={{ width: px + 26, height: px + 26 }} />
        <MoonPhase px={px} />
      </div>

      {title && (
        <h3 className="font-display text-lg sm:text-xl font-medium text-gm-ink tracking-tight">
          {title}
        </h3>
      )}
      {subtitle && (
        <p className="text-[13px] text-gray-500 mt-1.5 max-w-xs sm:max-w-sm leading-relaxed">{subtitle}</p>
      )}

      <div className="mt-7 w-40 h-[3px] rounded-full overflow-hidden bg-gm-ink/[0.06]">
        <div className="h-full w-full gm-skeleton !rounded-full !bg-[length:50%_100%] [background-image:linear-gradient(90deg,transparent,rgb(var(--gm-accent-rgb)/0.8),transparent)]" />
      </div>
    </div>
  );
}
