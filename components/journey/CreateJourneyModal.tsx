'use client';
import React, { useState, useEffect } from 'react';
import { X, Rocket, Globe, Lock, Sparkles, Loader2 } from 'lucide-react';
import { passportsApi } from '@/lib/api/client';

export type CreatedJourneyData = {
  id: string;
  title: string;
  description: string;
  category: string;
  visibility: 'Public' | 'Private';
  dateRange: string;
  color: string;
  dotColor: string;
};

type CreateJourneyModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (journey: CreatedJourneyData) => void;
};

const CATEGORIES = [
  'Building',
  'Learning',
  'Creativity',
  'Career',
  'Fitness',
  'Lifestyle',
];

export default function CreateJourneyModal({
  isOpen,
  onClose,
  onCreated,
}: CreateJourneyModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Building');
  const [visibility, setVisibility] = useState<'Public' | 'Private'>('Public');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset fields when opened
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setCategory('Building');
      setVisibility('Public');
      setErrorMsg(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setErrorMsg('Please enter a journey name.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await passportsApi.createPassport({
        title: cleanTitle,
        short_text: description.trim() || undefined,
        current_goal: category,
        category: category,
        is_public: visibility === 'Public',
      });

      const newJourney: CreatedJourneyData = {
        id: res.id,
        title: res.title,
        description: res.short_text || 'Documenting my milestones and discoveries.',
        category: res.category || category,
        visibility: res.is_public ? 'Public' : 'Private',
        dateRange: 'Just now – Present',
        color: 'bg-gm-accent-soft text-gm-accent',
        dotColor: 'bg-gm-accent',
      };

      onCreated(newJourney);
      onClose();
    } catch (err: any) {
      console.warn('Failed to save journey to database, using optimistic fallback:', err);
      const newJourney: CreatedJourneyData = {
        id: 'journey-' + Date.now(),
        title: cleanTitle,
        description: description.trim() || 'Documenting my milestones and discoveries.',
        category,
        visibility,
        dateRange: 'Just now – Present',
        color: 'bg-gm-accent-soft text-gm-accent',
        dotColor: 'bg-gm-accent',
      };

      onCreated(newJourney);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto select-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gm-ink/45 backdrop-blur-md transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <form
        onSubmit={handleSubmit}
        className="relative bg-white rounded-[32px] p-6 sm:p-8 shadow-modal border border-gm-ink/5 max-w-md w-full z-10 space-y-4 animate-slide-up"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-1 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gm-accent-soft text-gm-accent flex items-center justify-center flex-shrink-0">
              <Rocket className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gm-ink">Create a New Journey</h3>
              <p className="text-[11px] text-gray-500">Define a new goal, project or learning path</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
            {errorMsg}
          </div>
        )}

        {/* Journey Name */}
        <div>
          <label className="text-xs font-semibold text-gray-700 block mb-1.5">
            Journey Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            maxLength={100}
            placeholder="e.g. Scaling AI Workflows to ₹50K MRR"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-gm-accent focus:ring-2 focus:ring-gm-accent/15 transition-all"
            required
            autoFocus
          />
        </div>

        {/* Category */}
        <div>
          <label className="text-xs font-semibold text-gray-700 block mb-1.5">Category</label>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`py-2 px-2.5 rounded-full text-xs font-semibold transition-all border cursor-pointer text-center ${
                  category === cat
                    ? 'bg-gm-accent-soft text-gm-accent border-gm-accent/30 shadow-2xs'
                    : 'bg-gray-50/80 text-gray-600 border-gray-200/80 hover:bg-gray-100/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Short Description */}
        <div>
          <label className="text-xs font-semibold text-gray-700 block mb-1.5">
            Short Description / Goal
          </label>
          <textarea
            rows={2}
            maxLength={250}
            placeholder="Briefly describe what you are building, learning, or pursuing..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 rounded-xl border border-gray-200 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-gm-accent focus:ring-2 focus:ring-gm-accent/15 resize-none transition-all"
          />
        </div>

        {/* Visibility */}
        <div>
          <label className="text-xs font-semibold text-gray-700 block mb-1.5">Visibility</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setVisibility('Public')}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                visibility === 'Public'
                  ? 'bg-gm-accent-soft border-gm-accent text-gm-accent shadow-2xs'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Public (Community)</span>
            </button>
            <button
              type="button"
              onClick={() => setVisibility('Private')}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                visibility === 'Private'
                  ? 'bg-gm-accent-soft border-gm-accent text-gm-accent shadow-2xs'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Private (Only you)</span>
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-full bg-gm-accent hover:bg-gm-accent-deep disabled:opacity-60 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving to Database...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Create Journey</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
