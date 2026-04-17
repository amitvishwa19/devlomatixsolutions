'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import axios from '@/utils/axios';
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
            if (workspaceId) {
                const response = await axios.get(`/api/workspace/${workspaceId}/system/settings`);
                setSettings(response.data);
            } else {
                const response = await axios.get('/api/branding');
                setSettings({ branding: response.data });
            }
        } catch (error) {
            console.error('Fetch Settings Error:', error);
        } finally {
            setSettingsLoading(false);
        }
    }, [workspaceId]);

    // --- Fetch Access Management Data ---
    const fetchAccessData = useCallback(async () => {
        if (!workspaceId) return;
        try {
            setAccessLoading(true);
            const response = await fetch(`/api/workspace/${workspaceId}/access`);
            if (!response.ok) throw new Error('Failed to fetch access data');
            const data = await response.json();
            
            setUsers(data.users || []);
            setRoles(data.roles || []);
            setPermissions(data.permissions || []);
            setDepartments(data.departments || []);
        } catch (error) {
            console.error('Error fetching access data:', error);
            // toast.error('Failed to load access management data');
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
            await axios.patch(`/api/workspace/${workspaceId}/system/settings`, newData);
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

    const value = {
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
    };

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
