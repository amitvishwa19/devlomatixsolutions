'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';

import { WebRtcClient } from '@/lib/webrtc/webrtc-client';
import IncomingCallDialog from '@/app/workspace/[workspaceId]/crm/_components/call/IncomingCallDialog';
import ActiveCallModal from '@/app/workspace/[workspaceId]/crm/_components/call/ActiveCallModal';
import PostCallSummaryDialog from '@/app/workspace/[workspaceId]/crm/_components/call/PostCallSummaryDialog';

const CrmSocketContext = createContext(null);

const getSocketUrl = () => {
  if (process.env.NEXT_PUBLIC_SOCKET_SERVER_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_SERVER_URL;
  }
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:5001';
  }
  return 'https://socket.devlomatix.in';
};

export function CrmSocketProvider({ children }) {
  const { data: session } = useSession();
  const params = useParams();
  const workspaceId = params?.workspaceId;

  const currentUserId = session?.user?.userId || session?.user?.id;
  const currentUserName = session?.user?.displayName || session?.user?.name || 'Sales Rep';
  const currentUserAvatar = session?.user?.avatar || session?.user?.image || null;

  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);

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

  // 1. Connect Socket
  useEffect(() => {
    if (!currentUserId || !workspaceId) return;

    const socketUrl = getSocketUrl();
    const s = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000
    });

    s.on('connect', () => {
      setIsConnected(true);
      console.log(`[CRM_SOCKET] Connected to ${socketUrl} (ID: ${s.id})`);

      // Register presence in workspace
      s.emit('user:join', {
        userId: currentUserId,
        workspaceId,
        userName: currentUserName,
        avatar: currentUserAvatar
      });
    });

    s.on('disconnect', () => {
      setIsConnected(false);
      console.log('[CRM_SOCKET] Disconnected from server');
    });

    s.on('presence:sync', (users) => {
      setOnlineUsers(users.filter((u) => u.userId !== currentUserId));
    });

    socketRef.current = s;
    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [currentUserId, workspaceId, currentUserName, currentUserAvatar]);

  // Helper to cleanup WebRTC
  const cleanupCall = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (webrtcClientRef.current) {
      webrtcClientRef.current.cleanup();
      webrtcClientRef.current = null;
    }
    setLocalStream(null);
    setRemoteStream(null);
    setIsMuted(false);
    setIsCameraOff(false);
    setIsScreenSharing(false);
  }, []);

  // 2. Setup WebRTC Signaling Listeners
  useEffect(() => {
    if (!socket) return;

    // Incoming Call Ring
    socket.on('call:incoming', (data) => {
      if (callStatus !== 'idle') {
        // Automatically respond busy if already on a call
        socket.emit('call:response', { roomId: data.roomId, accepted: false, reason: 'busy' });
        return;
      }

      setIncomingCallData(data);
      setCallStatus('incoming');
    });

    // Caller: Callee accepted the call
    socket.on('call:accepted', async (data) => {
      setCallStatus('connected');
      toast.success(`${data.calleeName || 'Client'} connected!`);

      // Caller creates and sends SDP Offer
      if (webrtcClientRef.current) {
        try {
          const offer = await webrtcClientRef.current.createOffer();
          socket.emit('call:sdp:offer', { roomId: data.roomId, sdp: offer });
        } catch (err) {
          console.error('[WEBRTC_OFFER_ERROR]', err);
        }
      }

      // Start call duration timer
      setCallDuration(0);
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    });

    // Caller: Callee rejected the call
    socket.on('call:rejected', (data) => {
      cleanupCall();
      setCallStatus('idle');
      setActiveCallSession(null);
      toast.error(data.reason === 'busy' ? 'User is busy on another call.' : 'Call was declined.');
    });

    // Callee: Receives SDP Offer from Caller -> sends SDP Answer
    socket.on('call:sdp:offer', async ({ roomId, sdp }) => {
      if (webrtcClientRef.current) {
        try {
          const answer = await webrtcClientRef.current.handleOfferAndCreateAnswer(sdp);
          socket.emit('call:sdp:answer', { roomId, sdp: answer });

          // Start timer for callee
          setCallDuration(0);
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
      const finishedSession = activeCallSession;
      const finalDuration = duration || callDuration;

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
  }, [socket, callStatus, activeCallSession, callDuration, cleanupCall]);

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

      // Dispatch invite via socket
      socket.emit('call:invite', {
        calleeId,
        roomId: currentRoomId,
        callType,
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

    try {
      const rtc = new WebRtcClient({
        onRemoteStream: (stream) => {
          setRemoteStream(stream);
        },
        onIceCandidate: (candidate) => {
          if (socketRef.current && incomingCallData.roomId) {
            socketRef.current.emit('call:ice:candidate', { roomId: incomingCallData.roomId, candidate });
          }
        }
      });

      const stream = await rtc.initLocalMedia({
        audio: true,
        video: incomingCallData.callType === 'video'
      });

      setLocalStream(stream);
      webrtcClientRef.current = rtc;

      setActiveCallSession({
        roomId: incomingCallData.roomId,
        targetUserId: incomingCallData.callerId,
        targetName: incomingCallData.callerName,
        targetAvatar: incomingCallData.callerAvatar,
        callType: incomingCallData.callType,
        isCaller: false
      });

      setCallStatus('connected');

      // Send acceptance back to caller
      socket.emit('call:response', {
        roomId: incomingCallData.roomId,
        accepted: true
      });

      setIncomingCallData(null);
    } catch (err) {
      toast.error('Failed to connect to audio/video devices.');
      rejectCall();
    }
  };

  // 5. User Actions: Reject Call
  const rejectCall = (reason = 'declined') => {
    if (incomingCallData && socket) {
      socket.emit('call:response', {
        roomId: incomingCallData.roomId,
        accepted: false,
        reason
      });
    }
    setIncomingCallData(null);
    setCallStatus('idle');
  };

  // 6. User Actions: End Call / Hangup
  const endCall = () => {
    if (activeCallSession && socket) {
      socket.emit('call:hangup', {
        roomId: activeCallSession.roomId,
        duration: callDuration
      });
    }

    const finished = activeCallSession;
    const finalDuration = callDuration;

    cleanupCall();
    setCallStatus('idle');
    setActiveCallSession(null);
    setIncomingCallData(null);

    if (finished) {
      setPostCallRecord({
        ...finished,
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
    toggleScreenShare
  };

  return (
    <CrmSocketContext.Provider value={value}>
      {children}

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
  if (!context) {
    throw new Error('useCrmSocket must be used within CrmSocketProvider');
  }
  return context;
}
