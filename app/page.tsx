'use client';
import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { useApp } from '@/lib/state/AppContext';
import BrandMark from '@/components/shared/BrandMark';
import { Sparkles, ArrowRight, CheckCircle2, ArrowUpRight } from 'lucide-react';

const rise = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.08 * i, duration: 0.8, ease: [0.22, 1, 0.36, 1] as const } }),
};

const milestones = [
  { when: 'Month 1', title: 'Quit Job & Built v1.0', body: 'Left ₹18LPA role to code full-time. 40 days to ship first prototype.', phase: 0.22 },
  { when: 'Month 3', title: 'First Customer (₹3K/mo)', body: 'Signed first boutique CA in Koramangala via cold outreach.', phase: 0.55 },
  { when: 'Current Milestone', title: '₹42,000 / mo MRR', body: '3 annual subscriptions active. Stripe evidence verified.', phase: 1, current: true },
];

const otherNetwork = [
  'Only celebrates the exit or funding announcement',
  'Inflated follower counts and engagement bait algorithms',
  'Silent about pivots, customer churn, and early doubts',
  'Generic job titles that hide where someone truly is',
];

const growingMoon = [
  'Documents every milestone from day zero before you make it big',
  'Stage-matched discovery: find founders 1 step ahead of you',
  'Unified updates with verifiable product & revenue evidence',
  'Real-time journey milestones and transparent evidence of progress',
];

function Phase({ fill, size = 44 }: { fill: number; size?: number }) {
  return (
    <span className="relative inline-block rounded-full overflow-hidden bg-[#2A2925]" style={{ width: size, height: size }}>
      <span
        className="absolute inset-0 rounded-full bg-gradient-to-br from-[#F3FBF9] via-[#BFEDE4] to-gm-accent"
        style={{ clipPath: `inset(0 0 0 ${(1 - fill) * 100}%)` }}
      />
    </span>
  );
}

function HeroMoon() {
  return (
    <div className="relative w-full aspect-square max-w-[460px] mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-[8%] rounded-full overflow-hidden bg-gradient-to-br from-[#F3FBF9] via-[#BFEDE4] to-gm-accent shadow-[0_60px_120px_-40px_rgb(var(--gm-accent-rgb)/0.65)]"
      >
        <motion.div
          initial={{ x: '0%' }}
          animate={{ x: '34%' }}
          transition={{ duration: 2.4, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 rounded-full bg-gm-ivory"
        />
      </motion.div>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 rounded-full border border-dashed border-gm-ink/15"
      >
        <span className="absolute top-[6%] left-1/2 w-2.5 h-2.5 rounded-full bg-gm-ink" />
      </motion.div>
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, isAuthLoading } = useApp();

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      router.replace('/home');
    }
  }, [isAuthLoading, isAuthenticated, router]);
  return (
    <div className="min-h-screen bg-gm-ivory text-gm-midnight overflow-x-hidden" data-testid="landing-page">
      {/* ── Navbar ─────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 px-3 sm:px-8 pt-3 sm:pt-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between glass-dock rounded-full pl-4 pr-2 py-2">
          <Link href="/" data-testid="landing-logo">
            <BrandMark sub="Founder Journeys" />
          </Link>

          <div className="flex items-center gap-1 sm:gap-2 text-[13px] font-semibold">
            <Link href="/home" className="text-gm-midnight hover:text-gm-accent px-4 h-10 items-center rounded-full transition-colors hidden sm:inline-flex" data-testid="landing-nav-explore-feed">
              Explore Feed
            </Link>
            <Link href="/login" className="text-gm-midnight px-4 h-10 inline-flex items-center rounded-full hover:bg-gm-ink/5 transition-colors" data-testid="landing-nav-sign-in">
              Sign In
            </Link>
            <Link href="/register" className="bg-gm-accent text-white pl-5 pr-4 h-10 rounded-full transition-colors inline-flex items-center gap-1.5 group" data-testid="landing-nav-get-started">
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ───────────────────────────────────────── */}
      <section className="px-5 sm:px-8 pt-14 sm:pt-20 pb-24 sm:pb-32">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          <motion.div initial="hidden" animate="show" className="lg:col-span-7">
            <motion.div custom={0} variants={rise} className="inline-flex items-center gap-2 border border-gm-ink/10 px-3.5 py-1.5 rounded-full text-xs text-gm-ink font-medium mb-8">
              <Sparkles className="w-3.5 h-3.5 text-gm-accent" />
              <span>A social platform for early-stage founders & builders</span>
            </motion.div>

            <motion.h1 custom={1} variants={rise} className="text-[52px] leading-[0.98] sm:text-[84px] lg:text-[104px] text-gm-midnight mb-8">
              Your next step starts with the{' '}
              <span className="italic text-gm-accent relative whitespace-nowrap">
                right people
                <svg className="absolute -bottom-2 left-0 w-full" height="14" viewBox="0 0 300 14" preserveAspectRatio="none" aria-hidden>
                  <motion.path
                    d="M2 9 C 60 2, 120 13, 180 6 S 280 4, 298 8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.9, duration: 1.1, ease: 'easeInOut' }}
                  />
                </svg>
              </span>
              .
            </motion.h1>

            <motion.p custom={2} variants={rise} className="text-lg sm:text-xl text-gm-text-secondary max-w-xl leading-relaxed mb-10">
              Discover founders at your exact stage or just one step ahead. Document real breakthroughs and setbacks on your Journey Passport before you make it big.
            </motion.p>

            <motion.div custom={3} variants={rise} className="flex flex-col sm:flex-row sm:items-center gap-3 mb-12">
              <Link href="/register" className="inline-flex items-center justify-center gap-2 bg-gm-accent text-white font-semibold text-[15px] pl-7 pr-6 h-14 rounded-full hover:bg-gm-accent-deep transition-colors shadow-[0_20px_40px_-18px_rgb(var(--gm-accent-rgb)/0.8)] group" data-testid="hero-start-journey">
                <span>Start your journey</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/home" className="inline-flex items-center justify-center gap-2 text-gm-midnight font-semibold text-[15px] px-6 h-14 rounded-full border border-gm-ink/15 hover:border-gm-ink/40 transition-colors" data-testid="hero-explore-demo">
                <span>Explore live demo feed</span>
              </Link>
            </motion.div>

            <motion.blockquote custom={4} variants={rise} className="border-l-2 border-gm-accent pl-5 max-w-md">
              <p className="font-display text-xl sm:text-2xl italic text-gm-midnight leading-snug">
                &ldquo;Your journey matters before you make it big.&rdquo;
              </p>
            </motion.blockquote>
          </motion.div>

          <div className="lg:col-span-5 hidden sm:block">
            <HeroMoon />
          </div>
        </div>
      </section>

      {/* ── Journey Passport Visual Preview ────────────────────── */}
      <section className="py-24 sm:py-32 px-5 sm:px-8 bg-[#16161A] text-[#F5F0E7] relative overflow-hidden rounded-t-[40px] sm:rounded-t-[64px]">
        <div aria-hidden className="absolute -top-40 right-[-10%] w-[600px] h-[600px] rounded-full bg-gm-accent/20 blur-[140px]" />
        <div className="max-w-6xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="grid lg:grid-cols-12 gap-6 mb-16"
          >
            <div className="lg:col-span-5">
              <span className="text-[11px] font-semibold text-gm-accent uppercase tracking-[0.22em] block mb-4">Core Innovation</span>
              <h2 className="text-5xl sm:text-6xl text-white">The Journey Passport</h2>
            </div>
            <p className="lg:col-span-6 lg:col-start-7 text-base sm:text-lg text-[#F5F0E7]/65 leading-relaxed self-end">
              A structured, chronological record of your real entrepreneurial milestones, external evidence, and trajectory — not an ordinary embellished CV.
            </p>
          </motion.div>

          {/* Mock Interactive Passport Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white/[0.03] border border-white/10 rounded-[32px] p-6 sm:p-10"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-8 border-b border-white/10 mb-10">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#F3FBF9] via-[#BFEDE4] to-gm-accent text-[#16161A] font-semibold text-lg flex items-center justify-center font-display">
                  AS
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-2xl font-medium text-white">Arjun Sharma</h3>
                    <span className="text-[10px] font-semibold text-[#9FD6C2] bg-[#9FD6C2]/10 px-2.5 py-1 rounded-full border border-[#9FD6C2]/25 uppercase tracking-wider">
                      Verified Passport
                    </span>
                  </div>
                  <p className="text-sm text-[#F5F0E7]/55 mt-1">Bengaluru · First Customers Stage · Target: ₹1L MRR</p>
                </div>
              </div>

              <Link href="/passport/arjun_sharma" className="text-sm font-semibold text-[#16161A] bg-[#F5F0E7] hover:bg-white px-5 h-11 inline-flex items-center rounded-full transition-colors self-start sm:self-auto" data-testid="landing-inspect-passport">
                Inspect Full Passport →
              </Link>
            </div>

            {/* Timeline Snapshot — moon phase path */}
            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6">
              <div aria-hidden className="hidden md:block absolute top-[22px] left-[22px] right-[22px] h-px bg-gradient-to-r from-white/10 via-white/25 to-gm-accent" />
              {milestones.map((m, i) => (
                <motion.div
                  key={m.when}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.15 * i, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className="relative"
                >
                  <div className={`relative z-10 mb-5 inline-flex rounded-full p-1 ${m.current ? 'bg-gm-accent/30 ring-1 ring-gm-accent' : 'bg-[#16161A] ring-1 ring-white/15'}`}>
                    <Phase fill={m.phase} size={36} />
                  </div>
                  <span className={`text-[11px] font-mono uppercase tracking-widest block mb-2 ${m.current ? 'text-gm-accent font-bold' : 'text-[#F5F0E7]/45'}`}>{m.when}</span>
                  <span className="font-display text-xl text-white block mb-2">{m.title}</span>
                  <p className="text-sm text-[#F5F0E7]/60 leading-relaxed max-w-xs">{m.body}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Difference Section: Resume vs Real Journey ─────────── */}
      <section className="py-24 sm:py-32 px-5 sm:px-8 max-w-6xl mx-auto">
        <div className="max-w-2xl mb-16">
          <span className="text-[11px] font-semibold text-gm-accent uppercase tracking-[0.22em] block mb-4">The Paradigm Shift</span>
          <h2 className="text-5xl sm:text-6xl text-gm-midnight mb-5">Polished Résumé vs. Real Journey</h2>
          <p className="text-base sm:text-lg text-gm-text-secondary leading-relaxed">
            Conventional networks reward manufactured success theater. Growing Moon values honest forward movement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          {/* LinkedIn Style */}
          <div className="md:col-span-5 rounded-[28px] p-7 sm:p-9 border border-dashed border-gm-ink/15">
            <span className="text-[11px] font-semibold text-gm-text-secondary uppercase tracking-[0.18em] block mb-3">Every Other Network</span>
            <h3 className="text-2xl font-medium text-gm-midnight/60 mb-6">The Polish & Vanity Trap</h3>
            <ul className="space-y-4 text-sm text-gm-text-secondary">
              {otherNetwork.map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <span className="text-gm-danger font-bold mt-px">✕</span>
                  <span className="line-through decoration-gm-ink/15">{t}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Growing Moon Style */}
          <motion.div
            whileHover={{ y: -4 }}
            className="md:col-span-7 bg-gm-surface rounded-[28px] p-7 sm:p-10 shadow-card-hover relative overflow-hidden"
          >
            <div aria-hidden className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-gradient-to-br from-[#F3FBF9] via-[#BFEDE4] to-gm-accent opacity-40" />
            <span className="relative text-[11px] font-semibold text-gm-accent uppercase tracking-[0.18em] block mb-3">Growing Moon</span>
            <h3 className="relative text-3xl font-medium text-gm-midnight mb-7">Evidence of Real Movement</h3>
            <ul className="relative space-y-4 text-[15px] text-gm-midnight">
              {growingMoon.map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-gm-accent flex-shrink-0 mt-px" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* ── Final Call to Action ───────────────────────────────── */}
      <section className="px-5 sm:px-8 pb-24 sm:pb-32">
        <div className="max-w-6xl mx-auto rounded-[40px] bg-gm-accent text-white p-10 sm:p-16 relative overflow-hidden">
          <div aria-hidden className="absolute -right-24 -bottom-24 w-80 h-80 rounded-full bg-[#16161A]/20" />
          <div aria-hidden className="absolute -right-6 -bottom-40 w-80 h-80 rounded-full bg-gm-accent" />
          <h2 className="relative text-5xl sm:text-7xl text-white mb-5 max-w-2xl">Ready to take your next step?</h2>
          <p className="relative text-base sm:text-lg text-white/80 max-w-lg leading-relaxed mb-10">
            Join early-stage founders who are documenting the journey and moving forward together.
          </p>
          <Link href="/home" className="relative inline-flex items-center gap-2 bg-[#16161A] text-white font-semibold text-[15px] pl-7 pr-6 h-14 rounded-full hover:bg-black transition-colors group" data-testid="cta-start-passport">
            <span>Start your Journey Passport</span>
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-gm-ink/10 py-10 px-5 sm:px-8 text-[13px] text-gm-text-secondary">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <BrandMark size="sm" />
            <span>· Official Lunar Horizon System</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/home" className="hover:text-gm-midnight transition-colors">Feed</Link>
            <Link href="/discover" className="hover:text-gm-midnight transition-colors">Your Next Step</Link>
            <Link href="/passport" className="hover:text-gm-midnight transition-colors">Passport</Link>
            <Link href="/login" className="hover:text-gm-midnight transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
