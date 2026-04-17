'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from '@/utils/axios';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';

const SettingContext = createContext();

export const SettingProvider = ({ children }) => {
    const { workspaceId } = useParams();
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchSettings = useCallback(async () => {
        setLoading(true);
        try {
            if (workspaceId) {
                // Fetch full workspace settings
                const response = await axios.get(`/api/workspace/${workspaceId}/system/settings`);
                setSettings(response.data);
            } else {
                // Fallback to global branding for non-workspace pages (Login, Verify, etc)
                const response = await axios.get('/api/branding');
                setSettings({
                    branding: response.data
                });
            }
        } catch (error) {
            console.error('Fetch Settings Error:', error);
        } finally {
            setLoading(false);
        }
    }, [workspaceId]);

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

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    return (
        <SettingContext.Provider value={{
            settings,
            loading,
            saving,
            fetchSettings,
            updateSettings,
            setSettings
        }}>
            {children}
        </SettingContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingContext);
    // Return empty context if used outside to prevent crashes in global components
    if (!context) {
        return { settings: null, loading: false };
    }
    return context;
};
