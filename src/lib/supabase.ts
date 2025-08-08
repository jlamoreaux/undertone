import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// These will be set via environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Helper function to get the current user's session
export const getCurrentUser = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session?.user ?? null;
};

// Helper function to get the current user's ID
export const getCurrentUserId = async (): Promise<string | null> => {
  const user = await getCurrentUser();
  return user?.id ?? null;
};
