/**
 * Client-side stale-while-revalidate in-memory cache for KonnectX workspace metadata
 * (Message templates, Contact groups, Contact categories)
 */

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const store = {
    templates: new Map(),
    groups: new Map(),
    categories: new Map()
};

export const getCachedMetadata = (type, workspaceId) => {
    if (!type || !workspaceId || typeof window === 'undefined') return null;
    const bucket = store[type];
    if (!bucket) return null;

    const entry = bucket.get(workspaceId);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
        bucket.delete(workspaceId);
        return null;
    }

    return entry.data;
};

export const setCachedMetadata = (type, workspaceId, data) => {
    if (!type || !workspaceId || typeof window === 'undefined') return;
    if (!store[type]) store[type] = new Map();
    store[type].set(workspaceId, { data, timestamp: Date.now() });
};

export const invalidateCachedMetadata = (type, workspaceId) => {
    if (typeof window === 'undefined') return;
    if (type && workspaceId && store[type]) {
        store[type].delete(workspaceId);
    } else if (workspaceId) {
        store.templates.delete(workspaceId);
        store.groups.delete(workspaceId);
        store.categories.delete(workspaceId);
    }
};
