'use client';

import { useEffect, useRef } from 'react';
import { useCrmSocket } from '@/providers/CrmSocketProvider';

/**
 * useKonnectxSocket: Custom hook to listen for real-time KonnectX WhatsApp events
 * (connection state, live QR codes, new messages, and status receipts).
 * Automatically scopes events to the current workspace and handles ref stability.
 */
export function useKonnectxSocket({
    workspaceId,
    onStatusUpdate,
    onNewMessage,
    onMessageStatus
} = {}) {
    const { socket, isConnected } = useCrmSocket() || {};

    const onStatusUpdateRef = useRef(onStatusUpdate);
    const onNewMessageRef = useRef(onNewMessage);
    const onMessageStatusRef = useRef(onMessageStatus);

    useEffect(() => {
        onStatusUpdateRef.current = onStatusUpdate;
    }, [onStatusUpdate]);

    useEffect(() => {
        onNewMessageRef.current = onNewMessage;
    }, [onNewMessage]);

    useEffect(() => {
        onMessageStatusRef.current = onMessageStatus;
    }, [onMessageStatus]);

    useEffect(() => {
        if (!socket || !workspaceId) return;

        const handleStatus = (data) => {
            if (data?.workspaceId === workspaceId && onStatusUpdateRef.current) {
                onStatusUpdateRef.current(data);
            }
        };

        const handleNewMessage = (data) => {
            if (data?.workspaceId === workspaceId && onNewMessageRef.current) {
                onNewMessageRef.current(data);
            }
        };

        const handleMessageStatus = (data) => {
            if (data?.workspaceId === workspaceId && onMessageStatusRef.current) {
                onMessageStatusRef.current(data);
            }
        };

        socket.on('konnectx:status:update', handleStatus);
        socket.on('konnectx:message:new', handleNewMessage);
        socket.on('konnectx:message:status', handleMessageStatus);

        return () => {
            socket.off('konnectx:status:update', handleStatus);
            socket.off('konnectx:message:new', handleNewMessage);
            socket.off('konnectx:message:status', handleMessageStatus);
        };
    }, [socket, workspaceId]);

    return {
        socket,
        isConnected
    };
}
