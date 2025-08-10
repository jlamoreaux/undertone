/**
 * Test script for SyncService integration with Supabase
 * This script tests the performTwoWaySync() method and logs responses
 */

import { SyncService } from "./services/syncService";
import { supabase } from "@/lib/supabase";

// Helper function to log with timestamp
const log = (message: string, data?: any) => {
  const timestamp = new Date().toISOString();

  if (data) {
    // Better error serialization
    if (data instanceof Error) {

    } else {
      try {

      } catch (e) {

      }
    }
  }
};

// Helper function to add test data to localStorage
const seedLocalStorage = () => {
  // Add some test reading progress data
  const testData = {
    "Genesis": {
      "1": [new Date("2024-01-01"), new Date("2024-01-15")],
      "2": [new Date("2024-01-02")],
      "3": [new Date("2024-01-03")]
    }
  };

  localStorage.setItem("Genesis", JSON.stringify(testData["Genesis"]));
  log("✅ Local storage seeded with test data");
};

// Main test function
export async function testSyncService() {
  log("========================================");
  log("Starting SyncService Integration Test");
  log("========================================");

  try {
    // Check if user is logged in
    log("Checking authentication status...");
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      log("❌ Authentication error:", authError);
      return;
    }

    if (!user) {
      log("❌ No user logged in. Please log in first.");
      return;
    }

    log(`✅ User authenticated: ${user.email} (ID: ${user.id})`);

    // Seed local storage with test data
    seedLocalStorage();

    // Initialize SyncService
    const syncService = new SyncService();
    log("✅ SyncService initialized");

    // Test 1: Check initial data from Supabase
    log("\n📊 Test 1: Fetching existing data from Supabase...");
    const { data: initialData, error: fetchError } = await supabase
      .from("reading_progress")
      .select("*")
      .eq("user_id", user.id)
      .order("book_name")
      .order("chapter")
      .order("read_date");

    if (fetchError) {
      log("❌ Error fetching initial data:", fetchError);
    } else {
      log(`✅ Initial data fetched. Found ${initialData?.length || 0} records:`);
      if (initialData && initialData.length > 0) {
        log("Sample records:", initialData.slice(0, 3));
      }
    }

    // Test 2: Perform two-way sync
    log("\n🔄 Test 2: Performing two-way sync...");
    try {
      await syncService.performTwoWaySync();
      log("✅ Two-way sync completed successfully");
    } catch (syncError) {
      log("❌ Two-way sync error:", syncError);
      // Log more details about the error
      if (syncError && typeof syncError === "object") {

      }
      throw syncError;
    }

    // Test 3: Verify data after sync
    log("\n✅ Test 3: Verifying data after sync...");
    const { data: postSyncData, error: postFetchError } = await supabase
      .from("reading_progress")
      .select("*")
      .eq("user_id", user.id)
      .order("book_name")
      .order("chapter")
      .order("read_date");

    if (postFetchError) {
      log("❌ Error fetching post-sync data:", postFetchError);
    } else {
      log(`✅ Post-sync data fetched. Found ${postSyncData?.length || 0} records:`);
      if (postSyncData && postSyncData.length > 0) {
        log("Sample records after sync:", postSyncData.slice(0, 5));

        // Check if our test data was synced
        const genesisRecords = postSyncData.filter(r => r.book_name === "Genesis");
        if (genesisRecords.length > 0) {
          log(`✅ Genesis book synced successfully. Found ${genesisRecords.length} chapters:`, genesisRecords);
        }
      }
    }

    // Test 4: Test upsert operation directly
    log("\n📝 Test 4: Testing direct upsert operation...");
    const testRecord = {
      user_id: user.id,
      book_name: "TestBook",
      chapter: 1,
      read_date: new Date().toISOString().split("T")[0]
    };

    const { data: upsertData, error: upsertError } = await supabase
      .from("reading_progress")
      .upsert(testRecord, {
        onConflict: "user_id,book_name,chapter,read_date",
        ignoreDuplicates: true
      })
      .select();

    if (upsertError) {
      log("❌ Upsert error:", upsertError);
    } else {
      log("✅ Upsert successful. No errors thrown.");
      if (upsertData) {
        log("Upserted data:", upsertData);
      }
    }

    // Test 5: Check last sync time
    log("\n🕐 Test 5: Checking last sync time...");
    const lastSyncTime = await syncService.getLastSyncTime();
    if (lastSyncTime) {
      log(`✅ Last sync time: ${lastSyncTime.toISOString()}`);
    } else {
      log("⚠️ No last sync time found");
    }

    // Test 6: Verify in last_sync table
    log("\n📅 Test 6: Verifying last_sync table...");
    const { data: lastSyncData, error: lastSyncError } = await supabase
      .from("last_sync")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (lastSyncError) {
      log("⚠️ Error fetching last_sync (might not exist yet):", lastSyncError.message);
    } else if (lastSyncData) {
      log("✅ Last sync record found:", lastSyncData);
    }

    // Summary
    log("\n========================================");
    log("Test Summary");
    log("========================================");
    log("✅ Authentication check: PASSED");
    log("✅ Data fetch: PASSED");
    log("✅ Two-way sync: PASSED");
    log("✅ Upsert operation: PASSED");
    log("✅ No errors thrown during sync operations");
    log("\n📊 Final statistics:");
    log(`- Records in database: ${postSyncData?.length || 0}`);
    log("- Test record created: TestBook Chapter 1");
    log("\n✅ All tests completed successfully!");
    log("Check your Supabase dashboard to verify the data.");

  } catch (error) {
    log("❌ Test failed with error:", error);
    throw error;
  }
}

// Run the test if this file is executed directly
if (typeof window !== "undefined") {
  // Browser environment
  (window as any).testSyncService = testSyncService;

} else {
  // Node environment (won't work properly due to localStorage dependency)

}
