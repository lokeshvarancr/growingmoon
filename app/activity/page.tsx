'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/shared/AppShell';
import { Trash2, MessageSquare, Heart, CheckCircle2, Bookmark, ExternalLink, Clock, AlertCircle } from 'lucide-react';
import { activitiesApi } from '@/lib/api/client';
import type { UserActivity } from '@/lib/api/types';
import { useApp } from '@/lib/state/AppContext';

export default function UserActivityPage() {
  const { addToast } = useApp();
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'comment' | 'fuel' | 'helpful_vote'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
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
  }, []);

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
    <AppShell>
      <div className="max-w-2xl mx-auto py-6 sm:py-8 px-4">
        <div className="mb-6">
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#141724]">
            Activity & Participation Audit
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Browse and manage your past comments, answers, fuels, and contributions across Growing Moon.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-100/80 rounded-2xl text-xs mb-6 overflow-x-auto scrollbar-none">
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
              className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
                activeFilter === tab.id
                  ? 'bg-white text-[#6258DB] shadow-xs font-bold'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* List of activities */}
        <div className="space-y-3.5">
          {loading ? (
            <div className="py-16 text-center">
              <div className="w-6 h-6 border-2 border-[#6258DB] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-gray-500 font-medium">Loading your activity history...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-3xl border border-gray-100 p-8 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 mx-auto flex items-center justify-center mb-3">
                <AlertCircle className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-gray-800">No activities found</p>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                When you share advice, fuel updates, or vote on helpful tips, your participation log will appear here.
              </p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="p-4 sm:p-5 rounded-2xl bg-white border border-black/[0.04] shadow-xs hover:shadow-md transition-all flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {getActivityIcon(item.activity_type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-[13px] font-semibold text-[#141724] leading-snug">
                      {item.summary_text}
                    </p>

                    {item.snippet && (
                      <p className="text-xs text-gray-600 mt-1.5 p-2.5 rounded-xl bg-gray-50 border border-gray-100 italic">
                        &ldquo;{item.snippet}&rdquo;
                      </p>
                    )}

                    <div className="flex items-center gap-4 mt-2.5 text-xs text-gray-400 font-medium">
                      <span>{formatActivityDate(item.created_at)}</span>
                      {item.target_post_id && (
                        <Link
                          href={`/updates/${item.target_post_id}`}
                          className="text-[#6258DB] hover:underline flex items-center gap-1 font-semibold"
                        >
                          <span>View Discussion</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  disabled={deletingId === item.id}
                  className="p-2 text-gray-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors flex-shrink-0"
                  title="Delete activity record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
