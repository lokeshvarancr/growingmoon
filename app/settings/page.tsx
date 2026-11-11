'use client';
import React, { useState } from 'react';
import AppShell from '@/components/shared/AppShell';
import { useApp } from '@/lib/state/AppContext';
import type { EntrepreneurialStage } from '@/types';
import {
  Settings,
  User,
  Shield,
  Bell,
  RotateCcw,
  CheckCircle2,
  Save,
} from 'lucide-react';

const stages: EntrepreneurialStage[] = [
  'Exploring',
  'Idea Stage',
  'Building MVP',
  'Launched',
  'First Customers',
  'Growing',
  'Scaling',
];

export default function SettingsPage() {
  const { currentUser, updateUser, resetDemoUser, addToast } = useApp();

  const [name, setName] = useState(currentUser.name);
  const [bio, setBio] = useState(currentUser.bio);
  const [location, setLocation] = useState(currentUser.location);
  const [stage, setStage] = useState<EntrepreneurialStage>(currentUser.stage);
  const [currentGoal, setCurrentGoal] = useState(currentUser.currentGoal);
  const [biggestChallenge, setBiggestChallenge] = useState(currentUser.biggestChallenge);

  // Preferences
  const [publicPassport, setPublicPassport] = useState(true);
  const [connectionAlerts, setConnectionAlerts] = useState(true);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      name,
      bio,
      location,
      stage,
      currentGoal,
      biggestChallenge,
      avatar: name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase(),
    });
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-[40px] sm:text-[56px] leading-[1.02] font-extrabold text-gm-midnight tracking-tight">
            Settings & Preferences
          </h1>
          <p className="text-xs text-gm-text-secondary mt-0.5">
            Manage your profile, passport privacy, and demo session.
          </p>
        </div>

        {/* ── Edit Profile Section ───────────────────────────────── */}
        <section className="bg-gm-white border border-gm-border rounded-3xl p-6 sm:p-8 shadow-card">
          <div className="flex items-center gap-2 mb-6 pb-3 border-b border-gm-border">
            <User className="w-4 h-4 text-gm-indigo" />
            <h2 className="text-xl font-bold text-gm-midnight">
              Profile Details
            </h2>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gm-midnight mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gm-ivory border border-transparent hover:border-gm-border focus:border-gm-accent rounded-2xl transition-colors text-gm-midnight focus-ring"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gm-midnight mb-1">City / Base</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gm-ivory border border-transparent hover:border-gm-border focus:border-gm-accent rounded-2xl transition-colors text-gm-midnight focus-ring"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gm-midnight mb-1">
                Current Entrepreneurial Stage
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as EntrepreneurialStage)}
                className="w-full px-3.5 py-2.5 bg-gm-ivory border border-transparent hover:border-gm-border focus:border-gm-accent rounded-2xl transition-colors text-gm-midnight focus-ring cursor-pointer"
              >
                {stages.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-gm-midnight mb-1">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full px-3.5 py-2.5 bg-gm-ivory border border-transparent hover:border-gm-border focus:border-gm-accent rounded-2xl transition-colors text-gm-midnight focus-ring resize-none leading-relaxed"
              />
            </div>

            <div>
              <label className="block font-bold text-gm-midnight mb-1">30-Day Active Goal</label>
              <input
                type="text"
                value={currentGoal}
                onChange={(e) => setCurrentGoal(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gm-ivory border border-transparent hover:border-gm-border focus:border-gm-accent rounded-2xl transition-colors text-gm-midnight focus-ring"
              />
            </div>

            <div>
              <label className="block font-bold text-gm-midnight mb-1">Current Biggest Blocker</label>
              <input
                type="text"
                value={biggestChallenge}
                onChange={(e) => setBiggestChallenge(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gm-ivory border border-transparent hover:border-gm-border focus:border-gm-accent rounded-2xl transition-colors text-gm-midnight focus-ring"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-1.5 bg-gm-indigo hover:bg-gm-indigo-hover text-white text-xs font-bold px-5 py-2.5 rounded-full transition-all shadow-card"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </section>

        {/* ── Privacy & Visibility ───────────────────────────────── */}
        <section className="bg-gm-white border border-gm-border rounded-3xl p-6 sm:p-8 shadow-card text-xs">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gm-border">
            <Shield className="w-4 h-4 text-gm-indigo" />
            <h2 className="text-xl font-bold text-gm-midnight">
              Passport Privacy
            </h2>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="font-bold text-gm-midnight block">Public Journey Passport</span>
                <span className="text-[11px] text-gm-text-secondary">
                  Allow anyone on Growing Moon to scan your Passport QR code.
                </span>
              </div>
              <input
                type="checkbox"
                checked={publicPassport}
                onChange={(e) => setPublicPassport(e.target.checked)}
                className="w-4 h-4 accent-gm-indigo rounded cursor-pointer"
              />
            </label>
          </div>
        </section>

        {/* ── Demo Session Reset ─────────────────────────────────── */}
        <section className="bg-gm-white border border-gm-border rounded-3xl p-6 sm:p-8 shadow-card text-xs">
          <h2 className="text-xl font-bold text-gm-midnight mb-2">
            Demo Sandbox Controls
          </h2>
          <p className="text-gm-text-secondary leading-relaxed mb-4">
            Growing Moon is running in simulated frontend mode. Resetting restores all original seed journeys, updates, and connection states.
          </p>

          <button
            onClick={resetDemoUser}
            className="flex items-center gap-1.5 px-4 py-2 bg-gm-ivory hover:bg-rose-50 text-gm-danger border border-gm-border rounded-xl font-bold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data to Initial State</span>
          </button>
        </section>
      </div>
    </AppShell>
  );
}
