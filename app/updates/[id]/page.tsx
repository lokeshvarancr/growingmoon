'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppShell from '@/components/shared/AppShell';
import JourneyPostCard from '@/components/feed/JourneyPostCard';
import EmptyState from '@/components/EmptyState';
import { useApp } from '@/lib/state/AppContext';
import { postsApi } from '@/lib/api/client';
import type { JourneyUpdate } from '@/types';
import { ArrowLeft } from 'lucide-react';

export default function SingleUpdatePage() {
  const params = useParams();
  const router = useRouter();
  const { updates } = useApp();

  const updateId = typeof params.id === 'string' ? params.id : '';
  const cached = updates.find((u) => u.id === updateId);
  const [liveUpdate, setLiveUpdate] = useState<JourneyUpdate | null>(cached || null);
  const [isLoading, setIsLoading] = useState(!cached);

  useEffect(() => {
    if (cached) {
      setLiveUpdate(cached);
      setIsLoading(false);
      return;
    }

    if (!updateId) return;

    postsApi
      .getPost(updateId)
      .then((p) => {
        setLiveUpdate({
          id: p.id,
          authorId: p.author_id,
          author: {
            id: p.author.id,
            username: p.author.username,
            name: p.author.name,
            avatar: p.author.avatar_initials,
            avatarImage: p.author.avatar_image || undefined,
            avatarColor: p.author.avatar_color || 'bg-amber-100 text-amber-800',
            role: p.author.role_title || undefined,
            role_title: p.author.role_title || undefined,
            location: p.author.location || undefined,
          },
          headline: p.headline || undefined,
          journeyTag: p.journey_tag || undefined,
          content: p.content,
          category: p.category,
          startDate: p.start_date || undefined,
          endDate: p.end_date || undefined,
          start_date: p.start_date || undefined,
          end_date: p.end_date || undefined,
          createdAt: p.created_at,
          likes: p.is_fueled_by_me ? [p.author_id] : [],
          saves: p.is_saved_by_me ? [p.author_id] : [],
          comments: [],
          prompt_question_1: p.prompt_question_1 || undefined,
          prompt_question_2: p.prompt_question_2 || undefined,
          fuels_count: p.fuels_count,
          saves_count: p.saves_count,
          comments_count: p.comments_count,
          is_fueled_by_me: p.is_fueled_by_me,
          is_saved_by_me: p.is_saved_by_me,
          media: (p.media || []).map((m) => ({
            id: m.id,
            type: (m.media_type as 'image' | 'video' | 'file') || 'image',
            url: m.url,
            thumbnail: m.thumbnail_url || undefined,
            orientation: m.orientation,
          })),
        });
      })
      .catch((err) => {
        console.warn('Post not found on backend:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [updateId, cached]);

  if (isLoading) {
    return (
      <AppShell>
        <div className="py-12 text-center text-xs text-gm-text-secondary">
          Loading milestone...
        </div>
      </AppShell>
    );
  }

  if (!liveUpdate) {
    return (
      <AppShell>
        <div className="py-12">
          <EmptyState
            title="Update Not Found"
            description="This journey update may have been removed or does not exist."
            actionLabel="Return to Feed"
            actionHref="/home"
          />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gm-text-secondary hover:text-gm-midnight transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Feed</span>
        </button>

        <JourneyPostCard update={liveUpdate} />
      </div>
    </AppShell>
  );
}
