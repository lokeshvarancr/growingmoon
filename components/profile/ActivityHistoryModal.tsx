'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { X, Trash2, MessageSquare, Heart, CheckCircle2, Bookmark, ExternalLink, Clock, AlertCircle } from 'lucide-react';
import { activitiesApi } from '@/lib/api/client';
import type { UserActivity } from '@/lib/api/types';
import { useApp } from '@/lib/state/AppContext';

type ActivityHistoryModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function ActivityHistoryModal({ isOpen, onClose }: ActivityHistoryModalProps) {
  const { addToast } = useApp();
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'comment' | 'fuel' | 'helpful_vote'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    activitiesApi
      .getMyActivities(undefined, 50)
      .then((res) => {
        if (res && Array.isArray(res.items)) {
          setActivities(res.items);
        }
      })
      .catch((err) => {
        console.warn('Failed to fetch user activities:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDelete = async (activityId: string) => {
    setDeletingId(activityId);
    try {
      await activitiesApi.deleteActivity(activityId);
      setActivities((prev) => prev.filter((a) => a.id !== activityId));
      addToast('Activity removed successfully', 'success');
    } catch (e: any) {
      addToast(e?.message || 'Failed to remove activity', 'danger');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = activities.filter((a) => {
    if (activeFilter === 'all') return true;
    return a.activity_type === activeFilter;
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'comment':
      case 'ask_answer':
        return <MessageSquare className="w-4 h-4 text-[#6258DB]" />;
      case 'fuel':
        return <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />;
      case 'helpful_vote':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'save':
        return <Bookmark className="w-4 h-4 text-amber-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatActivityDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-3xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-gray-100 z-10 animate-in zoom-in-95 duration-150 overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#141724]">
              Activity & Participation Audit
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Review your contributions, comments, and engagement across the platform.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-black rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 px-5 sm:px-6 py-2.5 bg-gray-50/60 border-b border-gray-100 text-xs overflow-x-auto scrollbar-none flex-shrink-0">
          {[
            { id: 'all', label: 'All Activities' },
            { id: 'comment', label: 'Comments & Asks' },
            { id: 'fuel', label: 'Fuels' },
            { id: 'helpful_vote', label: 'Helpful Votes' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-3 py-1 rounded-full font-semibold transition-all whitespace-nowrap ${
                activeFilter === tab.id
                  ? 'bg-white text-[#6258DB] shadow-2xs font-bold border border-gray-200/80'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-3.5">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-6 h-6 border-2 border-[#6258DB] border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-xs text-gray-500 font-medium">Loading your activity history...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 mx-auto flex items-center justify-center mb-3">
                <AlertCircle className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-gray-700">No activities found</p>
              <p className="text-[11px] text-gray-400 mt-1">
                Your comments, fuels, and votes will appear here for review and management.
              </p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="p-3.5 sm:p-4 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 hover:shadow-xs transition-all flex items-start justify-between gap-3 group"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {getActivityIcon(item.activity_type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-[#141724] leading-snug">
                      {item.summary_text}
                    </p>

                    {item.snippet && (
                      <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 bg-gray-50/80 p-2 rounded-lg border border-gray-100/80 italic">
                        &ldquo;{item.snippet}&rdquo;
                      </p>
                    )}

                    <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400 font-medium">
                      <span>{formatActivityDate(item.created_at)}</span>
                      {item.target_post_id && (
                        <Link
                          href={`/updates/${item.target_post_id}`}
                          onClick={onClose}
                          className="text-[#6258DB] hover:underline flex items-center gap-0.5 font-semibold"
                        >
                          <span>View Post</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {/* Delete comment / activity action */}
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  disabled={deletingId === item.id}
                  className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors flex-shrink-0"
                  title="Delete activity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-xs text-gray-500">
          <span>{filtered.length} activities logged</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
