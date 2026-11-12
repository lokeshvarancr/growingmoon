import React from 'react';

type BrandMarkProps = { size?: 'sm' | 'md' | 'lg'; showWord?: boolean; sub?: string };

export default function BrandMark({ size = 'md', showWord = true, sub }: BrandMarkProps) {
  const dim = size === 'sm' ? 'w-7 h-7' : size === 'lg' ? 'w-11 h-11' : 'w-8 h-8 sm:w-9 sm:h-9';
  return (
    <span className="flex items-center gap-2.5 group select-none">
      <span className={`${dim} relative flex-shrink-0 rounded-full bg-gm-ink flex items-center justify-center overflow-hidden transition-transform duration-500 group-hover:rotate-[-18deg]`}>
        <span className="absolute inset-[22%] rounded-full bg-gradient-to-br from-[#F3FBF9] via-[#BFEDE4] to-gm-accent" />
        <span className="absolute inset-[22%] rounded-full bg-gm-ink translate-x-[38%] -translate-y-[8%] transition-transform duration-700 group-hover:translate-x-[58%]" />
      </span>
      {showWord && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-[19px] sm:text-[21px] font-medium tracking-tight text-gm-ink">
            Growing <em className="italic text-gm-accent">Moon</em>
          </span>
          {sub && (
            <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-gray-500">{sub}</span>
          )}
        </span>
      )}
    </span>
  );
}
