'use client';
import React from 'react';
import Link from 'next/link';
import {
  Compass,
  FileBadge2,
  Users2,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
  Layers,
  ChevronRight,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gm-ivory text-gm-midnight selection:bg-gm-lavender/30">
      {/* ── Navbar ─────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-gm-ivory/85 backdrop-blur-md border-b border-gm-border px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gm-midnight flex items-center justify-center text-gm-ivory shadow-sm transition-transform group-hover:scale-105">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-gm-midnight block leading-none">
                Growing Moon
              </span>
              <span className="text-[10px] font-semibold tracking-wider text-gm-lavender uppercase mt-1 block">
                Founder Journeys
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3 sm:gap-4 text-xs font-semibold">
            <Link
              href="/home"
              className="text-gm-midnight hover:text-gm-indigo px-3 py-2 rounded-xl transition-colors hidden sm:inline-block"
            >
              Explore Feed
            </Link>
            <Link
              href="/login"
              className="text-gm-midnight hover:text-gm-indigo px-3 py-2 rounded-xl border border-gm-border bg-gm-white hover:bg-gm-lavender-soft transition-colors shadow-sm"
            >
              Sign In
            </Link>
            <Link
              href="/onboarding"
              className="bg-gm-indigo text-gm-white hover:bg-gm-indigo-hover px-4 py-2 rounded-xl transition-colors shadow-card flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ───────────────────────────────────────── */}
      <section className="pt-16 pb-20 px-4 sm:px-8 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-gm-lavender-soft/70 border border-gm-lavender/30 px-3.5 py-1.5 rounded-full text-xs text-gm-indigo font-bold mb-6 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-gm-lavender" />
            <span>A social platform for early-stage founders & builders</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-gm-midnight tracking-tight leading-[1.1] mb-6">
            Your next step starts with the <span className="text-gm-indigo underline decoration-gm-lavender/40 decoration-wavy">right people</span>.
          </h1>

          <p className="text-base sm:text-lg text-gm-text-secondary max-w-2xl mx-auto leading-relaxed mb-8">
            Discover founders at your exact stage or just one step ahead. Document real breakthroughs and setbacks on your Journey Passport before you make it big.
          </p>

          {/* Primary & Secondary CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-14">
            <Link
              href="/onboarding"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gm-indigo text-gm-white font-bold text-sm px-6 py-3.5 rounded-xl hover:bg-gm-indigo-hover transition-all shadow-card group"
            >
              <span>Start your journey</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/home"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gm-white border border-gm-border text-gm-midnight font-bold text-sm px-6 py-3.5 rounded-xl hover:bg-gm-lavender-soft transition-colors shadow-sm"
            >
              <span>Explore live demo feed</span>
            </Link>
          </div>

          {/* Quote Banner */}
          <div className="p-4 bg-gm-white/70 border border-gm-border rounded-2xl max-w-lg mx-auto shadow-sm">
            <p className="text-xs font-semibold text-gm-midnight italic">
              &ldquo;Your journey matters before you make it big.&rdquo;
            </p>
          </div>
        </div>
      </section>

      {/* ── Journey Passport Visual Preview ────────────────────── */}
      <section className="py-16 px-4 sm:px-8 bg-gm-midnight text-gm-ivory relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[11px] font-extrabold text-gm-lavender uppercase tracking-widest block mb-2">
              Core Innovation
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              The Journey Passport
            </h2>
            <p className="text-xs sm:text-sm text-gm-mist/80 mt-2">
              A structured, chronological record of your real entrepreneurial milestones, external evidence, and trajectory — not an ordinary embellished CV.
            </p>
          </div>

          {/* Mock Interactive Passport Card */}
          <div className="bg-[#1D2138] border border-gm-lavender/30 rounded-3xl p-6 sm:p-10 shadow-modal max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#2C3150] mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gm-lavender text-gm-midnight font-extrabold text-lg flex items-center justify-center">
                  AS
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">Arjun Sharma</h3>
                    <span className="text-[10px] font-bold text-gm-mint bg-gm-mint/15 px-2.5 py-0.5 rounded-full border border-gm-mint/30">
                      Verified Passport
                    </span>
                  </div>
                  <p className="text-xs text-gm-mist mt-0.5">
                    Bengaluru · First Customers Stage · Target: ₹1L MRR
                  </p>
                </div>
              </div>

              <Link
                href="/passport/arjun_sharma"
                className="text-xs font-bold text-gm-lavender hover:text-white bg-gm-lavender/10 hover:bg-gm-lavender/20 px-4 py-2 rounded-xl transition-colors border border-gm-lavender/30 self-start sm:self-auto"
              >
                Inspect Full Passport →
              </Link>
            </div>

            {/* Timeline Snapshot */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#242946] p-4 rounded-2xl border border-[#343B63]">
                <span className="text-[10px] font-mono text-gm-mist/70 block mb-1">Month 1</span>
                <span className="text-xs font-bold text-white block mb-1">Quit Job & Built v1.0</span>
                <p className="text-[11px] text-gm-mist/80 leading-relaxed">
                  Left ₹18LPA role to code full-time. 40 days to ship first prototype.
                </p>
              </div>

              <div className="bg-[#242946] p-4 rounded-2xl border border-[#343B63]">
                <span className="text-[10px] font-mono text-gm-mist/70 block mb-1">Month 3</span>
                <span className="text-xs font-bold text-white block mb-1">First Customer (₹3K/mo)</span>
                <p className="text-[11px] text-gm-mist/80 leading-relaxed">
                  Signed first boutique CA in Koramangala via cold outreach.
                </p>
              </div>

              <div className="bg-gm-lavender/15 p-4 rounded-2xl border border-gm-lavender/50">
                <span className="text-[10px] font-mono text-gm-lavender font-bold block mb-1">Current Milestone</span>
                <span className="text-xs font-bold text-white block mb-1">₹42,000 / mo MRR</span>
                <p className="text-[11px] text-gm-mist/90 leading-relaxed">
                  3 annual subscriptions active. Stripe evidence verified.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Difference Section: Resume vs Real Journey ─────────── */}
      <section className="py-20 px-4 sm:px-8 max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-[11px] font-extrabold text-gm-lavender uppercase tracking-widest block mb-2">
            The Paradigm Shift
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gm-midnight tracking-tight">
            Polished Résumé vs. Real Journey
          </h2>
          <p className="text-xs sm:text-sm text-gm-text-secondary mt-2">
            Conventional networks reward manufactured success theater. Growing Moon values honest forward movement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* LinkedIn Style */}
          <div className="bg-gm-white border border-gm-border rounded-3xl p-6 sm:p-8 shadow-card opacity-80">
            <span className="text-xs font-bold text-gm-text-secondary uppercase tracking-wider block mb-2">
              Every Other Network
            </span>
            <h3 className="text-lg font-bold text-gm-midnight mb-4">
              The Polish & Vanity Trap
            </h3>
            <ul className="space-y-3 text-xs text-gm-text-secondary">
              <li className="flex items-start gap-2">
                <span className="text-gm-danger font-bold">✕</span>
                <span>Only celebrates the exit or funding announcement</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gm-danger font-bold">✕</span>
                <span>Inflated follower counts and engagement bait algorithms</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gm-danger font-bold">✕</span>
                <span>Silent about pivots, customer churn, and early doubts</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gm-danger font-bold">✕</span>
                <span>Generic job titles that hide where someone truly is</span>
              </li>
            </ul>
          </div>

          {/* Growing Moon Style */}
          <div className="bg-gm-lavender-soft/40 border-2 border-gm-lavender rounded-3xl p-6 sm:p-8 shadow-card relative">
            <span className="text-xs font-bold text-gm-indigo uppercase tracking-wider block mb-2">
              Growing Moon
            </span>
            <h3 className="text-lg font-bold text-gm-midnight mb-4">
              Evidence of Real Movement
            </h3>
            <ul className="space-y-3 text-xs text-gm-midnight font-medium">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-gm-indigo flex-shrink-0" />
                <span>Documents every milestone from day zero before you make it big</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-gm-indigo flex-shrink-0" />
                <span>Stage-matched discovery: find founders 1 step ahead of you</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-gm-indigo flex-shrink-0" />
                <span>Unified updates with verifiable product & revenue evidence</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-gm-indigo flex-shrink-0" />
                <span>Real-time journey milestones and transparent evidence of progress</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── Final Call to Action ───────────────────────────────── */}
      <section className="py-20 px-4 sm:px-8 text-center max-w-4xl mx-auto">
        <h2 className="text-3xl sm:text-5xl font-extrabold text-gm-midnight tracking-tight mb-4">
          Ready to take your next step?
        </h2>
        <p className="text-sm sm:text-base text-gm-text-secondary max-w-lg mx-auto leading-relaxed mb-8">
          Join early-stage founders who are documenting the journey and moving forward together.
        </p>
        <Link
          href="/onboarding"
          className="inline-flex items-center gap-2 bg-gm-indigo text-gm-white font-bold text-sm px-8 py-4 rounded-xl hover:bg-gm-indigo-hover transition-all shadow-card"
        >
          <span>Start your Journey Passport</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-gm-border py-12 px-4 sm:px-8 bg-gm-white text-xs text-gm-text-secondary">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gm-midnight flex items-center justify-center text-gm-ivory">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            </div>
            <span className="font-bold text-gm-midnight">Growing Moon</span>
            <span>· Official Lunar Horizon System</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/home" className="hover:text-gm-midnight transition-colors">
              Feed
            </Link>
            <Link href="/discover" className="hover:text-gm-midnight transition-colors">
              Your Next Step
            </Link>
            <Link href="/passport" className="hover:text-gm-midnight transition-colors">
              Passport
            </Link>
            <Link href="/login" className="hover:text-gm-midnight transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
