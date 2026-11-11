'use client';
import React from 'react';

type AestheticLoaderProps = {
  title?: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
};

export default function AestheticLoader({
  title = 'Bringing your journey...',
  subtitle = 'Connecting with the community ahead of you.',
  size = 'md',
  fullScreen = false,
}: AestheticLoaderProps) {
  const containerClasses = fullScreen
    ? 'min-h-[70vh] flex flex-col items-center justify-center p-6 text-center select-none'
    : 'py-12 sm:py-16 flex flex-col items-center justify-center p-6 text-center select-none';

  const dimensions =
    size === 'sm'
      ? { outer: 'w-10 h-10', inner: 'w-8 h-8', svg: 16 }
      : size === 'lg'
      ? { outer: 'w-20 h-20', inner: 'w-16 h-16', svg: 28 }
      : { outer: 'w-14 h-14', inner: 'w-11 h-11', svg: 22 };

  return (
    <div className={containerClasses} role="status" aria-live="polite">
      {/* ── Aesthetic Pulsing Crescent Loop (Zero Percentage) ── */}
      <div className={`relative ${dimensions.outer} flex items-center justify-center mb-4`}>
        {/* Soft Breathing Ambient Halo */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#6258DB]/20 via-[#9E77ED]/25 to-amber-200/20 animate-ping opacity-60 duration-1000" />
        
        {/* Smooth Rotating Accent Orbit */}
        <div className="absolute inset-[-4px] rounded-full border border-dashed border-[#6258DB]/25 animate-[spin_6s_linear_infinite]" />

        {/* Core Glowing Moon Vessel */}
        <div className={`${dimensions.inner} rounded-full border-2 border-[#6258DB]/20 border-t-[#6258DB] animate-spin flex items-center justify-center shadow-md bg-white/90 backdrop-blur-xs`}>
          <svg
            width={dimensions.svg}
            height={dimensions.svg}
            viewBox="0 0 24 24"
            fill="none"
            className="text-[#6258DB] animate-pulse"
          >
            <path
              d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
              fill="currentColor"
            />
          </svg>
        </div>
      </div>

      {/* Atmospheric Typography */}
      {title && (
        <h3 className="text-sm sm:text-base font-extrabold text-[#141724] tracking-tight animate-pulse">
          {title}
        </h3>
      )}
      {subtitle && (
        <p className="text-xs text-gray-500 mt-1 max-w-xs sm:max-w-sm leading-relaxed">
          {subtitle}
        </p>
      )}

      {/* Subtle Shimmer Bar Placeholder Cards (Continuous Wave, No Numbers) */}
      <div className="mt-6 flex items-center gap-1.5 opacity-60">
        <span className="w-2 h-2 rounded-full bg-[#6258DB] animate-bounce [animation-delay:-0.3s]" />
        <span className="w-2 h-2 rounded-full bg-[#6258DB] animate-bounce [animation-delay:-0.15s]" />
        <span className="w-2 h-2 rounded-full bg-[#6258DB] animate-bounce" />
      </div>
    </div>
  );
}
