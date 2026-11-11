'use client';
import React from 'react';
import { useApp } from '@/lib/state/AppContext';
import { Image as ImageIcon, ArrowUpRight, TrendingUp, Rocket, ChevronDown } from 'lucide-react';

type StartPostCardProps = {
  onOpenModal: (actionType?: 'text' | 'photo' | 'video' | 'milestone' | 'type' | 'journey') => void;
};

export default function StartPostCard({ onOpenModal }: StartPostCardProps) {
  const { currentUser } = useApp();

  return (
    <div className="bg-white rounded-[28px] sm:rounded-[32px] p-4 sm:p-5 mb-3.5 shadow-sm border border-black/[0.04] transition-all">
      {/* ── Top Row: User Avatar, "Share a progress update..." Bar with Image Icon, and Arrow Button ── */}
      <div className="flex items-center gap-3">
        {currentUser.avatarImage ? (
          <img
            src={currentUser.avatarImage}
            alt={currentUser.name}
            className="w-10 h-10 rounded-full object-cover ring-1 ring-gray-200 shadow-2xs flex-shrink-0"
          />
        ) : (
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${currentUser.avatarColor} ring-1 ring-gray-200 shadow-2xs flex-shrink-0`}
          >
            {currentUser.avatar}
          </div>
        )}

        {/* Input Bar with Image Icon inside */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onOpenModal('text')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onOpenModal('text');
            }
          }}
          className="flex-1 px-5 py-3 rounded-full border border-gray-200/90 hover:border-gray-300 bg-white hover:bg-gray-50/50 text-gray-400 hover:text-gray-600 text-xs sm:text-[13px] font-normal transition-all cursor-pointer text-left flex items-center justify-between group shadow-2xs select-none"
        >
          <span className="truncate">Share a progress update...</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenModal('photo');
            }}
            className="p-1 hover:text-gm-ink transition-colors cursor-pointer"
            title="Attach photo"
          >
            <ImageIcon className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
          </button>
        </div>

        {/* Circular Action Button with ↗ Arrow */}
        <button
          type="button"
          onClick={() => onOpenModal('text')}
          className="w-10 h-10 rounded-full bg-[#1A1A1A] hover:bg-black text-white flex items-center justify-center shadow-sm active:scale-95 transition-all flex-shrink-0 cursor-pointer"
          title="Create update"
          aria-label="Create update"
        >
          <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* ── Bottom Row: Dropdown Pills (Progress update ▾ | Select journey ▾) ── */}
      <div className="flex items-center gap-2 sm:gap-3 pt-3.5 mt-3 border-t border-gray-100/80 text-xs font-semibold text-gray-700 overflow-x-auto scrollbar-none pb-0.5">
        <button
          type="button"
          onClick={() => onOpenModal('type')}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full hover:bg-gray-100/70 transition-colors text-gray-700 cursor-pointer flex-shrink-0"
        >
          <TrendingUp className="w-3.5 h-3.5 text-gray-700" strokeWidth={2.3} />
          <span className="text-xs font-semibold">Progress update</span>
          <ChevronDown className="w-3 h-3 text-gray-400" />
        </button>

        <div className="h-3.5 w-[1px] bg-gray-200 flex-shrink-0" />

        <button
          type="button"
          onClick={() => onOpenModal('journey')}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full hover:bg-gray-100/70 transition-colors text-gray-700 cursor-pointer flex-shrink-0"
        >
          <Rocket className="w-3.5 h-3.5 text-[#936B2B]" strokeWidth={2.2} />
          <span className="text-xs font-semibold">Select journey</span>
          <ChevronDown className="w-3 h-3 text-gray-400" />
        </button>
      </div>
    </div>
  );
}
