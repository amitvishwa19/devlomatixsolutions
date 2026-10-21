"use client";

import { useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { X, MessageSquare, Mail } from "lucide-react";
import { useCrmSocket } from "@/providers/CrmSocketProvider";
import { useNotifications } from "@/providers/NotificationProvider";

// Singleton Web Audio Context for zero-lag bell chime
let sharedAudioCtx = null;

function getSharedAudioContext() {
    if (typeof window === 'undefined') return null;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    if (!sharedAudioCtx) {
        sharedAudioCtx = new AudioCtx();
    }
    if (sharedAudioCtx.state === 'suspended') {
        sharedAudioCtx.resume().catch(() => {});
    }
    return sharedAudioCtx;
}

if (typeof window !== 'undefined') {
    const unlockAudio = () => {
        getSharedAudioContext();
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
    };
    window.addEventListener('click', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });
    window.addEventListener('touchstart', unlockAudio, { once: true });
}

function playMessageTone() {
    if (typeof window === 'undefined') return;
    try {
        const ctx = getSharedAudioContext();
        if (!ctx) return;
        if (ctx.state === 'suspended') {
            ctx.resume().catch(() => {});
        }
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Pleasant high-pitch bell chime (880Hz -> 1320Hz)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1320, now + 0.08);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.25, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.36);
    } catch (_) {}
}

// Gentle professional email chime (C5 523Hz -> G5 784Hz)
function playEmailTone() {
    if (typeof window === 'undefined') return;
    try {
        const ctx = getSharedAudioContext();
        if (!ctx) return;
        if (ctx.state === 'suspended') {
            ctx.resume().catch(() => {});
        }
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.09);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.20, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.43);
    } catch (_) {}
}

let titleFlashingInterval = null;
let originalPageTitle = '';

function startTitleFlashing(text) {
    if (typeof document === 'undefined') return;
    if (!originalPageTitle) {
        originalPageTitle = document.title;
    }
    if (titleFlashingInterval) clearInterval(titleFlashingInterval);
    let toggle = false;
    titleFlashingInterval = setInterval(() => {
        document.title = toggle ? text : originalPageTitle;
        toggle = !toggle;
    }, 1200);

    const onFocus = () => {
        if (titleFlashingInterval) {
            clearInterval(titleFlashingInterval);
            titleFlashingInterval = null;
        }
        if (originalPageTitle) {
            document.title = originalPageTitle;
            originalPageTitle = '';
        }
        window.removeEventListener('focus', onFocus);
    };
    window.addEventListener('focus', onFocus);
}

const getPhoneLast10 = (str) => {
    if (!str) return '';
    const digits = String(str).replace(/\D/g, '').split('@')[0];
    return digits.length >= 10 ? digits.slice(-10) : digits;
};

export default function WorkspaceMessageNotifier() {
    const params = useParams();
    const router = useRouter();
    const workspaceId = params?.workspaceId;
    const { socket, isConnected } = useCrmSocket() || {};
    const { addNotification } = useNotifications();

    const workspaceIdRef = useRef(workspaceId);
    workspaceIdRef.current = workspaceId;

    // Auto-request desktop notification permission on mount
    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().catch(() => {});
        }
    }, []);

    useEffect(() => {
        if (!socket || !isConnected) return;

        // 1. Inbound WhatsApp Message Handler
        const handleNewMessage = (data) => {
            if (!data || (workspaceIdRef.current && data.workspaceId && data.workspaceId !== workspaceIdRef.current)) {
                return;
            }

            const incomingMsg = data.message;
            if (!incomingMsg || incomingMsg.fromMe) return;

            const targetJid = data.jid || incomingMsg.jid;
            if (!targetJid) return;

            const targetPhone10 = getPhoneLast10(targetJid);

            // Check if user is currently on the chats page actively viewing this contact
            const activeJid = typeof window !== 'undefined' ? window.__konnectx_active_jid : null;
            const isCurrentlyViewing = activeJid && getPhoneLast10(activeJid) === targetPhone10 && typeof document !== 'undefined' && document.hasFocus();

            // If user is actively reading this conversation right now, don't show an intrusive popup toast
            if (isCurrentlyViewing) {
                return;
            }

            // Play audio alert chime
            playMessageTone();

            // Extract sender name and preview text
            const senderDisplayName = data.senderName || incomingMsg.senderName || `+${targetPhone10}`;
            const messagePreview = incomingMsg.text || incomingMsg.metadata?.caption || (incomingMsg.metadata?.type ? `[${incomingMsg.metadata.type.toUpperCase()}]` : 'New WhatsApp message');

            const currentWsId = workspaceIdRef.current || data.workspaceId;

            // Also record in top navbar notification center
            if (addNotification) {
                addNotification({
                    id: `wa_msg_${incomingMsg.id || incomingMsg.waId || targetPhone10}_${Date.now()}`,
                    type: 'WHATSAPP',
                    title: `WhatsApp: ${senderDisplayName}`,
                    message: messagePreview,
                    link: currentWsId ? `/workspace/${currentWsId}/konnectx/chats?jid=${encodeURIComponent(targetJid)}` : null,
                    metadata: { jid: targetJid, phone: targetPhone10 }
                }, { silent: true });
            }

            // Trigger Sonner Rich Floating Toast Banner across the entire workspace
            toast.custom((t) => (
                <div
                    onClick={() => {
                        if (typeof window !== 'undefined') {
                            window.dispatchEvent(new CustomEvent('konnectx:open-chat', { detail: { jid: targetJid } }));
                        }
                        if (currentWsId) {
                            router.push(`/workspace/${currentWsId}/konnectx/chats?jid=${encodeURIComponent(targetJid)}`);
                        }
                        toast.dismiss(t);
                    }}
                    className="flex items-start gap-3 p-3.5 bg-slate-950/95 dark:bg-card/95 backdrop-blur-md border-2 border-emerald-500/60 text-white rounded-2xl shadow-2xl min-w-[320px] max-w-sm cursor-pointer hover:border-emerald-400 hover:shadow-emerald-500/25 transition-all animate-in slide-in-from-top-4 group"
                >
                    <div className="relative shrink-0 mt-0.5">
                        <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-sm text-white overflow-hidden border border-emerald-400">
                            {(senderDisplayName.replace(/^\+/, '').trim() || 'WA').slice(0, 2).toUpperCase()}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-950 animate-pulse" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                            <h4 className="text-xs font-bold text-white truncate group-hover:text-emerald-400 transition-colors">
                                {senderDisplayName}
                            </h4>
                            <span className="text-[10px] text-slate-400 shrink-0 font-medium">Just now</span>
                        </div>
                        <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                            {messagePreview}
                        </p>
                        <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-emerald-400 font-semibold group-hover:underline">
                            <MessageSquare className="w-3 h-3" /> Click to open chat →
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            toast.dismiss(t);
                        }}
                        className="text-slate-400 hover:text-white p-1 rounded-md shrink-0 opacity-70 hover:opacity-100 transition-opacity"
                        title="Dismiss"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ), {
                duration: 6000,
                id: `ws_msg_toast_${incomingMsg.id || incomingMsg.waId || targetPhone10 || Date.now()}`
            });

            // Native Desktop Notification (when tab is in background)
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted' && document.hidden) {
                try {
                    const notif = new Notification(`WhatsApp: ${senderDisplayName}`, {
                        body: messagePreview,
                        icon: '/fevicon.ico',
                        tag: `wa-msg-${targetPhone10}`
                    });
                    notif.onclick = () => {
                        window.focus();
                        if (typeof window !== 'undefined') {
                            window.dispatchEvent(new CustomEvent('konnectx:open-chat', { detail: { jid: targetJid } }));
                        }
                        if (currentWsId) {
                            router.push(`/workspace/${currentWsId}/konnectx/chats?jid=${encodeURIComponent(targetJid)}`);
                        }
                        notif.close();
                    };
                } catch (_) {}
            }
        };

        // 2. Inbound Email Notification Handler
        const handleNewEmail = (data) => {
            if (!data || (workspaceIdRef.current && data.workspaceId && data.workspaceId !== workspaceIdRef.current)) {
                return;
            }

            const currentWsId = workspaceIdRef.current || data.workspaceId;
            const threadId = data.threadId;
            const senderName = data.contactName || data.fromName || data.fromEmail || data.from || 'New Email';
            const subject = data.subject || '(No Subject)';
            const snippet = data.snippet || 'You received a new email';

            // Check if user is currently on mailbox page actively viewing this specific thread
            const activeThreadId = typeof window !== 'undefined' ? window.__crm_mailbox_active_thread_id : null;
            const isViewingThisThread = activeThreadId && activeThreadId === threadId && typeof document !== 'undefined' && document.hasFocus();

            // Play professional email tone
            playEmailTone();

            // Background tab notification & title flashing
            if (typeof document !== 'undefined' && document.hidden) {
                startTitleFlashing(`✉️ ${senderName}: ${subject.slice(0, 30)}`);
            }

            // Record in Notification Center (Top navbar bell drawer)
            if (addNotification) {
                addNotification({
                    id: `email_${data.messageId || threadId}_${Date.now()}`,
                    type: 'EMAIL',
                    title: `Email: ${senderName}`,
                    message: `${subject} - ${snippet}`,
                    link: currentWsId ? `/workspace/${currentWsId}/crm/mailbox?threadId=${encodeURIComponent(threadId)}` : null,
                    metadata: { threadId, messageId: data.messageId, senderName, subject }
                }, { silent: true });
            }

            // If the user is actively reading this exact thread right now in front of them, skip intrusive toast
            if (isViewingThisThread) {
                return;
            }

            // Trigger Sonner Rich Floating Toast Banner for Inbound Email
            toast.custom((t) => (
                <div
                    onClick={() => {
                        if (currentWsId) {
                            router.push(`/workspace/${currentWsId}/crm/mailbox?threadId=${encodeURIComponent(threadId)}`);
                        }
                        toast.dismiss(t);
                    }}
                    className="flex items-start gap-3 p-3.5 bg-slate-950/95 dark:bg-card/95 backdrop-blur-md border-2 border-blue-500/60 text-white rounded-2xl shadow-2xl min-w-[320px] max-w-sm cursor-pointer hover:border-blue-400 hover:shadow-blue-500/25 transition-all animate-in slide-in-from-top-4 group"
                >
                    <div className="relative shrink-0 mt-0.5">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-sm text-white overflow-hidden border border-blue-400 shadow-sm">
                            <Mail className="w-4 h-4 text-white" />
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-blue-400 rounded-full border-2 border-slate-950 animate-pulse" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                            <h4 className="text-xs font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                                {senderName}
                            </h4>
                            <span className="text-[10px] text-slate-400 shrink-0 font-medium">Just now</span>
                        </div>
                        <p className="text-xs font-semibold text-slate-200 truncate">
                            {subject}
                        </p>
                        <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed mt-0.5">
                            {snippet}
                        </p>
                        <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-blue-400 font-semibold group-hover:underline">
                            <Mail className="w-3 h-3" /> Click to open email →
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            toast.dismiss(t);
                        }}
                        className="text-slate-400 hover:text-white p-1 rounded-md shrink-0 opacity-70 hover:opacity-100 transition-opacity"
                        title="Dismiss"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ), {
                duration: 7000,
                id: `email_toast_${data.messageId || threadId || Date.now()}`
            });

            // Native Desktop Notification (when tab is in background)
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted' && document.hidden) {
                try {
                    const notif = new Notification(`New Email: ${senderName}`, {
                        body: `${subject}\n${snippet}`,
                        icon: '/fevicon.ico',
                        tag: `email-${threadId}`
                    });
                    notif.onclick = () => {
                        window.focus();
                        if (currentWsId) {
                            router.push(`/workspace/${currentWsId}/crm/mailbox?threadId=${encodeURIComponent(threadId)}`);
                        }
                        notif.close();
                    };
                } catch (_) {}
            }
        };

        socket.on('konnectx:cloud:message:new', handleNewMessage);
        socket.on('konnectx:message:new', handleNewMessage);
        socket.on('crm:mailbox:new_email', handleNewEmail);

        return () => {
            socket.off('konnectx:cloud:message:new', handleNewMessage);
            socket.off('konnectx:message:new', handleNewMessage);
            socket.off('crm:mailbox:new_email', handleNewEmail);
        };
    }, [socket, isConnected, router, addNotification]);

    return null;
}
