'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { io } from 'socket.io-client';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';

import { useSettings } from '@/providers/WorkspaceProvider';
import { WebRtcClient } from '@/lib/webrtc/webrtc-client';
import IncomingCallDialog from '@/app/workspace/[workspaceId]/crm/_components/call/IncomingCallDialog';
import ActiveCallModal from '@/app/workspace/[workspaceId]/crm/_components/call/ActiveCallModal';
import PostCallSummaryDialog from '@/app/workspace/[workspaceId]/crm/_components/call/PostCallSummaryDialog';

const CrmSocketContext = createContext(null);

export const resolveSocketUrl = (customConfig) => {
  let config = customConfig;
  if (!config && typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem('devlomatix_socket_config');
      if (cached) config = JSON.parse(cached);
    } catch (_) {}
  }

  if (config) {
    const devUrl = config.devUrl ? String(config.devUrl).trim().replace(/\/+$/, '') : '';
    const prodUrl = config.prodUrl ? String(config.prodUrl).trim().replace(/\/+$/, '') : '';
    const mode = config.environmentMode || 'auto';

    if (mode === 'development' && devUrl) return devUrl;
    if (mode === 'production' && prodUrl) return prodUrl;

    if (mode === 'auto') {
      const isLocalHost = typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      if (isLocalHost && devUrl) return devUrl;
      if (!isLocalHost && prodUrl) return prodUrl;
    }
  }

  const envUrl =
    process.env.NEXT_PUBLIC_SOCKET_SERVER ||
    process.env.NEXT_PUBLIC_SOCKET_SERVER_URL ||
    process.env.NEXT_PUBLIC_SOCKETSERVER ||
    process.env.NEXT_PUBLIC_SOCKET_URL;

  if (envUrl) {
    return envUrl.trim().replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:5001';
  }
  return 'https://socket.devlomatix.in';
};

export const getSocketUrl = (customConfig) => resolveSocketUrl(customConfig);

// Pure Web Audio tone synthesizer for ringback and incoming call melodies
function playWebAudioTone(type) {
  if (typeof window === 'undefined') return null;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    const ctx = new AudioCtx();
    let isRunning = true;

    if (type === 'ringback') {
      // Classic phone ringback tone: 440Hz + 480Hz dual sine tones
      const ring = () => {
        if (!isRunning || ctx.state === 'closed') return;
        const now = ctx.currentTime;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(440, now);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(480, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.07, now + 0.05);
        gain.gain.setValueAtTime(0.07, now + 1.5);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 1.6);
        osc2.stop(now + 1.6);

        setTimeout(ring, 3800);
      };
      ring();
    } else if (type === 'incoming') {
      // Pleasant melodic chime sequence: C5, E5, G5, C6 notes repeating
      const chime = () => {
        if (!isRunning || ctx.state === 'closed') return;
        const freqs = [523.25, 659.25, 783.99, 1046.5];
        freqs.forEach((freq, idx) => {
          const now = ctx.currentTime + idx * 0.12;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(0.001, now);
          gain.gain.exponentialRampToValueAtTime(0.12, now + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.45);
        });

        setTimeout(chime, 2600);
      };
      chime();
    }

    return {
      stop: () => {
        isRunning = false;
        try {
          ctx.close();
        } catch (_) {}
      }
    };
  } catch (err) {
    console.warn('[AUDIO_SYNTH_WARN]', err);
    return null;
  }
}

export function CrmSocketProvider({ children }) {
  const { data: session } = useSession();
  const params = useParams();
  const workspaceId = params?.workspaceId;
  const { settings } = useSettings() || {};

  const currentUserId = session?.user?.userId || session?.user?.id;
  const currentUserName = session?.user?.displayName || session?.user?.name || 'Sales Rep';
  const currentUserAvatar = session?.user?.avatar || session?.user?.image || null;

  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // 'connected' | 'connecting' | 'reconnecting' | 'disconnected' | 'error'
  const [transport, setTransport] = useState(null); // 'websocket' | 'polling'
  const [socketUrl, setSocketUrl] = useState('');
  const [latency, setLatency] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [customSocketConfig, setCustomSocketConfig] = useState(null);

  // Synchronize socket server config from WorkspaceProvider settings or localStorage
  useEffect(() => {
    if (settings?.socketServer) {
      setCustomSocketConfig(settings.socketServer);
      try {
        localStorage.setItem('devlomatix_socket_config', JSON.stringify(settings.socketServer));
      } catch (_) {}
    } else if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('devlomatix_socket_config');
        if (cached) setCustomSocketConfig(JSON.parse(cached));
      } catch (_) {}
    }
  }, [settings?.socketServer]);

  // Listen for immediate dynamic updates from Settings Modal or tests
  useEffect(() => {
    const handleConfigEvent = (e) => {
      if (e.detail) {
        setCustomSocketConfig(e.detail);
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('devlomatix-socket-config-changed', handleConfigEvent);
      return () => window.removeEventListener('devlomatix-socket-config-changed', handleConfigEvent);
    }
  }, []);

  const activeConfig = customSocketConfig || settings?.socketServer;
  const resolvedUrl = useMemo(() => resolveSocketUrl(activeConfig), [activeConfig]);

  // Call State Management
  // callStatus: 'idle' | 'calling' | 'incoming' | 'connected' | 'ended'
  const [callStatus, setCallStatus] = useState('idle');
  const [incomingCallData, setIncomingCallData] = useState(null);
  const [activeCallSession, setActiveCallSession] = useState(null);
  const [postCallRecord, setPostCallRecord] = useState(null);

  // Audio/Video control states
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Streams
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const webrtcClientRef = useRef(null);
  const timerRef = useRef(null);
  const socketRef = useRef(null);
  const ringtoneRef = useRef(null);
  const callTimeoutRef = useRef(null);
  const activeCallSessionRef = useRef(null);
  const callStatusRef = useRef('idle');
  const callDurationRef = useRef(0);

  const incomingAudioRef = useRef(null);
  const incomingToastIdRef = useRef(null);
  const originalTitleRef = useRef(typeof document !== 'undefined' ? document.title : '');
  const titleIntervalRef = useRef(null);

  // Auto-request browser desktop notification permission once mounted
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
      }
    }
  }, []);

  const startTitleFlashing = useCallback((callerName) => {
    if (typeof document === 'undefined') return;
    originalTitleRef.current = document.title;
    let toggle = false;
    if (titleIntervalRef.current) clearInterval(titleIntervalRef.current);
    titleIntervalRef.current = setInterval(() => {
      document.title = toggle
        ? `📞 Call from ${callerName || 'User'}!`
        : `🔔 Ringing... - Devlomatix`;
      toggle = !toggle;
    }, 1000);
  }, []);

  const stopTitleFlashing = useCallback(() => {
    if (titleIntervalRef.current) {
      clearInterval(titleIntervalRef.current);
      titleIntervalRef.current = null;
    }
    if (typeof document !== 'undefined' && originalTitleRef.current) {
      document.title = originalTitleRef.current;
    }
    if (incomingToastIdRef.current) {
      toast.dismiss(incomingToastIdRef.current);
      incomingToastIdRef.current = null;
    }
  }, []);

  // Synchronize state to refs for resilient socket callbacks
  useEffect(() => {
    activeCallSessionRef.current = activeCallSession;
  }, [activeCallSession]);

  useEffect(() => {
    callStatusRef.current = callStatus;
  }, [callStatus]);

  useEffect(() => {
    callDurationRef.current = callDuration;
  }, [callDuration]);

  const stopRingtone = useCallback(() => {
    stopTitleFlashing();
    if (incomingAudioRef.current) {
      try {
        incomingAudioRef.current.pause();
        incomingAudioRef.current.currentTime = 0;
      } catch (_) {}
    }
    if (ringtoneRef.current) {
      ringtoneRef.current.stop();
      ringtoneRef.current = null;
    }
  }, [stopTitleFlashing]);

  const startRingtone = useCallback((type) => {
    stopRingtone();

    if (type === 'incoming') {
      // Play actual MP3 voice call ringtone
      if (incomingAudioRef.current) {
        incomingAudioRef.current.currentTime = 0;
        incomingAudioRef.current.volume = 0.9;
        const playPromise = incomingAudioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn('[INCOMING_MP3_RINGTONE_WARN] HTML5 Audio autoplay blocked, using fallback chime:', err);
            ringtoneRef.current = playWebAudioTone('incoming');
          });
        }
      } else {
        try {
          const audio = new Audio('/tones/call-ring-tone.mp3');
          audio.loop = true;
          audio.volume = 0.9;
          audio.play().catch(() => {
            ringtoneRef.current = playWebAudioTone('incoming');
          });
          ringtoneRef.current = {
            stop: () => {
              try {
                audio.pause();
                audio.currentTime = 0;
              } catch (_) {}
            }
          };
        } catch (_) {
          ringtoneRef.current = playWebAudioTone('incoming');
        }
      }
    } else if (type === 'ringback') {
      ringtoneRef.current = playWebAudioTone('ringback');
    }
  }, [stopRingtone]);

  // 1. Connect Socket
  useEffect(() => {
    if (!currentUserId || !workspaceId) {
      setConnectionStatus('disconnected');
      return;
    }

    let isCancelled = false;
    let s = null;

    async function initializeSocket() {
      setSocketUrl(resolvedUrl);
      setConnectionStatus('connecting');

      // 🔐 Fetch signed JWT socket auth token
      let authToken = null;
      try {
        const tokenRes = await fetch('/api/auth/socket-token');
        if (tokenRes.ok) {
          const tokenData = await tokenRes.json();
          authToken = tokenData?.token || null;
        }
      } catch (err) {
        console.warn('[CRM_SOCKET] Failed to fetch socket auth token:', err);
      }

      if (isCancelled) return;

      s = io(resolvedUrl, {
        auth: {
          token: authToken
        },
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 15,
        reconnectionDelay: 2000,
        timeout: 10000
      });

      s.on('connect', () => {
        setIsConnected(true);
        setConnectionStatus('connected');
        const currentTransport = s.io?.engine?.transport?.name || 'websocket';
        setTransport(currentTransport);
        console.log(`[CRM_SOCKET] Authenticated connection established to ${resolvedUrl} (ID: ${s.id}, Transport: ${currentTransport})`);

        // Monitor transport upgrades (e.g., polling -> websocket)
        s.io?.engine?.on('upgrade', (rawTransport) => {
          setTransport(rawTransport?.name || 'websocket');
        });

        // Quick latency calculation
        const start = Date.now();
        try {
          s.timeout(2000).emit('client:ping', () => {
            setLatency(Date.now() - start);
          });
        } catch (_) {}

        // Register presence — server uses verified JWT identity (no workspaceId needed for presence)
        s.emit('user:join', {});
      });

      s.on('disconnect', (reason) => {
        setIsConnected(false);
        setConnectionStatus('disconnected');
        console.log('[CRM_SOCKET] Disconnected from server. Reason:', reason);
      });

      s.on('connect_error', (error) => {
        setIsConnected(false);
        setConnectionStatus('error');
        console.warn('[CRM_SOCKET] Connection error:', error?.message);
      });

      s.io?.on('reconnect_attempt', () => {
        setConnectionStatus('reconnecting');
      });

      s.io?.on('reconnect', () => {
        setIsConnected(true);
        setConnectionStatus('connected');
        setTransport(s.io?.engine?.transport?.name || 'websocket');
        // Re-register presence after reconnect
        s.emit('user:join', {});
      });

      s.io?.on('reconnect_failed', () => {
        setIsConnected(false);
        setConnectionStatus('disconnected');
      });

      s.on('presence:sync', (users) => {
        setOnlineUsers(users.filter((u) => String(u.userId) !== String(currentUserId)));
      });

      socketRef.current = s;
      setSocket(s);
    }

    initializeSocket();

    return () => {
      isCancelled = true;
      if (s) {
        s.disconnect();
      }
    };
  }, [currentUserId, workspaceId, currentUserName, currentUserAvatar, resolvedUrl]);

  const checkLatency = useCallback(() => {
    if (!socketRef.current || !socketRef.current.connected) return;
    const start = Date.now();
    try {
      socketRef.current.timeout(2500).emit('client:ping', () => {
        setLatency(Date.now() - start);
      });
    } catch (_) {}
  }, []);

  const reconnect = useCallback(() => {
    if (socketRef.current) {
      setConnectionStatus('connecting');
      try {
        socketRef.current.disconnect();
        socketRef.current.connect();
      } catch (err) {
        console.error('[CRM_SOCKET] Reconnect failed:', err);
      }
    }
  }, []);

  // Helper to cleanup WebRTC
  const cleanupCall = useCallback(() => {
    stopRingtone();
    if (callTimeoutRef.current) {
      clearTimeout(callTimeoutRef.current);
      callTimeoutRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (webrtcClientRef.current) {
      webrtcClientRef.current.cleanup();
      webrtcClientRef.current = null;
    }
    setLocalStream(null);
    setRemoteStream(null);
    setIsMuted(false);
    setIsCameraOff(false);
    setIsScreenSharing(false);
  }, [stopRingtone]);

  const acceptCallRef = useRef(null);
  const rejectCallRef = useRef(null);

  // 2. Setup WebRTC Signaling Listeners
  useEffect(() => {
    if (!socket) return;

    // Incoming Call Ring
    socket.on('call:incoming', (data) => {
      if (callStatusRef.current !== 'idle') {
        // Automatically respond busy if already on a call
        socket.emit('call:response', { roomId: data.roomId, accepted: false, reason: 'busy' });
        return;
      }

      setIncomingCallData(data);
      setCallStatus('incoming');
      startRingtone('incoming');
      startTitleFlashing(data.callerName);

      // Trigger Web Desktop Notification if supported
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        try {
          const notif = new Notification(`Incoming ${data.callType === 'video' ? 'Video' : 'Voice'} Call`, {
            body: `${data.callerName || 'Team Member'} is calling you... Click to answer.`,
            icon: data.callerAvatar || '/fevicon.ico',
            tag: `call-${data.roomId}`,
            requireInteraction: true,
          });
          notif.onclick = () => {
            window.focus();
            notif.close();
          };
        } catch (e) {
          console.warn('[DESKTOP_NOTIF_ERROR]', e);
        }
      }

      // Display floating sticky alert banner across any workspace screen
      const toastId = `incoming-call-${data.roomId}`;
      incomingToastIdRef.current = toastId;
      toast.custom(
        (t) => (
          <div className="flex items-center gap-3 p-3.5 bg-slate-950/95 backdrop-blur-md border-2 border-indigo-500 text-white rounded-2xl shadow-2xl min-w-[320px] max-w-sm animate-in slide-in-from-top-4">
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-sm text-white overflow-hidden border border-indigo-400">
                {data.callerAvatar ? (
                  <img src={data.callerAvatar} alt={data.callerName} className="w-full h-full object-cover" />
                ) : (
                  data.callerName?.charAt(0)?.toUpperCase() || 'U'
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-950 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-white truncate">{data.callerName}</h4>
              <p className="text-[10px] text-slate-400 font-medium">
                Incoming {data.callType === 'video' ? 'HD Video Call' : 'Voice Call'}...
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  toast.dismiss(t);
                  rejectCallRef.current?.('declined');
                }}
                className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-[11px] font-bold text-white shadow-md transition-colors cursor-pointer"
              >
                Decline
              </button>
              <button
                type="button"
                onClick={() => {
                  toast.dismiss(t);
                  acceptCallRef.current?.();
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-[11px] font-bold text-white shadow-md shadow-emerald-500/20 transition-colors cursor-pointer animate-pulse"
              >
                Answer
              </button>
            </div>
          </div>
        ),
        { id: toastId, duration: 35000 }
      );

      // Auto-decline if ringing for 35 seconds without answer
      if (callTimeoutRef.current) clearTimeout(callTimeoutRef.current);
      callTimeoutRef.current = setTimeout(() => {
        if (callStatusRef.current === 'incoming') {
          stopRingtone();
          socket.emit('call:response', {
            roomId: data.roomId,
            accepted: false,
            reason: 'timeout'
          });
          setIncomingCallData(null);
          setCallStatus('idle');
        }
      }, 35000);
    });

    // Caller: Callee accepted the call
    socket.on('call:accepted', async (data) => {
      stopRingtone();
      if (callTimeoutRef.current) {
        clearTimeout(callTimeoutRef.current);
        callTimeoutRef.current = null;
      }

      // Guard: Only the caller creates the SDP offer
      if (!activeCallSessionRef.current?.isCaller) return;

      setCallStatus('connected');
      toast.success(`${data.calleeName || 'Client'} connected!`);

      // Caller creates and sends SDP Offer
      if (webrtcClientRef.current) {
        try {
          const isAudioOnly = activeCallSessionRef.current?.callType === 'audio';
          const offer = await webrtcClientRef.current.createOffer({ isAudioOnly });
          socket.emit('call:sdp:offer', { roomId: data.roomId, sdp: offer });
        } catch (err) {
          console.error('[WEBRTC_OFFER_ERROR]', err);
        }
      }

      // Start call duration timer
      setCallDuration(0);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    });

    // Caller: Callee rejected the call
    socket.on('call:rejected', (data) => {
      cleanupCall();
      setCallStatus('idle');
      setActiveCallSession(null);
      setIncomingCallData(null);
      toast.error(
        data.reason === 'busy'
          ? 'User is busy on another call.'
          : data.reason === 'timeout'
          ? 'Call timed out (no answer).'
          : 'Call was declined.'
      );
    });

    // Callee: Receives SDP Offer from Caller -> sends SDP Answer
    socket.on('call:sdp:offer', async ({ roomId, sdp }) => {
      if (webrtcClientRef.current) {
        try {
          const answer = await webrtcClientRef.current.handleOfferAndCreateAnswer(sdp);
          socket.emit('call:sdp:answer', { roomId, sdp: answer });

          // Start timer for callee
          setCallDuration(0);
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = setInterval(() => {
            setCallDuration((prev) => prev + 1);
          }, 1000);
        } catch (err) {
          console.error('[WEBRTC_ANSWER_ERROR]', err);
        }
      }
    });

    // Caller: Receives SDP Answer from Callee
    socket.on('call:sdp:answer', async ({ sdp }) => {
      if (webrtcClientRef.current) {
        try {
          await webrtcClientRef.current.handleAnswer(sdp);
        } catch (err) {
          console.error('[WEBRTC_HANDLE_ANSWER_ERROR]', err);
        }
      }
    });

    // Receive ICE Candidates
    socket.on('call:ice:candidate', async ({ candidate }) => {
      if (webrtcClientRef.current) {
        await webrtcClientRef.current.addIceCandidate(candidate);
      }
    });

    // Remote peer toggled audio/video/screen
    socket.on('call:media:toggle', ({ mediaType, enabled }) => {
      if (mediaType === 'audio') {
        toast.info(enabled ? 'Remote user unmuted audio' : 'Remote user muted audio');
      }
    });

    // Call Ended
    socket.on('call:ended', ({ duration }) => {
      const finishedSession = activeCallSessionRef.current;
      const finalDuration = duration || callDurationRef.current;

      cleanupCall();
      setCallStatus('idle');
      setActiveCallSession(null);
      setIncomingCallData(null);

      // Open Post-Call Activity Summary Dialog if there was an active conversation
      if (finishedSession) {
        setPostCallRecord({
          ...finishedSession,
          duration: finalDuration
        });
      }
    });

    return () => {
      socket.off('call:incoming');
      socket.off('call:accepted');
      socket.off('call:rejected');
      socket.off('call:sdp:offer');
      socket.off('call:sdp:answer');
      socket.off('call:ice:candidate');
      socket.off('call:media:toggle');
      socket.off('call:ended');
    };
  }, [socket, cleanupCall, startRingtone, stopRingtone]);

  // 3. User Actions: Start Call
  const startCall = async ({ calleeId, calleeName, calleeAvatar, callType = 'video', clientOrDealInfo = null }) => {
    if (!socket || !socket.connected) {
      toast.error('Socket server is connecting... Please try again in a moment.');
      return;
    }

    try {
      const currentRoomId = `call_${currentUserId}_${calleeId}_${Date.now()}`;

      const rtc = new WebRtcClient({
        onRemoteStream: (stream) => {
          setRemoteStream(stream);
        },
        onIceCandidate: (candidate) => {
          if (socketRef.current && currentRoomId) {
            socketRef.current.emit('call:ice:candidate', { roomId: currentRoomId, candidate });
          }
        },
        onConnectionStateChange: (state) => {
          if (state === 'connected') {
            setCallStatus('connected');
          }
        }
      });

      const stream = await rtc.initLocalMedia({
        audio: true,
        video: callType === 'video'
      });

      setLocalStream(stream);
      webrtcClientRef.current = rtc;

      setActiveCallSession({
        roomId: currentRoomId,
        targetUserId: calleeId,
        targetName: calleeName,
        targetAvatar: calleeAvatar,
        callType,
        isCaller: true,
        clientOrDealInfo
      });

      setCallStatus('calling');
      startRingtone('ringback');

      // 35s calling timeout
      if (callTimeoutRef.current) clearTimeout(callTimeoutRef.current);
      callTimeoutRef.current = setTimeout(() => {
        if (callStatusRef.current === 'calling') {
          toast.info('No answer from user. Call timed out.');
          endCall();
        }
      }, 35000);

      // Dispatch invite via socket
      socket.emit('call:invite', {
        calleeId,
        roomId: currentRoomId,
        callType,
        workspaceId,
        callerInfo: {
          name: currentUserName,
          avatar: currentUserAvatar,
          title: 'Sales Representative'
        }
      });
    } catch (err) {
      toast.error(err.message || 'Could not access camera or microphone.');
      cleanupCall();
      setCallStatus('idle');
    }
  };

  // 4. User Actions: Accept Call
  const acceptCall = async () => {
    if (!incomingCallData || !socket) return;
    const currentIncoming = incomingCallData;
    const targetRoomId = currentIncoming.roomId;

    stopRingtone();
    if (callTimeoutRef.current) {
      clearTimeout(callTimeoutRef.current);
      callTimeoutRef.current = null;
    }

    try {
      const rtc = new WebRtcClient({
        onRemoteStream: (stream) => {
          setRemoteStream(stream);
        },
        onIceCandidate: (candidate) => {
          if (socketRef.current && targetRoomId) {
            socketRef.current.emit('call:ice:candidate', { roomId: targetRoomId, candidate });
          }
        }
      });

      const stream = await rtc.initLocalMedia({
        audio: true,
        video: currentIncoming.callType === 'video'
      });

      setLocalStream(stream);
      webrtcClientRef.current = rtc;

      setActiveCallSession({
        roomId: targetRoomId,
        targetUserId: currentIncoming.callerId,
        targetName: currentIncoming.callerName,
        targetAvatar: currentIncoming.callerAvatar,
        callType: currentIncoming.callType,
        isCaller: false
      });

      setCallStatus('connected');
      setIncomingCallData(null);

      // Send acceptance back to caller
      socket.emit('call:response', {
        roomId: targetRoomId,
        accepted: true
      });
    } catch (err) {
      toast.error(err.message || 'Failed to connect to audio/video devices.');
      rejectCall('declined');
    }
  };

  // 5. User Actions: Reject Call
  const rejectCall = (reason = 'declined') => {
    stopRingtone();
    if (callTimeoutRef.current) {
      clearTimeout(callTimeoutRef.current);
      callTimeoutRef.current = null;
    }
    const roomId = incomingCallData?.roomId || activeCallSessionRef.current?.roomId;
    if (roomId && socket) {
      socket.emit('call:response', {
        roomId,
        accepted: false,
        reason
      });
      socket.emit('call:hangup', {
        roomId,
        duration: 0,
        reason
      });
      socket.emit('call:end', {
        roomId,
        duration: 0,
        reason
      });
    }
    cleanupCall();
    setIncomingCallData(null);
    setCallStatus('idle');
  };

  acceptCallRef.current = acceptCall;
  rejectCallRef.current = rejectCall;

  // 6. User Actions: End Call / Hangup
  const endCall = () => {
    stopRingtone();
    if (callTimeoutRef.current) {
      clearTimeout(callTimeoutRef.current);
      callTimeoutRef.current = null;
    }

    const currentSession = activeCallSessionRef.current;
    const currentIncoming = incomingCallData;
    const roomId = currentSession?.roomId || currentIncoming?.roomId;
    const finalDuration = callDurationRef.current;

    if (roomId && socket) {
      socket.emit('call:hangup', {
        roomId,
        duration: finalDuration
      });
      socket.emit('call:end', {
        roomId,
        duration: finalDuration
      });
      socket.emit('call:response', {
        roomId,
        accepted: false,
        reason: 'declined'
      });
    }

    cleanupCall();
    setCallStatus('idle');
    setActiveCallSession(null);
    setIncomingCallData(null);

    if (currentSession && finalDuration > 0) {
      setPostCallRecord({
        ...currentSession,
        duration: finalDuration
      });
    }
  };

  // 7. Toggle Controls
  const toggleMute = () => {
    if (webrtcClientRef.current) {
      const active = webrtcClientRef.current.toggleAudio();
      setIsMuted(!active);
      if (socket && activeCallSession) {
        socket.emit('call:media:toggle', {
          roomId: activeCallSession.roomId,
          mediaType: 'audio',
          enabled: active
        });
      }
    }
  };

  const toggleCamera = () => {
    if (webrtcClientRef.current) {
      const active = webrtcClientRef.current.toggleVideo();
      setIsCameraOff(!active);
      if (socket && activeCallSession) {
        socket.emit('call:media:toggle', {
          roomId: activeCallSession.roomId,
          mediaType: 'video',
          enabled: active
        });
      }
    }
  };

  const toggleScreenShare = async () => {
    if (webrtcClientRef.current) {
      const res = await webrtcClientRef.current.toggleScreenShare();
      setIsScreenSharing(res.isSharing);
      if (socket && activeCallSession) {
        socket.emit('call:media:toggle', {
          roomId: activeCallSession.roomId,
          mediaType: 'screen',
          enabled: res.isSharing
        });
      }
    }
  };

  const value = {
    socket,
    isConnected,
    connectionStatus,
    transport,
    socketUrl,
    socketConfig: activeConfig,
    latency,
    onlineUsers,
    callStatus,
    activeCallSession,
    isMuted,
    isCameraOff,
    isScreenSharing,
    callDuration,
    localStream,
    remoteStream,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleCamera,
    toggleScreenShare,
    reconnect,
    checkLatency
  };

  return (
    <CrmSocketContext.Provider value={value}>
      {children}

      {/* Incoming Call Voice Ringtone MP3 Audio Player */}
      <audio
        ref={incomingAudioRef}
        src="/tones/call-ring-tone.mp3"
        loop
        preload="auto"
        className="hidden"
      />

      {/* Global Incoming Call Ringing Dialog */}
      <IncomingCallDialog
        isOpen={callStatus === 'incoming' && !!incomingCallData}
        callData={incomingCallData}
        onAccept={acceptCall}
        onDecline={() => rejectCall('declined')}
      />

      {/* Global Active Call & Video Modal (Floating or Fullscreen) */}
      <ActiveCallModal
        isOpen={callStatus === 'calling' || callStatus === 'connected'}
        status={callStatus}
        session={activeCallSession}
        localStream={localStream}
        remoteStream={remoteStream}
        duration={callDuration}
        isMuted={isMuted}
        isCameraOff={isCameraOff}
        isScreenSharing={isScreenSharing}
        onToggleMute={toggleMute}
        onToggleCamera={toggleCamera}
        onToggleScreenShare={toggleScreenShare}
        onHangup={endCall}
      />

      {/* Post-Call Activity Logger Dialog */}
      {postCallRecord && (
        <PostCallSummaryDialog
          isOpen={!!postCallRecord}
          onClose={() => setPostCallRecord(null)}
          workspaceId={workspaceId}
          record={postCallRecord}
        />
      )}
    </CrmSocketContext.Provider>
  );
}

export function useCrmSocket() {
  const context = useContext(CrmSocketContext);
  return context || {};
}
