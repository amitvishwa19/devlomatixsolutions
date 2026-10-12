'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  ScreenShare,
  Maximize2,
  Minimize2,
  User,
  Shield,
  Clock,
  Disc,
  Radio
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ActiveCallModal({
  isOpen,
  status, // 'calling' | 'connected'
  session,
  localStream,
  remoteStream,
  duration = 0,
  isMuted = false,
  isCameraOff = false,
  isScreenSharing = false,
  onToggleMute,
  onToggleCamera,
  onToggleScreenShare,
  onHangup
}) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recSeconds, setRecSeconds] = useState(0);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const recIntervalRef = useRef(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);

  const toggleRecording = () => {
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (recIntervalRef.current) clearInterval(recIntervalRef.current);
      setIsRecording(false);
    } else {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const audioCtx = new AudioCtx();
        const destination = audioCtx.createMediaStreamDestination();

        if (localStream && localStream.getAudioTracks().length > 0) {
          const localSrc = audioCtx.createMediaStreamSource(localStream);
          localSrc.connect(destination);
        }
        if (remoteStream && remoteStream.getAudioTracks().length > 0) {
          const remoteSrc = audioCtx.createMediaStreamSource(remoteStream);
          remoteSrc.connect(destination);
        }

        chunksRef.current = [];
        const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg';
        const recorder = new MediaRecorder(destination.stream, { mimeType });

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
        };

        recorder.start(1000);
        mediaRecorderRef.current = recorder;
        setIsRecording(true);
        setRecSeconds(0);
        recIntervalRef.current = setInterval(() => setRecSeconds(s => s + 1), 1000);
      } catch (err) {
        console.warn('[AUDIO_REC_ERR]', err);
      }
    }
  };

  const handleHangupWithRecordingCleanup = () => {
    if (isRecording && mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch {}
    }
    if (recIntervalRef.current) clearInterval(recIntervalRef.current);
    setIsRecording(false);
    onHangup();
  };

  // Attach local stream to video element
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, isOpen, isCameraOff]);

  // Attach remote stream to video element
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, isOpen]);

  // Always attach remote stream to audio element so voice call audio ALWAYS plays
  useEffect(() => {
    if (remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
      remoteAudioRef.current.play().catch((err) => {
        console.warn('[REMOTE_AUDIO_PLAY_WARN]', err);
      });
    }
  }, [remoteStream, isOpen]);

  if (!isOpen || !session) return null;

  const isVideo = session.callType === 'video';

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${remSecs < 10 ? '0' : ''}${remSecs}`;
  };

  return (
    <>
      {/* Remote audio player mounted persistently to ensure voice audio plays in both minimized and fullscreen modes */}
      <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />

      {/* Minimized Picture-in-Picture Floating Bar */}
      {isMinimized ? (
        <div className="fixed bottom-6 right-6 z-50 p-3 bg-card/95 backdrop-blur-md border border-border/80 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <div className="relative">
            <Avatar className="w-10 h-10 border border-primary/30">
              <AvatarImage src={session.targetAvatar} />
              <AvatarFallback className="font-bold text-xs bg-indigo-600 text-white">
                {session.targetName?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background animate-pulse" />
          </div>

          <div>
            <h4 className="text-xs font-bold text-foreground line-clamp-1">{session.targetName}</h4>
            <p className="text-[10px] text-muted-foreground font-mono">
              {status === 'calling' ? 'Calling...' : formatTime(duration)}
            </p>
          </div>

          <div className="flex items-center gap-1.5 ml-2">
            <Button
              size="icon"
              variant={isMuted ? "destructive" : "secondary"}
              onClick={onToggleMute}
              className="h-8 w-8 rounded-full"
            >
              {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            </Button>

            <Button
              size="icon"
              variant="destructive"
              onClick={onHangup}
              className="h-8 w-8 rounded-full"
            >
              <PhoneOff className="w-3.5 h-3.5" />
            </Button>

            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsMinimized(false)}
              className="h-8 w-8 rounded-full"
            >
              <Maximize2 className="w-3.5 h-3.5 text-muted-foreground" />
            </Button>
          </div>
        </div>
      ) : (
        /* Full Call Window Modal */
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in-50">
          <div className="relative w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[80vh] max-h-[700px]">
        {/* Top Header Bar */}
        <div className="absolute top-0 inset-x-0 z-20 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border border-white/20">
              <AvatarImage src={session.targetAvatar} />
              <AvatarFallback className="font-bold bg-indigo-600 text-white">
                {session.targetName?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                {session.targetName}
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Shield className="w-2.5 h-2.5" /> WebRTC P2P Encrypted
                </span>
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Clock className="w-3 h-3 text-slate-400" />
                <span className="font-mono font-semibold">
                  {status === 'calling' ? 'Ringing...' : formatTime(duration)}
                </span>
                {isRecording && (
                  <span className="text-[10px] bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5 animate-pulse ml-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> REC {formatTime(recSeconds)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsMinimized(true)}
            className="h-8 w-8 rounded-full text-white/80 hover:text-white hover:bg-white/10"
            title="Minimize to Floating Bar"
          >
            <Minimize2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Center Media Feed Canvas */}
        <div className="relative flex-1 w-full bg-slate-900 flex items-center justify-center overflow-hidden">

          {/* Remote Video Stream (Main Feed for HD Video Calls) */}
          {isVideo && remoteStream && !isCameraOff ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="relative">
                {/* Concentric Audio Pulse Rings */}
                <div className={`absolute -inset-4 rounded-full border border-indigo-500/20 ${status === 'connected' ? 'animate-ping duration-1000' : ''}`} />
                <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-indigo-600/30 via-violet-600/20 to-blue-600/30 border-2 border-indigo-500/50 flex items-center justify-center shadow-2xl">
                  <Avatar className="w-24 h-24 border-2 border-white/20">
                    <AvatarImage src={session.targetAvatar} />
                    <AvatarFallback className="text-3xl font-bold bg-gradient-to-tr from-indigo-600 to-violet-600 text-white">
                      {session.targetName?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>

              <div>
                <h4 className="text-xl font-bold text-white tracking-tight">{session.targetName}</h4>
                <p className="text-xs text-indigo-400 font-medium mt-1">
                  {status === 'calling'
                    ? 'Calling / Ringing...'
                    : '🟢 Voice Call Active • P2P Audio Connected'}
                </p>

                {/* Animated Audio Equalizer Bars when connected */}
                {status === 'connected' && (
                  <div className="flex items-center justify-center gap-1 mt-3">
                    <span className="w-1 h-3 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.1s]" />
                    <span className="w-1 h-5 bg-violet-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1 h-4 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                    <span className="w-1 h-6 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                    <span className="w-1 h-3 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Local Camera Pip (Self Preview only for Video Calls) */}
          {isVideo && (
            <div className="absolute bottom-20 right-4 z-10 w-36 sm:w-48 aspect-video bg-black/80 rounded-2xl overflow-hidden border border-white/20 shadow-xl">
              {!isCameraOff && localStream ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform -scale-x-100"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-1 bg-slate-900">
                  <VideoOff className="w-5 h-5 text-slate-500" />
                  <span className="text-[10px] font-medium">Camera Off</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Call Control Action Toolbar */}
        <div className="p-4 bg-slate-950/95 border-t border-slate-800/80 flex items-center justify-center gap-3 sm:gap-4">
          {/* Mute Button */}
          <Button
            size="icon"
            variant={isMuted ? "destructive" : "secondary"}
            onClick={onToggleMute}
            className="w-12 h-12 rounded-full shadow-md"
            title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </Button>

          {/* Camera Button */}
          {isVideo && (
            <Button
              size="icon"
              variant={isCameraOff ? "destructive" : "secondary"}
              onClick={onToggleCamera}
              className="w-12 h-12 rounded-full shadow-md"
              title={isCameraOff ? "Turn On Camera" : "Turn Off Camera"}
            >
              {isCameraOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </Button>
          )}

          {/* Screen Share Button */}
          <Button
            size="icon"
            variant={isScreenSharing ? "default" : "secondary"}
            onClick={onToggleScreenShare}
            className={`w-12 h-12 rounded-full shadow-md ${isScreenSharing ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : ''}`}
            title={isScreenSharing ? "Stop Screen Share" : "Share Screen"}
          >
            <ScreenShare className="w-5 h-5" />
          </Button>

          {/* Record Audio Button */}
          <Button
            size="icon"
            variant={isRecording ? "destructive" : "secondary"}
            onClick={toggleRecording}
            className={`w-12 h-12 rounded-full shadow-md ${isRecording ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse' : 'hover:text-rose-500'}`}
            title={isRecording ? "Stop Recording" : "Record Call Audio (AI Meeting Notes)"}
          >
            <Disc className={`w-5 h-5 ${isRecording ? 'animate-spin' : ''}`} />
          </Button>

          {/* Hangup / End Call Button */}
          <Button
            size="icon"
            variant="destructive"
            onClick={handleHangupWithRecordingCleanup}
            className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-700 shadow-xl shadow-rose-600/30"
            title="End Call"
          >
            <PhoneOff className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </div>
      )}
    </>
  );
}
