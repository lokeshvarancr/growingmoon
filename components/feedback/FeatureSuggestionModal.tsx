'use client';
import React, { useState, useEffect } from 'react';
import { feedbackApi } from '@/lib/api/client';
import type { FeatureSuggestionResponse, FeatureSuggestionCategory } from '@/lib/api/types';
import { useApp } from '@/lib/state/AppContext';
import {
  Lightbulb,
  X,
  ThumbsUp,
  Plus,
  Sparkles,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Filter,
} from 'lucide-react';

const CATEGORIES: FeatureSuggestionCategory[] = ['General', 'Feed', 'Profile', 'Chat', 'UI/UX', 'Mobile'];

type FeatureSuggestionModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function FeatureSuggestionModal({ isOpen, onClose }: FeatureSuggestionModalProps) {
  const { addToast, isAuthenticated } = useApp();
  const [activeTab, setActiveTab] = useState<'browse' | 'submit'>('browse');

  // Browse state
  const [suggestions, setSuggestions] = useState<FeatureSuggestionResponse[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'popular' | 'newest'>('popular');
  const [isLoadingList, setIsLoadingList] = useState(false);

  // Submit form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<FeatureSuggestionCategory>('General');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch suggestions
  const fetchSuggestions = async () => {
    setIsLoadingList(true);
    try {
      const data = await feedbackApi.getFeatures(
        selectedCategory === 'All' ? undefined : selectedCategory,
        sortBy,
        30,
        0
      );
      if (Array.isArray(data)) {
        setSuggestions(data);
      }
    } catch (err) {
      console.warn('Failed to load feature suggestions:', err);
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSuggestions();
    }
  }, [isOpen, selectedCategory, sortBy]);

  // Handle upvoting
  const handleVote = async (suggestionId: string) => {
    if (!isAuthenticated) {
      addToast('Please sign in to upvote feature ideas', 'warning');
      return;
    }

    try {
      const res = await feedbackApi.voteFeature(suggestionId);
      setSuggestions((prev) =>
        prev.map((s) =>
          s.id === suggestionId
            ? { ...s, has_voted: res.has_voted, upvotes_count: res.upvotes_count }
            : s
        )
      );
      addToast(res.has_voted ? 'Upvoted idea!' : 'Upvote removed', 'info');
    } catch (err: any) {
      addToast(err?.message || 'Failed to update vote', 'danger');
    }
  };

  // Handle submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const cleanTitle = title.trim();
    const cleanDesc = description.trim();

    if (cleanTitle.length < 5) {
      setSubmitError('Title must be at least 5 characters long.');
      return;
    }

    if (cleanDesc.length < 15) {
      setSubmitError('Please provide at least 15 characters describing your idea.');
      return;
    }

    setIsSubmitting(true);

    try {
      const created = await feedbackApi.submitFeature({
        title: cleanTitle,
        description: cleanDesc,
        category,
      });

      addToast('Feature suggestion submitted! Thank you.', 'success');
      setTitle('');
      setDescription('');
      setCategory('General');
      setActiveTab('browse');
      setSuggestions((prev) => [created, ...prev]);
    } catch (err: any) {
      setSubmitError(err?.message || 'Failed to submit feature suggestion. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gm-ink/45 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-[32px] max-w-lg w-full p-6 sm:p-7 shadow-modal border border-gm-ink/5 animate-slide-up relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shadow-2xs">
              <Lightbulb className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-gm-ink tracking-tight">
                Product Suggestions
              </h2>
              <p className="text-xs text-gray-500">Shape the future of Growing Moon</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-black flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 my-4 p-1 bg-gray-100/80 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveTab('browse')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'browse'
                ? 'bg-white text-gm-ink shadow-xs'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            Community Ideas ({suggestions.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('submit')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'submit'
                ? 'bg-gm-ink text-white shadow-xs'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Suggest a Feature</span>
          </button>
        </div>

        {/* Tab 1: Browse Suggestions */}
        {activeTab === 'browse' && (
          <div className="flex-1 overflow-y-auto pr-1 space-y-4">
            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedCategory('All')}
                className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === 'All'
                    ? 'bg-gm-accent text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-gm-accent text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* List */}
            {isLoadingList ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-8 h-8 rounded-full border-2 border-gm-accent border-t-transparent animate-spin mb-2" />
                <p className="text-xs text-gray-500">Loading community suggestions...</p>
              </div>
            ) : suggestions.length === 0 ? (
              <div className="py-12 text-center">
                <Sparkles className="w-8 h-8 text-amber-500 mx-auto mb-2 opacity-60" />
                <h4 className="text-xs font-bold text-gray-700">No suggestions yet in this category</h4>
                <p className="text-xs text-gray-400 mt-1">Be the first to propose an idea!</p>
                <button
                  type="button"
                  onClick={() => setActiveTab('submit')}
                  className="mt-3 px-4 py-2 bg-gm-accent text-white text-xs font-bold rounded-full cursor-pointer"
                >
                  Suggest New Feature
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {suggestions.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-gray-50/70 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all flex items-start gap-3.5"
                  >
                    {/* Upvote Button */}
                    <button
                      type="button"
                      onClick={() => handleVote(item.id)}
                      className={`flex flex-col items-center justify-center min-w-[44px] py-2 px-1.5 rounded-full border transition-all cursor-pointer ${
                        item.has_voted
                          ? 'bg-gm-accent-soft border-gm-accent text-gm-accent shadow-2xs'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                      title={item.has_voted ? 'Withdraw upvote' : 'Upvote this idea'}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${item.has_voted ? 'fill-current' : ''}`} />
                      <span className="text-[11px] font-extrabold mt-1">{item.upvotes_count || 0}</span>
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-gray-200/80 text-gray-700">
                          {item.category}
                        </span>
                        {item.status && item.status !== 'submitted' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize">
                            {item.status.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-gm-ink leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed whitespace-pre-wrap">
                        {item.description}
                      </p>
                      {item.admin_notes && (
                        <div className="mt-2 p-2 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-800">
                          <span className="font-bold">Team update: </span>
                          {item.admin_notes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Submit Suggestion Form */}
        {activeTab === 'submit' && (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1">
            {submitError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gm-ink mb-1.5">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      category === cat
                        ? 'bg-gm-accent text-white shadow-2xs'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gm-ink mb-1.5">
                Feature Headline
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Export milestone certificates as PDF"
                required
                maxLength={150}
                className="w-full px-3.5 py-2.5 bg-gray-50 focus:bg-white border border-gray-200 rounded-2xl text-xs text-gray-900 focus:outline-none focus:border-gm-accent transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gm-ink mb-1.5">
                Description & Why It Helps
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the problem this solves and how you envision it working in Growing Moon..."
                required
                rows={4}
                maxLength={2000}
                className="w-full px-3.5 py-2.5 bg-gray-50 focus:bg-white border border-gray-200 rounded-2xl text-xs text-gray-900 focus:outline-none focus:border-gm-accent transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gm-ink hover:bg-black text-white font-bold text-xs rounded-2xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? 'Submitting Idea...' : 'Submit Suggestion'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
