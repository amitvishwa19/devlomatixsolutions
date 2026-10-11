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
  PhoneCall
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';

import { useCrmSocket } from '@/providers/CrmSocketProvider';
import { getCrmContactsAction } from '../_actions/contact-actions';

export default function CrmChatPage() {
  const params = useParams();
  const workspaceId = params?.workspaceId;
  const { data: session } = useSession();

  const currentUserId = session?.user?.userId || session?.user?.id;
  const currentUserName = session?.user?.displayName || session?.user?.name || 'Sales Rep';

  const {
    socket,
    isConnected,
    onlineUsers,
    startCall
  } = useCrmSocket();

  const [activeTab, setActiveTab] = useState('team'); // 'team' | 'contacts'
  const [contacts, setContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChatUser, setActiveChatUser] = useState(null);

  // Chat Messages State: roomId -> Array<Message>
  const [messages, setMessages] = useState({});
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [remoteTyping, setRemoteTyping] = useState(null);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // 1. Fetch CRM Contacts
  useEffect(() => {
    async function loadContacts() {
      if (!workspaceId) return;
      try {
        const res = await getCrmContactsAction(workspaceId);
        if (res.success && res.data) {
          setContacts(res.data);
          // Set first contact as active if no user selected
          if (!activeChatUser && res.data.length > 0) {
            setActiveChatUser({
              id: res.data[0].id,
              name: res.data[0].name,
              avatar: null,
              title: res.data[0].title || 'Client Contact',
              company: res.data[0].account?.name || 'Account',
              phone: res.data[0].phone,
              type: 'contact'
            });
          }
        }
      } catch (err) {
        console.warn('Failed to load contacts for chat:', err);
      }
    }
    loadContacts();
  }, [workspaceId]);

  // Fallback Team Members list
  const defaultTeamMembers = [
    { id: 'rep-1', name: 'Amit Vishwakarma', title: 'Lead Solutions Architect', avatar: null, type: 'team' },
    { id: 'rep-2', name: 'Sarah Jenkins', title: 'Senior Enterprise AE', avatar: null, type: 'team' },
    { id: 'rep-3', name: 'Rahul Verma', title: 'Growth Account Executive', avatar: null, type: 'team' },
    { id: 'rep-4', name: 'Priya Patel', title: 'Outreach & SDR Lead', avatar: null, type: 'team' }
  ];

  const allTeamMembers = defaultTeamMembers.filter((m) => m.id !== currentUserId);

  // 2. Compute Active Room ID
  const getRoomId = (targetId) => {
    if (!targetId || !currentUserId) return 'general';
    return [currentUserId, targetId].sort().join('_');
  };

  const currentRoomId = activeChatUser ? getRoomId(activeChatUser.id) : 'general';

  // 3. Socket Message & Typing Listeners
  useEffect(() => {
    if (!socket) return;

    // Join active chat room
    socket.emit('chat:room:join', { roomId: currentRoomId });

    const handleMessageReceive = (msg) => {
      setMessages((prev) => {
        const roomMsgs = prev[msg.roomId] || [];
        return {
          ...prev,
          [msg.roomId]: [...roomMsgs, msg]
        };
      });
    };

    const handleTyping = (data) => {
      if (data.userId !== currentUserId) {
        setRemoteTyping(data.isTyping ? data.userName : null);
      }
    };

    socket.on('chat:message:receive', handleMessageReceive);
    socket.on('chat:typing', handleTyping);

    return () => {
      socket.emit('chat:room:leave', { roomId: currentRoomId });
      socket.off('chat:message:receive', handleMessageReceive);
      socket.off('chat:typing', handleTyping);
    };
  }, [socket, currentRoomId, currentUserId]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentRoomId]);

  // 4. Send Message Handler
  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!inputMessage.trim() || !activeChatUser || !socket) return;

    const newMsg = {
      id: `msg_${Date.now()}`,
      roomId: currentRoomId,
      recipientId: activeChatUser.id,
      senderId: currentUserId,
      senderName: currentUserName,
      message: inputMessage.trim(),
      timestamp: new Date().toISOString()
    };

    // Optimistically update UI
    setMessages((prev) => ({
      ...prev,
      [currentRoomId]: [...(prev[currentRoomId] || []), newMsg]
    }));

    // Emit via socket
    socket.emit('chat:message:send', {
      roomId: currentRoomId,
      recipientId: activeChatUser.id,
      workspaceId,
      message: inputMessage.trim(),
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
    if (!activeChatUser) return;
    startCall({
      calleeId: activeChatUser.id,
      calleeName: activeChatUser.name,
      calleeAvatar: activeChatUser.avatar,
      callType: 'audio'
    });
  };

  const handleStartVideoCall = () => {
    if (!activeChatUser) return;
    startCall({
      calleeId: activeChatUser.id,
      calleeName: activeChatUser.name,
      calleeAvatar: activeChatUser.avatar,
      callType: 'video'
    });
  };

  const isUserOnline = (userId) => {
    return onlineUsers.some((u) => u.userId === userId);
  };

  const currentChatMessages = messages[currentRoomId] || [];

  return (
    <div className="flex h-[calc(100vh-8.5rem)] w-full max-w-7xl mx-auto rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
      {/* LEFT COLUMN: CONTACTS & TEAM SIDEBAR */}
      <div className="w-80 border-r border-border flex flex-col bg-muted/20 shrink-0">
        {/* Header & Status */}
        <div className="p-3.5 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              Communication Hub
            </h2>
            <Badge
              variant="outline"
              className={`text-[10px] gap-1 px-1.5 py-0.5 ${
                isConnected
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-600 border-rose-500/30'
              }`}
            >
              {isConnected ? <Wifi className="w-2.5 h-2.5" /> : <WifiOff className="w-2.5 h-2.5" />}
              {isConnected ? 'Socket Live' : 'Connecting'}
            </Badge>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 h-8">
              <TabsTrigger value="team" className="text-xs">
                Sales Team ({allTeamMembers.length})
              </TabsTrigger>
              <TabsTrigger value="contacts" className="text-xs">
                CRM Contacts ({contacts.length})
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

        {/* User / Contact List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {activeTab === 'team' ? (
            allTeamMembers.map((member) => {
              const online = isUserOnline(member.id);
              const active = activeChatUser?.id === member.id;

              return (
                <button
                  key={member.id}
                  onClick={() => setActiveChatUser({ ...member, type: 'team' })}
                  className={`w-full p-2.5 rounded-xl text-left flex items-center gap-3 transition-all cursor-pointer ${
                    active
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'hover:bg-muted/80 text-foreground'
                  }`}
                >
                  <div className="relative">
                    <Avatar className="w-9 h-9">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback className={`text-xs font-bold ${active ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-indigo-600 text-white'}`}>
                        {member.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 ${
                        active ? 'border-primary' : 'border-card'
                      } ${online ? 'bg-emerald-500' : 'bg-slate-400'}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold truncate">{member.name}</h4>
                    </div>
                    <p className={`text-[11px] truncate ${active ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                      {member.title}
                    </p>
                  </div>
                </button>
              );
            })
          ) : (
            contacts.map((c) => {
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
                  className={`w-full p-2.5 rounded-xl text-left flex items-center gap-3 transition-all cursor-pointer ${
                    active
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'hover:bg-muted/80 text-foreground'
                  }`}
                >
                  <div className="relative">
                    <Avatar className="w-9 h-9">
                      <AvatarFallback className={`text-xs font-bold ${active ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-emerald-600 text-white'}`}>
                        {c.name.charAt(0)}
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
          )}
        </div>
      </div>

      {/* CENTER COLUMN: MAIN CHAT & CALL HEADER */}
      {activeChatUser ? (
        <div className="flex-1 flex flex-col min-w-0 bg-background">
          {/* Active Conversation Header */}
          <div className="p-3.5 border-b border-border flex items-center justify-between bg-card shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative">
                <Avatar className="w-10 h-10 border border-border">
                  <AvatarImage src={activeChatUser.avatar} />
                  <AvatarFallback className="font-bold text-xs bg-indigo-600 text-white">
                    {activeChatUser.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${
                    isUserOnline(activeChatUser.id) ? 'bg-emerald-500' : 'bg-slate-400'
                  }`}
                />
              </div>

              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  {activeChatUser.name}
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
                    activeChatUser.title || 'Available'
                  )}
                </p>
              </div>
            </div>

            {/* Direct Calling & Screen Share Action Buttons */}
            <div className="flex items-center gap-2">
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
            </div>
          </div>

          {/* Message History Thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            <div className="text-center my-4">
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-muted/60 text-[11px] text-muted-foreground border border-border/60">
                <Shield className="w-3 h-3 text-emerald-500" />
                Encrypted Real-Time P2P WebRTC & Socket Channel
              </div>
            </div>

            {currentChatMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
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

                return (
                  <div
                    key={msg.id || index}
                    className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isMe && (
                      <Avatar className="w-7 h-7 mb-1">
                        <AvatarFallback className="text-[10px] bg-slate-700 text-white font-bold">
                          {msg.senderName?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div
                      className={`max-w-md p-3 rounded-2xl text-xs shadow-xs space-y-1 ${
                        isMe
                          ? 'bg-primary text-primary-foreground rounded-br-xs'
                          : 'bg-muted/80 text-foreground border border-border/60 rounded-bl-xs'
                      }`}
                    >
                      {!isMe && (
                        <p className="text-[10px] font-bold text-primary">{msg.senderName}</p>
                      )}
                      <p className="leading-relaxed whitespace-pre-line">{msg.message}</p>
                      <div
                        className={`text-[9px] flex items-center justify-end gap-1 ${
                          isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'
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
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Bar */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-border bg-card flex items-center gap-2">
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
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-background">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-foreground">Select a conversation</h3>
          <p className="text-xs text-muted-foreground max-w-sm mt-1">
            Choose a sales team member or CRM client from the left sidebar to start real-time messaging, screen sharing, or HD video calling.
          </p>
        </div>
      )}
    </div>
  );
}
