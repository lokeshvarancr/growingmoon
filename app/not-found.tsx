'use client';
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gm-ivory flex flex-col items-center justify-center p-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-gm-midnight text-gm-ivory flex items-center justify-center mx-auto mb-6 shadow-sm">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </div>

      <span className="text-xs font-bold text-gm-lavender uppercase tracking-widest block mb-2">
        404 · Destination Lost in Orbit
      </span>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-gm-midnight tracking-tight mb-3">
        Page Not Found
      </h1>
      <p className="text-xs sm:text-sm text-gm-text-secondary max-w-sm mx-auto mb-8 leading-relaxed">
        This route or founder journey does not exist. Let&apos;s get you back on the right path.
      </p>

      <div className="flex items-center gap-3">
        <Link
          href="/home"
          className="inline-flex items-center gap-1.5 bg-gm-indigo hover:bg-gm-indigo-hover text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-card"
        >
          <span>Return to Feed</span>
        </Link>
        <Link
          href="/discover"
          className="inline-flex items-center gap-1.5 bg-gm-white border border-gm-border text-gm-midnight text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-gm-lavender-soft transition-colors"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Discover Founders</span>
        </Link>
      </div>
    </div>
  );
}
