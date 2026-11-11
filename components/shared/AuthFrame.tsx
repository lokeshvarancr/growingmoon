'use client';
import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import BrandMark from './BrandMark';

export default function AuthFrame({ tagline, children }: { tagline: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gm-paper grid lg:grid-cols-[1.05fr_1fr] select-none" data-testid="auth-frame">
      {/* Editorial art panel */}
      <aside className="hidden lg:flex relative overflow-hidden bg-[#16161A] text-[#F5F0E7] m-3 rounded-[36px] flex-col justify-between p-12">
        <Link href="/" className="relative z-10 [&_span]:!text-[#F5F0E7] [&_em]:!text-gm-accent">
          <BrandMark />
        </Link>
        <div aria-hidden className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-[62%] aspect-square rounded-full overflow-hidden shadow-[0_0_160px_-20px_rgb(var(--gm-accent-rgb)/0.6)]"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#FFF6EA] via-[#F7D3AE] to-gm-accent" />
            <motion.div
              initial={{ x: '0%' }}
              animate={{ x: '38%' }}
              transition={{ duration: 2.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 rounded-full bg-[#16161A]"
            />
          </motion.div>
        </div>
        <p className="relative z-10 font-display italic text-4xl xl:text-5xl leading-[1.05] max-w-md">
          &ldquo;Your journey matters before you make it big.&rdquo;
        </p>
      </aside>

      {/* Form column */}
      <div className="flex flex-col items-center justify-center px-4 py-10 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 text-center flex flex-col items-center"
        >
          <Link href="/" className="lg:hidden mb-3" data-testid="auth-logo">
            <BrandMark size="lg" />
          </Link>
          <p className="text-[13px] text-gray-500 font-medium max-w-xs">{tagline}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="w-full flex flex-col items-center"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
