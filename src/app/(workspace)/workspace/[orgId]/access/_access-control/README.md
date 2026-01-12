# Access Control Module (Non-Breaking Update)

This package enhances your existing access-control system without breaking current usage.

## What’s Improved
- Super Admin bypass support
- Dev-mode warnings if AccessProvider is missing
- Optional debug mode for Access component
- Fixed internal hook consistency

## File Structure
```
_access-control/
 ├─ Access.jsx
 ├─ AccessContext.jsx
 ├─ types.js
 └─ usePermission.js
```

## How to Apply (Step-by-Step)

### 1. Backup Existing Files
Before replacing, copy your existing `_access-control` folder.

### 2. Replace Files
Replace your current files with the ones from this package.
No imports or usage need to change.

### 3. Ensure AccessProvider is Wrapped
Example:
```jsx
<AccessProvider session={session}>
  {children}
</AccessProvider>
```

### 4. Optional Debugging
```jsx
<Access permission="users.delete" debug>
  <Button>Delete</Button>
</Access>
```

### 5. Super Admin Role
Any user with role:
- `SUPER_ADMIN` or
- `Super Admin`
will automatically bypass permission checks.

## No Breaking Changes
- Existing Access usage still works
- Existing usePermission hooks still work
- No API changes required

## Recommended
Mirror the same permission checks on the server for true security.

---
Happy building 🚀