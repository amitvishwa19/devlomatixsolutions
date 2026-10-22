'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
    MessageSquare,
    Phone,
    Video,
    ScreenShare,
    Search,
    Send,
    Paperclip,
    Smile,
    MoreVertical,
    User,
    Building2,
    CheckCheck,
    Clock,
    Sparkles,
    Wifi,
    WifiOff,
    Shield,
    PhoneCall,
    PhoneMissed,
    PhoneOff,
    PhoneIncoming,
    PhoneOutgoing,
    Loader2,
    MessageCircle,
    UserCheck
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';

import { useCrmSocket } from '@/providers/CrmSocketProvider';
import { getCrmContactsAction } from '../_actions/contact-actions';
import { getCrmTeamMembersAction } from '../_actions/team-actions';
import { getCrmCandidatesAction } from '../_actions/candidate-query-actions';
import CrmWhatsAppOutreachSheet from '../_components/CrmWhatsAppOutreachSheet';
import { ScrollArea } from '@/components/ui/scroll-area';

const parseCallLog = (text, attachments) => {
    const fromAttachment = Array.isArray(attachments)
        ? attachments.find((a) => a?.type === 'call_log')
        : attachments?.type === 'call_log'
            ? attachments
            : null;

    if (fromAttachment) return fromAttachment;

    if (!text || typeof text !== 'string') return null;
    const isCallMsg = text.startsWith('📞') || text.startsWith('📹') || text.includes('Voice Call') || text.includes('Video Call');
    if (!isCallMsg) return null;

    const isVideo = text.includes('Video') || text.includes('📹');
    let callStatus = 'completed';
    if (text.toLowerCase().includes('missed')) callStatus = 'missed';
    else if (text.toLowerCase().includes('declined')) callStatus = 'declined';
    else if (text.toLowerCase().includes('busy')) callStatus = 'busy';

    let duration = 0;
    const matchMins = text.match(/(\d+)m/);
    const matchSecs = text.match(/(\d+)s/);
    if (matchMins) duration += parseInt(matchMins[1], 10) * 60;
    if (matchSecs) duration += parseInt(matchSecs[1], 10);

    return {
        type: 'call_log',
        callType: isVideo ? 'video' : 'audio',
        callStatus,
        duration
    };
};

const formatCallDuration = (secs) => {
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return mins > 0 ? `${mins}m ${remSecs}s` : `${remSecs}s`;
};

export default function CrmChatPage() {
    const params = useParams();
    const workspaceId = params?.workspaceId;
    const { data: session } = useSession();

    const currentUserId = session?.user?.userId || session?.user?.id;
    const currentUserEmail = session?.user?.email;
    const currentUserName = session?.user?.displayName || session?.user?.name || 'Sales Rep';

    const {
        socket,
        isConnected,
        onlineUsers,
        startCall
    } = useCrmSocket();

    const [activeTab, setActiveTab] = useState('team'); // 'team' | 'contacts' | 'candidates'
    const [teamMembers, setTeamMembers] = useState([]);
    const [loadingTeam, setLoadingTeam] = useState(true);
    const [contacts, setContacts] = useState([]);
    const [loadingContacts, setLoadingContacts] = useState(true);
    const [candidates, setCandidates] = useState([]);
    const [loadingCandidates, setLoadingCandidates] = useState(true);
    const [isWaSheetOpen, setIsWaSheetOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeChatUser, setActiveChatUser] = useState(null);

    // Chat Messages State: roomId -> Array<Message>
    const [messages, setMessages] = useState({});
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [remoteTyping, setRemoteTyping] = useState(null);

    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // 1. Fetch Real Team Members from Database (Unified with Org Builder via /api/v5/crm/team)
    useEffect(() => {
        async function loadTeamMembers() {
            if (!workspaceId) return;
            setLoadingTeam(true);
            try {
                // Fetch directly from CRM Team REST API (same endpoint verified on mobile)
                const apiRes = await fetch(`/api/v5/crm/team?workspaceId=${workspaceId}`);
                if (apiRes.ok) {
                    const json = await apiRes.json();
                    if (json.success && Array.isArray(json.data)) {
                        setTeamMembers(json.data);
                        return;
                    }
                }

                // Fallback to Server Action if needed
                const res = await getCrmTeamMembersAction(workspaceId);
                if (res.success && res.data) {
                    setTeamMembers(res.data);
                }
            } catch (err) {
                console.warn('Failed to load team members via API, trying action:', err);
                try {
                    const res = await getCrmTeamMembersAction(workspaceId);
                    if (res.success && res.data) {
                        setTeamMembers(res.data);
                    }
                } catch (actionErr) {
                    console.warn('Action fallback also failed:', actionErr);
                }
            } finally {
                setLoadingTeam(false);
            }
        }
        loadTeamMembers();
    }, [workspaceId]);

    // 2. Fetch CRM Contacts
    useEffect(() => {
        async function loadContacts() {
            if (!workspaceId) return;
            setLoadingContacts(true);
            try {
                const res = await getCrmContactsAction(workspaceId);
                if (res.success && res.data) {
                    setContacts(res.data);
                }
            } catch (err) {
                console.warn('Failed to load contacts for chat:', err);
            } finally {
                setLoadingContacts(false);
            }
        }
        loadContacts();
    }, [workspaceId]);

    // 3. Fetch Applied Candidates from HireFlow (read-only query)
    useEffect(() => {
        async function loadCandidates() {
            if (!workspaceId) return;
            setLoadingCandidates(true);
            try {
                const res = await getCrmCandidatesAction(workspaceId);
                if (res.success && res.data?.candidates) {
                    setCandidates(res.data.candidates);
                }
            } catch (err) {
                console.warn('Failed to load candidates for chat:', err);
            } finally {
                setLoadingCandidates(false);
            }
        }
        loadCandidates();
    }, [workspaceId]);

    // Team members excluding current user's own id and email
    const otherTeamMembers = React.useMemo(() => {
        return teamMembers.filter((member) => {
            if (currentUserId && member.id === currentUserId) return false;
            if (currentUserEmail && member.email && member.email.toLowerCase() === currentUserEmail.toLowerCase()) return false;
            return true;
        });
    }, [teamMembers, currentUserId, currentUserEmail]);

    // 3. Set default active chat user if none is selected or if activeChatUser is self
    useEffect(() => {
        const isSelf = activeChatUser && (
            (currentUserId && activeChatUser.id === currentUserId) ||
            (currentUserEmail && activeChatUser.email && activeChatUser.email.toLowerCase() === currentUserEmail.toLowerCase())
        );

        if ((!activeChatUser || isSelf) && otherTeamMembers.length > 0) {
            setActiveChatUser({ ...otherTeamMembers[0], type: 'team' });
        }
    }, [otherTeamMembers, activeChatUser, currentUserId, currentUserEmail]);

    // Filter lists by search query
    const filteredTeamMembers = otherTeamMembers.filter((member) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            member.name?.toLowerCase().includes(q) ||
            member.email?.toLowerCase().includes(q) ||
            member.title?.toLowerCase().includes(q) ||
            member.department?.toLowerCase().includes(q)
        );
    });

    const filteredContacts = contacts.filter((c) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            c.name?.toLowerCase().includes(q) ||
            c.email?.toLowerCase().includes(q) ||
            c.title?.toLowerCase().includes(q) ||
            c.account?.name?.toLowerCase().includes(q) ||
            c.phone?.includes(q)
        );
    });

    const filteredCandidates = candidates.filter((c) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            c.name?.toLowerCase().includes(q) ||
            c.email?.toLowerCase().includes(q) ||
            c.jobTitle?.toLowerCase().includes(q) ||
            c.phone?.includes(q)
        );
    });

    // 2. Compute Active Room ID
    const getRoomId = (targetId) => {
        if (!targetId || !currentUserId) return 'general';
        return [currentUserId, targetId].sort().join('_');
    };

    const currentRoomId = activeChatUser ? getRoomId(activeChatUser.id) : 'general';

    // 3. Socket Message, History & Typing Listeners
    useEffect(() => {
        if (!socket) return;

        // Join active chat room and request history
        socket.emit('chat:room:join', { roomId: currentRoomId });
        socket.emit('chat:history:get', { roomId: currentRoomId });

        const handleRoomHistory = (data) => {
            if (data?.roomId && Array.isArray(data.messages)) {
                setMessages((prev) => {
                    const existing = prev[data.roomId] || [];
                    const messageMap = new Map();
                    // Load server messages
                    data.messages.forEach((m) => messageMap.set(m.id, m));
                    // Retain pending optimistic local messages not yet in history
                    existing.forEach((m) => {
                        const key = m.clientMessageId || m.id;
                        if (!messageMap.has(m.id) && !messageMap.has(key)) {
                            messageMap.set(key, m);
                        }
                    });
                    const merged = Array.from(messageMap.values()).sort(
                        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
                    );
                    return {
                        ...prev,
                        [data.roomId]: merged
                    };
                });
            }
        };

        const handleMessageReceive = (msg) => {
            if (!msg?.roomId) return;
            setMessages((prev) => {
                const roomMsgs = prev[msg.roomId] || [];
                // Deduplicate by message ID or clientMessageId
                const exists = roomMsgs.some(
                    (m) => m.id === msg.id || (m.clientMessageId && m.clientMessageId === msg.clientMessageId)
                );
                if (exists) return prev;

                return {
                    ...prev,
                    [msg.roomId]: [...roomMsgs, msg]
                };
            });
        };

        const handleMessageAck = (ack) => {
            if (!ack?.roomId || !ack?.clientMessageId) return;
            setMessages((prev) => {
                const roomMsgs = prev[ack.roomId] || [];
                return {
                    ...prev,
                    [ack.roomId]: roomMsgs.map((m) => {
                        if (m.id === ack.clientMessageId || m.clientMessageId === ack.clientMessageId) {
                            return { ...m, id: ack.serverId || m.id, delivered: true, status: 'sent' };
                        }
                        return m;
                    })
                };
            });
        };

        const handleTyping = (data) => {
            if (data.userId !== currentUserId) {
                setRemoteTyping(data.isTyping ? data.userName : null);
            }
        };

        socket.on('chat:room:history', handleRoomHistory);
        socket.on('chat:message:receive', handleMessageReceive);
        socket.on('chat:message:ack', handleMessageAck);
        socket.on('chat:typing', handleTyping);

        return () => {
            socket.emit('chat:room:leave', { roomId: currentRoomId });
            socket.off('chat:room:history', handleRoomHistory);
            socket.off('chat:message:receive', handleMessageReceive);
            socket.off('chat:message:ack', handleMessageAck);
            socket.off('chat:typing', handleTyping);
        };
    }, [socket, currentRoomId, currentUserId]);

    // Scroll to bottom on new message or history change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, currentRoomId]);

    // 4. Send Message Handler
    const handleSendMessage = (e) => {
        e?.preventDefault();
        if (!inputMessage.trim() || !activeChatUser || !socket) return;

        const msgText = inputMessage.trim();
        const clientMsgId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

        const newMsg = {
            id: clientMsgId,
            clientMessageId: clientMsgId,
            roomId: currentRoomId,
            recipientId: activeChatUser.id,
            senderId: currentUserId,
            senderName: currentUserName,
            message: msgText,
            timestamp: new Date().toISOString(),
            delivered: false
        };

        // Optimistically update UI
        setMessages((prev) => ({
            ...prev,
            [currentRoomId]: [...(prev[currentRoomId] || []), newMsg]
        }));

        // Emit via socket
        socket.emit('chat:message:send', {
            clientMessageId: clientMsgId,
            roomId: currentRoomId,
            recipientId: activeChatUser.id,
            workspaceId,
            message: msgText,
            senderId: currentUserId,
            senderName: currentUserName
        });

        setInputMessage('');

        // Clear typing indicator
        socket.emit('chat:typing', {
            roomId: currentRoomId,
            recipientId: activeChatUser.id,
            isTyping: false
        });
    };

    // Typing change handler
    const handleInputChange = (e) => {
        setInputMessage(e.target.value);

        if (socket && activeChatUser) {
            socket.emit('chat:typing', {
                roomId: currentRoomId,
                recipientId: activeChatUser.id,
                isTyping: true
            });

            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                socket.emit('chat:typing', {
                    roomId: currentRoomId,
                    recipientId: activeChatUser.id,
                    isTyping: false
                });
            }, 2000);
        }
    };

    // Call Triggers
    const handleStartVoiceCall = () => {
        if (!activeChatUser || activeChatUser.id === currentUserId) return;
        startCall({
            calleeId: activeChatUser.id,
            calleeName: activeChatUser.name,
            calleeAvatar: activeChatUser.avatar,
            callType: 'audio'
        });
    };

    const handleStartVideoCall = () => {
        if (!activeChatUser || activeChatUser.id === currentUserId) return;
        startCall({
            calleeId: activeChatUser.id,
            calleeName: activeChatUser.name,
            calleeAvatar: activeChatUser.avatar,
            callType: 'video'
        });
    };

    const isUserOnline = (userId) => {
        if (userId === currentUserId) return isConnected;
        return onlineUsers.some((u) => u.userId === userId);
    };

    const currentChatMessages = messages[currentRoomId] || [];

    return (
        <div className="flex h-[91vh] w-full  overflow-hidden ">


            {/* LEFT COLUMN: CONTACTS & TEAM SIDEBAR */}
            <div className="w-80 border-r border-border flex flex-col h-full bg-muted/20 shrink-0 overflow-hidden min-h-0 p-2">
                {/* Header & Status */}
                <div className="p-3.5 border-b border-border shrink-0">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-primary" />
                            Communication Hub
                        </h2>
                        <Badge
                            variant="outline"
                            className={`text-[10px] gap-1 px-1.5 py-0.5 ${isConnected
                                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                                : 'bg-rose-500/10 text-rose-600 border-rose-500/30'
                                }`}
                        >
                            {isConnected ? <Wifi className="w-2.5 h-2.5" /> : <WifiOff className="w-2.5 h-2.5" />}
                            {isConnected ? 'Socket Live' : 'Connecting'}
                        </Badge>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid grid-cols-3 h-8">
                            <TabsTrigger value="team" className="text-xs">
                                Team ({otherTeamMembers.length})
                            </TabsTrigger>
                            <TabsTrigger value="contacts" className="text-xs">
                                Contacts ({contacts.length})
                            </TabsTrigger>
                            <TabsTrigger value="candidates" className="text-xs">
                                Candidates ({candidates.length})
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <div className="relative mt-2.5">
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search conversations..."
                            className="h-8 pl-8 text-xs bg-background"
                        />
                    </div>
                </div>

                {/* User / Contact / Candidate List */}
                <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1">
                    {activeTab === 'team' ? (
                        loadingTeam ? (
                            <div className="flex flex-col items-center justify-center p-6 text-muted-foreground gap-2">
                                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                <span className="text-xs">Loading sales team...</span>
                            </div>
                        ) : filteredTeamMembers.length === 0 ? (
                            <div className="p-6 text-center text-xs text-muted-foreground flex flex-col items-center gap-1.5">
                                <Building2 className="w-8 h-8 text-muted-foreground/40 mb-1" />
                                <span className="font-semibold text-foreground">
                                    {teamMembers.length === 0 ? 'No Org Members Assigned' : 'No matching team members'}
                                </span>
                                <span className="text-[11px] max-w-[200px] leading-relaxed">
                                    {teamMembers.length === 0
                                        ? 'Assign team members to roles in Settings > Org Builder to chat with them here.'
                                        : `No members matching "${searchQuery}"`}
                                </span>
                            </div>
                        ) : (
                            filteredTeamMembers.map((member) => {
                                const online = isUserOnline(member.id);
                                const active = activeChatUser?.id === member.id;

                                return (
                                    <button
                                        key={member.id}
                                        onClick={() => setActiveChatUser({ ...member, type: 'team' })}
                                        className={`w-full p-2.5 rounded-xl text-left flex items-center gap-3 transition-all cursor-pointer ${active
                                            ? 'bg-primary text-primary-foreground shadow-sm'
                                            : 'hover:bg-muted/80 text-foreground'
                                            }`}
                                    >
                                        <div className="relative">
                                            <Avatar className="w-9 h-9">
                                                <AvatarImage src={member.avatar} />
                                                <AvatarFallback className={`text-xs font-bold ${active ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-indigo-600 text-white'}`}>
                                                    {member.name.charAt(0)?.toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div
                                                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 ${active ? 'border-primary' : 'border-card'
                                                    } ${online ? 'bg-emerald-500' : 'bg-slate-400'}`}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-1">
                                                <h4 className="text-xs font-bold truncate">{member.name}</h4>
                                                {member.department && (
                                                    <span
                                                        className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${active
                                                            ? 'bg-primary-foreground/20 text-primary-foreground'
                                                            : 'bg-muted text-muted-foreground border border-border/50'
                                                            }`}
                                                    >
                                                        {member.department}
                                                    </span>
                                                )}
                                            </div>
                                            <p className={`text-[11px] truncate ${active ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                                                {member.title || member.email}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })
                        )
                    ) : activeTab === 'contacts' ? (
                        loadingContacts ? (
                            <div className="flex flex-col items-center justify-center p-6 text-muted-foreground gap-2">
                                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                <span className="text-xs">Loading contacts...</span>
                            </div>
                        ) : filteredContacts.length === 0 ? (
                            <div className="p-6 text-center text-xs text-muted-foreground">
                                No contacts found
                            </div>
                        ) : (
                            filteredContacts.map((c) => {
                                const active = activeChatUser?.id === c.id;

                                return (
                                    <button
                                        key={c.id}
                                        onClick={() =>
                                            setActiveChatUser({
                                                id: c.id,
                                                name: c.name,
                                                avatar: null,
                                                title: c.title || 'Client Contact',
                                                company: c.account?.name || 'Direct Client',
                                                phone: c.phone,
                                                type: 'contact'
                                            })
                                        }
                                        className={`w-full p-2.5 rounded-xl text-left flex items-center gap-3 transition-all cursor-pointer ${active
                                            ? 'bg-primary text-primary-foreground shadow-sm'
                                            : 'hover:bg-muted/80 text-foreground'
                                            }`}
                                    >
                                        <div className="relative">
                                            <Avatar className="w-9 h-9">
                                                <AvatarFallback className={`text-xs font-bold ${active ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-emerald-600 text-white'}`}>
                                                    {c.name.charAt(0)?.toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-xs font-bold truncate">{c.name}</h4>
                                            </div>
                                            <p className={`text-[11px] truncate ${active ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                                                {c.account?.name || c.phone || 'Direct Client'}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })
                        )
                    ) : (
                        loadingCandidates ? (
                            <div className="flex flex-col items-center justify-center p-6 text-muted-foreground gap-2">
                                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                <span className="text-xs">Loading candidates...</span>
                            </div>
                        ) : filteredCandidates.length === 0 ? (
                            <div className="p-6 text-center text-xs text-muted-foreground">
                                No candidates found
                            </div>
                        ) : (
                            filteredCandidates.map((cand) => {
                                const active = activeChatUser?.id === cand.id;

                                return (
                                    <button
                                        key={cand.id}
                                        onClick={() =>
                                            setActiveChatUser({
                                                id: cand.id,
                                                name: cand.name,
                                                avatar: cand.avatarUrl,
                                                title: cand.jobTitle || 'Applicant',
                                                company: cand.stage ? `Stage: ${cand.stage}` : 'HireFlow Candidate',
                                                phone: cand.phone,
                                                email: cand.email,
                                                jobTitle: cand.jobTitle,
                                                candidateId: cand.id,
                                                type: 'candidate'
                                            })
                                        }
                                        className={`w-full p-2.5 rounded-xl text-left flex items-center gap-3 transition-all cursor-pointer ${active
                                            ? 'bg-primary text-primary-foreground shadow-sm'
                                            : 'hover:bg-muted/80 text-foreground'
                                            }`}
                                    >
                                        <div className="relative">
                                            <Avatar className="w-9 h-9">
                                                <AvatarImage src={cand.avatarUrl} />
                                                <AvatarFallback className={`text-xs font-bold ${active ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-indigo-600 text-white'}`}>
                                                    {cand.name.charAt(0)?.toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-1">
                                                <h4 className="text-xs font-bold truncate">{cand.name}</h4>
                                                {cand.stage && (
                                                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${active ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                                        {cand.stage}
                                                    </span>
                                                )}
                                            </div>
                                            <p className={`text-[11px] truncate ${active ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                                                {cand.jobTitle || cand.phone || 'HireFlow Candidate'}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })
                        )
                    )}
                </div>
            </div>

            {/* CENTER COLUMN: MAIN CHAT & CALL HEADER */}
            {activeChatUser ? (
                <div className="flex-1 flex flex-col h-full min-w-0 bg-background overflow-hidden min-h-0">
                    {/* Active Conversation Header */}
                    <div className="p-3.5 border-b border-border flex items-center justify-between bg-card shrink-0">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="relative">
                                <Avatar className="w-10 h-10 border border-border">
                                    <AvatarImage src={activeChatUser.avatar} />
                                    <AvatarFallback className="font-bold text-xs bg-indigo-600 text-white">
                                        {activeChatUser.name?.charAt(0)?.toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div
                                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${isUserOnline(activeChatUser.id) ? 'bg-emerald-500' : 'bg-slate-400'
                                        }`}
                                />
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                    {activeChatUser.name}
                                    {activeChatUser.id === currentUserId && (
                                        <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-normal">
                                            You
                                        </Badge>
                                    )}
                                    {activeChatUser.company && (
                                        <span className="text-xs text-muted-foreground font-normal">
                                            • {activeChatUser.company}
                                        </span>
                                    )}
                                </h3>
                                <p className="text-[11px] text-muted-foreground">
                                    {remoteTyping ? (
                                        <span className="text-indigo-600 font-medium animate-pulse">{remoteTyping} is typing...</span>
                                    ) : isUserOnline(activeChatUser.id) ? (
                                        '🟢 Online & Ready to Call'
                                    ) : (
                                        activeChatUser.title || activeChatUser.email || 'Available'
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* Direct Calling & Screen Share Action Buttons */}
                        <div className="flex items-center gap-2">
                            {activeChatUser.id === currentUserId ? (
                                <Badge variant="secondary" className="text-xs px-2.5 py-1 text-muted-foreground font-medium">
                                    Personal Space (You)
                                </Badge>
                            ) : (
                                <>
                                    {activeChatUser.phone && (
                                        <Button
                                            size="sm"
                                            onClick={() => setIsWaSheetOpen(true)}
                                            className="h-8 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs font-semibold"
                                            title="Send WhatsApp via KonnectX"
                                        >
                                            <MessageCircle className="w-3.5 h-3.5" />
                                            <span className="hidden sm:inline">WhatsApp</span>
                                        </Button>
                                    )}

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleStartVoiceCall}
                                        className="h-8 text-xs gap-1.5 border-border hover:border-blue-500/40 hover:text-blue-600"
                                        title="Start WebRTC Voice Call"
                                    >
                                        <Phone className="w-3.5 h-3.5 text-blue-600" />
                                        <span className="hidden sm:inline">Voice Call</span>
                                    </Button>

                                    <Button
                                        size="sm"
                                        onClick={handleStartVideoCall}
                                        className="h-8 text-xs gap-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-sm font-semibold"
                                        title="Start WebRTC HD Video Call"
                                    >
                                        <Video className="w-3.5 h-3.5" />
                                        <span>HD Video Call</span>
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Message History Thread */}
                    <ScrollArea className="flex-1 min-h-0">
                        <div className="p-4 space-y-3.5">
                            <div className="text-center my-3">
                                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-muted/60 text-[11px] text-muted-foreground border border-border/60">
                                    <Shield className="w-3 h-3 text-emerald-500" />
                                    Encrypted Real-Time P2P WebRTC & Socket Channel
                                </div>
                            </div>

                            {currentChatMessages.length === 0 ? (
                                <div className="h-48 flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-2">
                                        <MessageSquare className="w-6 h-6" />
                                    </div>
                                    <h4 className="text-sm font-bold text-foreground">No messages yet</h4>
                                    <p className="text-xs text-muted-foreground max-w-xs mt-1">
                                        Start the conversation or click <strong>HD Video Call</strong> above to initiate an encrypted meeting.
                                    </p>
                                </div>
                            ) : (
                                currentChatMessages.map((msg, index) => {
                                    const isMe = msg.senderId === currentUserId;
                                    const callLog = parseCallLog(msg.message, msg.attachments);

                                    return (
                                        <div
                                            key={msg.id || index}
                                            className={`flex items-end gap-2 my-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}
                                        >
                                            {!isMe && (
                                                <Avatar className="w-7 h-7 mb-1">
                                                    <AvatarFallback className="text-[10px] bg-slate-700 text-white font-bold">
                                                        {msg.senderName?.charAt(0) || 'U'}
                                                    </AvatarFallback>
                                                </Avatar>
                                            )}

                                            {callLog ? (
                                                <div
                                                    className={`max-w-xs sm:max-w-sm p-3.5 rounded-2xl text-xs shadow-xs space-y-2.5 border transition-all ${isMe
                                                        ? 'bg-card border-primary/30 text-foreground rounded-br-xs'
                                                        : 'bg-muted/60 border-border text-foreground rounded-bl-xs'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${callLog.callStatus === 'completed'
                                                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                                                : callLog.callStatus === 'missed'
                                                                    ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                                                                    : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                                                                }`}
                                                        >
                                                            {callLog.callType === 'video' ? (
                                                                <Video className="w-4 h-4" />
                                                            ) : callLog.callStatus === 'completed' ? (
                                                                <PhoneCall className="w-4 h-4" />
                                                            ) : callLog.callStatus === 'missed' ? (
                                                                <PhoneMissed className="w-4 h-4" />
                                                            ) : (
                                                                <PhoneOff className="w-4 h-4" />
                                                            )}
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between gap-1">
                                                                <h5 className="text-xs font-bold truncate">
                                                                    {callLog.callType === 'video' ? 'Video Call' : 'Voice Call'}
                                                                </h5>
                                                                <Badge
                                                                    variant="outline"
                                                                    className={`text-[9px] px-1.5 py-0 font-medium ${callLog.callStatus === 'completed'
                                                                        ? 'border-emerald-500/30 text-emerald-600 bg-emerald-500/10'
                                                                        : callLog.callStatus === 'missed'
                                                                            ? 'border-rose-500/30 text-rose-600 bg-rose-500/10'
                                                                            : 'border-amber-500/30 text-amber-600 bg-amber-500/10'
                                                                        }`}
                                                                >
                                                                    {callLog.callStatus === 'completed'
                                                                        ? 'Completed'
                                                                        : callLog.callStatus === 'missed'
                                                                            ? 'Missed'
                                                                            : callLog.callStatus === 'busy'
                                                                                ? 'Busy'
                                                                                : 'Declined'}
                                                                </Badge>
                                                            </div>

                                                            <p className="text-[11px] text-muted-foreground mt-0.5">
                                                                {callLog.callStatus === 'completed' ? (
                                                                    <span>Duration: <strong className="font-mono text-foreground">{formatCallDuration(callLog.duration || 0)}</strong></span>
                                                                ) : callLog.callStatus === 'missed' ? (
                                                                    <span>{isMe ? 'No answer' : 'Missed call'}</span>
                                                                ) : (
                                                                    <span>{isMe ? 'Call declined' : 'Declined'}</span>
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="pt-1.5 border-t border-border/50 flex items-center justify-between">
                                                        <span className="text-[10px] text-muted-foreground font-mono">
                                                            {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], {
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </span>

                                                        {activeChatUser && activeChatUser.id !== currentUserId && (
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => {
                                                                    if (callLog.callType === 'video') {
                                                                        handleStartVideoCall();
                                                                    } else {
                                                                        handleStartVoiceCall();
                                                                    }
                                                                }}
                                                                className="h-6 text-[10px] px-2 gap-1 text-primary hover:text-primary hover:bg-primary/10 font-semibold"
                                                            >
                                                                <Phone className="w-3 h-3" />
                                                                Call Back
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div
                                                    className={`max-w-md p-3 rounded-2xl text-xs shadow-xs space-y-1.5 ${isMe
                                                        ? 'bg-primary text-primary-foreground rounded-br-xs'
                                                        : 'bg-muted/80 text-foreground border border-border/60 rounded-bl-xs'
                                                        }`}
                                                >
                                                    {!isMe && (
                                                        <p className="text-[10px] font-bold text-primary">{msg.senderName}</p>
                                                    )}
                                                    <p className="leading-relaxed whitespace-pre-line">{msg.message}</p>
                                                    <div
                                                        className={`text-[9px] flex items-center justify-end gap-1 ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'
                                                            }`}
                                                    >
                                                        <span>
                                                            {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], {
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </span>
                                                        {isMe && <CheckCheck className="w-3 h-3" />}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </ScrollArea>

                    {/* Message Input Bar */}
                    <form onSubmit={handleSendMessage} className="p-3 border-t border-border bg-card flex items-center gap-2 shrink-0">
                        {activeChatUser.phone && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsWaSheetOpen(true)}
                                className="h-10 w-10 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10 shrink-0"
                                title="Send WhatsApp Template via KonnectX"
                            >
                                <MessageCircle className="w-4 h-4" />
                            </Button>
                        )}
                        <Input
                            value={inputMessage}
                            onChange={handleInputChange}
                            placeholder={`Message ${activeChatUser.name}...`}
                            className="h-10 text-xs bg-background"
                        />

                        <Button type="submit" size="sm" className="h-10 px-4 gap-1.5 font-semibold">
                            <Send className="w-3.5 h-3.5" />
                            <span>Send</span>
                        </Button>
                    </form>
                </div>
            ) : (
                <div className="flex-1 flex flex-col h-full items-center justify-center text-center p-8 bg-background min-h-0">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                        <MessageSquare className="w-8 h-8" />
                    </div>
                    <h3 className="text-base font-bold text-foreground">Select a conversation</h3>
                    <p className="text-xs text-muted-foreground max-w-sm mt-1">
                        Choose a sales team member or CRM client from the left sidebar to start real-time messaging, screen sharing, or HD video calling.
                    </p>
                </div>
            )}

            <CrmWhatsAppOutreachSheet
                isOpen={isWaSheetOpen}
                onClose={() => setIsWaSheetOpen(false)}
                workspaceId={workspaceId}
                recipient={activeChatUser ? {
                    name: activeChatUser.name,
                    phone: activeChatUser.phone,
                    email: activeChatUser.email,
                    jobTitle: activeChatUser.jobTitle || activeChatUser.title,
                    company: activeChatUser.company,
                    candidateId: activeChatUser.candidateId || null,
                    contactId: activeChatUser.type === 'contact' ? activeChatUser.id : null
                } : null}
                onSuccess={() => toast.success("WhatsApp message dispatched!")}
            />
        </div>
    );
}
