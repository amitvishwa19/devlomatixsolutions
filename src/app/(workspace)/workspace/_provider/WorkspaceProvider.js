// components/providers/WorkspaceProvider.tsx
'use client';

import { createContext, useContext, ReactNode, useMemo } from 'react';



const WorkspaceContext = createContext(null);


export function WorkspaceProvider({ children, initialData, }) {


    // Memoize to prevent unnecessary re-renders
    const value = useMemo(() => initialData, [initialData]);
    console.log('Initial WorkspaceProvider data', initialData)

    return (
        <WorkspaceContext.Provider value={value}>
            {children}
        </WorkspaceContext.Provider>
    );
}

export function useWorkspace() {
    const context = useContext(WorkspaceContext);
    if (context === null) {
        throw new Error(
            'useWorkspace must be used within a WorkspaceProvider'
        );
    }
    return context;
}

export function useAppSettings() {
    return useWorkspace().appSettings;
}


export function useDepartments() {
    return useWorkspace()?.appSettings?.departments;
}


// Convenience hooks
export function useOrgServer() {
    return useWorkspace().defaultServer;
}

export function useOrgServers() {
    return useWorkspace().servers;
}

export function useOrgPermissions() {
    return useWorkspace().userPermissions;
}

export function useDefaultServer() {
    return useWorkspace().defaultServer;
}

export function useServers() {
    return useWorkspace().servers;
}

export function useUsers() {
    return useWorkspace().users;
}

// Current user (directly from workspace data)
export function useCurrentUser() {
    return useWorkspace().currentUser;
}

// Current user's permissions (pre-computed)
export function useCurrentUserPermissions() {
    return useWorkspace().userPermissions || [];
}

// Current user's roles
export function useCurrentUserRoles() {
    return useWorkspace().currentUser?.roles || [];
}

// Check if current user has permission
export function useHasPermission(permission) {
    const permissions = useCurrentUserPermissions();
    return permissions.includes(permission);
}

// Check if current user has any of these permissions
export function useHasAnyPermission(permissionsArray) {
    const userPermissions = useCurrentUserPermissions();
    return permissionsArray.some(p => userPermissions.includes(p));
}

// Check if current user has all of these permissions
export function useHasAllPermissions(permissionsArray) {
    const userPermissions = useCurrentUserPermissions();
    return permissionsArray.every(p => userPermissions.includes(p));
}