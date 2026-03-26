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
            const response = await axios.get(`/api/workspace/${workspaceId}/system/settings`);
            setSettings(response.data);
        } catch (error) {
            console.error('Fetch Settings Error:', error);
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    }, [workspaceId]);

    const updateSettings = async (newData) => {
        setSaving(true);
        const toastId = toast.loading('Saving changes...');
        try {
            const response = await axios.patch(`/api/workspace/${workspaceId}/system/settings`, newData);
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
    if (!context) {
        throw new Error('useSettings must be used within a SettingProvider');
    }
    return context;
};
