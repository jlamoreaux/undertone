# SyncButton Visibility Audit Report

## Files Audited
1. `/src/app/layout.tsx` - Contains the SyncButton component
2. `/src/contexts/AuthContext.tsx` - Provides auth state and performSync function

## Key Findings

### SyncButton Component (layout.tsx)
- **Location**: Lines 93-112 (now 93-122 with enhanced logging)
- **Visibility Condition**: `if (!user) return null;` (line 99)
- **Props Used**: 
  - `user` - Controls visibility
  - `performSync` - Click handler 
  - `syncing` - Loading state

### Conditions Analysis
1. **Primary Condition**: The button is hidden when `user` is null
2. **No Feature Flags**: No feature flag checks found
3. **Props Availability**: Both `user` and `performSync` are provided by `useAuth()` hook

## Issues Identified

### 1. Closure Issue in performSync
- **Problem**: The `performSync` function in AuthContext was capturing stale `user` state from closure
- **Impact**: Auto-sync on login might fail silently
- **Solution**: Used `useRef` to maintain current state references

### 2. Insufficient Logging
- **Problem**: Limited visibility into why button might not appear
- **Solution**: Added detailed logging for:
  - User state (email if present)
  - Sync state
  - performSync availability
  - Timestamp of renders
  - Explicit logs when button is hidden vs visible

## Changes Made

### 1. Enhanced SyncButton Logging (layout.tsx)
```jsx
// Added detailed logging
console.log('SyncButton render:', {
  user: user ? `User: ${user.email}` : 'No user',
  syncing,
  hasPerformSync: !!performSync,
  performSyncType: typeof performSync,
  timestamp: new Date().toISOString()
});

// Log visibility decisions
if (!user) {
  console.log('SyncButton hidden: No user logged in');
  return null;
}
console.log('SyncButton visible: User logged in, rendering button');

// Log button clicks
onClick={() => {
  console.log('Sync button clicked, calling performSync');
  performSync();
}}
```

### 2. Fixed Closure Issue (AuthContext.tsx)
```jsx
// Added refs to maintain current state
const userRef = useRef<User | null>(null);
const syncingRef = useRef(false);

// Keep refs in sync
userRef.current = user;
syncingRef.current = syncing;

// Use refs in performSync
const performSync = useCallback(async () => {
  const currentUser = userRef.current;
  const currentSyncing = syncingRef.current;
  // ... rest of function uses current values
}, [syncService]);
```

### 3. Added performSync Logging
```jsx
console.log('performSync called, current state:', { 
  user: currentUser ? currentUser.email : 'null', 
  syncing: currentSyncing 
});
```

## Verification Steps

To verify the fix works:
1. Open browser console
2. Log in to the application
3. Look for these console logs:
   - "SyncButton render: User: [email]" - Button should be visible
   - "SyncButton visible: User logged in, rendering button"
   - "performSync called, current state: user: [email]"
4. Click the Sync button and verify:
   - "Sync button clicked, calling performSync"
   - "Starting sync for user: [email]"

## Conclusion

The SyncButton visibility is controlled by a simple condition: `if (!user) return null`. This is working correctly. The main issue was a closure problem in the `performSync` function that could cause auto-sync to fail. This has been fixed using refs to maintain current state values.

All props that influence visibility are now logged for debugging:
- `user` - Primary visibility control
- `performSync` - Always available from context
- `syncing` - Affects button state but not visibility
