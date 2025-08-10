# Automatic Sync Trigger Implementation

## Overview
This document describes the implementation of automatic sync triggering after reading activity in the Undrtone application.

## Changes Made

### 1. Main Page (`src/app/page.tsx`)
- Added `useAuth` hook to access `performSync` function and user state
- Modified `recordReading` function to return the book name that was updated
- Added state tracking for the last updated book using `useState`
- Implemented a `useEffect` hook that:
  - Watches for changes in `lastUpdatedBook` state
  - Only triggers sync if user is logged in
  - Implements a 3-second debounce to batch multiple reading activities
  - Clears any existing timeouts to prevent multiple syncs
  - Logs the activity for debugging

### 2. Book Detail Page (`src/app/book/[id]/page.tsx`)
- Added `useAuth` hook to access `performSync` function and user state
- Added state tracking for the last updated book
- Modified `saveRecording` function to capture the updated book name
- Implemented the same `useEffect` hook with 3-second debounce for consistency

## How It Works

1. **Reading Activity Detection**: When a user marks chapters as read (either through the RecordForm on the main page or through the book detail page), the `recordReading` function is called.

2. **Book Tracking**: The `recordReading` function now returns the name of the book that was updated, which is captured in the component state.

3. **Debounced Sync**: A `useEffect` hook watches for changes to `lastUpdatedBook`. When it detects a change:
   - It first checks if the user is logged in (sync only works for authenticated users)
   - It clears any existing sync timeout to prevent multiple syncs
   - It sets a new 3-second timeout before calling `performSync()`
   - This debounce allows multiple rapid reading activities to be batched into a single sync

4. **Cleanup**: The effect properly cleans up timeouts when the component unmounts or dependencies change.

## Benefits

- **Automatic**: Users don't need to manually click the sync button after reading
- **Efficient**: The 3-second debounce prevents excessive sync calls
- **User-friendly**: Works transparently in the background
- **Consistent**: Same behavior on both main page and book detail page

## Testing

To test the implementation:
1. Log in to the application
2. Mark some chapters as read (either from the main page or book detail page)
3. Watch the browser console for log messages:
   - "Reading activity detected for book: [book name], scheduling sync..."
   - "Triggering automatic sync after reading activity" (after 3 seconds)
4. Verify that the sync notification appears after the debounce period

## Debug Logs

The implementation includes console.log statements for debugging:
- When reading activity is detected
- When sync is scheduled
- When sync is triggered

These can be removed in production or replaced with a proper logging system.
