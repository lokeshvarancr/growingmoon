/**
 * ==============================================================================
 * GROWING MOON - SUPABASE CLIENT & REAL-TIME ENGINE
 * ==============================================================================
 * Powers:
 * 1. Supabase Auth (Sign in, Sign up, Session state & JWT management).
 * 2. Supabase Realtime (Instant WhatsApp-style live incoming messages and typing state).
 * ==============================================================================
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { setStoredAuthToken } from './api/client';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pyvaviomgmbohpbfadbv.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5dmF2aW9tZ21ib2hwYmZhZGJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDQ1MDAwMDAsImV4cCI6MjAyMDMwMDAwMH0.placeholder';

// Singleton Supabase Client
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Setup auth state change listener to sync JWT with API client
if (typeof window !== 'undefined') {
  supabase.auth.onAuthStateChange((event, session) => {
    if (session?.access_token) {
      setStoredAuthToken(session.access_token);
    } else if (event === 'SIGNED_OUT') {
      setStoredAuthToken(null);
    }
  });
}

/**
 * Subscribe to real-time chat messages for a specific conversation.
 * Automatically receives new messages and read-status updates.
 */
export function subscribeToConversationMessages(
  conversationId: string,
  onNewMessage: (message: any) => void,
  onMessageUpdate: (message: any) => void
) {
  const channel = supabase
    .channel(`chat:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        onNewMessage(payload.new);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        onMessageUpdate(payload.new);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
