"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useParams } from "next/navigation";
import {
    Search,
    MoreVertical,
    Phone,
    Video,
    Send,
    Smile,
    Paperclip,
    Check,
    CheckCheck,
    AlertCircle,
    User,
    Users,
    Layout,
    StickyNote,
    ArrowLeft,
    Loader2,
    Sparkles,
    MessageSquare,
    Trash2, Share2, UserPlus, Eye, Mail, Tag, Info, X,
    RefreshCw,
    Forward,
    ChevronDown,
    ChevronRight,
    FolderPlus,
    Hash,
    Filter,
    Radio,
    Megaphone
} from "lucide-react";
import { useSession } from 'next-auth/react';
import { useAction } from "@/hooks/use-action";
import { getConversations } from "./_actions/get-conversations";
import { sendMessage } from "./_actions/send-message";
import { sendBroadcastMessage } from "./_actions/send-broadcast-message";
import { forwardMessage } from "./_actions/forward-message";
import { deleteConversation } from "./_actions/delete-conversation";
import { assignConversation } from "./_actions/assign-conversation";
import { removeConversationAssignment } from "./_actions/remove-conversation-assignment";
import { getAiSuggestions } from "./_actions/get-ai-suggestions";
import { searchUsers } from "../template/_actions/search-users";
import { getContacts } from "../contacts/_actions/get-contacts";
import { getGroups } from "../contacts/_actions/get-groups";
import { getCategories } from "../contacts/_actions/get-categories";
import { getTemplates } from "../template/_actions/get-templates";
import ManageContactModal from "./_components/ManageContactModal";
import ForwardMessageModal from "./_components/ForwardMessageModal";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Layers } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import MediaBubble from "./_components/MediaBubble";
import TemplateMessage from "./_components/TemplateMessage";
import AccountSwitcher from "../_components/AccountSwitcher";

// Helper: Parse lastMessage JSON and return a preview string
function renderMessagePreview(lastMessage) {
    if (!lastMessage) return "";
    try {
        const parsed = typeof lastMessage === 'string' ? JSON.parse(lastMessage) : lastMessage;
        if (typeof parsed === 'object' && parsed !== null) {
            const type = (parsed.type || 'text').toLowerCase();
            const text = parsed.text || "";

            if (type === 'text') return text;
            if (['image', 'video', 'audio', 'document', 'sticker'].includes(type)) {
                return `[${type.toUpperCase()}] ${parsed.caption || text || ""}`.trim();
            }
            if (type === 'template') {
                const clean = text.replace(/^\[Template:[^\]]+\]\s*/, '').trim();
                return `📋 ${clean || text || "Template message"}`;
            }
            if (type === 'location') return "📍 Location shared";
            if (type === 'contacts') return `👤 Contact: ${parsed.text || "Shared Contact"}`;
            if (type === 'poll') return `📊 Poll: ${parsed.text || "New Poll"}`;
            if (type === 'order') return `🛒 Order: ${text || "Catalog Order"}`;
            if (type === 'interactive' || type === 'product' || type === 'catalog_message') {
                if (text && !text.includes('[Interactive Message]')) return text;
                return "🛍️ Catalog / Interactive Message";
            }
            if (type === 'unsupported') return "⚠️ WhatsApp System Message";

            return text || `[${type.toUpperCase()}]`;
        }
        return String(lastMessage);
    } catch (e) {
        return String(lastMessage);
    }
}

// Helper: replace {{N}} placeholders in a template body string
function fillTemplatePreview(body, vars) {
    let text = body || '';
    Object.entries(vars).forEach(([key, val]) => {
        text = text.replace(key, val || key);
    });
    return text;
}

// Message Status Indicator Component
const MessageStatus = ({ status }) => {
    switch (status) {
        case 'PENDING':
            return <Loader2 className="w-3 h-3 text-zinc-400 animate-spin" title="Sending..." />;
        case 'READ':
            return <CheckCheck className="w-3.5 h-3.5 text-blue-400" title="Read" />;
        case 'DELIVERED':
            return <CheckCheck className="w-3.5 h-3.5 text-emerald-300/80" title="Delivered" />;
        case 'SENT':
            return <Check className="w-3.5 h-3.5 text-emerald-300/60" title="Sent to Meta" />;
        case 'FAILED':
            return <AlertCircle className="w-3.5 h-3.5 text-red-500 animate-pulse" title="Message Failed" />;
        default:
            return <Check className="w-3.5 h-3.5 text-emerald-300/50" />;
    }
};

export default function WhatsAppChatsPage() {
    const { workspaceId } = useParams();
    const { data: session } = useSession();
    const userId = session?.user?.userId || '';
    const [conversations, setConversations] = useState([]);
    const [selectedJid, setSelectedJid] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [templates, setTemplates] = useState([]);
    const [previewTemplate, setPreviewTemplate] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState([]);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [isTemplateDrawerOpen, setIsTemplateDrawerOpen] = useState(false);
    const [selectedTemplateForSend, setSelectedTemplateForSend] = useState(null);
    const [templateVars, setTemplateVars] = useState({});
    const [templateMediaUrl, setTemplateMediaUrl] = useState("");

    const [allContacts, setAllContacts] = useState([]);
    const [activeTab, setActiveTab] = useState("chats");

    // Delete Modal State
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [jidToDelete, setJidToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Assign Modal State
    const [isAssignOpen, setIsAssignOpen] = useState(false);
    const [jidToAssign, setJidToAssign] = useState(null);
    const [assignUsers, setAssignUsers] = useState([]);
    const [selectedAssignEmail, setSelectedAssignEmail] = useState('');

    // View Contact Modal State
    const [isViewContactOpen, setIsViewContactOpen] = useState(false);
    const [viewContactJid, setViewContactJid] = useState(null);

    // Manage Contact / Group / Tag Modal State
    const [isManageContactOpen, setIsManageContactOpen] = useState(false);
    const [manageContactJid, setManageContactJid] = useState(null);

    // Forward Message Modal State
    const [isForwardOpen, setIsForwardOpen] = useState(false);
    const [forwardingMsg, setForwardingMsg] = useState(null);

    // Broadcast & Segment State
    const [broadcastHistory, setBroadcastHistory] = useState({});
    const [isRecipientsDialogOpen, setIsRecipientsDialogOpen] = useState(false);
    const [recipientSearchTerm, setRecipientSearchTerm] = useState('');

    // Sidebar/Filter State
    const [groups, setGroups] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeSegment, setActiveSegment] = useState('all'); // all, group:[id], category:[name], tag:[name]
    const [segmentViewFilter, setSegmentViewFilter] = useState('all'); // all, categories, groups, tags
    const [expandedSegments, setExpandedSegments] = useState({});

    const toggleSegmentExpand = (key) => {
        setExpandedSegments(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const scrollRef = useRef(null);

    // Helper: Extract last 10 digits of phone number / JID
    const getPhoneLast10 = (str) => {
        if (!str) return '';
        const digits = String(str).replace(/\D/g, '').split('@')[0];
        return digits.length >= 10 ? digits.slice(-10) : digits;
    };

    // Derived State: Check if a Segment (Group / Category / Tag) is selected
    const isSegmentChat = Boolean(selectedJid?.startsWith('segment:'));

    // Compute unique categories combining DB categories and contact categories
    const uniqueCategories = Array.from(
        new Map([
            ...categories.map(c => [c.name, { name: c.name, color: c.color || '#3b82f6', id: c.id }]),
            ...allContacts.filter(c => c.category).map(c => [c.category, { name: c.category, color: '#3b82f6', id: c.category }])
        ]).values()
    );

    // Compute unique tags from all contacts
    const uniqueTags = Array.from(
        new Set(allContacts.flatMap(c => c.tags || []).filter(Boolean))
    ).sort();

    let activeSegmentData = null;
    if (isSegmentChat) {
        const parts = selectedJid.split(':');
        const sType = parts[1]; // 'group', 'category', 'tag'
        const sId = parts.slice(2).join(':');

        if (sType === 'group') {
            const grp = groups.find(g => g.id === sId);
            const recipients = allContacts.filter(c => c.groups?.some(g => g.id === sId));
            activeSegmentData = {
                type: 'group',
                id: sId,
                name: grp?.name || 'Broadcast Group',
                description: grp?.description || '',
                recipients
            };
        } else if (sType === 'category') {
            const cat = uniqueCategories.find(c => c.name === sId);
            const recipients = allContacts.filter(c => c.category === sId);
            activeSegmentData = {
                type: 'category',
                id: sId,
                name: sId,
                color: cat?.color || '#3b82f6',
                recipients
            };
        } else if (sType === 'tag') {
            const recipients = allContacts.filter(c => c.tags?.includes(sId));
            activeSegmentData = {
                type: 'tag',
                id: sId,
                name: sId,
                color: '#f59e0b',
                recipients
            };
        }
    }

    // Derived State: Get the actual chat object based on selectedJid
    const selectedChat = isSegmentChat ? null : conversations.find(c => getPhoneLast10(c.jid) === getPhoneLast10(selectedJid));
    const selectedContact = isSegmentChat ? null : allContacts.find(c => getPhoneLast10(c.phone) === getPhoneLast10(selectedJid));

    // Display name for the header
    const activeName = isSegmentChat
        ? activeSegmentData?.name
        : (selectedChat?.name || selectedContact?.name || selectedJid?.split('@')[0]);

    // Server Action Hooks
    const { execute: executeConversations } = useAction(getConversations, {
        onSuccess: (data) => {
            if (data.conversations) {
                setConversations(prevConversations => {
                    const incomingConvMap = new Map(data.conversations.map(c => [getPhoneLast10(c.jid), c]));
                    const mergedResults = data.conversations.map(newConv => {
                        const prevConv = prevConversations.find(p => getPhoneLast10(p.jid) === getPhoneLast10(newConv.jid));
                        if (!prevConv) return newConv;
                        const localTempMsgs = prevConv.messages.filter(m =>
                            String(m.id).startsWith('temp_') &&
                            !newConv.messages.some(nm => nm.text === m.text && Math.abs(nm.timestamp - m.timestamp) < 30)
                        );
                        return { ...newConv, messages: [...newConv.messages, ...localTempMsgs] };
                    });
                    return mergedResults.sort((a, b) => b.timestamp - a.timestamp);
                });

                setSelectedJid(currentJid => {
                    if (currentJid && currentJid.startsWith('segment:')) return currentJid;
                    if (!currentJid && data.conversations.length > 0) return data.conversations[0].jid;
                    if (currentJid) {
                        const existsInConv = data.conversations.some(c => getPhoneLast10(c.jid) === getPhoneLast10(currentJid));
                        if (existsInConv) return currentJid;
                        const existsInContacts = allContacts.some(c => getPhoneLast10(c.phone) === getPhoneLast10(currentJid));
                        if (existsInContacts) return currentJid;
                        return data.conversations.length > 0 ? data.conversations[0].jid : currentJid;
                    }
                    return currentJid;
                });
            }
            setIsLoading(false);
        },
        onError: (err) => {
            // Suppress standard "Failed to fetch" console errors as they are transient network blips
            if (err !== "Failed to fetch") {
                console.error("Conversations error:", err);
            }
            setIsLoading(false);
        }
    });

    const { execute: executeGetContacts } = useAction(getContacts, {
        onSuccess: (data) => {
            setAllContacts(Array.isArray(data) ? data : []);
        }
    });

    const { execute: executeGetGroups } = useAction(getGroups, {
        onSuccess: (data) => setGroups(data || [])
    });

    const { execute: executeGetCategories } = useAction(getCategories, {
        onSuccess: (data) => setCategories(data || [])
    });

    const { execute: executeGetTemplates } = useAction(getTemplates, {
        onSuccess: (data) => setTemplates(data.templates || []),
    });

    const { execute: executeSendMessage } = useAction(sendMessage, {
        onSuccess: (data, context) => {
            setConversations(prev => prev.map(conv => {
                if (getPhoneLast10(conv.jid) === getPhoneLast10(context.to)) {
                    return {
                        ...conv,
                        messages: conv.messages.map(m => m.id === context.tempId ? { ...m, status: 'SENT' } : m)
                    };
                }
                return conv;
            }));
            toast.success('Message sent!');
        },
        onError: (err, context) => {
            toast.error(err || "Failed to send message");
            setConversations(prev => prev.map(conv => {
                if (getPhoneLast10(conv.jid) === getPhoneLast10(context.to)) {
                    return { ...conv, messages: conv.messages.filter(m => m.id !== context.tempId) };
                }
                return conv;
            }));
        },
        onComplete: () => setIsSending(false)
    });

    const { execute: executeSendBroadcastMessage } = useAction(sendBroadcastMessage, {
        onSuccess: (data, context) => {
            if (data?.success) {
                toast.success(`Broadcast delivered to ${data.sentCount} contact${data.sentCount === 1 ? '' : 's'}!`);
                if (data.failedCount > 0) {
                    toast.warning(`${data.failedCount} recipient${data.failedCount === 1 ? '' : 's'} failed`);
                }
                setBroadcastHistory(prev => ({
                    ...prev,
                    [context.segmentKey]: (prev[context.segmentKey] || []).map(m => m.id === context.tempId ? { ...m, status: 'SENT', sentCount: data.sentCount } : m)
                }));
                fetchConversations();
            } else {
                toast.error("Failed to send broadcast");
            }
        },
        onError: (err, context) => {
            toast.error(err || "Failed to send broadcast");
            setBroadcastHistory(prev => ({
                ...prev,
                [context.segmentKey]: (prev[context.segmentKey] || []).filter(m => m.id !== context.tempId)
            }));
        },
        onComplete: () => setIsSending(false)
    });

    const { execute: executeAiSuggestions } = useAction(getAiSuggestions, {
        onSuccess: (data) => setAiSuggestions(data.suggestions || []),
        onComplete: () => setIsAiLoading(false)
    });

    const { execute: executeDeleteConversation } = useAction(deleteConversation, {
        onSuccess: (data, context) => {
            toast.success("Chat deleted");
            setConversations(prev => prev.filter(c => c.jid !== context.jid));
            if (selectedJid === context.jid) setSelectedJid(null);
            setIsDeleteDialogOpen(false);
        },
        onError: (err) => toast.error(err || "Failed to delete chat"),
        onComplete: () => setIsDeleting(false)
    });

    const { execute: executeSearchUsers } = useAction(searchUsers, {
        onSuccess: (data) => setAssignUsers(data || []),
        onError: () => setAssignUsers([])
    });

    const { execute: executeAssign, isLoading: isAssigning } = useAction(assignConversation, {
        onSuccess: (data, context) => {
            toast.success(`Conversation shared with ${data.user.displayName || data.user.email}`);
            setSelectedAssignEmail('');
            setConversations(prev => prev.map(c => {
                if (c.jid === context.jid) {
                    const alreadyShared = c.sharedWith || [];
                    if (!alreadyShared.some(s => s.sharedWithUserId === data.user.id)) {
                        return {
                            ...c,
                            sharedWith: [...alreadyShared, {
                                id: `temp_share_${Date.now()}`,
                                sharedWithUserId: data.user.id,
                                sharedByUserId: userId,
                                sharedWith: {
                                    id: data.user.id,
                                    displayName: data.user.displayName,
                                    email: data.user.email
                                }
                            }]
                        };
                    }
                }
                return c;
            }));
        },
        onError: (err) => toast.error(err)
    });

    const { execute: executeRemoveAssign, isLoading: isRemovingAssign } = useAction(removeConversationAssignment, {
        onSuccess: (data, context) => {
            toast.success("Share access removed");
            setConversations(prev => prev.map(c => {
                if (c.jid === context.jid) {
                    return {
                        ...c,
                        sharedWith: (c.sharedWith || []).filter(s => s.sharedWithUserId !== context.sharedWithUserId)
                    };
                }
                return c;
            }));
        },
        onError: (err) => toast.error(err)
    });

    const { execute: executeForwardMessage, isLoading: isForwarding } = useAction(forwardMessage, {
        onSuccess: (res) => {
            if (res?.success) {
                toast.success(`Message forwarded to ${res.sentCount} recipient${res.sentCount === 1 ? '' : 's'}`);
                setIsForwardOpen(false);
                setForwardingMsg(null);
                executeConversations({ workspaceId, userId });
            } else {
                toast.error("Failed to forward message");
            }
        },
        onError: (err) => toast.error(err || "Failed to forward message")
    });

    const handleAssignConversation = (jid) => {
        setJidToAssign(jid);
        setSelectedAssignEmail('');
        setIsAssignOpen(true);
        executeSearchUsers({ workspaceId, query: '' });
    };

    const confirmAssign = () => {
        if (!jidToAssign || !selectedAssignEmail) return;
        executeAssign(
            { workspaceId, jid: jidToAssign, email: selectedAssignEmail },
            { jid: jidToAssign, email: selectedAssignEmail }
        );
    };

    const fetchConversations = () => executeConversations({ workspaceId });
    const fetchContacts = () => { executeGetContacts({ workspaceId, userId }); };
    const fetchTemplates = () => executeGetTemplates({ workspaceId, all: true });
    const fetchGroups = () => executeGetGroups({ workspaceId });
    const fetchCategories = () => executeGetCategories({ workspaceId, type: 'CONTACT' });

    const handleDeleteConversation = (e, jid) => {
        e.stopPropagation();
        setJidToDelete(jid);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (!jidToDelete) return;
        setIsDeleting(true);
        executeDeleteConversation({ workspaceId, jid: jidToDelete }, { jid: jidToDelete });
    };

    useEffect(() => {
        fetchConversations();
        fetchTemplates();
        fetchContacts();
        fetchGroups();
        fetchCategories();

        const handleSwitch = () => {
            setIsLoading(true);
            setConversations([]);
            setSelectedJid(null);
            fetchConversations();
            fetchTemplates();
            fetchContacts();
            fetchGroups();
            fetchCategories();
        };
        window.addEventListener('wa-account-switched', handleSwitch);

        // Continuous polling every 3.5 seconds to fetch latest messages live
        const interval = setInterval(() => {
            fetchConversations();
        }, 3500);

        return () => {
            clearInterval(interval);
            window.removeEventListener('wa-account-switched', handleSwitch);
        };
    }, [workspaceId]);

    const scrollToBottom = (behavior = 'auto') => {
        const doScroll = () => {
            if (!scrollRef.current) return;
            scrollRef.current.scrollIntoView({ behavior, block: 'end', inline: 'nearest' });

            const viewport = scrollRef.current.closest('[data-radix-scroll-area-viewport]') ||
                scrollRef.current.closest('.overflow-y-auto') ||
                scrollRef.current.parentElement;
            if (viewport) {
                if (behavior === 'smooth') {
                    viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
                } else {
                    viewport.scrollTop = viewport.scrollHeight;
                }
            }
        };

        doScroll();
        const timer1 = setTimeout(doScroll, 50);
        const timer2 = setTimeout(doScroll, 180);
        const timer3 = setTimeout(doScroll, 400);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
        };
    };

    useEffect(() => {
        if (selectedJid && selectedChat?.messages) {
            return scrollToBottom('auto');
        }
    }, [selectedJid, selectedChat?.messages?.length]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedJid || isSending) return;

        const textToSend = newMessage;

        // Handle Broadcast Mode for Group / Category / Tag
        if (isSegmentChat && activeSegmentData) {
            if (activeSegmentData.recipients.length === 0) {
                toast.error(`No contacts found in this ${activeSegmentData.type}. Add contacts first.`);
                return;
            }

            const tempId = `temp_bc_${Date.now()}`;
            const optimisticMsg = {
                id: tempId,
                text: textToSend,
                fromMe: true,
                timestamp: Math.floor(Date.now() / 1000),
                status: 'PENDING',
                recipientCount: activeSegmentData.recipients.length
            };

            setBroadcastHistory(prev => ({
                ...prev,
                [selectedJid]: [...(prev[selectedJid] || []), optimisticMsg]
            }));

            setNewMessage("");
            setIsSending(true);

            executeSendBroadcastMessage({
                workspaceId,
                segmentType: activeSegmentData.type,
                segmentId: activeSegmentData.id,
                segmentName: activeSegmentData.name,
                recipients: activeSegmentData.recipients.map(r => r.phone),
                type: 'text',
                body: textToSend
            }, { segmentKey: selectedJid, tempId });
            return;
        }

        const tempId = `temp_${Date.now()}`;
        const optimisticMsg = {
            id: tempId,
            text: textToSend,
            fromMe: true,
            timestamp: Math.floor(Date.now() / 1000),
            status: 'PENDING',
            waId: tempId,
            metadata: { type: 'text' }
        };

        // UI OPTIMISTIC UPDATE
        setConversations(prev => prev.map(conv => {
            if (getPhoneLast10(conv.jid) === getPhoneLast10(selectedJid)) {
                return {
                    ...conv,
                    lastMessage: JSON.stringify({
                        text: textToSend,
                        type: 'text',
                        timestamp: optimisticMsg.timestamp
                    }),
                    timestamp: optimisticMsg.timestamp,
                    messages: [...conv.messages, optimisticMsg]
                };
            }
            return conv;
        }));

        setNewMessage("");
        setIsSending(true);
        scrollToBottom('smooth');
        executeSendMessage({ workspaceId, to: selectedJid, type: 'text', body: textToSend }, { to: selectedJid, tempId, type: 'text' });
    };

    const handleGetAiSuggestions = () => {
        if (!selectedChat || selectedChat.messages.length === 0) return;
        setIsAiLoading(true);
        executeAiSuggestions({ workspaceId, messages: selectedChat.messages.slice(-10) });
    };

    const handleApplySuggestion = (text) => {
        setNewMessage(text);
        setAiSuggestions([]);
    };

    const handleOpenTemplatePicker = () => {
        setSelectedTemplateForSend(null);
        setTemplateVars({});
        setIsTemplateDrawerOpen(true);
    };

    const handleSelectTemplate = (tpl) => {
        setSelectedTemplateForSend(tpl);
        // Parse body for variable placeholders like {{1}}, {{2}}
        const matches = (tpl.body || '').match(/\{\{(\d+)\}\}/g) || [];
        const vars = {};
        matches.forEach(m => { vars[m] = ''; });
        setTemplateVars(vars);

        // Extract default media URL from metadata if exists
        let metadata = tpl.metadata;
        if (typeof metadata === 'string') {
            try { metadata = JSON.parse(metadata); } catch (e) { }
        }
        setTemplateMediaUrl(metadata?.mediaUrl || "");
    };

    const handleSendTemplate = async () => {
        if (!selectedTemplateForSend || !selectedJid) return;

        const templateName = selectedTemplateForSend.templateName || selectedTemplateForSend.name;

        // Build body parameters from vars
        const bodyParams = Object.entries(templateVars).map(([, val]) => ({
            type: 'text',
            text: val || ' '
        }));

        const components = [];

        // Handle Media Header if required by the template
        const templateType = (selectedTemplateForSend.type || 'text').toUpperCase();
        if (['IMAGE', 'VIDEO', 'DOCUMENT'].includes(templateType)) {
            let finalMediaUrl = templateMediaUrl || '';

            // Fallback URLs if metadata mediaUrl is not defined
            if (!finalMediaUrl) {
                finalMediaUrl = {
                    IMAGE: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809",
                    VIDEO: "https://www.w3schools.com/html/mov_bbb.mp4",
                    DOCUMENT: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
                }[templateType];
            }

            if (finalMediaUrl) {
                const mediaType = templateType.toLowerCase();
                const isHandle = /^\d+$/.test(finalMediaUrl.toString()) || finalMediaUrl.toString().startsWith('4');

                components.push({
                    type: 'header',
                    parameters: [
                        {
                            type: mediaType,
                            [mediaType]: isHandle
                                ? { id: finalMediaUrl }
                                : { link: finalMediaUrl }
                        }
                    ]
                });
            }
        }

        // Add body parameters
        if (bodyParams.length > 0) {
            components.push({
                type: 'body',
                parameters: bodyParams
            });
        }

        // Build preview text for optimistic UI
        let previewText = selectedTemplateForSend.body || `[Template: ${templateName}]`;
        Object.entries(templateVars).forEach(([key, val]) => {
            previewText = previewText.replace(key, val || key);
        });

        // Handle Broadcast Mode Template Sending
        if (isSegmentChat && activeSegmentData) {
            if (activeSegmentData.recipients.length === 0) {
                toast.error(`No contacts found in this ${activeSegmentData.type}`);
                return;
            }

            const tempId = `temp_bc_${Date.now()}`;
            const optimisticMsg = {
                id: tempId,
                text: previewText,
                fromMe: true,
                timestamp: Math.floor(Date.now() / 1000),
                status: 'PENDING',
                metadata: { type: 'template', templateName },
                recipientCount: activeSegmentData.recipients.length
            };

            setBroadcastHistory(prev => ({
                ...prev,
                [selectedJid]: [...(prev[selectedJid] || []), optimisticMsg]
            }));

            setIsTemplateDrawerOpen(false);
            setSelectedTemplateForSend(null);
            setTemplateVars({});
            setIsSending(true);

            executeSendBroadcastMessage({
                workspaceId,
                segmentType: activeSegmentData.type,
                segmentId: activeSegmentData.id,
                segmentName: activeSegmentData.name,
                recipients: activeSegmentData.recipients.map(r => r.phone),
                type: 'template',
                template: {
                    name: templateName,
                    language: { code: selectedTemplateForSend.language || 'en_US' },
                    components
                }
            }, { segmentKey: selectedJid, tempId });
            return;
        }

        const tempId = `temp_${Date.now()}`;
        const optimisticMsg = {
            id: tempId,
            text: previewText,
            fromMe: true,
            timestamp: Math.floor(Date.now() / 1000),
            status: 'PENDING',
            metadata: { type: 'template', templateName }
        };
        setConversations(prev => prev.map(conv => {
            return {
                ...conv,
                lastMessage: JSON.stringify({
                    text: previewText,
                    type: 'template',
                    templateName: templateName,
                    timestamp: optimisticMsg.timestamp
                }),
                messages: [optimisticMsg, ...conv.messages]
            };
            return conv;
        }));
        setIsTemplateDrawerOpen(false);
        setSelectedTemplateForSend(null);
        setTemplateVars({});
        setIsSending(true);

        executeSendMessage({
            workspaceId,
            to: selectedJid,
            type: 'template',
            template: {
                name: templateName,
                language: { code: selectedTemplateForSend.language || 'en_US' },
                components
            }
        }, { to: selectedJid, tempId, type: 'template' });
    };

    const handleTemplateClick = (msg) => {
        const templateName = msg.metadata?.templateName ||
            msg.metadata?.originalPayload?.template?.name ||
            (typeof msg.text === 'string' && msg.text.startsWith('[Template:')
                ? msg.text.split('[Template:')[1]?.split(']')[0]?.trim()
                : null);

        if (!templateName) return;

        console.log(`[Preview] Looking for template: ${templateName}`);

        let foundTemplate = templates.find(t =>
            t.templateName === templateName || t.name === templateName
        );

        if (!foundTemplate) {
            foundTemplate = {
                name: templateName,
                templateName: templateName,
                body: msg.text?.replace(/^\[Template:[^\]]+\]\s*/, '') || msg.text || "WhatsApp Template Message",
                type: 'TEXT',
                status: 'APPROVED',
                metadata: msg.metadata || {}
            };
        }

        setPreviewTemplate(foundTemplate);
        setIsPreviewOpen(true);
    };

    // Helper: Find contact for a JID
    const getContactForJid = (jid) => {
        const jidLast10 = getPhoneLast10(jid);
        return allContacts.find(c => getPhoneLast10(c.phone) === jidLast10);
    };

    const handleSelectContactChat = (contact) => {
        const contactLast10 = getPhoneLast10(contact.phone);
        const existingConv = conversations.find(c => getPhoneLast10(c.jid) === contactLast10);
        const cleanPhoneDigits = contact.phone.replace(/\D/g, '');
        const normalizedJid = existingConv
            ? existingConv.jid
            : (cleanPhoneDigits.length === 10 ? `91${cleanPhoneDigits}@s.whatsapp.net` : `${cleanPhoneDigits}@s.whatsapp.net`);
        setSelectedJid(normalizedJid);
        setActiveTab('chats');
    };


    const filteredConversations = conversations.filter(c => {
        const contact = getContactForJid(c.jid);
        const contactName = contact?.name || "";
        const contactPhone = contact?.phone || "";
        const searchLower = searchTerm.toLowerCase();

        const matchesSearch = !searchTerm ||
            c.jid.toLowerCase().includes(searchLower) ||
            (c.name || "").toLowerCase().includes(searchLower) ||
            contactName.toLowerCase().includes(searchLower) ||
            contactPhone.includes(searchTerm);

        let matchesSegment = true;

        if (activeSegment.startsWith('group:')) {
            const groupId = activeSegment.split(':')[1];
            matchesSegment = contact?.groups?.some(g => g.id === groupId);
        } else if (activeSegment.startsWith('category:')) {
            const catName = activeSegment.split(':')[1];
            matchesSegment = contact?.category === catName;
        } else if (activeSegment.startsWith('tag:')) {
            const tagName = activeSegment.split(':')[1];
            matchesSegment = contact?.tags?.includes(tagName);
        }

        return matchesSearch && matchesSegment;
    });

    const displayConversations = useMemo(() => {
        let list = [...filteredConversations];
        if (selectedJid && !selectedJid.startsWith('segment:')) {
            const hasConv = list.some(c => getPhoneLast10(c.jid) === getPhoneLast10(selectedJid));
            if (!hasConv) {
                const contact = getContactForJid(selectedJid) || allContacts.find(c => getPhoneLast10(c.phone) === getPhoneLast10(selectedJid));
                if (contact) {
                    const cleanPhoneDigits = contact.phone.replace(/\D/g, '');
                    const jid = cleanPhoneDigits.length === 10 ? `91${cleanPhoneDigits}@s.whatsapp.net` : `${cleanPhoneDigits}@s.whatsapp.net`;
                    list.unshift({
                        jid: selectedJid || jid,
                        name: contact.name,
                        lastMessage: "New Conversation",
                        timestamp: Math.floor(Date.now() / 1000),
                        unreadCount: 0,
                        messages: []
                    });
                }
            }
        }
        return list;
    }, [filteredConversations, selectedJid, allContacts]);

    const filteredContacts = allContacts.filter(contact => {
        const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contact.phone.includes(searchTerm);

        let matchesSegment = true;
        if (activeSegment.startsWith('group:')) {
            const groupId = activeSegment.split(':')[1];
            matchesSegment = contact.groups?.some(g => g.id === groupId);
        } else if (activeSegment.startsWith('category:')) {
            const catName = activeSegment.split(':')[1];
            matchesSegment = contact.category === catName;
        } else if (activeSegment.startsWith('tag:')) {
            const tagName = activeSegment.split(':')[1];
            matchesSegment = contact.tags?.includes(tagName);
        }

        return matchesSearch && matchesSegment;
    });

    const handleTabChange = (value) => {
        setActiveTab(value);
    };

    if (isLoading && conversations.length === 0) {
        return (
            <div className="flex h-[calc(100vh-100px)] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div id='main-content-container' className="h-full flex flex-col overflow-hidden shadow-2xl transition-all ">


            <div className="border-b border-border/50 bg-card/20 backdrop-blur-sm shrink-0">
                <div className="flex items-center justify-between gap-2 py-2 px-4">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-primary" />
                        <h1 className="text-xl font-bold tracking-tight">WhatsApp Chats</h1>
                    </div>
                    <div className="flex flex-row gap-2">
                        <div className="relative w-80 border rounded-lg">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                            <Input
                                placeholder={`Search ${activeTab}...`}
                                className="bg-background/50 border-border/40 pl-9 h-9 text-xs rounded-lg"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <AccountSwitcher />
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 rounded-lg border-border/40 bg-background/50 hover:bg-muted/50 shrink-0"
                            onClick={() => {
                                fetchConversations();
                                toast.success("Refreshed messages");
                            }}
                            title="Refresh messages"
                        >
                            <RefreshCw className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                        </Button>
                    </div>
                </div>

            </div>


            <div className="flex-1 min-h-0 flex overflow-hidden">

                <div className="w-[320px] md:w-[360px] border-r border-border/50 flex flex-col h-full shrink-0 overflow-hidden bg-card/5">
                    <Tabs value={activeTab} onValueChange={handleTabChange} className="flex flex-col flex-1 min-h-0 w-full overflow-hidden">

                        <div className="px-3 h-12 py-1.5 border-b border-border/50 bg-muted/5 flex items-center shrink-0">
                            <TabsList className="grid w-full grid-cols-3 h-9 bg-muted/40 p-0.5 rounded-lg border border-border/40">
                                <TabsTrigger value="chats" className="text-xs h-7.5 rounded-md font-medium">Chats</TabsTrigger>
                                <TabsTrigger value="contacts" className="text-xs h-7.5 rounded-md font-medium">Contacts</TabsTrigger>
                                <TabsTrigger value="segments" className="text-[10.5px] px-1 h-7.5 rounded-md font-medium truncate" title="Group/Category/Tags">Group/Category</TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="chats" className="flex-1 min-h-0 m-0 p-0 border-0 data-[state=active]:flex flex-col overflow-hidden">
                            {/* Segment Filters Inside Tab */}
                            <div className="px-3 py-1.5 border-b border-border/40 bg-card/20 flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth shrink-0">
                                <Badge
                                    variant={activeSegment === 'all' ? 'default' : 'outline'}
                                    className="cursor-pointer text-[10px] shrink-0 font-medium h-5 px-2"
                                    onClick={() => setActiveSegment('all')}
                                >
                                    All Chats
                                </Badge>
                                {activeSegment.startsWith('tag:') && (
                                    <Badge
                                        variant="default"
                                        className="cursor-pointer text-[10px] shrink-0 gap-1 font-medium h-5 px-2 bg-amber-500 text-white"
                                        onClick={() => setActiveSegment('all')}
                                    >
                                        <Tag className="w-2.5 h-2.5" />
                                        <span>#{activeSegment.split(':')[1]}</span>
                                        <X className="w-2.5 h-2.5 ml-0.5 hover:opacity-80" />
                                    </Badge>
                                )}
                                {Array.from(new Set(allContacts.map(c => c.category).filter(Boolean))).sort().map(catName => (
                                    <Badge
                                        key={catName}
                                        variant={activeSegment === `category:${catName}` ? 'default' : 'outline'}
                                        className="cursor-pointer text-[10px] shrink-0 gap-1 font-medium h-5 px-2"
                                        onClick={() => setActiveSegment(`category:${catName}`)}
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary/80 shrink-0" />
                                        <span>{catName}</span>
                                    </Badge>
                                ))}
                                {groups.map(group => (
                                    <Badge
                                        key={group.id}
                                        variant={activeSegment === `group:${group.id}` ? 'default' : 'outline'}
                                        className="cursor-pointer text-[10px] shrink-0 font-medium h-5 px-2"
                                        onClick={() => setActiveSegment(`group:${group.id}`)}
                                    >
                                        {group.name}
                                    </Badge>
                                ))}
                            </div>

                            <ScrollArea id="chats-contacts-list" className="flex-1 min-h-0 w-full overflow-x-hidden [&>div>div]:block! [&>div>div]:w-full">
                                <div id="chats-contacts-list-content" className="flex flex-col w-full min-w-0">
                                    {displayConversations.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center flex-1 h-full text-center p-8 animate-in fade-in zoom-in duration-700">
                                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 relative">
                                                <MessageSquare className="w-8 h-8 text-primary/60" />
                                                <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping duration-3000" />
                                            </div>
                                            <h3 className="text-sm font-bold text-zinc-800 mb-1">No Conversations Found</h3>
                                            <p className="text-xs text-muted-foreground max-w-[200px] leading-relaxed">
                                                {activeSegment === 'all' ? "Your message history will appear here." : "No chats match the selected filter."}
                                            </p>
                                        </div>
                                    ) : (
                                        displayConversations.map((chat) => (
                                            <div
                                                id='chatinfoblock'
                                                key={chat.jid}
                                                onClick={() => setSelectedJid(chat.jid)}
                                                className={`flex items-start gap-2.5 p-3 w-full border-b border-border/20 cursor-pointer transition-all hover:bg-primary/5 group ${getPhoneLast10(selectedJid) === getPhoneLast10(chat.jid) ? 'bg-primary/10 border-r-2 ' : ''}`}
                                            >
                                                {/* Left: Avatar */}
                                                <Avatar className="w-10 h-10 border-2 border-background shadow-xs shrink-0 mt-0.5">
                                                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                                                        {(chat.name || chat.jid.split('@')[0]).substring(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>

                                                {/* Middle: Name, Category, Phone, Message Snippet */}
                                                <div className="flex-1 min-w-0 w-0 overflow-hidden">
                                                    <div className="flex items-center gap-1.5 min-w-0 mb-0.5">
                                                        <h3 className="text-xs font-bold truncate group-hover:text-primary transition-colors">
                                                            {chat.name || chat.jid.split('@')[0]}
                                                        </h3>
                                                        {getContactForJid(chat.jid)?.category && (
                                                            <Badge variant="outline" className="text-[8px] py-0 px-1 h-3.5 shrink-0 max-w-[65px] truncate border-emerald-500/30 text-emerald-400 bg-emerald-500/10 font-normal">
                                                                {getContactForJid(chat.jid).category}
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    <p className="text-[9px] text-muted-foreground/60 truncate font-mono mb-1">
                                                        {getContactForJid(chat.jid)?.phone || chat.jid.split('@')[0]}
                                                    </p>

                                                    <div className="flex items-center gap-1 min-w-0 w-full overflow-hidden">
                                                        {chat.fromMe && <span className="text-[9px] uppercase font-bold text-primary/70 shrink-0">You:</span>}
                                                        <p className="text-[11px] text-muted-foreground truncate opacity-70 min-w-0 flex-1 block overflow-hidden text-ellipsis whitespace-nowrap leading-tight">
                                                            {renderMessagePreview(chat.lastMessage)}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Right: Timestamp & DropdownMenu Action */}
                                                <div id='dropdownoptions' className="flex flex-col items-end justify-between shrink-0 ml-auto pl-1 self-stretch gap-1">
                                                    <span className="text-[9px] text-muted-foreground whitespace-nowrap shrink-0">
                                                        {formatDistanceToNow(new Date(chat.timestamp * 1000))} ago
                                                    </span>

                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6 p-0 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all shrink-0"
                                                                onClick={(e) => e.stopPropagation()}
                                                                title="More options"
                                                            >
                                                                <MoreVertical className="w-3.5 h-3.5" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48 z-50 shadow-xl border-border/60 bg-popover">
                                                            <DropdownMenuItem
                                                                className="gap-2 cursor-pointer text-emerald-600 focus:text-emerald-700 focus:bg-emerald-500/10 font-medium"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setManageContactJid(chat.jid);
                                                                    setIsManageContactOpen(true);
                                                                }}
                                                            >
                                                                <UserPlus className="w-3.5 h-3.5" /> {getContactForJid(chat.jid) ? "Edit Contact & Tags" : "Add to Contacts"}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                className="gap-2 cursor-pointer"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setViewContactJid(chat.jid);
                                                                    setIsViewContactOpen(true);
                                                                }}
                                                            >
                                                                <Eye className="w-3.5 h-3.5" /> View Contact
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                className="gap-2 cursor-pointer text-purple-600 focus:text-purple-700 focus:bg-purple-50"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleAssignConversation(chat.jid);
                                                                }}
                                                            >
                                                                <Share2 className="w-3.5 h-3.5" /> Share / Delegate
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                className="gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteConversation(e, chat.jid);
                                                                }}
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" /> Delete Chat
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </ScrollArea>
                        </TabsContent>

                        <TabsContent value="contacts" className="flex-1 min-h-0 m-0 p-0 border-0 data-[state=active]:flex flex-col">
                            {/* Segment Filters Inside Tab */}
                            <div className="px-3 py-1.5 border-b border-border/40 bg-card/20 flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
                                <Badge
                                    variant={activeSegment === 'all' ? 'default' : 'outline'}
                                    className="cursor-pointer text-[10px] shrink-0 font-medium h-5 px-2"
                                    onClick={() => setActiveSegment('all')}
                                >
                                    All Contacts
                                </Badge>
                                {activeSegment.startsWith('tag:') && (
                                    <Badge
                                        variant="default"
                                        className="cursor-pointer text-[10px] shrink-0 gap-1 font-medium h-5 px-2 bg-amber-500 text-white"
                                        onClick={() => setActiveSegment('all')}
                                    >
                                        <Tag className="w-2.5 h-2.5" />
                                        <span>#{activeSegment.split(':')[1]}</span>
                                        <X className="w-2.5 h-2.5 ml-0.5 hover:opacity-80" />
                                    </Badge>
                                )}
                                {Array.from(new Set(allContacts.map(c => c.category).filter(Boolean))).sort().map(catName => (
                                    <Badge
                                        key={catName}
                                        variant={activeSegment === `category:${catName}` ? 'default' : 'outline'}
                                        className="cursor-pointer text-[10px] shrink-0 gap-1 font-medium h-5 px-2"
                                        onClick={() => setActiveSegment(`category:${catName}`)}
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 shrink-0" />
                                        <span>{catName}</span>
                                    </Badge>
                                ))}
                                {groups.map(group => (
                                    <Badge
                                        key={group.id}
                                        variant={activeSegment === `group:${group.id}` ? 'default' : 'outline'}
                                        className="cursor-pointer text-[10px] shrink-0 font-medium h-5 px-2"
                                        onClick={() => setActiveSegment(`group:${group.id}`)}
                                    >
                                        {group.name}
                                    </Badge>
                                ))}
                            </div>

                            <ScrollArea className="flex-1 min-h-0 w-full overflow-x-hidden [&>div>div]:block! [&>div>div]:w-full">
                                <div className="flex flex-col w-full min-w-0">
                                    {filteredContacts.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center flex-1 h-full text-center p-8 animate-in fade-in zoom-in duration-700">
                                            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4 relative">
                                                <Users className="w-8 h-8 text-emerald-500/60" />
                                                <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 animate-ping duration-3000" />
                                            </div>
                                            <h3 className="text-sm font-bold text-zinc-800 mb-1">No Contacts Found</h3>
                                            <p className="text-xs text-muted-foreground max-w-[200px] leading-relaxed">
                                                We couldn&apos;t find any contacts matching the selected filter.
                                            </p>
                                        </div>
                                    ) : (
                                        filteredContacts.map((contact) => {
                                            const contactLast10 = getPhoneLast10(contact.phone);
                                            const existingConv = conversations.find(c => getPhoneLast10(c.jid) === contactLast10);
                                            const cleanPhoneDigits = contact.phone.replace(/\D/g, '');
                                            const normalizedJid = existingConv ? existingConv.jid : (cleanPhoneDigits.length === 10 ? `91${cleanPhoneDigits}@s.whatsapp.net` : `${cleanPhoneDigits}@s.whatsapp.net`);
                                            const isSelected = getPhoneLast10(selectedJid) === contactLast10;
                                            return (
                                                <div
                                                    key={contact.id}
                                                    onClick={() => handleSelectContactChat(contact)}
                                                    className={`flex items-center gap-3 p-4 border-b border-border/20 cursor-pointer transition-all hover:bg-primary/5 group ${isSelected ? 'bg-primary/10 border-r-2 border-r-primary' : ''}`}
                                                >
                                                    <Avatar className="w-10 h-10 border-2 border-background shadow-sm">
                                                        <AvatarFallback className="bg-emerald-500/10 text-emerald-500 font-bold text-xs">
                                                            {(contact.name || contact.phone).substring(0, 2).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-0.5">
                                                            <h3 className="text-xs font-bold truncate group-hover:text-primary transition-colors">{contact.name}</h3>
                                                            <Badge variant="outline" className="text-[8px] py-0 h-3 opacity-50">
                                                                {contact.category || contact.type || "Contact"}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-[11px] text-muted-foreground truncate opacity-70">
                                                            {contact.phone}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </ScrollArea>
                        </TabsContent>

                        <TabsContent value="segments" className="flex-1 min-h-0 m-0 p-0 border-0 data-[state=active]:flex flex-col">
                            {/* Sub Segment Filter Badges */}
                            <div className="px-3 py-1.5 border-b border-border/40 bg-card/20 flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
                                <div className="flex items-center gap-1">
                                    {[
                                        { id: 'all', label: 'All' },
                                        { id: 'categories', label: `Categories (${uniqueCategories.length})` },
                                        { id: 'groups', label: `Groups (${groups.length})` },
                                        { id: 'tags', label: `Tags (${uniqueTags.length})` },
                                    ].map(tab => (
                                        <Badge
                                            key={tab.id}
                                            variant={segmentViewFilter === tab.id ? 'default' : 'outline'}
                                            className={`cursor-pointer text-[10px] shrink-0 font-medium h-5 px-2 transition-all ${segmentViewFilter === tab.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                                                }`}
                                            onClick={() => setSegmentViewFilter(tab.id)}
                                        >
                                            {tab.label}
                                        </Badge>
                                    ))}
                                </div>
                                {activeSegment !== 'all' && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-5 px-1.5 text-[9px] font-bold text-muted-foreground hover:text-destructive shrink-0 gap-0.5"
                                        onClick={() => setActiveSegment('all')}
                                        title="Clear active filter"
                                    >
                                        <X className="w-2.5 h-2.5" /> Clear
                                    </Button>
                                )}
                            </div>

                            <ScrollArea className="flex-1 min-h-0 w-full overflow-x-hidden [&>div>div]:block! [&>div>div]:w-full">
                                <div className="flex flex-col p-2.5 space-y-3 w-full">
                                    {/* 1. CATEGORIES SECTION */}
                                    {(segmentViewFilter === 'all' || segmentViewFilter === 'categories') && (
                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between px-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                                <span className="flex items-center gap-1.5 text-blue-400">
                                                    <FolderPlus className="w-3.5 h-3.5" />
                                                    <span>Categories</span>
                                                </span>
                                                <span className="text-[10px] opacity-70 font-mono">
                                                    {uniqueCategories.length}
                                                </span>
                                            </div>

                                            {uniqueCategories.length === 0 ? (
                                                <div className="text-[11px] text-muted-foreground/60 italic px-2 py-1.5 bg-muted/10 rounded-lg border border-dashed border-border/30">
                                                    No categories created yet.
                                                </div>
                                            ) : (
                                                <div className="space-y-1">
                                                    {uniqueCategories.map(cat => {
                                                        const catContacts = allContacts.filter(c => c.category === cat.name);
                                                        const isExpanded = !!expandedSegments[`category:${cat.name}`];
                                                        const isFilterActive = activeSegment === `category:${cat.name}`;
                                                        const isSelectedSegment = selectedJid === `segment:category:${cat.name}`;

                                                        return (
                                                            <div key={cat.name} className={`rounded-lg border transition-all ${isSelectedSegment
                                                                ? 'border-primary ring-1 ring-primary/40 bg-primary/10'
                                                                : isFilterActive
                                                                    ? 'border-primary/50 bg-primary/5'
                                                                    : 'border-border/40 bg-card/30 hover:border-border/80'
                                                                }`}>
                                                                <div
                                                                    className="flex items-center justify-between p-2 cursor-pointer select-none"
                                                                    onClick={() => setSelectedJid(`segment:category:${cat.name}`)}
                                                                >
                                                                    <div className="flex items-center gap-2 min-w-0">
                                                                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color || '#3b82f6' }} />
                                                                        <span className="text-xs font-semibold truncate text-foreground">{cat.name}</span>
                                                                        <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 font-mono">
                                                                            {catContacts.length}
                                                                        </Badge>
                                                                    </div>
                                                                    <div className="flex items-center gap-1">
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className={`h-5 px-1.5 text-[9px] rounded font-medium gap-1 ${isFilterActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                                                                                }`}
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setActiveSegment(isFilterActive ? 'all' : `category:${cat.name}`);
                                                                                setActiveTab('chats');
                                                                            }}
                                                                            title={isFilterActive ? "Remove filter" : "Filter chats by this category"}
                                                                        >
                                                                            <Filter className="w-2.5 h-2.5" />
                                                                            <span>{isFilterActive ? 'Filtered' : 'Filter'}</span>
                                                                        </Button>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                toggleSegmentExpand(`category:${cat.name}`);
                                                                            }}
                                                                        >
                                                                            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                                                        </Button>
                                                                    </div>
                                                                </div>

                                                                {isExpanded && (
                                                                    <div className="px-2 pb-2 pt-0.5 border-t border-border/20 space-y-1">
                                                                        {catContacts.length === 0 ? (
                                                                            <p className="text-[10px] text-muted-foreground/60 italic py-1 px-1">No contacts in this category</p>
                                                                        ) : (
                                                                            catContacts.map(contact => {
                                                                                const contactLast10 = getPhoneLast10(contact.phone);
                                                                                const isSelected = getPhoneLast10(selectedJid) === contactLast10;
                                                                                return (
                                                                                    <div
                                                                                        key={contact.id}
                                                                                        onClick={() => handleSelectContactChat(contact)}
                                                                                        className={`flex items-center justify-between p-1.5 rounded-md cursor-pointer text-xs transition-colors hover:bg-primary/10 ${isSelected ? 'bg-primary/15 font-semibold text-primary' : 'text-foreground/90'
                                                                                            }`}
                                                                                    >
                                                                                        <div className="flex items-center gap-2 truncate">
                                                                                            <Avatar className="w-5 h-5 shrink-0 border border-border/40">
                                                                                                <AvatarFallback className="text-[8px] bg-primary/10 text-primary font-bold">
                                                                                                    {(contact.name || contact.phone).substring(0, 2).toUpperCase()}
                                                                                                </AvatarFallback>
                                                                                            </Avatar>
                                                                                            <span className="truncate text-xs">{contact.name}</span>
                                                                                        </div>
                                                                                        <span className="text-[10px] text-muted-foreground font-mono shrink-0">{contact.phone}</span>
                                                                                    </div>
                                                                                );
                                                                            })
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* 2. BROADCAST GROUPS SECTION */}
                                    {(segmentViewFilter === 'all' || segmentViewFilter === 'groups') && (
                                        <div className="space-y-1.5 pt-1 border-t border-border/20">
                                            <div className="flex items-center justify-between px-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                                <span className="flex items-center gap-1.5 text-emerald-400">
                                                    <Users className="w-3.5 h-3.5" />
                                                    <span>Broadcast Groups</span>
                                                </span>
                                                <span className="text-[10px] opacity-70 font-mono">
                                                    {groups.length}
                                                </span>
                                            </div>

                                            {groups.length === 0 ? (
                                                <div className="text-[11px] text-muted-foreground/60 italic px-2 py-1.5 bg-muted/10 rounded-lg border border-dashed border-border/30">
                                                    No broadcast groups created yet.
                                                </div>
                                            ) : (
                                                <div className="space-y-1">
                                                    {groups.map(group => {
                                                        const groupContacts = allContacts.filter(c => c.groups?.some(g => g.id === group.id));
                                                        const isExpanded = !!expandedSegments[`group:${group.id}`];
                                                        const isFilterActive = activeSegment === `group:${group.id}`;
                                                        const isSelectedSegment = selectedJid === `segment:group:${group.id}`;

                                                        return (
                                                            <div key={group.id} className={`rounded-lg border transition-all ${isSelectedSegment
                                                                ? 'border-emerald-500 ring-1 ring-emerald-500/40 bg-emerald-500/10'
                                                                : isFilterActive
                                                                    ? 'border-emerald-500/50 bg-emerald-500/5'
                                                                    : 'border-border/40 bg-card/30 hover:border-border/80'
                                                                }`}>
                                                                <div
                                                                    className="flex items-center justify-between p-2 cursor-pointer select-none"
                                                                    onClick={() => setSelectedJid(`segment:group:${group.id}`)}
                                                                >
                                                                    <div className="flex items-center gap-2 min-w-0">
                                                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
                                                                        <span className="text-xs font-semibold truncate text-foreground">{group.name}</span>
                                                                        <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 font-mono">
                                                                            {groupContacts.length}
                                                                        </Badge>
                                                                    </div>
                                                                    <div className="flex items-center gap-1">
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className={`h-5 px-1.5 text-[9px] rounded font-medium gap-1 ${isFilterActive ? 'bg-emerald-500 text-white' : 'text-muted-foreground hover:text-foreground'
                                                                                }`}
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setActiveSegment(isFilterActive ? 'all' : `group:${group.id}`);
                                                                                setActiveTab('chats');
                                                                            }}
                                                                            title={isFilterActive ? "Remove filter" : "Filter chats by this group"}
                                                                        >
                                                                            <Filter className="w-2.5 h-2.5" />
                                                                            <span>{isFilterActive ? 'Filtered' : 'Filter'}</span>
                                                                        </Button>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                toggleSegmentExpand(`group:${group.id}`);
                                                                            }}
                                                                        >
                                                                            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                                                        </Button>
                                                                    </div>
                                                                </div>

                                                                {isExpanded && (
                                                                    <div className="px-2 pb-2 pt-0.5 border-t border-border/20 space-y-1">
                                                                        {groupContacts.length === 0 ? (
                                                                            <p className="text-[10px] text-muted-foreground/60 italic py-1 px-1">No contacts in this group</p>
                                                                        ) : (
                                                                            groupContacts.map(contact => {
                                                                                const contactLast10 = getPhoneLast10(contact.phone);
                                                                                const isSelected = getPhoneLast10(selectedJid) === contactLast10;
                                                                                return (
                                                                                    <div
                                                                                        key={contact.id}
                                                                                        onClick={() => handleSelectContactChat(contact)}
                                                                                        className={`flex items-center justify-between p-1.5 rounded-md cursor-pointer text-xs transition-colors hover:bg-emerald-500/10 ${isSelected ? 'bg-emerald-500/15 font-semibold text-emerald-600' : 'text-foreground/90'
                                                                                            }`}
                                                                                    >
                                                                                        <div className="flex items-center gap-2 truncate">
                                                                                            <Avatar className="w-5 h-5 shrink-0 border border-border/40">
                                                                                                <AvatarFallback className="text-[8px] bg-emerald-500/10 text-emerald-500 font-bold">
                                                                                                    {(contact.name || contact.phone).substring(0, 2).toUpperCase()}
                                                                                                </AvatarFallback>
                                                                                            </Avatar>
                                                                                            <span className="truncate text-xs">{contact.name}</span>
                                                                                        </div>
                                                                                        <span className="text-[10px] text-muted-foreground font-mono shrink-0">{contact.phone}</span>
                                                                                    </div>
                                                                                );
                                                                            })
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* 3. TAGS & BADGES SECTION */}
                                    {(segmentViewFilter === 'all' || segmentViewFilter === 'tags') && (
                                        <div className="space-y-1.5 pt-1 border-t border-border/20">
                                            <div className="flex items-center justify-between px-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                                <span className="flex items-center gap-1.5 text-amber-400">
                                                    <Tag className="w-3.5 h-3.5" />
                                                    <span>Tags & Badges</span>
                                                </span>
                                                <span className="text-[10px] opacity-70 font-mono">
                                                    {uniqueTags.length}
                                                </span>
                                            </div>

                                            {uniqueTags.length === 0 ? (
                                                <div className="text-[11px] text-muted-foreground/60 italic px-2 py-1.5 bg-muted/10 rounded-lg border border-dashed border-border/30">
                                                    No tags assigned to contacts yet.
                                                </div>
                                            ) : (
                                                <div className="space-y-1">
                                                    {uniqueTags.map(tagName => {
                                                        const taggedContacts = allContacts.filter(c => c.tags?.includes(tagName));
                                                        const isExpanded = !!expandedSegments[`tag:${tagName}`];
                                                        const isFilterActive = activeSegment === `tag:${tagName}`;
                                                        const isSelectedSegment = selectedJid === `segment:tag:${tagName}`;

                                                        return (
                                                            <div key={tagName} className={`rounded-lg border transition-all ${isSelectedSegment
                                                                ? 'border-amber-500 ring-1 ring-amber-500/40 bg-amber-500/10'
                                                                : isFilterActive
                                                                    ? 'border-amber-500/50 bg-amber-500/5'
                                                                    : 'border-border/40 bg-card/30 hover:border-border/80'
                                                                }`}>
                                                                <div
                                                                    className="flex items-center justify-between p-2 cursor-pointer select-none"
                                                                    onClick={() => setSelectedJid(`segment:tag:${tagName}`)}
                                                                >
                                                                    <div className="flex items-center gap-2 min-w-0">
                                                                        <Badge variant="outline" className="text-[10px] font-semibold border-amber-500/30 text-amber-500 bg-amber-500/10 px-1.5 py-0 h-4">
                                                                            #{tagName}
                                                                        </Badge>
                                                                        <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 font-mono">
                                                                            {taggedContacts.length}
                                                                        </Badge>
                                                                    </div>
                                                                    <div className="flex items-center gap-1">
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className={`h-5 px-1.5 text-[9px] rounded font-medium gap-1 ${isFilterActive ? 'bg-amber-500 text-white' : 'text-muted-foreground hover:text-foreground'
                                                                                }`}
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setActiveSegment(isFilterActive ? 'all' : `tag:${tagName}`);
                                                                                setActiveTab('chats');
                                                                            }}
                                                                            title={isFilterActive ? "Remove filter" : "Filter chats by this tag"}
                                                                        >
                                                                            <Filter className="w-2.5 h-2.5" />
                                                                            <span>{isFilterActive ? 'Filtered' : 'Filter'}</span>
                                                                        </Button>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                toggleSegmentExpand(`tag:${tagName}`);
                                                                            }}
                                                                        >
                                                                            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                                                        </Button>
                                                                    </div>
                                                                </div>

                                                                {isExpanded && (
                                                                    <div className="px-2 pb-2 pt-0.5 border-t border-border/20 space-y-1">
                                                                        {taggedContacts.length === 0 ? (
                                                                            <p className="text-[10px] text-muted-foreground/60 italic py-1 px-1">No contacts with this tag</p>
                                                                        ) : (
                                                                            taggedContacts.map(contact => {
                                                                                const contactLast10 = getPhoneLast10(contact.phone);
                                                                                const isSelected = getPhoneLast10(selectedJid) === contactLast10;
                                                                                return (
                                                                                    <div
                                                                                        key={contact.id}
                                                                                        onClick={() => handleSelectContactChat(contact)}
                                                                                        className={`flex items-center justify-between p-1.5 rounded-md cursor-pointer text-xs transition-colors hover:bg-amber-500/10 ${isSelected ? 'bg-amber-500/15 font-semibold text-amber-600' : 'text-foreground/90'
                                                                                            }`}
                                                                                    >
                                                                                        <div className="flex items-center gap-2 truncate">
                                                                                            <Avatar className="w-5 h-5 shrink-0 border border-border/40">
                                                                                                <AvatarFallback className="text-[8px] bg-amber-500/10 text-amber-500 font-bold">
                                                                                                    {(contact.name || contact.phone).substring(0, 2).toUpperCase()}
                                                                                                </AvatarFallback>
                                                                                            </Avatar>
                                                                                            <span className="truncate text-xs">{contact.name}</span>
                                                                                        </div>
                                                                                        <span className="text-[10px] text-muted-foreground font-mono shrink-0">{contact.phone}</span>
                                                                                    </div>
                                                                                );
                                                                            })
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden bg-background/30 backdrop-blur-[2px]">
                    {selectedJid ? (
                        <>
                            {/* Chat Header */}
                            {isSegmentChat ? (
                                <div className="px-4 h-14 border-b border-border/50 bg-card/20 backdrop-blur-md flex items-center justify-between shrink-0">
                                    <div className="flex items-center gap-3">
                                        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedJid(null)}>
                                            <ArrowLeft className="w-4 h-4" />
                                        </Button>
                                        <Avatar className="w-10 h-10 border border-border/50 shadow-xs">
                                            <AvatarFallback className={`font-bold ${activeSegmentData?.type === 'group'
                                                ? 'bg-emerald-500/15 text-emerald-500'
                                                : activeSegmentData?.type === 'category'
                                                    ? 'bg-blue-500/15 text-blue-500'
                                                    : 'bg-amber-500/15 text-amber-500'
                                                }`}>
                                                {activeSegmentData?.type === 'group' ? <Users className="w-5 h-5" /> : activeSegmentData?.type === 'category' ? <FolderPlus className="w-5 h-5" /> : <Tag className="w-5 h-5" />}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h2 className="text-sm font-bold">{activeSegmentData?.name}</h2>
                                                <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-primary/30 text-primary bg-primary/10 font-semibold uppercase tracking-wider">
                                                    Broadcast Channel
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-[11px] text-muted-foreground">
                                                    {activeSegmentData?.recipients?.length || 0} recipient{activeSegmentData?.recipients?.length === 1 ? '' : 's'}
                                                </p>
                                                <span className="text-muted-foreground/40">•</span>
                                                <span className="text-[10px] text-emerald-500 font-medium flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                    Live Broadcast
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 px-3 gap-1.5 text-xs font-medium rounded-lg border-border/60 hover:bg-muted/50 text-foreground"
                                            onClick={() => setIsRecipientsDialogOpen(true)}
                                            title="View all recipients in this segment"
                                        >
                                            <Users className="w-3.5 h-3.5 text-primary" />
                                            <span className="hidden sm:inline">Recipients ({activeSegmentData?.recipients?.length || 0})</span>
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="px-4 h-14 border-b border-border/50 bg-card/20 backdrop-blur-md flex items-center justify-between shrink-0">
                                    <div className="flex items-center gap-3">
                                        <Button variant="ghost" size="icon" className="md:hidden">
                                            <ArrowLeft className="w-4 h-4" />
                                        </Button>
                                        <Avatar className="w-10 h-10 border border-border/50">
                                            <AvatarFallback className="bg-emerald-500/10 text-emerald-500 font-bold">
                                                {(activeName || '??').substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h2 className="text-sm font-bold">{activeName}</h2>
                                                {getContactForJid(selectedJid)?.category && (
                                                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-emerald-500/30 text-emerald-400 bg-emerald-500/10 font-medium">
                                                        {getContactForJid(selectedJid).category}
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-tight">
                                                    {selectedChat ? "Active Conversation" : "New Chat"}
                                                </p>
                                                {getContactForJid(selectedJid)?.groups?.map(g => (
                                                    <Badge key={g.id} variant="secondary" className="text-[8px] px-1 py-0 h-3.5 opacity-80 bg-muted/60">
                                                        {g.name}
                                                    </Badge>
                                                ))}
                                                {getContactForJid(selectedJid)?.tags?.slice(0, 2).map(t => (
                                                    <Badge key={t} variant="outline" className="text-[8px] px-1 py-0 h-3.5 font-normal text-muted-foreground">
                                                        #{t}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className={`h-8 px-2.5 gap-1.5 text-xs font-semibold rounded-lg transition-all text-foreground hover:text-foreground ${getContactForJid(selectedJid)
                                                ? "border-border/60 hover:bg-muted/50"
                                                : "border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20"
                                                }`}
                                            onClick={() => {
                                                setManageContactJid(selectedJid);
                                                setIsManageContactOpen(true);
                                            }}
                                            title={getContactForJid(selectedJid) ? "Manage Contact, Groups & Tags" : "Add user to Contacts"}
                                        >
                                            {getContactForJid(selectedJid) ? (
                                                <>
                                                    <Tag className="w-3.5 h-3.5 text-amber-400" />
                                                    <span className="hidden sm:inline text-foreground">Tags & Groups</span>
                                                </>
                                            ) : (
                                                <>
                                                    <UserPlus className="w-3.5 h-3.5" />
                                                    <span className="text-foreground">Add Contact</span>
                                                </>
                                            )}
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="rounded-full h-8 px-3 gap-1.5 text-xs opacity-80 hover:opacity-100 hover:bg-purple-100 hover:text-purple-700 transition-colors"
                                            onClick={() => selectedJid && handleAssignConversation(selectedJid)}
                                            title="Share this conversation"
                                        >
                                            <Share2 className="w-3.5 h-3.5" />
                                            <span className="hidden sm:inline">Share</span>
                                        </Button>
                                        <Button variant="ghost" size="icon" className="rounded-full w-9 h-9 opacity-60 hover:opacity-100">
                                            <Video className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="rounded-full w-9 h-9 opacity-60 hover:opacity-100">
                                            <Phone className="w-4 h-4" />
                                        </Button>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="rounded-full w-9 h-9 opacity-60 hover:opacity-100">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-52">
                                                <DropdownMenuItem
                                                    className="gap-2 cursor-pointer text-emerald-500 focus:text-emerald-400 focus:bg-emerald-500/10 font-medium"
                                                    onClick={() => {
                                                        setManageContactJid(selectedJid);
                                                        setIsManageContactOpen(true);
                                                    }}
                                                >
                                                    <UserPlus size={14} />
                                                    {getContactForJid(selectedJid) ? "Edit Contact, Tags & Groups" : "Add to Contacts"}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="gap-2 cursor-pointer"
                                                    onClick={() => {
                                                        setViewContactJid(selectedJid);
                                                        setIsViewContactOpen(true);
                                                    }}
                                                >
                                                    <Eye size={14} /> View Contact Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="gap-2 cursor-pointer text-purple-400 focus:text-purple-300 focus:bg-purple-500/10"
                                                    onClick={() => handleAssignConversation(selectedJid)}
                                                >
                                                    <Share2 size={14} /> Share / Delegate
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                                                    onClick={(e) => handleDeleteConversation(e, selectedJid)}
                                                >
                                                    <Trash2 size={14} /> Delete Conversation
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            )}

                            {/* Chat Messages */}
                            {isSegmentChat ? (
                                <ScrollArea className="flex-1 min-h-0 p-4 md:p-6 relative w-full overflow-x-hidden [&>div>div]:block! [&>div>div]:w-full">
                                    <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#005a4a 0.5px, transparent 0.5px)', backgroundSize: '20px 20px' }} />

                                    <div className="flex flex-col gap-4 relative z-10 pb-12 max-w-3xl mx-auto">
                                        {/* Broadcast Information Card */}
                                        <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 backdrop-blur-xs flex items-start gap-3.5 shadow-xs">
                                            <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-primary mt-0.5">
                                                <Radio className="w-4 h-4 text-primary animate-pulse" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-xs font-bold text-foreground mb-0.5">
                                                    Broadcast Channel • {activeSegmentData?.name} ({activeSegmentData?.recipients?.length || 0} Members)
                                                </h4>
                                                <p className="text-[11px] text-muted-foreground leading-relaxed">
                                                    Messages and templates sent here will be delivered simultaneously to all {activeSegmentData?.recipients?.length || 0} members. Each contact receives a personal direct message from your WhatsApp number.
                                                </p>
                                                {activeSegmentData?.recipients?.length > 0 && (
                                                    <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                                                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-tight mr-1">Recipients:</span>
                                                        {activeSegmentData.recipients.slice(0, 4).map(r => (
                                                            <Badge key={r.id} variant="secondary" className="text-[9px] px-1.5 py-0 h-4 bg-background/60 border border-border/40">
                                                                {r.name} ({r.phone})
                                                            </Badge>
                                                        ))}
                                                        {activeSegmentData.recipients.length > 4 && (
                                                            <Badge
                                                                variant="outline"
                                                                className="text-[9px] px-1.5 py-0 h-4 cursor-pointer hover:bg-muted font-mono"
                                                                onClick={() => setIsRecipientsDialogOpen(true)}
                                                            >
                                                                +{activeSegmentData.recipients.length - 4} more
                                                            </Badge>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Broadcast Messages Feed */}
                                        {(!broadcastHistory[selectedJid] || broadcastHistory[selectedJid].length === 0) ? (
                                            <div className="flex flex-col items-center justify-center py-16 text-center opacity-70">
                                                <div className="w-12 h-12 rounded-full bg-muted/40 flex items-center justify-center mb-3">
                                                    <Megaphone className="w-6 h-6 text-muted-foreground" />
                                                </div>
                                                <h3 className="text-xs font-bold mb-1">No Broadcast Messages Sent Yet</h3>
                                                <p className="text-[11px] text-muted-foreground max-w-xs leading-relaxed">
                                                    Type a message or select a WhatsApp template below to broadcast to all {activeSegmentData?.recipients?.length || 0} members.
                                                </p>
                                            </div>
                                        ) : (
                                            broadcastHistory[selectedJid].map((msg) => (
                                                <div key={msg.id} className="flex justify-end w-full">
                                                    <div className="max-w-[85%] relative bg-primary text-primary-foreground p-3.5 rounded-2xl rounded-tr-none shadow-sm space-y-1.5">
                                                        <div className="flex items-center justify-between gap-4 text-[10px] opacity-80 border-b border-primary-foreground/20 pb-1">
                                                            <span className="font-semibold flex items-center gap-1">
                                                                <Radio className="w-2.5 h-2.5" /> Broadcast Message
                                                            </span>
                                                            <span>Sent to {msg.recipientCount || activeSegmentData?.recipients?.length} members</span>
                                                        </div>
                                                        <p className="text-xs whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                                                        <div className="flex items-center justify-end gap-1.5 text-[9px] opacity-75 pt-0.5">
                                                            <span>{formatDistanceToNow(new Date(msg.timestamp * 1000))} ago</span>
                                                            {msg.status === 'PENDING' ? (
                                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                            ) : (
                                                                <CheckCheck className="w-3 h-3 text-emerald-300" />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                        <div ref={scrollRef} className="h-4 w-full shrink-0" />
                                    </div>
                                </ScrollArea>
                            ) : (
                                <ScrollArea className="flex-1 min-h-0 p-4 md:p-6 relative w-full overflow-x-hidden [&>div>div]:block! [&>div>div]:w-full">
                                    {/* WhatsApp-style Background Pattern Overlay */}
                                    <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#005a4a 0.5px, transparent 0.5px)', backgroundSize: '20px 20px' }} />

                                    <div className="flex flex-col gap-3 relative z-10 pb-12">
                                        {!selectedChat || selectedChat.messages.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-20 opacity-40">
                                                <MessageSquare className="w-12 h-12 mb-4" />
                                                <p className="text-sm font-medium italic">Starting a new conversation...</p>
                                            </div>
                                        ) : (
                                            selectedChat.messages.map((msg, i) => {
                                                const isTemplate = msg.metadata?.type === 'template' ||
                                                    msg.metadata?.type === 'TEMPLATE' ||
                                                    Boolean(msg.metadata?.templateName) ||
                                                    Boolean(msg.metadata?.originalPayload?.template?.name) ||
                                                    (typeof msg.text === 'string' && msg.text.startsWith('[Template:'));
                                                const type = msg.metadata?.type?.toLowerCase() || (isTemplate ? 'template' : 'text');
                                                const isInteractiveOrProduct = type === 'interactive' || type === 'order' || type === 'product' || type === 'catalog_message' ||
                                                    (typeof msg.text === 'string' && (msg.text.startsWith('[Product:') || msg.text.startsWith('[Catalog]') || msg.text.startsWith('🛒 Order')));
                                                const isMedia = !isTemplate && (isInteractiveOrProduct || ['image', 'video', 'audio', 'document', 'sticker', 'voice', 'location', 'contacts', 'poll', 'poll_creation', 'interactive', 'order', 'unsupported'].includes(type));
                                                const templateName = msg.metadata?.templateName ||
                                                    msg.metadata?.originalPayload?.template?.name ||
                                                    (typeof msg.text === 'string' && msg.text.startsWith('[Template:')
                                                        ? msg.text.split('[Template:')[1]?.split(']')[0]?.trim()
                                                        : null);
                                                const templateDef = (isTemplate && templateName)
                                                    ? templates.find(t => t.templateName === templateName || t.name === templateName)
                                                    : null;

                                                return (
                                                    <div
                                                        key={msg.id}
                                                        className={`flex w-full mb-4 ${msg.fromMe ? 'justify-end' : 'justify-start'}`}
                                                    >
                                                        <div className={`relative group max-w-[85%] ${msg.fromMe ? 'mr-2' : 'ml-2'}`}>
                                                            {isTemplate ? (
                                                                <div
                                                                    onClick={() => handleTemplateClick(msg)}
                                                                    className="cursor-pointer transition-transform active:scale-[0.98]"
                                                                >
                                                                    <TemplateMessage
                                                                        msg={msg}
                                                                        templateDefinition={templateDef}
                                                                    />
                                                                </div>
                                                            ) : isMedia ? (
                                                                <div className={`relative px-1 py-1 rounded-2xl shadow-sm text-sm transition-all duration-200 ${msg.fromMe
                                                                    ? 'bg-primary/5 border border-primary/20 rounded-tr-none'
                                                                    : 'bg-card border border-border/50 rounded-tl-none'
                                                                    }`}>
                                                                    <MediaBubble msg={msg} workspaceId={workspaceId} />
                                                                </div>
                                                            ) : (
                                                                <div
                                                                    className={`relative px-4 py-2.5 rounded-2xl shadow-sm text-sm transition-all duration-200 ${msg.fromMe
                                                                        ? 'bg-primary text-primary-foreground rounded-tr-none'
                                                                        : 'bg-card border border-border/50 rounded-tl-none'
                                                                        }`}
                                                                >
                                                                    <p className="leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>

                                                                    {/* Source Tail (Bubble Hook) for regular text */}
                                                                    {msg.fromMe ? (
                                                                        <div className="absolute -right-[6px] top-0 w-0 h-0 border-t-8 border-t-primary border-r-8 border-r-transparent" />
                                                                    ) : (
                                                                        <div className="absolute -left-[6px] top-0 w-0 h-0 border-t-8 border-t-card border-l-8 border-l-transparent" />
                                                                    )}
                                                                </div>
                                                            )}

                                                            {/* Hover Action: Forward */}
                                                            <div
                                                                className={`absolute top-1 ${msg.fromMe ? '-left-8' : '-right-8'} opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center gap-1`}
                                                            >
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-6 w-6 rounded-full bg-card/90 border border-border/60 shadow-xs hover:bg-muted text-muted-foreground hover:text-primary transition-all"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setForwardingMsg(msg);
                                                                        setIsForwardOpen(true);
                                                                    }}
                                                                    title="Forward message"
                                                                >
                                                                    <Forward className="w-3 h-3" />
                                                                </Button>
                                                            </div>

                                                            {/* Common Meta Info (Time & Status) */}
                                                            <div className={`flex items-center justify-end gap-1 mt-1 text-[9px] px-1 ${msg.fromMe ? 'text-primary/60' : 'text-muted-foreground/60'}`}>
                                                                {formatDistanceToNow(new Date(msg.timestamp * 1000))} ago
                                                                {msg.fromMe && <MessageStatus status={msg.status} />}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                        <div ref={scrollRef} className="h-8 w-full shrink-0" />
                                    </div>
                                </ScrollArea>
                            )}

                            {/* Chat Input */}
                            <div className="p-4 bg-card/30 backdrop-blur-sm border-t border-border/50 flex items-center gap-3 shrink-0">
                                <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary transition-colors">
                                    <Smile className="w-5 h-5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary transition-colors">
                                    <Paperclip className="w-5 h-5" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    title="Send a Template"
                                    onClick={handleOpenTemplatePicker}
                                    className="rounded-full text-muted-foreground hover:text-primary transition-colors"
                                >
                                    <Layout className="w-5 h-5" />
                                </Button>

                                <form onSubmit={handleSendMessage} className="flex-1 flex flex-col gap-2">
                                    {/* AI Suggestions Chips */}
                                    {aiSuggestions.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-1 animate-in slide-in-from-bottom-2 duration-300">
                                            {aiSuggestions.map((s, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => handleApplySuggestion(s)}
                                                    className="bg-primary/10 hover:bg-primary/20 text-primary text-[10px] px-2.5 py-1 rounded-full border border-primary/20 transition-colors max-w-[200px] truncate"
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => setAiSuggestions([])}
                                                className="text-[10px] text-muted-foreground hover:text-foreground px-2"
                                            >
                                                Clear
                                            </button>
                                        </div>
                                    )}
                                    <div className="flex gap-3 items-center">
                                        <div className="flex-1 relative">
                                            <Input
                                                className="bg-background/50 border-border/30 h-10 rounded-full px-4 text-xs focus-visible:ring-primary/20 w-full"
                                                placeholder={isSegmentChat ? `Broadcast to all ${activeSegmentData?.recipients?.length || 0} members of ${activeSegmentData?.name || 'group'}...` : "Type a message..."}
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                            />
                                            <Button
                                                type="button"
                                                onClick={handleGetAiSuggestions}
                                                disabled={isAiLoading || (!selectedChat && !isSegmentChat)}
                                                variant="ghost"
                                                size="icon"
                                                className="absolute right-1 top-1 w-8 h-8 rounded-full text-primary hover:bg-primary/10"
                                            >
                                                {isAiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                                            </Button>
                                        </div>
                                        <Button
                                            type="submit"
                                            disabled={!newMessage.trim() || isSending}
                                            className="rounded-full w-10 h-10 p-0 bg-primary hover:bg-primary/90 shrink-0"
                                            title={isSegmentChat ? `Broadcast message to ${activeSegmentData?.recipients?.length || 0} members` : "Send message"}
                                        >
                                            {isSending ? <Loader2 className="w-4 h-4 animate-spin font-bold" /> : <Send className="w-4 h-4" />}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div id='chat-empty' className="flex-1 flex flex-col items-center justify-center p-8 text-center h-full bg-muted/5 animate-in fade-in zoom-in duration-700">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 relative">
                                <MessageSquare className="w-8 h-8 text-primary/60" />
                                <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping duration-3000" />
                            </div>

                            <h3 className="text-sm font-bold text-zinc-800 mb-1">Select a conversation</h3>
                            <p className="text-xs text-muted-foreground max-w-[200px] leading-relaxed opacity-80">
                                Choose from your existing chats or find a colleague in the contacts tab to begin messaging.
                            </p>
                        </div>
                    )}
                </div>

            </div>

            {/* ===== Template Picker Modal ===== */}
            {
                isTemplateDrawerOpen && (
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="w-full max-w-lg bg-card border border-border/60 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                            {/* Header */}
                            <div className="flex items-center justify-between px-5 py-4 border-b border-border/50 bg-muted/10">
                                <div className="flex items-center gap-2">
                                    <Layout className="w-4 h-4 text-primary" />
                                    <h2 className="font-semibold text-sm">
                                        {selectedTemplateForSend ? 'Fill Variables' : 'Select a Template'}
                                    </h2>
                                </div>
                                <button
                                    onClick={() => { setIsTemplateDrawerOpen(false); setSelectedTemplateForSend(null); }}
                                    className="text-muted-foreground hover:text-foreground transition-colors text-lg leading-none"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-4 max-h-[65vh] overflow-y-auto">
                                {!selectedTemplateForSend ? (
                                    /* Template List */
                                    <>
                                        {templates.filter(t => t.approved || t.status === 'APPROVED').length === 0 ? (
                                            <div className="text-center py-10 text-muted-foreground">
                                                <Layout className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                                <p className="text-xs">No approved templates found.</p>
                                                <p className="text-xs opacity-70 mt-1">Sync your templates from the Templates page.</p>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-2">
                                                {templates
                                                    .filter(t => t.approved || t.status === 'APPROVED')
                                                    .map(tpl => (
                                                        <button
                                                            key={tpl.id}
                                                            onClick={() => handleSelectTemplate(tpl)}
                                                            className="text-left p-3 rounded-xl border border-border/40 hover:border-primary/50 hover:bg-primary/5 transition-all duration-150 group"
                                                        >
                                                            <div className="flex items-start justify-between gap-2">
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                                                                        {tpl.name}
                                                                    </p>
                                                                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                                                                        {tpl.body}
                                                                    </p>
                                                                </div>
                                                                <div className="flex flex-col items-end gap-1 shrink-0">
                                                                    <span className="text-[9px] bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-1.5 py-0.5 rounded-full font-medium">
                                                                        APPROVED
                                                                    </span>
                                                                    <span className="text-[9px] text-muted-foreground uppercase">{tpl.language || 'en'}</span>
                                                                </div>
                                                            </div>
                                                        </button>
                                                    ))}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    /* Variable Input View */
                                    <div className="flex flex-col gap-4">
                                        {/* Template Preview */}
                                        <div className="rounded-xl bg-muted/30 border border-border/40 p-3">
                                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Preview</p>
                                            <p className="text-xs leading-relaxed text-foreground whitespace-pre-wrap">
                                                {fillTemplatePreview(selectedTemplateForSend.body, templateVars)}
                                            </p>
                                        </div>

                                        {/* Media Header Input if required */}
                                        {['IMAGE', 'VIDEO', 'DOCUMENT'].includes((selectedTemplateForSend.type || '').toUpperCase()) && (
                                            <div className="flex flex-col gap-1.5 bg-primary/5 p-3 rounded-xl border border-primary/10">
                                                <label className="text-[10px] font-semibold text-primary uppercase tracking-wide flex items-center gap-1.5">
                                                    <span className="flex h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                                                    {selectedTemplateForSend.type} Header Required
                                                </label>
                                                <Input
                                                    value={templateMediaUrl}
                                                    onChange={(e) => setTemplateMediaUrl(e.target.value)}
                                                    placeholder={`https://... or Meta Media ID`}
                                                    className="h-9 text-xs bg-background/60 border-border/40 focus-visible:ring-primary/20"
                                                />
                                                <p className="text-[9px] text-muted-foreground">
                                                    Provide a public URL (e.g. Supabase link) or Meta Media ID to change the image for this message.
                                                </p>
                                            </div>
                                        )}

                                        {/* Variable Fields */}
                                        {Object.keys(templateVars).length > 0 ? (
                                            <div className="flex flex-col gap-3">
                                                <p className="text-xs font-medium text-muted-foreground">Fill in the variables:</p>
                                                {Object.keys(templateVars).map((key, idx) => (
                                                    <div key={key} className="flex flex-col gap-1">
                                                        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                                                            Variable {idx + 1} <span className="text-primary">{key}</span>
                                                        </label>
                                                        <Input
                                                            autoFocus={idx === 0}
                                                            value={templateVars[key]}
                                                            onChange={(e) => setTemplateVars(prev => ({ ...prev, [key]: e.target.value }))}
                                                            placeholder={`Enter value for ${key}...`}
                                                            className="h-9 text-xs bg-background/60 border-border/40"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-muted-foreground text-center py-2">No variables required for this template.</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Footer Actions */}
                            <div className="px-5 py-3 border-t border-border/50 bg-muted/5 flex items-center justify-between gap-3">
                                {selectedTemplateForSend ? (
                                    <>
                                        <Button variant="ghost" size="sm" className="text-xs" onClick={() => setSelectedTemplateForSend(null)}>
                                            ← Back
                                        </Button>
                                        <Button size="sm" className="text-xs bg-primary" onClick={handleSendTemplate}>
                                            Send Template
                                        </Button>
                                    </>
                                ) : (
                                    <div className="text-[10px] text-muted-foreground italic">
                                        Select an approved template to continue
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }
            {/* Delete Confirmation Modal */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent className="sm:max-w-[425px] bg-card/95 backdrop-blur-2xl border-destructive/20 shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-lg font-bold text-destructive flex items-center gap-2">
                            <Trash2 className="w-5 h-5 text-destructive shrink-0" />
                            <span>Delete Conversation?</span>
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-xs font-medium text-muted-foreground mt-2">
                            This will permanently delete all messages in this conversation.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 sm:gap-0 mt-4">
                        <AlertDialogCancel disabled={isDeleting} className="rounded-md font-bold">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                confirmDelete();
                            }}
                            disabled={isDeleting}
                            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-md font-bold flex items-center gap-2"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete Chat"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Assign Conversation Dialog */}
            <Dialog open={isAssignOpen} onOpenChange={(open) => { setIsAssignOpen(open); if (!open) setJidToAssign(null); }}>
                <DialogContent className="bg-card border-border max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Share2 className="w-4 h-4" /> Share Conversation
                        </DialogTitle>
                        <DialogDescription>
                            Share this conversation with other users. They will be able to view and reply to messages.
                        </DialogDescription>
                    </DialogHeader>

                    {(() => {
                        const activeChat = conversations.find(c => c.jid === jidToAssign);
                        const sharedWithList = activeChat?.sharedWith || [];
                        return (
                            <div className="space-y-4 py-2">
                                <div className="space-y-2">
                                    <Label>Select User</Label>
                                    <div className="flex gap-2">
                                        <Select value={selectedAssignEmail} onValueChange={setSelectedAssignEmail}>
                                            <SelectTrigger className="flex-1">
                                                <SelectValue placeholder="Choose a user..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {assignUsers.map((user) => {
                                                    const isShared = new Set([
                                                        ...sharedWithList.map(s => s.sharedWithUserId),
                                                        ...(userId ? [userId] : [])
                                                    ]).has(user.id);
                                                    return (
                                                        <SelectItem key={user.id} value={user.email} disabled={isShared}>
                                                            {user.displayName || user.email} {isShared ? '(Already shared)' : ''}
                                                        </SelectItem>
                                                    );
                                                })}
                                            </SelectContent>
                                        </Select>
                                        <Button onClick={confirmAssign} disabled={isAssigning || !selectedAssignEmail} className="gap-2">
                                            {isAssigning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
                                            Share
                                        </Button>
                                    </div>
                                </div>

                                {sharedWithList.length > 0 && (
                                    <div className="space-y-2">
                                        <Label>Shared with</Label>
                                        <div className="space-y-2 max-h-40 overflow-y-auto">
                                            {sharedWithList.map((share) => (
                                                <div key={share.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/50">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                                        <span className="text-sm truncate">{share.sharedWith?.displayName || share.sharedWith?.email}</span>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="w-7 h-7 text-muted-foreground hover:text-destructive shrink-0"
                                                        onClick={() => executeRemoveAssign(
                                                            { workspaceId, jid: jidToAssign, sharedWithUserId: share.sharedWithUserId },
                                                            { jid: jidToAssign, sharedWithUserId: share.sharedWithUserId }
                                                        )}
                                                        disabled={isRemovingAssign}
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })()}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setIsAssignOpen(false); setJidToAssign(null); }}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Contact Dialog */}
            <Dialog open={isViewContactOpen} onOpenChange={(open) => { setIsViewContactOpen(open); if (!open) setViewContactJid(null); }}>
                <DialogContent className="bg-card border-border max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <User className="w-4 h-4" /> Contact Details
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        {(() => {
                            const contact = viewContactJid ? getContactForJid(viewContactJid) : null;
                            return (
                                <>
                                    {contact ? (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 pb-3 border-b border-border/50">
                                                <Avatar className="w-12 h-12 border-2 border-background shadow-sm">
                                                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                                                        {(contact.name || contact.phone || '?').substring(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <h3 className="text-sm font-bold">{contact.name}</h3>
                                                    <span className="text-xs text-muted-foreground/70">{viewContactJid?.split('@')[0]}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Phone className="w-3.5 h-3.5" /> {contact.phone}
                                                </div>
                                                {contact.email && (
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <Mail className="w-3.5 h-3.5" /> {contact.email}
                                                    </div>
                                                )}
                                                {contact.category && (
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <Tag className="w-3.5 h-3.5" /> {contact.category}
                                                    </div>
                                                )}
                                                {contact.tags?.length > 0 && (
                                                    <div className="flex items-start gap-2 text-muted-foreground">
                                                        <Tag className="w-3.5 h-3.5 mt-0.5" />
                                                        <div className="flex flex-wrap gap-1">
                                                            {contact.tags.map(t => (
                                                                <Badge key={t} variant="outline" className="text-[9px] h-4 px-1">{t}</Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {contact.type && (
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <Info className="w-3.5 h-3.5" /> Type: {contact.type}
                                                    </div>
                                                )}
                                                {contact.lastInteraction && (
                                                    <div className="text-[11px] text-muted-foreground/50">
                                                        Last interaction: {new Date(contact.lastInteraction).toLocaleString()}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <p className="text-sm">Contact not found in your contacts list.</p>
                                            <p className="text-xs mt-1">JID: {viewContactJid?.split('@')[0]}</p>
                                        </div>
                                    )}
                                </>
                            );
                        })()}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setIsViewContactOpen(false); setViewContactJid(null); }}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Manage Contact & Group / Tag Modal */}
            <ManageContactModal
                isOpen={isManageContactOpen}
                onOpenChange={setIsManageContactOpen}
                selectedJid={manageContactJid || selectedJid}
                selectedChat={conversations.find(c => c.jid === (manageContactJid || selectedJid))}
                existingContact={getContactForJid(manageContactJid || selectedJid)}
                categories={categories}
                groups={groups}
                userId={userId}
                workspaceId={workspaceId}
                onCategoryCreated={fetchCategories}
                onSaved={() => {
                    fetchContacts();
                    fetchConversations();
                }}
            />

            {/* Forward Message Modal */}
            <ForwardMessageModal
                isOpen={isForwardOpen}
                onClose={() => {
                    setIsForwardOpen(false);
                    setForwardingMsg(null);
                }}
                message={forwardingMsg}
                contacts={allContacts}
                conversations={conversations}
                workspaceId={workspaceId}
                onForward={(recipients, msgPayload) => {
                    executeForwardMessage({
                        workspaceId,
                        recipients,
                        message: msgPayload
                    });
                }}
                isLoading={isForwarding}
            />
            {/* Segment Recipients Dialog */}
            <Dialog open={isRecipientsDialogOpen} onOpenChange={setIsRecipientsDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-base">
                            <Users className="w-4 h-4 text-primary" />
                            <span>{activeSegmentData?.name} Recipients ({activeSegmentData?.recipients?.length || 0})</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Contacts who will receive messages sent in this {activeSegmentData?.type}.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 py-2">
                        <div className="relative">
                            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search recipients by name or phone..."
                                className="h-8 pl-8 text-xs bg-muted/20"
                                value={recipientSearchTerm}
                                onChange={(e) => setRecipientSearchTerm(e.target.value)}
                            />
                        </div>

                        <ScrollArea className="h-64 rounded-lg border border-border/40 p-2">
                            {(!activeSegmentData?.recipients || activeSegmentData.recipients.length === 0) ? (
                                <p className="text-xs text-muted-foreground text-center py-8">No contacts found in this {activeSegmentData?.type}.</p>
                            ) : (
                                <div className="space-y-1">
                                    {activeSegmentData.recipients
                                        .filter(r => (r.name || '').toLowerCase().includes(recipientSearchTerm.toLowerCase()) || (r.phone || '').includes(recipientSearchTerm))
                                        .map(r => (
                                            <div key={r.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/40 transition-colors text-xs">
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <Avatar className="w-7 h-7 border border-border/40">
                                                        <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-bold">
                                                            {(r.name || r.phone).substring(0, 2).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="min-w-0">
                                                        <p className="font-semibold truncate text-xs">{r.name}</p>
                                                        <p className="text-[10px] text-muted-foreground font-mono">{r.phone}</p>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-6 px-2 text-[10px] gap-1 shrink-0"
                                                    onClick={() => {
                                                        handleSelectContactChat(r);
                                                        setIsRecipientsDialogOpen(false);
                                                    }}
                                                >
                                                    <MessageSquare className="w-2.5 h-2.5" />
                                                    <span>Chat 1-on-1</span>
                                                </Button>
                                            </div>
                                        ))
                                    }
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
