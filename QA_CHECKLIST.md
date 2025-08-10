# Manual QA Checklist - Sync Functionality

## Overview
This checklist covers the essential quality assurance tests for the sync functionality in the Undertone application. Follow these steps to verify that the sync feature is working correctly across all scenarios.

## Prerequisites
- [ ] Access to Supabase dashboard with proper permissions
- [ ] At least two different browsers installed (e.g., Chrome and Firefox)
- [ ] Test user account credentials
- [ ] Network developer tools enabled in browser

---

## Test Cases

### 1. Sync Button Visibility After Sign-In
**Priority:** Critical  
**Test Steps:**
1. Navigate to the application in incognito/private mode
2. Sign in with test credentials
3. Wait for the page to fully load

**Expected Result:**
- [ ] Sync button is visible immediately after successful sign-in
- [ ] Button is properly styled and positioned in the UI
- [ ] Button text is readable and clear ("Sync" or similar)
- [ ] No loading delays or flickers

**Notes:**
- Test in multiple browsers
- Check responsive design (desktop, tablet, mobile views)

---

### 2. Manual Sync - Success Scenario
**Priority:** Critical  
**Test Steps:**
1. Ensure you're signed in with a valid account
2. Make sure there are some chapters marked as complete
3. Click the sync button
4. Observe the UI response

**Expected Result:**
- [ ] "Sync Complete" toast notification appears
- [ ] Toast has green/success styling
- [ ] Toast automatically dismisses after appropriate duration (3-5 seconds)
- [ ] No console errors in browser developer tools
- [ ] Button remains clickable for subsequent syncs

**Additional Checks:**
- [ ] Multiple rapid clicks don't cause issues
- [ ] Button shows loading state during sync (if implemented)

---

### 3. Manual Sync - Error Scenario
**Priority:** High  
**Test Steps:**
1. Sign in with test account
2. Simulate error condition (options below):
   - Disconnect network before clicking sync
   - Use invalid/expired auth token (dev tools)
   - Trigger rate limit (if applicable)
3. Click the sync button
4. Observe the UI response

**Expected Result:**
- [ ] Error toast notification appears
- [ ] Toast has red/error styling
- [ ] Error message is user-friendly and actionable
- [ ] Toast includes relevant error details without exposing sensitive info
- [ ] Button returns to clickable state after error

**Error Scenarios to Test:**
- [ ] Network disconnection
- [ ] Authentication failure
- [ ] Server timeout
- [ ] Database write failure (if simulatable)

---

### 4. Automatic Sync on Chapter Completion
**Priority:** Critical  
**Test Steps:**
1. Sign in and navigate to any chapter
2. Open browser developer tools (Network tab)
3. Mark a chapter as complete/incomplete
4. Monitor network activity for sync request

**Expected Result:**
- [ ] Automatic sync triggers within 2-3 seconds of marking
- [ ] No manual intervention required
- [ ] Network request shows successful sync to Supabase
- [ ] No duplicate sync requests
- [ ] UI doesn't freeze or lag during background sync

**Timing Verification:**
- [ ] Start timer when chapter is marked
- [ ] Stop timer when sync request initiates
- [ ] Confirm time is under 3 seconds

---

### 5. Database Verification (Supabase)
**Priority:** Critical  
**Test Steps:**
1. Note the current state of chapters (which are marked complete)
2. Perform a manual sync or mark a chapter
3. Open Supabase dashboard
4. Navigate to the relevant table (likely `user_progress` or similar)
5. Query for the test user's records

**Expected Result:**
- [ ] Data appears in Supabase table immediately after sync
- [ ] Chapter completion status matches UI state
- [ ] Timestamps are accurate and in correct timezone
- [ ] User ID correctly associated with progress data
- [ ] No duplicate entries for same chapter/user combination

**Database Fields to Verify:**
- [ ] user_id
- [ ] chapter_id or chapter identifier
- [ ] completion_status (boolean or similar)
- [ ] last_updated timestamp
- [ ] Any additional metadata

---

### 6. Cross-Browser Sync Verification
**Priority:** Critical  
**Test Steps:**
1. Sign in to Browser A (e.g., Chrome)
2. Mark several chapters as complete
3. Ensure sync has occurred (manual or automatic)
4. Sign out from Browser A
5. Open Browser B (e.g., Firefox) in incognito mode
6. Sign in with the same credentials
7. Navigate to the chapters page

**Expected Result:**
- [ ] Latest progress from Browser A is visible in Browser B
- [ ] All completed chapters show as marked
- [ ] No missing or incorrect chapter states
- [ ] Data loads quickly without manual sync needed
- [ ] Progress persists across page refreshes

**Additional Scenarios:**
- [ ] Test with 3+ browsers simultaneously
- [ ] Test with mobile browser
- [ ] Test after clearing browser cache
- [ ] Test with different user accounts

---

## Regression Testing

### Quick Smoke Test (5 minutes)
For each release, perform this minimal test:
1. [ ] Sign in → Sync button visible
2. [ ] Click sync → Green toast appears
3. [ ] Mark chapter → Auto-sync occurs
4. [ ] Sign out/in → Progress restored

### Performance Checks
- [ ] Sync completes within 2 seconds on good connection
- [ ] UI remains responsive during sync
- [ ] No memory leaks after multiple syncs
- [ ] Console free of warnings/errors

---

## Edge Cases to Consider

### Data Conflicts
- [ ] What happens if user marks chapters in two browsers simultaneously?
- [ ] How does system handle sync when local data conflicts with server?
- [ ] Test sync with very large number of completed chapters (100+)

### Network Conditions
- [ ] Test on slow 3G connection
- [ ] Test with intermittent connectivity
- [ ] Test with VPN enabled
- [ ] Test behind corporate firewall

### User State
- [ ] Test sync immediately after account creation
- [ ] Test sync with no chapters marked
- [ ] Test sync after account deletion and recreation
- [ ] Test with expired session tokens

---

## Bug Reporting Template

If issues are found, document them with:

**Issue Title:** [Brief description]

**Environment:**
- Browser: [Name and version]
- OS: [Operating system]
- Network: [Connection type]
- User: [Test account used]

**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [etc.]

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happened]

**Screenshots/Videos:**
[Attach if applicable]

**Console Errors:**
```
[Paste any console errors]
```

**Priority:** [Critical/High/Medium/Low]

---

## Sign-off Checklist

Before approving release:
- [ ] All critical test cases pass
- [ ] No blocking bugs identified
- [ ] Performance meets requirements
- [ ] Cross-browser compatibility verified
- [ ] Database integrity maintained
- [ ] Error handling works as expected
- [ ] User experience is smooth and intuitive

**QA Engineer:** _________________  
**Date:** _________________  
**Version Tested:** _________________

---

## Notes and Observations

[Space for additional notes during testing]

---

## Version History
- v1.0 - Initial QA checklist creation
- Last updated: [Current date]
