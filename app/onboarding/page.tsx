'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/state/AppContext';
import type { EntrepreneurialStage } from '@/types';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  User,
  Compass,
  Target,
  Wrench,
  Check,
} from 'lucide-react';

const stages: { stage: EntrepreneurialStage; desc: string }[] = [
  { stage: 'Exploring', desc: 'Thinking about ideas, researching markets, or learning skills.' },
  { stage: 'Idea Stage', desc: 'Defined a specific problem hypothesis, conducting interviews.' },
  { stage: 'Building MVP', desc: 'Actively coding, designing, or manufacturing v1.0.' },
  { stage: 'Launched', desc: 'Product is live in public. Seeking first pilot users.' },
  { stage: 'First Customers', desc: 'Have 1–10 paying customers or initial steady traction.' },
  { stage: 'Growing', desc: 'Proven repeatable value proposition. Scaling distribution.' },
];

const availableSkills = [
  'Frontend Engineering',
  'Backend Engineering',
  'UI/UX Design',
  'Product Management',
  'Cold Outreach & Sales',
  'Content & SEO',
  'Growth Marketing',
  'Operations & Logistics',
  'Data & Analytics',
  'Fundraising & Finance',
];

const availableInterests = [
  'B2B SaaS',
  'Health Tech',
  'EdTech',
  'D2C & E-Commerce',
  'Consumer Apps',
  'Fintech',
  'Developer Tools',
  'Creator Economy',
  'AI & Automation',
];

export default function OnboardingPage() {
  const router = useRouter();
  const { currentUser, updateUser, addToast } = useApp();

  React.useEffect(() => {
    // Automatically redirect directly to home feed without setup
    router.replace('/home');
  }, [router]);

  const [step, setStep] = useState(1);

  // Form State
  const [name, setName] = useState(currentUser.name === 'You (Demo)' ? 'Aditi Roy' : currentUser.name);
  const [username, setUsername] = useState('aditi_roy');
  const [bio, setBio] = useState('Building a modern mental wellness app for young tech operators.');
  const [location, setLocation] = useState('Bengaluru');
  const [selectedStage, setSelectedStage] = useState<EntrepreneurialStage>('Building MVP');
  const [currentGoal, setCurrentGoal] = useState('Reach 100 active community members');
  const [biggestChallenge, setBiggestChallenge] = useState('Finding reliable distribution channels without ad spend');
  const [skillsOffered, setSkillsOffered] = useState<string[]>(['UI/UX Design', 'Product Management']);
  const [skillsNeeded, setSkillsNeeded] = useState<string[]>(['Backend Engineering', 'Growth Marketing']);
  const [interests, setInterests] = useState<string[]>(['Health Tech', 'Consumer Apps']);

  const toggleSkillOffered = (skill: string) => {
    setSkillsOffered((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const toggleSkillNeeded = (skill: string) => {
    setSkillsNeeded((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleFinish = () => {
    updateUser({
      name,
      username,
      bio,
      location,
      stage: selectedStage,
      currentGoal,
      biggestChallenge,
      skillsOffered,
      skillsNeeded,
      interests,
      avatar: name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase(),
    });
    addToast('Your Journey Passport is ready!', 'success');
    router.push('/home');
  };

  return (
    <div className="min-h-screen bg-gm-ivory flex flex-col justify-center items-center px-4 py-12">
      <div className="max-w-xl w-full bg-gm-white rounded-[36px] p-6 sm:p-12 shadow-card-hover animate-slide-up" data-testid="onboarding-card">
        {/* Progress header */}
        <div className="mb-10">
          <div className="flex items-center justify-between text-xs font-semibold text-gm-text-secondary mb-4">
            <span className="text-gm-lavender uppercase tracking-[0.18em]">Step {step} of 4</span>
            <span>{Math.round((step / 4) * 100)}% Completed</span>
          </div>
          <div className="relative flex items-center justify-between" aria-hidden>
            <div className="absolute left-3 right-3 top-1/2 h-px border-t border-dashed border-gm-ink/20" />
            <div
              className="absolute left-3 top-1/2 h-px bg-gm-indigo transition-all duration-700"
              style={{ width: `calc(${((step - 1) / 3) * 100}% - ${((step - 1) / 3) * 24}px)` }}
            />
            {[1, 2, 3, 4].map((n) => (
              <span
                key={n}
                className={`relative w-6 h-6 rounded-full overflow-hidden ring-4 ring-gm-white transition-transform duration-500 ${n === step ? 'scale-125' : ''} ${n <= step ? 'bg-[#2A2925]' : 'bg-gm-ink/10'}`}
              >
                {n <= step && (
                  <span
                    className="absolute inset-0 bg-gradient-to-br from-[#F3FBF9] via-[#BFEDE4] to-gm-accent transition-all duration-700"
                    style={{ clipPath: `inset(0 0 0 ${(1 - n / 4) * 100}%)` }}
                  />
                )}
              </span>
            ))}
          </div>
        </div>

        {/* ── Step 1: Identity & Bio ──────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-[26px] font-bold text-gm-midnight">
                Tell us who you are
              </h2>
              <p className="text-xs text-gm-text-secondary mt-1">
                Your name, handle, and what you are starting out with.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gm-midnight mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-gm-ivory border border-transparent hover:border-gm-border focus:border-gm-accent focus:bg-gm-white rounded-2xl text-sm transition-colors text-gm-midnight focus-ring"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gm-midnight mb-1">Username Handle</label>
              <div className="flex items-center bg-gm-ivory border border-transparent hover:border-gm-border focus:border-gm-accent rounded-2xl transition-colors px-3.5 py-2.5 text-xs sm:text-sm text-gm-midnight">
                <span className="text-gm-text-secondary mr-1">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  className="bg-transparent w-full focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gm-midnight mb-1">City / Base</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-3 bg-gm-ivory border border-transparent hover:border-gm-border focus:border-gm-accent focus:bg-gm-white rounded-2xl text-sm transition-colors text-gm-midnight focus-ring"
                placeholder="e.g. Bengaluru, Mumbai, Delhi, Remote"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gm-midnight mb-1">Short Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="What are you building or exploring right now?"
                className="w-full px-4 py-3 bg-gm-ivory border border-transparent hover:border-gm-border focus:border-gm-accent focus:bg-gm-white rounded-2xl text-sm transition-colors text-gm-midnight focus-ring resize-none"
              />
            </div>
          </div>
        )}

        {/* ── Step 2: Entrepreneurial Stage ───────────────────────── */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-[26px] font-bold text-gm-midnight">
                Where are you right now?
              </h2>
              <p className="text-xs text-gm-text-secondary mt-1">
                We use this to connect you with peers at your exact level.
              </p>
            </div>

            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
              {stages.map((item) => (
                <button
                  key={item.stage}
                  type="button"
                  onClick={() => setSelectedStage(item.stage)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                    selectedStage === item.stage
                      ? 'border-gm-indigo bg-gm-lavender-soft/60 shadow-sm'
                      : 'border-gm-border bg-gm-white hover:bg-gm-ivory'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-gm-midnight">{item.stage}</span>
                    {selectedStage === item.stage && (
                      <CheckCircle2 className="w-4 h-4 text-gm-indigo" />
                    )}
                  </div>
                  <p className="text-[11px] text-gm-text-secondary">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 3: Goal & Biggest Challenge ───────────────────── */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-[26px] font-bold text-gm-midnight">
                Current goal & blockers
              </h2>
              <p className="text-xs text-gm-text-secondary mt-1">
                Transparency creates genuine peer resonance.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gm-midnight mb-1">
                What is your immediate 30-day goal?
              </label>
              <input
                type="text"
                value={currentGoal}
                onChange={(e) => setCurrentGoal(e.target.value)}
                placeholder="e.g. Conduct 10 user interviews, launch MVP, get 3 clients"
                className="w-full px-4 py-3 bg-gm-ivory border border-transparent hover:border-gm-border focus:border-gm-accent focus:bg-gm-white rounded-2xl text-sm transition-colors text-gm-midnight focus-ring"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gm-midnight mb-1">
                What is your biggest blocker or challenge?
              </label>
              <textarea
                value={biggestChallenge}
                onChange={(e) => setBiggestChallenge(e.target.value)}
                rows={3}
                placeholder="e.g. Struggling with cold outreach, balancing day job, lack technical skills"
                className="w-full px-4 py-3 bg-gm-ivory border border-transparent hover:border-gm-border focus:border-gm-accent focus:bg-gm-white rounded-2xl text-sm transition-colors text-gm-midnight focus-ring resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gm-midnight mb-2">
                Industry Interests (Pick 2–4)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {availableInterests.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`text-[11px] px-3 py-1.5 rounded-full font-semibold transition-all ${
                      interests.includes(interest)
                        ? 'bg-gm-indigo text-gm-white'
                        : 'border border-gm-border bg-gm-ivory text-gm-text-secondary hover:text-gm-midnight'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 4: Skills Exchange & Review ────────────────────── */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-[26px] font-bold text-gm-midnight">
                Skills Offered & Needed
              </h2>
              <p className="text-xs text-gm-text-secondary mt-1">
                Growing Moon matches complementary peer relationships.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gm-midnight mb-1.5">
                Skills & knowledge you can share with others:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {availableSkills.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkillOffered(skill)}
                    className={`text-[11px] px-2.5 py-1 rounded-full font-semibold transition-all ${
                      skillsOffered.includes(skill)
                        ? 'bg-gm-lavender text-gm-midnight'
                        : 'border border-gm-border bg-gm-ivory text-gm-text-secondary'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gm-midnight mb-1.5">
                Skills you are actively seeking advice on:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {availableSkills.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkillNeeded(skill)}
                    className={`text-[11px] px-2.5 py-1 rounded-full font-semibold transition-all ${
                      skillsNeeded.includes(skill)
                        ? 'bg-gm-indigo text-gm-white'
                        : 'border border-gm-border bg-gm-ivory text-gm-text-secondary'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            {/* Passport Preview Box */}
            <div className="p-4 bg-gm-lavender-soft border border-gm-accent-line rounded-[24px] text-xs">
              <span className="text-[10px] font-bold text-gm-indigo uppercase tracking-wider block mb-1">
                Passport Preview Ready
              </span>
              <p className="font-bold text-gm-midnight text-sm">{name} (@{username})</p>
              <p className="text-[11px] text-gm-text-secondary mt-0.5">
                {location} · {selectedStage}
              </p>
              <p className="text-[11px] text-gm-midnight mt-1.5 font-medium">
                Goal: {currentGoal}
              </p>
            </div>
          </div>
        )}

        {/* ── Bottom Controls ────────────────────────────────────── */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-gm-border">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gm-text-secondary hover:text-gm-midnight px-3 py-2 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <Link
              href="/login"
              className="text-xs text-gm-text-secondary hover:underline"
            >
              Already have an account?
            </Link>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="inline-flex items-center gap-1.5 bg-gm-indigo hover:bg-gm-indigo-hover text-gm-white text-xs font-bold px-6 h-12 rounded-full transition-all shadow-float"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="inline-flex items-center gap-1.5 bg-gm-indigo hover:bg-gm-indigo-hover text-gm-white text-xs font-bold px-7 h-12 rounded-full transition-all shadow-float"
            >
              <span>Launch Passport & Enter Feed</span>
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
