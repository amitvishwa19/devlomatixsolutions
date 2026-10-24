'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { io } from 'socket.io-client';
import SessionSupersededModal from '@/components/global/SessionSupersededModal';
import { resolveSocketUrl } from '@/providers/CrmSocketProvider';

export default function GlobalSessionGuard() {
  const { data: session, status } = useSession();
  const userId = session?.user?.userId || session?.user?.id;
  const socketRef = useRef(null);

  const [supersededData, setSupersededData] = useState({
    isOpen: false,
    device: 'Mobile App',
    loggedAt: null,
  });

  // 1. Reactive NextAuth error state detection
  useEffect(() => {
    if (session?.error === 'SESSION_SUPERSEDED') {
      console.warn('[GLOBAL_SESSION_GUARD] NextAuth session detected SESSION_SUPERSEDED');
      setSupersededData((prev) => ({
        ...prev,
        isOpen: true,
        device: 'Mobile App',
      }));
      signOut({ redirect: false }).catch(() => {});
    }
  }, [session?.error]);

  // 2. Periodic background verification fallback (in case WebSockets are temporarily blocked)
  useEffect(() => {
    if (status !== 'authenticated' || !userId) return;

    const checkInterval = setInterval(async () => {
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const sess = await res.json();
          if (sess?.error === 'SESSION_SUPERSEDED' || (sess && !sess.user && sess.expires)) {
            console.warn('[GLOBAL_SESSION_GUARD] Session superseded detected via periodic sync');
            setSupersededData({
              isOpen: true,
              device: 'Mobile App',
              loggedAt: new Date().toISOString(),
            });
            signOut({ redirect: false }).catch(() => {});
          }
        }
      } catch (_) {}
    }, 15000);

    return () => clearInterval(checkInterval);
  }, [status, userId]);

  // 2. Real-time WebSocket listener for immediate (<100ms) kickout
  useEffect(() => {
    if (status !== 'authenticated' || !userId) {
      if (socketRef.current) {
        try {
          socketRef.current.disconnect();
        } catch (_) {}
        socketRef.current = null;
      }
      return;
    }

    let isCancelled = false;
    let s = null;

    async function initGuardSocket() {
      try {
        let authToken = null;
        try {
          const res = await fetch('/api/auth/socket-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, email: session?.user?.email }),
          });
          if (res.ok) {
            const data = await res.json();
            authToken = data?.token || null;
          } else {
            const getRes = await fetch('/api/auth/socket-token');
            if (getRes.ok) {
              const getData = await getRes.json();
              authToken = getData?.token || null;
            }
          }
        } catch (_) {}

        if (isCancelled || !authToken) return;

        const socketUrl = resolveSocketUrl();
        console.log(`[GLOBAL_SESSION_GUARD] Connecting session guard socket to ${socketUrl} for user ${userId}`);

        s = io(socketUrl, {
          auth: { token: authToken },
          transports: ['websocket', 'polling'],
          reconnectionAttempts: 20,
          reconnectionDelay: 2000,
          timeout: 10000,
        });

        s.on('connect', () => {
          console.log(`[GLOBAL_SESSION_GUARD] Connected (Socket ID: ${s.id})`);
          // Join user personal channel
          s.emit('user:join', {});
        });

        s.on('auth:session_superseded', (data) => {
          console.warn('[GLOBAL_SESSION_GUARD] Received auth:session_superseded:', data);
          const platform = (data?.platform || '').toLowerCase();
          if (platform !== 'web') {
            setSupersededData({
              isOpen: true,
              device: data?.device || 'Mobile App',
              loggedAt: data?.loggedAt || new Date().toISOString(),
            });

            // Disconnect socket and clear NextAuth session in background
            try {
              s.disconnect();
            } catch (_) {}
            signOut({ redirect: false }).catch(() => {});
          }
        });

        socketRef.current = s;
      } catch (err) {
        console.warn('[GLOBAL_SESSION_GUARD] Failed to connect guard socket:', err?.message);
      }
    }

    initGuardSocket();

    return () => {
      isCancelled = true;
      if (s) {
        try {
          s.disconnect();
        } catch (_) {}
      }
    };
  }, [status, userId]);

  return (
    <SessionSupersededModal
      isOpen={supersededData.isOpen}
      device={supersededData.device}
      loggedAt={supersededData.loggedAt}
    />
  );
}
