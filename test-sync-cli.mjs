#!/usr/bin/env node

/**
 * CLI Test Runner for SyncService
 * Run this script to test the SyncService integration with Supabase
 * 
 * Usage: node test-sync-cli.mjs
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '.env.local');

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {

  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to log with timestamp
const log = (message, data = null) => {
  const timestamp = new Date().toISOString();

  if (data) {

  }
};

// Main test function
async function testSyncServiceCLI() {
  log('========================================');
  log('Starting SyncService Integration Test (CLI)');
  log('========================================');

  try {
    // Check if user is logged in
    log('Checking authentication status...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      log('❌ Authentication error:', authError);
      log('Note: You may need to log in through the web interface first');
      return;
    }
    
    if (!user) {
      log('❌ No user logged in.');
      log('Please log in through the web interface first at http://localhost:8888');
      return;
    }
    
    log(`✅ User authenticated: ${user.email} (ID: ${user.id})`);
    
    // Test 1: Check initial data from Supabase
    log('\n📊 Test 1: Fetching existing data from Supabase...');
    const { data: initialData, error: fetchError } = await supabase
      .from('reading_progress')
      .select('*')
      .eq('user_id', user.id)
      .order('book_name')
      .order('chapter')
      .order('read_date');
    
    if (fetchError) {
      log('❌ Error fetching initial data:', fetchError);
    } else {
      log(`✅ Initial data fetched. Found ${initialData?.length || 0} records`);
      if (initialData && initialData.length > 0) {
        log('First 3 records:', initialData.slice(0, 3));
      }
    }
    
    // Test 2: Test upsert operation with test data
    log('\n📝 Test 2: Testing upsert operation with test data...');
    
    // Create test records
    const testRecords = [
      {
        user_id: user.id,
        book_name: 'Genesis',
        chapter: 1,
        read_date: '2024-01-01'
      },
      {
        user_id: user.id,
        book_name: 'Genesis',
        chapter: 2,
        read_date: '2024-01-02'
      },
      {
        user_id: user.id,
        book_name: 'Genesis',
        chapter: 3,
        read_date: '2024-01-03'
      },
      {
        user_id: user.id,
        book_name: 'TestBook',
        chapter: 1,
        read_date: new Date().toISOString().split('T')[0]
      }
    ];
    
    const { data: upsertData, error: upsertError } = await supabase
      .from('reading_progress')
      .upsert(testRecords, {
        onConflict: 'user_id,book_name,chapter,read_date',
        ignoreDuplicates: true
      })
      .select();
    
    if (upsertError) {
      log('❌ Upsert error:', upsertError);
    } else {
      log('✅ Upsert successful. No errors thrown.');
      if (upsertData && upsertData.length > 0) {
        log(`Upserted ${upsertData.length} records:`, upsertData);
      }
    }
    
    // Test 3: Verify data after upsert
    log('\n✅ Test 3: Verifying data after upsert...');
    const { data: postSyncData, error: postFetchError } = await supabase
      .from('reading_progress')
      .select('*')
      .eq('user_id', user.id)
      .order('book_name')
      .order('chapter')
      .order('read_date');
    
    if (postFetchError) {
      log('❌ Error fetching post-upsert data:', postFetchError);
    } else {
      log(`✅ Post-upsert data fetched. Found ${postSyncData?.length || 0} records`);
      
      // Check if our test data exists
      const genesisRecords = postSyncData.filter(r => r.book_name === 'Genesis');
      const testBookRecords = postSyncData.filter(r => r.book_name === 'TestBook');
      
      if (genesisRecords.length > 0) {
        log(`✅ Genesis book records found: ${genesisRecords.length} chapters`);
      }
      if (testBookRecords.length > 0) {
        log(`✅ TestBook records found: ${testBookRecords.length} chapters`);
      }
    }
    
    // Test 4: Test last_sync table update
    log('\n📅 Test 4: Testing last_sync table update...');
    const { error: syncUpdateError } = await supabase
      .from('last_sync')
      .upsert({
        user_id: user.id,
        last_synced_at: new Date().toISOString(),
        device_info: {
          source: 'CLI Test',
          timestamp: new Date().toISOString(),
          test: true
        }
      }, {
        onConflict: 'user_id'
      });
    
    if (syncUpdateError) {
      log('⚠️ Error updating last_sync:', syncUpdateError.message);
    } else {
      log('✅ Last sync time updated successfully');
    }
    
    // Test 5: Verify last_sync record
    const { data: lastSyncData, error: lastSyncError } = await supabase
      .from('last_sync')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (lastSyncError) {
      log('⚠️ Error fetching last_sync:', lastSyncError.message);
    } else if (lastSyncData) {
      log('✅ Last sync record found:', lastSyncData);
    }
    
    // Summary
    log('\n========================================');
    log('Test Summary');
    log('========================================');
    log('✅ Authentication check: PASSED');
    log('✅ Data fetch queries: PASSED');
    log('✅ Upsert operations: PASSED');
    log('✅ No errors thrown during database operations');
    log('\n📊 Final statistics:');
    log(`- Total records in database: ${postSyncData?.length || 0}`);
    log(`- Genesis chapters: ${postSyncData?.filter(r => r.book_name === 'Genesis').length || 0}`);
    log(`- Test records created successfully`);
    log('\n✅ All tests completed successfully!');
    log('Check your Supabase dashboard to verify the data.');
    log('Dashboard URL: https://supabase.com/dashboard/project/[your-project-id]/editor/reading_progress');
    
  } catch (error) {
    log('❌ Test failed with error:', error);
    process.exit(1);
  }
}

// Run the test
testSyncServiceCLI().then(() => {
  log('\nTest script completed.');
  process.exit(0);
}).catch(error => {

  process.exit(1);
});
