# Implementation Plan: URL-Based Sidebar Filtering

## Goal
Transition the sidebar access control to use the normalized `url` field stored in navigation permissions. This ensures that permissions are workspace-independent and visually accurate.

## Proposed Steps

### Step 1: Sidebar Path Normalization
In `src/app/workspace/_components/AppSidebar.jsx`, we will introduce a helper to strip the dynamic part of the URL.
```javascript
const normalizePath = (url) => {
    if (!url) return null;
    return url.replace(/^\/workspace\/[^/]+/, '') || '/';
};
```

### Step 2: Update Sidebar Filtering
Modify the filtering logic in `AppSidebar.jsx` to compare the normalized sidebar item URL with the user's `activePermissions`.
- Match where `p.type ==='navigation'` AND `p.url === normalizedPath`.
- Fallback to matching `p.value` for legacy items.

### Step 3: End-to-End Verification
- Confirm that existing permissions in the DB (like `navigation.wa.chats`) correctly toggle the sidebar.
- Verify that the `url` field in the database is the primary matching factor.

## Next Step
Confirm if we should proceed with "Step 1: Normalization" first.
