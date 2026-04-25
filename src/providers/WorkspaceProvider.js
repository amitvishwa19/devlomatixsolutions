'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

const WorkspaceContext = createContext();

export const WorkspaceProvider = ({ children }) => {
    const { workspaceId } = useParams();
    const { data: session } = useSession();
    
    // Derive isSuperAdmin from session roles
    const sessionRoles = useMemo(() => session?.user?.roles || [], [session]);
    const isSuperAdmin = useMemo(() => {
        // DEV BYPASS: Treat everyone as Super Admin in development mode
        return true;

        // Broad check for super admin across various naming conventions
        return sessionRoles.some(r => 
            r.title?.toLowerCase().replace(/\s/g, '-') === "super-admin" || 
            r.title?.toLowerCase() === "super admin" ||
            session?.user?.role === "SUPER_ADMIN"
        );
    }, [sessionRoles, session?.user?.role]);

    // --- Settings State (from legacy SettingProvider) ---
    const [settings, setSettings] = useState(null);
    const [settingsLoading, setSettingsLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // --- Access/Simulation State (from legacy accessProvider) ---
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]); // All available permission definitions
    const [departments, setDepartments] = useState([]);
    const [accessLoading, setAccessLoading] = useState(true);
    const [previewRole, setPreviewRole] = useState(null);

    // --- Fetch Settings ---
    const fetchSettings = useCallback(async () => {
        setSettingsLoading(true);
        try {
            if (workspaceId && workspaceId !== '[workspaceId]' && workspaceId !== 'undefined') {
                const response = await fetch(`/api/workspace/${workspaceId}/system/settings`, { cache: 'no-store' });
                if (!response.ok) throw new Error(`Failed to fetch settings: ${response.status}`);
                
                const contentType = response.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    const text = await response.text();
                    console.error("Expected JSON (settings) but received:", text.substring(0, 100));
                    return;
                }
                const data = await response.json();
                setSettings(data);
            } else {
                const response = await fetch('/api/branding', { cache: 'no-store' });
                if (!response.ok) throw new Error(`Failed to fetch branding: ${response.status}`);
                
                const contentType = response.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    const text = await response.text();
                    console.error("Expected JSON (branding) but received:", text.substring(0, 100));
                    return;
                }
                const data = await response.json();
                setSettings({ branding: data });
            }
        } catch (error) {
            console.error('Fetch Settings Error:', error);
        } finally {
            setSettingsLoading(false);
        }
    }, [workspaceId]);

    // --- Fetch Access Management Data ---
    const fetchAccessData = useCallback(async () => {
        if (!workspaceId || workspaceId === '[workspaceId]' || workspaceId === 'undefined') return;
        try {
            setAccessLoading(true);
            
            // Fetch from split endpoints (New Architecture)
            const [usersRes, rolesRes, permissionsRes] = await Promise.all([
                fetch(`/api/workspace/${workspaceId}/management/user`, { cache: 'no-store' }),
                fetch(`/api/workspace/${workspaceId}/management/role`, { cache: 'no-store' }),
                fetch(`/api/workspace/${workspaceId}/management/permission`, { cache: 'no-store' })
            ]);

            // Handle errors
            if (!usersRes.ok || !rolesRes.ok || !permissionsRes.ok) {
                console.error("Failed to fetch one or more access management resources");
                return;
            }

            const [usersData, rolesData, permissionsData] = await Promise.all([
                usersRes.json(),
                rolesRes.json(),
                permissionsRes.json()
            ]);
            
            setUsers(usersData || []);
            setRoles(rolesData || []);
            
            // The permissions endpoint returns { all, grouped }
            setPermissions(permissionsData.all || permissionsData || []);
            
            // Departments currently empty/missing in schema
            setDepartments([]);

        } catch (error) {
            console.error('Error fetching access data:', error);
        } finally {
            setAccessLoading(false);
        }
    }, [workspaceId]);

    // --- Update Settings ---
    const updateSettings = async (newData) => {
        if (!workspaceId) return;
        setSaving(true);
        const toastId = toast.loading('Saving changes...');
        try {
            const response = await fetch(`/api/workspace/${workspaceId}/system/settings`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newData)
            });
            if (!response.ok) throw new Error(`Failed to update settings: ${response.status}`);
            
            setSettings(prev => ({ ...prev, ...newData }));
            toast.success('Settings updated successfully', { id: toastId });
        } catch (error) {
            console.error('Update Settings Error:', error);
            toast.error('Failed to update settings', { id: toastId });
        } finally {
            setSaving(false);
        }
    };


    // --- Permission Resolution ---
    const resolveRolePermissions = useCallback((roleId) => {
        if (!roleId) return [];
        const role = roles.find(r => r.id === roleId);
        if (!role) return [];

        let allPermissions = [...(role.permissions || [])];
        
        // Recursive inheritance
        if (role.parentId) {
            const parentPermissions = resolveRolePermissions(role.parentId);
            parentPermissions.forEach(pp => {
                if (!allPermissions.find(p => p.id === pp.id)) {
                    allPermissions.push(pp);
                }
            });
        }
        return allPermissions;
    }, [roles]);

    // --- Active Permissions Bridge ---
    const activePermissions = useMemo(() => {
        if (previewRole) {
            return resolveRolePermissions(previewRole.id);
        }
        
        // Fallback to real user roles from session
        // Flatten all permissions from all roles in the session
        const allSessionPerms = sessionRoles.flatMap(role => role.permissions || []);
        
        
        // Ensure we return the format expected by the system { value, ... }
        return allSessionPerms;
    }, [previewRole, resolveRolePermissions, sessionRoles]);

    useEffect(() => {
        fetchSettings();
        if (workspaceId) fetchAccessData();
    }, [fetchSettings, fetchAccessData, workspaceId]);

    const value = useMemo(() => ({
        // Core
        workspaceId,
        loading: settingsLoading || accessLoading,
        
        // Settings / Branding
        settings,
        setSettings,
        settingsLoading,
        saving,
        fetchSettings,
        updateSettings,

        // Access / RBAC
        users, setUsers,
        roles, setRoles,
        permissions, setPermissions,
        departments, setDepartments,
        accessLoading,
        previewRole, setPreviewRole,
        resolveRolePermissions,
        activePermissions,
        isSuperAdmin
    }), [
        workspaceId,
        settingsLoading,
        accessLoading,
        settings,
        saving,
        fetchSettings,
        updateSettings,
        users,
        roles,
        permissions,
        departments,
        previewRole,
        resolveRolePermissions,
        activePermissions,
        isSuperAdmin
    ]);

    return (
        <WorkspaceContext.Provider value={value}>
            {children}
        </WorkspaceContext.Provider>
    );
};

export const useWorkspace = () => {
    const context = useContext(WorkspaceContext);
    if (!context) {
        return { settings: null, loading: false, activePermissions: [] };
    }
    return context;
};

// Compatibility hook to prevent massive refactor in Access components
export const useAccess = useWorkspace;
export const useSettings = useWorkspace;
