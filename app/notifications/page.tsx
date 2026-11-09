'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/shared/AppShell';
import EmptyState from '@/components/EmptyState';
import { useApp } from '@/lib/state/AppContext';
import { getFounderById } from '@/lib/mock-data/founders';
import { formatRelativeTime } from '@/lib/utils';
import {
  Bell,
  CheckCircle2,
  UserPlus,
  MessageCircle,
  Heart,
  Check,
} from 'lucide-react';

export default function NotificationsPage() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useApp();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'connection_request':
      case 'connection_accepted':
        return <UserPlus className="w-4 h-4 text-gm-indigo" />;
      case 'like':
        return <Heart className="w-4 h-4 text-gm-danger fill-current" />;
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-gm-indigo" />;
      default:
        return <Bell className="w-4 h-4 text-gm-text-secondary" />;
    }
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gm-midnight tracking-tight">
              Notifications
            </h1>
            <p className="text-xs text-gm-text-secondary mt-0.5">
              Updates from people you follow and your posts.
            </p>
          </div>

          <button
            onClick={markAllNotificationsRead}
            className="text-xs font-bold text-gm-indigo hover:underline flex items-center gap-1"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Mark all as read</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 pb-2 border-b border-gm-border">
          <button
            onClick={() => setFilter('all')}
            className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all ${
              filter === 'all'
                ? 'bg-gm-midnight text-gm-white'
                : 'bg-gm-white border border-gm-border text-gm-text-secondary hover:text-gm-midnight'
            }`}
          >
            All Notifications
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all ${
              filter === 'unread'
                ? 'bg-gm-midnight text-gm-white'
                : 'bg-gm-white border border-gm-border text-gm-text-secondary hover:text-gm-midnight'
            }`}
          >
            Unread Only
          </button>
        </div>

        {/* Notification Items */}
        {filtered.length > 0 ? (
          <div className="bg-gm-white border border-gm-border rounded-2xl shadow-card divide-y divide-gm-border/70 overflow-hidden">
            {filtered.map((n) => {
              const actor = getFounderById(n.actorId);

              return (
                <div
                  key={n.id}
                  onClick={() => markNotificationRead(n.id)}
                  className={`p-4 flex items-start gap-3.5 transition-colors ${
                    !n.read ? 'bg-gm-lavender-soft/40' : 'hover:bg-gm-ivory/50'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-gm-ivory border border-gm-border/80 flex-shrink-0 mt-0.5">
                    {getIcon(n.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gm-midnight leading-relaxed font-medium">
                      {n.message}
                    </p>
                    <span className="text-[10px] text-gm-text-secondary mt-1 block">
                      {formatRelativeTime(n.createdAt)}
                    </span>
                  </div>

                  <Link
                    href={n.link || (n.targetId ? `/feed#${n.targetId}` : '/feed')}
                    className="text-xs font-bold text-gm-indigo hover:underline flex-shrink-0 self-center"
                  >
                    View →
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={<Bell className="w-10 h-10 opacity-30 text-gm-indigo" />}
            title="You're all caught up"
            description="No unread notifications at the moment. Keep building and documenting your journey!"
          />
        )}
      </div>
    </AppShell>
  );
}
