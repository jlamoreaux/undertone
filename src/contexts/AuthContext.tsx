'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useRef, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { SyncService } from '../services/syncService';
import { notifications } from '@mantine/notifications';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  syncing: boolean;
  signIn: (email: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  performSync: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const router = useRouter();
  const syncService = new SyncService();
  const userRef = useRef<User | null>(null);
  const syncingRef = useRef(false);
  
  // Keep refs in sync with state
  userRef.current = user;
  syncingRef.current = syncing;
  
  // Debug: Verify AuthProvider is mounted
  console.log('AuthProvider mounted');

  // Sync function using useCallback to maintain stable reference
  const performSync = useCallback(async () => {
    const currentUser = userRef.current;
    const currentSyncing = syncingRef.current;
    
    console.log('performSync called, current state:', { 
      user: currentUser ? currentUser.email : 'null', 
      syncing: currentSyncing 
    });
    
    if (currentSyncing || !currentUser) {
      console.log('performSync early return:', { 
        syncing: currentSyncing, 
        userNull: !currentUser 
      });
      return;
    }
    
    console.log('Starting sync for user:', currentUser.email);
    setSyncing(true);
    syncingRef.current = true;
    
    try {
      await syncService.performTwoWaySync();
      notifications.show({
        title: 'Sync Complete',
        message: 'Your reading progress has been synced',
        color: 'green',
      });
    } catch (error) {
      console.error('Sync error:', error);
      notifications.show({
        title: 'Sync Failed',
        message: 'Could not sync your reading progress. Will retry later.',
        color: 'red',
      });
    } finally {
      setSyncing(false);
      syncingRef.current = false;
    }
  }, [syncService]);

  useEffect(() => {
    // Check active sessions and set the user
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, 'user:', session?.user);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Sync when user signs in
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in:', session.user);
          setTimeout(() => performSync(), 1000); // Small delay to ensure user state is set
        }
      }
    );

    // Get the current session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Initial session check, user:', session?.user);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Sync if user is already logged in
      if (session?.user) {
        console.log('User already logged in:', session.user);
        setTimeout(() => performSync(), 1000);
      }
    };

    getSession();

    return () => {
      subscription?.unsubscribe();
    };
  }, [performSync]);

  // Sign in with magic link
  const signIn = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error };
  };

  // Sign out
  const signOut = async () => {
    // Sync before signing out
    if (user) {
      await performSync();
    }
    await supabase.auth.signOut();
    router.push('/login');
  };

  const value = {
    user,
    loading,
    syncing,
    signIn,
    signOut,
    performSync,
  };

  // Debug: Log user state on each render
  console.log('AuthProvider render, user:', user, 'loading:', loading);
  
  // Debug: Verify performSync is in context
  console.log('performSync in context', !!value.performSync);
  
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
