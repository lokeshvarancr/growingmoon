'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppShell from '@/components/shared/AppShell';
import EmptyState from '@/components/EmptyState';
import AestheticLoader from '@/components/shared/AestheticLoader';
import { useApp } from '@/lib/state/AppContext';
import { notificationsApi } from '@/lib/api/client';
import { getFounderById } from '@/lib/mock-data/founders';
import { formatRelativeTime } from '@/lib/utils';
import type { Notification } from '@/types';
import {
  Bell,
  CheckCircle2,
  UserPlus,
  MessageCircle,
  Heart,
  Check,
  Flame,
} from 'lucide-react';

export default function NotificationsPage() {
  const { notifications: contextNotifications, markNotificationRead, markAllNotificationsRead } = useApp();
  const [liveNotifications, setLiveNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    notificationsApi
      .getNotifications(50)
      .then((data) => {
        if (!isMounted) return;
        const rawList = data?.items || data?.notifications;
        if (Array.isArray(rawList)) {
          const mapped: Notification[] = rawList.map((n: any) => ({
            id: n.id,
            actorId: n.actor_id || 'u-system',
            type: (n.type as any) || 'like',
            message: n.message,
            read: n.is_read,
            createdAt: n.created_at,
            link: n.link || '/home',
          }));
          setLiveNotifications(mapped);
        } else {
          setLiveNotifications(contextNotifications);
        }
      })
      .catch((err) => {
        console.warn('Notifications fetch note:', err);
        if (isMounted) setLiveNotifications(contextNotifications);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [contextNotifications]);

  const activeList = liveNotifications.length > 0 ? liveNotifications : contextNotifications;

  const filtered = activeList.filter((n) => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'connection_request':
      case 'connection_accepted':
      case 'user_follow':
        return <UserPlus className="w-4 h-4 text-[#6258DB]" />;
      case 'like':
      case 'post_fuel':
      case 'fuel':
        return <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />;
      case 'comment':
      case 'discussion_reply':
      case 'discussion_helpful':
      case 'advice_applied':
        return <MessageCircle className="w-4 h-4 text-[#6258DB]" />;
      default:
        return <Bell className="w-4 h-4 text-gray-400" />;
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
            type="button"
            onClick={markAllNotificationsRead}
            className="text-xs font-bold text-gm-indigo hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Mark all as read</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 pb-2 border-b border-gm-border">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-gm-midnight text-gm-white'
                : 'bg-gm-white border border-gm-border text-gm-text-secondary hover:text-gm-midnight'
            }`}
          >
            All Notifications
          </button>
          <button
            type="button"
            onClick={() => setFilter('unread')}
            className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all cursor-pointer ${
              filter === 'unread'
                ? 'bg-gm-midnight text-gm-white'
                : 'bg-gm-white border border-gm-border text-gm-text-secondary hover:text-gm-midnight'
            }`}
          >
            Unread Only
          </button>
        </div>

        {/* ── Continuous Aesthetic Loop Loading State ── */}
        {isLoading ? (
          <div className="bg-white rounded-3xl p-10 border border-black/[0.04] shadow-xs">
            <AestheticLoader
              title="Loading your notifications..."
              subtitle="Fetching real-time updates from followers, comments, and milestones."
            />
          </div>
        ) : filtered.length > 0 ? (
          <div className="bg-gm-white border border-gm-border rounded-2xl shadow-card divide-y divide-gm-border/70 overflow-hidden">
            {filtered.map((n) => (
              <div
                key={n.id}
                onClick={() => markNotificationRead(n.id)}
                className={`p-4 flex items-start gap-3.5 transition-colors cursor-pointer ${
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
                  href={n.link || '/home'}
                  className="text-xs font-bold text-gm-indigo hover:underline flex-shrink-0 self-center"
                >
                  View →
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Bell className="w-10 h-10 opacity-30 text-gm-indigo" />}
            title="You're all caught up"
            description="No notifications at the moment. Keep building and documenting your journey!"
          />
        )}
      </div>
    </AppShell>
  );
}
