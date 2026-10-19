'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCrmSocket } from '@/providers/CrmSocketProvider';
import { toast } from 'sonner';

const NotificationContext = createContext(null);

// Audio synthesizer for notification bell chime
function playNotificationChime() {
    if (typeof window === 'undefined') return;
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now); // A5 note
        osc.frequency.exponentialRampToValueAtTime(1320, now + 0.12); // E6 note

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.08, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.4);
    } catch (_) {}
}

export function NotificationProvider({ children }) {
    const params = useParams();
    const workspaceId = params?.workspaceId;
    const { data: session } = useSession();
    const currentUserId = session?.user?.userId || session?.user?.id;

    const { socket, isConnected } = useCrmSocket() || {};

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [soundEnabled, setSoundEnabled] = useState(true);

    const workspaceIdRef = useRef(workspaceId);
    workspaceIdRef.current = workspaceId;

    // Load sound preference from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('devlomatix.notif_sound');
            if (stored !== null) {
                setSoundEnabled(stored === 'true');
            }
        }
    }, []);

    const toggleSound = useCallback(() => {
        setSoundEnabled((prev) => {
            const next = !prev;
            if (typeof window !== 'undefined') {
                localStorage.setItem('devlomatix.notif_sound', String(next));
            }
            toast.info(next ? 'Notification sound enabled' : 'Notification sound muted');
            return next;
        });
    }, []);

    // Fetch notifications from API
    const fetchNotifications = useCallback(async () => {
        if (!workspaceId || workspaceId === '[workspaceId]') return;
        setLoading(true);
        try {
            const res = await fetch(`/api/workspace/${workspaceId}/notifications`, {
                cache: 'no-store'
            });
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data?.notifications)) {
                    setNotifications(data.notifications);
                }
            }
        } catch (err) {
            console.warn('[NOTIFICATIONS_FETCH_WARN]', err?.message);
        } finally {
            setLoading(false);
        }
    }, [workspaceId]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Programmatically add a new notification (used by socket events or client actions)
    const addNotification = useCallback((notif, options = {}) => {
        const { silent = false, persist = true } = options;
        const newNotif = {
            id: notif.id || `notif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            workspaceId: workspaceIdRef.current,
            userId: notif.userId || currentUserId,
            type: notif.type || 'SYSTEM',
            title: notif.title || 'Notification',
            message: notif.message || '',
            link: notif.link || null,
            read: false,
            metadata: notif.metadata || null,
            createdAt: notif.createdAt || new Date().toISOString()
        };

        // Prepend to state (avoid duplicates by id)
        setNotifications((prev) => {
            if (prev.some((n) => n.id === newNotif.id)) return prev;
            return [newNotif, ...prev];
        });

        // Play chime
        if (!silent && soundEnabled) {
            playNotificationChime();
        }

        // Persist to backend API in background
        if (persist && workspaceIdRef.current) {
            fetch(`/api/workspace/${workspaceIdRef.current}/notifications`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newNotif)
            }).catch((err) => console.warn('[NOTIF_POST_ERR]', err));
        }
    }, [currentUserId, soundEnabled]);

    // Mark single notification as read
    const markAsRead = useCallback((id) => {
        if (!id) return;
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );

        if (workspaceIdRef.current) {
            fetch(`/api/workspace/${workspaceIdRef.current}/notifications`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            }).catch((err) => console.warn('[NOTIF_PATCH_ERR]', err));
        }
    }, []);

    // Mark all as read
    const markAllAsRead = useCallback(() => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        toast.success('All notifications marked as read');

        if (workspaceIdRef.current) {
            fetch(`/api/workspace/${workspaceIdRef.current}/notifications`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ all: true })
            }).catch((err) => console.warn('[NOTIF_PATCH_ALL_ERR]', err));
        }
    }, []);

    // Delete single notification
    const deleteNotification = useCallback((id) => {
        if (!id) return;
        setNotifications((prev) => prev.filter((n) => n.id !== id));

        if (workspaceIdRef.current) {
            fetch(`/api/workspace/${workspaceIdRef.current}/notifications?id=${encodeURIComponent(id)}`, {
                method: 'DELETE'
            }).catch((err) => console.warn('[NOTIF_DEL_ERR]', err));
        }
    }, []);

    // Clear all notifications
    const clearAll = useCallback(() => {
        setNotifications([]);
        toast.success('All notifications cleared');

        if (workspaceIdRef.current) {
            fetch(`/api/workspace/${workspaceIdRef.current}/notifications?all=true`, {
                method: 'DELETE'
            }).catch((err) => console.warn('[NOTIF_CLEAR_ALL_ERR]', err));
        }
    }, []);

    // Listen to real-time socket events
    useEffect(() => {
        if (!socket || !isConnected) return;

        // 1. System or Broadcast Notifications
        const handleNewNotification = (data) => {
            if (!data) return;
            addNotification({
                id: data.id,
                type: data.type || 'SYSTEM',
                title: data.title || 'System Notification',
                message: data.message || data.body || '',
                link: data.link || data.url || null,
                metadata: data.metadata || null
            });
        };

        // 2. Internal CRM Chat Messages
        const handleChatMessage = (msg) => {
            if (!msg || msg.senderId === currentUserId) return;
            // Check if current user is actively viewing this room
            const activeRoomId = typeof window !== 'undefined' ? window.__crm_active_room_id : null;
            if (activeRoomId && activeRoomId === msg.roomId && document.hasFocus()) {
                return;
            }

            addNotification({
                id: `crm_msg_${msg.id || Date.now()}`,
                type: 'CHAT',
                title: `Message from ${msg.senderName || 'Team Member'}`,
                message: msg.message || 'Sent an attachment',
                link: workspaceIdRef.current ? `/workspace/${workspaceIdRef.current}/crm/chat?roomId=${encodeURIComponent(msg.roomId)}` : null,
                metadata: {
                    senderId: msg.senderId,
                    senderAvatar: msg.senderAvatar,
                    roomId: msg.roomId
                }
            });
        };

        // 3. WebRTC Missed Call
        const handleCallMissed = (data) => {
            if (!data) return;
            addNotification({
                id: `missed_call_${data.roomId || Date.now()}`,
                type: 'CALL',
                title: `Missed Call from ${data.callerName || 'Team Member'}`,
                message: `${data.callType === 'video' ? 'Video' : 'Voice'} call was not answered`,
                link: workspaceIdRef.current ? `/workspace/${workspaceIdRef.current}/crm/chat` : null,
                metadata: data
            });
        };

        socket.on('notification:new', handleNewNotification);
        socket.on('chat:message:receive', handleChatMessage);
        socket.on('call:missed', handleCallMissed);

        return () => {
            socket.off('notification:new', handleNewNotification);
            socket.off('chat:message:receive', handleChatMessage);
            socket.off('call:missed', handleCallMissed);
        };
    }, [socket, isConnected, currentUserId, addNotification]);

    const unreadCount = notifications.filter((n) => !n.read).length;

    const value = {
        notifications,
        unreadCount,
        loading,
        soundEnabled,
        toggleSound,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        addNotification,
        refresh: fetchNotifications
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    return context || {
        notifications: [],
        unreadCount: 0,
        loading: false,
        soundEnabled: true,
        toggleSound: () => {},
        markAsRead: () => {},
        markAllAsRead: () => {},
        deleteNotification: () => {},
        clearAll: () => {},
        addNotification: () => {},
        refresh: () => {}
    };
}
