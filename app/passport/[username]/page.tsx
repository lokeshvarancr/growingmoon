'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AppShell from '@/components/shared/AppShell';
import EmptyState from '@/components/EmptyState';
import JourneyPassportView from '@/components/passport/JourneyPassportView';
import { getFounderByUsername } from '@/lib/mock-data/founders';
import { useApp } from '@/lib/state/AppContext';
import { usersApi } from '@/lib/api/client';
import type { FounderProfile } from '@/types';

export default function PublicPassportPage() {
  const params = useParams();
  const { currentUser } = useApp();

  const username = typeof params.username === 'string' ? params.username : '';
  const mockFounder = getFounderByUsername(username);

  const [founder, setFounder] = useState<FounderProfile | null>(
    mockFounder || (username === 'demo' || username === 'you' ? currentUser : null)
  );
  const [loading, setLoading] = useState(!founder);

  useEffect(() => {
    let isMounted = true;
    if (username) {
      usersApi
        .getByUsername(username === 'demo' || username === 'you' ? currentUser.username : username)
        .then((profile) => {
          if (!isMounted) return;
          const mapped: FounderProfile = {
            id: profile.id,
            username: profile.username,
            name: profile.name,
            avatar: profile.avatar_initials || 'GM',
            avatarImage: profile.avatar_image || undefined,
            avatarColor: profile.avatar_color || 'bg-amber-100 text-amber-800',
            bio: profile.bio || '',
            role: profile.role_title || 'Builder',
            stage: 'Building MVP',
            currentGoal: profile.profile_details?.current_focus_1 || 'Building Growing Moon',
            biggestChallenge: profile.profile_details?.figuring_out || 'Scaling authentic community',
            skillsOffered: profile.profile_details?.can_help_with ? [profile.profile_details.can_help_with] : [],
            skillsNeeded: profile.profile_details?.figuring_out ? [profile.profile_details.figuring_out] : [],
            interests: profile.profile_details?.interests || [],
            location: profile.location || 'Bengaluru, India',
            joinedDate: profile.created_at,
            connectionsCount: profile.connections_count,
            isDemo: false,
          };
          setFounder(mapped);
        })
        .catch(() => {})
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [username, currentUser.username]);

  if (loading) {
    return (
      <AppShell>
        <div className="py-20 flex flex-col items-center justify-center">
          <div className="w-6 h-6 border-2 border-[#6258DB] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs text-gray-500 font-medium">Loading Journey Passport...</p>
        </div>
      </AppShell>
    );
  }

  if (!founder) {
    return (
      <AppShell>
        <div className="py-12">
          <EmptyState
            title="Journey Passport Not Found"
            description="The founder journey you are looking for does not exist or may have been renamed."
            actionLabel="Discover Founders"
            actionHref="/discover"
          />
        </div>
      </AppShell>
    );
  }

  const isOwner = founder.id === currentUser.id;

  return <JourneyPassportView founder={founder} isOwner={isOwner} />;
}
