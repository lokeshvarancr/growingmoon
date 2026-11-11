'use client';
import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gm-ivory flex flex-col items-center justify-center p-6 text-center relative overflow-hidden" data-testid="not-found-page">
      <div aria-hidden className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="font-display italic text-[38vw] sm:text-[28vw] leading-none text-gm-ink/[0.04] select-none">404</span>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.6, rotate: -30 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 160, damping: 16 }}
        className="relative w-20 h-20 rounded-full bg-gm-ink flex items-center justify-center mx-auto mb-8 overflow-hidden"
      >
        <span className="absolute inset-[24%] rounded-full bg-gradient-to-br from-[#FFF3E2] via-[#F6CFA6] to-gm-accent" />
        <span className="absolute inset-[24%] rounded-full bg-gm-ink translate-x-[45%]" />
      </motion.div>

      <span className="relative text-[11px] font-semibold text-gm-accent uppercase tracking-[0.22em] block mb-4">
        404 · Destination Lost in Orbit
      </span>
      <h1 className="relative text-5xl sm:text-6xl text-gm-midnight mb-4">Page Not Found</h1>
      <p className="relative text-sm sm:text-base text-gm-text-secondary max-w-sm mx-auto mb-10 leading-relaxed">
        This route or founder journey does not exist. Let&apos;s get you back on the right path.
      </p>

      <div className="relative flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/home"
          className="inline-flex items-center gap-1.5 bg-gm-ink hover:bg-gm-accent text-gm-paper text-sm font-semibold px-6 h-12 rounded-full transition-colors"
          data-testid="not-found-return-feed"
        >
          <span>Return to Feed</span>
        </Link>
        <Link
          href="/discover"
          className="inline-flex items-center gap-2 bg-gm-surface border border-gm-ink/10 text-gm-midnight text-sm font-semibold px-5 h-12 rounded-full hover:border-gm-ink/30 transition-colors"
          data-testid="not-found-discover"
        >
          <Compass className="w-4 h-4" />
          <span>Discover Founders</span>
        </Link>
      </div>
    </div>
  );
}
