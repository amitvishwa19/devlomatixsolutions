'use client';

import React, { useState, useEffect } from 'react';
import { Copy, Check, Volume2, Square, Sparkles } from 'lucide-react';

export function CopyScriptButton({ text, label = "Copy Pitch Script" }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  return (
    <button
      onClick={handleCopy}
      type="button"
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white/5 hover:bg-white/10 text-cyan-300 border border-white/10 hover:border-cyan-500/40 transition-all shrink-0 active:scale-95"
      title="Copy this script to clipboard"
    >
      {copied ? (
        <>
          <Check size={13} className="text-emerald-400" />
          <span className="text-emerald-400">Copied!</span>
        </>
      ) : (
        <>
          <Copy size={13} />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}

export function AudioSpeechButton({ text, label = "Listen to Pitch" }) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const handleEnd = () => setIsSpeaking(false);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // reset on unmount
    }
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleToggleSpeak = (e) => {
    e.stopPropagation();
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95; // slightly slower, clear conversational pace
      utterance.pitch = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      // Prefer a natural English voice if available
      const voices = window.speechSynthesis.getVoices();
      const naturalVoice = voices.find(v => (v.name.includes('Natural') || v.name.includes('Google') || v.lang.startsWith('en')) && !v.name.includes('Zira'));
      if (naturalVoice) utterance.voice = naturalVoice;

      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  return (
    <button
      onClick={handleToggleSpeak}
      type="button"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 active:scale-95 border ${
        isSpeaking
          ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)] animate-pulse'
          : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10 hover:border-cyan-500/40'
      }`}
      title={isSpeaking ? "Stop Voice Demo" : "Listen to sample pitch audio"}
    >
      {isSpeaking ? (
        <>
          <Square size={12} className="text-cyan-400 fill-cyan-400" />
          <span>Stop Audio</span>
        </>
      ) : (
        <>
          <Volume2 size={13} className="text-cyan-400" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
