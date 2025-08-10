# SyncService Integration Test Instructions

This document provides instructions for testing the SyncService integration with Supabase.

## Test Setup

Three test methods have been created:

1. **Web-based Test Page** (Recommended)
2. **Browser Console Test**
3. **CLI Test Script** (requires authentication setup)

## Method 1: Web-based Test Page (Recommended)

This is the easiest way to test the SyncService with proper authentication.

### Steps:

1. Ensure the development server is running:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:8888/test-sync
   ```

3. Make sure you are logged in. If not, log in first through your normal authentication flow.

4. Click the "Run SyncService Test" button

5. The test will:
   - Check authentication status
   - Seed local storage with test data (Genesis chapters 1-3)
   - Call `performTwoWaySync()` method
   - Query and log responses from `supabase.from('reading_progress')`
   - Test upsert operations with no errors
   - Verify sync completion

6. Review the test output in the console display on the page

7. Verify in Supabase Dashboard:
   - Go to your Supabase project dashboard
   - Navigate to the Table Editor
   - Check the `reading_progress` table for new/updated rows
   - Check the `last_sync` table for sync timestamps

## Method 2: Browser Console Test

If you prefer to run the test directly in the browser console:

1. Navigate to any page of your app where you're logged in

2. Open the browser developer console (F12)

3. Run:
   ```javascript
   // Import and run the test
   import('/src/test-sync-service.ts').then(module => {
     module.testSyncService();
   });
   ```

4. Watch the console output for test results

## Method 3: CLI Test Script

The CLI test script (`test-sync-cli.mjs`) can be used but requires authentication to be set up properly.

```bash
node test-sync-cli.mjs
```

Note: This method may not work if authentication cookies/sessions are not accessible from the CLI environment.

## What the Tests Verify

1. **Authentication**: Confirms user is logged in
2. **Data Fetching**: Successfully queries `reading_progress` table
3. **Two-way Sync**: Executes `performTwoWaySync()` without errors
4. **Upsert Operations**: Confirms upsert doesn't throw errors
5. **Data Persistence**: Verifies new/updated rows in Supabase

## Expected Test Output

✅ Successful test output includes:
- User authenticated message with email and ID
- Initial data fetch count
- Two-way sync completion
- Post-sync data verification
- Upsert operation success
- Last sync time update

## Verification in Supabase Dashboard

After running the test:

1. Go to your Supabase project dashboard
2. Navigate to Table Editor
3. Check `reading_progress` table for:
   - Genesis chapters 1-3 with dates 2024-01-01 to 2024-01-03
   - TestBook chapter 1 with today's date
4. Check `last_sync` table for:
   - User's last sync timestamp
   - Device information

## Test Data

The test creates the following sample data:
- **Book**: Genesis
  - Chapter 1: Read on 2024-01-01 and 2024-01-15
  - Chapter 2: Read on 2024-01-02
  - Chapter 3: Read on 2024-01-03
- **Book**: TestBook
  - Chapter 1: Read on current date

## Troubleshooting

- **Not logged in**: Make sure to log in through the app's normal authentication flow first
- **No data appearing**: Check browser console for errors
- **Supabase connection issues**: Verify your `.env.local` has correct Supabase credentials
- **localStorage issues**: Clear browser cache/localStorage if you see stale data

## Files Created

- `/src/test-sync-service.ts` - Main test module
- `/src/app/test-sync/page.tsx` - Web-based test page
- `/test-sync-cli.mjs` - CLI test script
- `/TEST_SYNC_README.md` - This documentation
