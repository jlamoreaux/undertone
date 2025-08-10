"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useRef, useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { SyncService } from "../services/syncService";
import { notifications } from "@mantine/notifications";

interface AuthError {
  message: string;
  status?: number;
  code?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  syncing: boolean;
  signIn: (email: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  performSync: () => Promise<void>;
}

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

  // Sync function using useCallback to maintain stable reference
  const performSync = useCallback(async () => {
    const currentUser = userRef.current;
    const currentSyncing = syncingRef.current;

    if (currentSyncing || !currentUser) {

      return;
    }

    setSyncing(true);
    syncingRef.current = true;

    try {
      await syncService.performTwoWaySync();
      notifications.show({
        title: "Sync Complete",
        message: "Your reading progress has been synced",
        color: "green",
      });
    } catch (error) {

      notifications.show({
        title: "Sync Failed",
        message: "Could not sync your reading progress. Will retry later.",
        color: "red",
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

        setUser(session?.user ?? null);
        setLoading(false);

        // Sync when user signs in
        if (event === "SIGNED_IN" && session?.user) {

          setTimeout(() => performSync(), 1000); // Small delay to ensure user state is set
        }
      }
    );

    // Get the current session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      setUser(session?.user ?? null);
      setLoading(false);

      // Sync if user is already logged in
      if (session?.user) {

        setTimeout(() => performSync(), 1000);
      }
    };

    getSession();

    return () => {
      subscription?.unsubscribe();
    };
  }, [performSync]);

  // Sign in with magic link
  const signIn = async (email: string): Promise<{ error: AuthError | null }> => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error: error as AuthError | null };
  };

  // Sign out
  const signOut = async () => {
    // Sync before signing out
    if (user) {
      await performSync();
    }
    await supabase.auth.signOut();
    router.push("/login");
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

  // Debug: Verify performSync is in context

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
