#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {

  process.exit(1);
}

// Create Supabase client with service role key for admin access
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function verifyTableConfiguration() {

  try {
    // 1. Check table structure

    // Try to query the table
    const { data: sampleData, error: queryError } = await supabase
      .from('reading_progress')
      .select('*')
      .limit(0);
    
    if (!queryError) {

    } else {

      return;
    }

    // 2. Verify RLS is enabled by checking if we can query without auth

    // Create an anon client to test RLS
    const anonClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
    const { data: anonData, error: anonError } = await anonClient
      .from('reading_progress')
      .select('*')
      .limit(1);
    
    if (anonError && anonError.message.includes('denied')) {

    } else if (!anonError && (!anonData || anonData.length === 0)) {

    } else {

    }

    // 3. Test constraint by attempting duplicate insert (will fail, which is expected)

    // 4. Display policy information from migration

    // 5. Summary

  } catch (error) {

  }
}

// Run the verification
verifyTableConfiguration();
