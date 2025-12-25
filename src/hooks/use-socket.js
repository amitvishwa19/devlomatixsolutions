// hooks/use-socket.js
'use client';

import { useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';

export function useSocket(roomId) {
    const socketRef = useRef(null);

    useEffect(() => {
        console.log('🔌 Connecting to socket...');

        socketRef.current = io(SOCKET_URL, {
            path: '/api/socket',
            transports: ['websocket'],
            autoConnect: true
        });

        socketRef.current.on('connect', () => {
            console.log('✅ Connected:', socketRef.current.id);
            if (roomId) {
                socketRef.current.emit('join-room', roomId);
            }
        });

        return () => {
            socketRef.current?.disconnect();
        };
    }, [roomId]);

    const emitAppointmentUpdate = useCallback((data) => {
        socketRef.current?.emit('appointment-update', data);
    }, []);

    const emitInvoiceCreated = useCallback((data) => {
        socketRef.current?.emit('invoice-created', data);
    }, []);

    return {
        socket: socketRef.current,
        emitAppointmentUpdate,
        emitInvoiceCreated
    };
}
