# Browser Console & Network Error Inspection Guide

## Error Monitoring Setup

An automatic error monitoring system has been added to the application that captures:
- Console errors (including Supabase and React Context errors)
- Unhandled promise rejections
- Network errors (401/403/CORS)
- All errors related to `supabase.co` requests

## How to Inspect for Errors

### 1. Open Browser Developer Tools
- **Chrome/Edge**: Press `F12` or `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (Mac)
- **Firefox**: Press `F12` or `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (Mac)
- **Safari**: Enable Developer menu in Preferences, then press `Cmd+Option+I`

### 2. Check Console Tab
Look for the following indicators:

#### Red Error Messages (🔴)
- **Supabase Errors**: Look for messages containing "supabase" or related to authentication
- **React Context Errors**: Messages like "useAuth must be used within an AuthProvider"
- **Unhandled Promise Rejections**: Warnings about promises that weren't caught

#### Monitoring Indicators
The error monitor will show:
- `🔍 Error monitoring started...` - Confirms monitoring is active
- `🚨 SUPABASE ERROR DETECTED` - Supabase-specific issues
- `🚨 REACT CONTEXT ERROR DETECTED` - Context-related issues
- `🚨 UNHANDLED PROMISE REJECTION` - Uncaught async errors
- `🚨 SUPABASE 401/403 ERROR` - Authentication/authorization issues
- `🚨 SUPABASE NETWORK/CORS ERROR` - Network connectivity issues
- `✅ Supabase request successful` - Successful Supabase API calls

### 3. Check Network Tab
1. Go to the **Network** tab in Developer Tools
2. Filter by "supabase.co" or look for requests to Supabase
3. Check for:
   - **401 Unauthorized**: User not authenticated
   - **403 Forbidden**: User lacks permissions
   - **CORS errors**: Cross-Origin Resource Sharing issues
   - **Failed requests**: Network timeouts or connection issues

### 4. Use Built-in Error Summary Tool

In the browser console, type:
```javascript
// Get a formatted summary of all captured errors
window.getErrorSummary()

// Get raw error data
window.errorMonitor.getErrors()

// Export errors to a JSON file for analysis
window.errorMonitor.exportErrors()
```

## Common Error Patterns to Look For

### Supabase Authentication Errors
- "Auth session missing" 
- "Invalid user credentials"
- "JWT expired"
- 401 responses from `*.supabase.co`

### React Context Errors
- "Cannot read properties of undefined (reading 'user')"
- "useAuth must be used within an AuthProvider"
- "Context value is undefined"

### CORS Errors
- "CORS policy: No 'Access-Control-Allow-Origin'"
- "Cross-Origin Request Blocked"
- Network tab shows OPTIONS requests failing

### Unhandled Promise Rejections
- "Uncaught (in promise)"
- Stack traces pointing to async functions
- Network requests without proper error handling

## Error Notes Template

When errors are found, copy this template and fill in the details:

```
=== ERROR LOG ===
Timestamp: [Date/Time]
Page URL: [Current page where error occurred]

Error Type: [Console Error / Network Error / Promise Rejection]
Error Message: [Full error message]
Related to: [Supabase / React Context / Other]

Stack Trace:
[Paste full stack trace here]

Network Details (if applicable):
- Request URL: 
- Status Code:
- Response:

Steps to Reproduce:
1. 
2. 
3. 

Additional Context:
[Any other relevant information]
===================
```

## Quick Troubleshooting

### No Errors in Console?
1. Make sure error monitoring is active (look for "📊 Error monitoring initialized")
2. Try performing actions that interact with Supabase (login, sync, etc.)
3. Check if errors are being filtered (ensure "All" or "Errors" is selected in console)

### Too Many Errors?
1. Clear console: `Ctrl+L` or click the clear button
2. Reproduce the specific issue
3. Use `window.getErrorSummary()` to get organized error list

### Export Errors for Analysis
1. Run `window.errorMonitor.exportErrors()` in console
2. A JSON file will be downloaded with all captured errors
3. Share this file for debugging assistance
