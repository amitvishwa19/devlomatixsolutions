'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

import MailboxSidebar from './_components/MailboxSidebar';
import MailboxThreadList from './_components/MailboxThreadList';
import MailboxThreadDetail from './_components/MailboxThreadDetail';
import MailboxEmptyState from './_components/MailboxEmptyState';
import MailboxComposeSheet from './_components/MailboxComposeSheet';

import {
    getMailboxThreadsAction,
    getMailboxThreadDetailAction,
    sendMailboxEmailAction,
    updateMailboxThreadAction,
    getMailboxContactsAndDealsAction
} from './_actions/mailbox-actions';
import { useCrmSocket } from '@/providers/CrmSocketProvider';

export default function CrmMailboxPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const workspaceId = params?.workspaceId;
    const queryThreadId = searchParams?.get('threadId');

    // Mailbox state
    const [threads, setThreads] = useState([]);
    const [selectedThreadId, setSelectedThreadId] = useState(null);
    const [threadDetail, setThreadDetail] = useState(null);
    const [counts, setCounts] = useState({ unread: 0, inbox: 0, starred: 0, sent: 0, archive: 0, trash: 0 });
    const [currentFolder, setCurrentFolder] = useState('INBOX');
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoadingThreads, setIsLoadingThreads] = useState(true);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);

    // Quick Reply state
    const [replyBody, setReplyBody] = useState('');
    const [isSendingReply, setIsSendingReply] = useState(false);

    // Compose Sheet Modal state (54vw)
    const [isComposeOpen, setIsComposeOpen] = useState(false);
    const [composeTo, setComposeTo] = useState('');
    const [composeCc, setComposeCc] = useState('');
    const [composeBcc, setComposeBcc] = useState('');
    const [composeSubject, setComposeSubject] = useState('');
    const [composeBody, setComposeBody] = useState('');
    const [composeBodyText, setComposeBodyText] = useState('');
    const [composeAttachments, setComposeAttachments] = useState([]);
    const [composeContactId, setComposeContactId] = useState('');
    const [composeDealId, setComposeDealId] = useState('');
    const [isSendingCompose, setIsSendingCompose] = useState(false);

    // Autocomplete data for composer
    const [contactsList, setContactsList] = useState([]);
    const [dealsList, setDealsList] = useState([]);
    const [senderInfo, setSenderInfo] = useState(null);
    const [senderName, setSenderName] = useState('');

    // Socket real-time updates from global CRM Socket Provider
    const { socket, isConnected } = useCrmSocket() || {};

    // Track active mailbox thread so WorkspaceMessageNotifier knows when user is actively reading it
    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.__crm_mailbox_active_thread_id = selectedThreadId;
        }
        return () => {
            if (typeof window !== 'undefined') {
                window.__crm_mailbox_active_thread_id = null;
            }
        };
    }, [selectedThreadId]);

    // Deep link selection from notifications (?threadId=...)
    useEffect(() => {
        if (queryThreadId && queryThreadId !== selectedThreadId) {
            setSelectedThreadId(queryThreadId);
            loadThreadDetail(queryThreadId);
        }
    }, [queryThreadId]);

    // 1. Fetch Threads via Server Action
    const loadThreads = useCallback(async (folder, search = searchQuery) => {
        const targetFolder = folder !== undefined ? folder : currentFolder;
        setIsLoadingThreads(true);
        try {
            const res = await getMailboxThreadsAction(workspaceId, {
                folder: targetFolder,
                search
            });

            if (res.success) {
                setThreads(res.data || []);
                if (res.counts) setCounts(res.counts);
            } else {
                toast.error(res.error || 'Failed to fetch emails');
            }
        } catch (err) {
            toast.error('Network error loading emails');
        } finally {
            setIsLoadingThreads(false);
        }
    }, [workspaceId, currentFolder, searchQuery]);

    // Folder navigation with direct folder load
    const handleSelectFolder = useCallback((folderId) => {
        setCurrentFolder(folderId);
        setSelectedThreadId(null);
        setThreadDetail(null);
        loadThreads(folderId, searchQuery);
    }, [loadThreads, searchQuery]);

    // Initial fetch of contacts and deals for composer autocomplete (once per workspace)
    useEffect(() => {
        if (workspaceId) {
            getMailboxContactsAndDealsAction(workspaceId).then(res => {
                if (res.success) {
                    setContactsList(res.data.contacts || []);
                    setDealsList(res.data.deals || []);
                    if (res.data.senderInfo) {
                        setSenderInfo(res.data.senderInfo);
                        setSenderName(prev => prev || res.data.senderInfo.name || '');
                    }
                }
            });
        }
    }, [workspaceId]);

    // Initial threads fetch on mount
    useEffect(() => {
        if (workspaceId) {
            loadThreads('INBOX', searchQuery);
        }
    }, [workspaceId]);

    // 2. Fetch Thread Detail via Server Action
    const loadThreadDetail = async (threadId) => {
        if (!threadId) return;
        setIsLoadingDetail(true);
        try {
            const res = await getMailboxThreadDetailAction(workspaceId, threadId);
            if (res.success) {
                setThreadDetail(res.data);
                // Optimistically decrease unread count
                setCounts(prev => ({
                    ...prev,
                    unread: Math.max(0, (prev.unread || 0) - (res.data.unreadCount || 1))
                }));
                setThreads(prev => prev.map(t => t.id === threadId ? { ...t, unreadCount: 0 } : t));
            } else {
                toast.error(res.error || 'Failed to load thread');
            }
        } catch (err) {
            toast.error('Error loading email details');
        } finally {
            setIsLoadingDetail(false);
        }
    };

    const handleSelectThread = (threadId) => {
        setSelectedThreadId(threadId);
        // Direct useState update: mark thread read in list immediately
        setThreads(prev => prev.map(t => (t.id === threadId && t.unreadCount > 0 ? { ...t, unreadCount: 0 } : t)));
        loadThreadDetail(threadId);
    };

    // 3. Socket listener for instant inbound emails & sent updates
    useEffect(() => {
        if (!socket) return;

        const handleNewEmail = (data) => {
            if (!data || (workspaceId && data.workspaceId && data.workspaceId !== workspaceId)) return;

            // Direct useState count update
            setCounts(prev => ({
                ...prev,
                unread: (prev.unread || 0) + 1,
                inbox: (prev.inbox || 0) + 1
            }));

            // Prepend or refresh threads if in INBOX
            if (currentFolder === 'INBOX' || currentFolder === 'ALL') {
                loadThreads(currentFolder, searchQuery);
            }

            // If user is currently viewing this exact thread, refresh conversation live
            if (selectedThreadId && data.threadId === selectedThreadId) {
                loadThreadDetail(selectedThreadId);
            }
        };

        const handleEmailSent = (data) => {
            setCounts(prev => ({
                ...prev,
                sent: (prev.sent || 0) + 1
            }));
            if (currentFolder === 'SENT' || currentFolder === 'ALL') {
                loadThreads(currentFolder, searchQuery);
            }
            if (selectedThreadId && data.threadId === selectedThreadId) {
                loadThreadDetail(selectedThreadId);
            }
        };

        socket.on('crm:mailbox:new_email', handleNewEmail);
        socket.on('crm:mailbox:email_sent', handleEmailSent);

        return () => {
            socket.off('crm:mailbox:new_email', handleNewEmail);
            socket.off('crm:mailbox:email_sent', handleEmailSent);
        };
    }, [socket, selectedThreadId, currentFolder, searchQuery, loadThreads, workspaceId]);

    // Keyboard Shortcuts (c to compose, Escape to close/back)
    useEffect(() => {
        const handleKeyDown = (e) => {
            const activeTag = document.activeElement?.tagName?.toLowerCase();
            const isContentEditable = document.activeElement?.isContentEditable;
            const isInputActive = activeTag === 'input' || activeTag === 'textarea' || isContentEditable;

            if (e.key === 'c' && !isInputActive && !isComposeOpen) {
                e.preventDefault();
                setIsComposeOpen(true);
            } else if (e.key === 'Escape') {
                if (isComposeOpen) {
                    setIsComposeOpen(false);
                } else if (selectedThreadId) {
                    setSelectedThreadId(null);
                    setThreadDetail(null);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isComposeOpen, selectedThreadId]);

    // 4. Thread Actions via Server Action with immediate useState updates
    const handleToggleStar = async (threadId) => {
        // Optimistic useState update: flip star immediately in list and detail
        let newStarredStatus = false;
        setThreads(prev => prev.map(t => {
            if (t.id === threadId) {
                newStarredStatus = !t.isStarred;
                return { ...t, isStarred: newStarredStatus };
            }
            return t;
        }));
        if (threadDetail && threadDetail.id === threadId) {
            setThreadDetail(prev => ({ ...prev, isStarred: !prev.isStarred }));
        }

        try {
            const res = await updateMailboxThreadAction(workspaceId, {
                threadId,
                action: 'toggleStar'
            });
            if (res.success) {
                setThreads(prev => prev.map(t => t.id === threadId ? { ...t, isStarred: res.isStarred } : t));
                if (threadDetail && threadDetail.id === threadId) {
                    setThreadDetail(prev => ({ ...prev, isStarred: res.isStarred }));
                }
                setCounts(prev => ({
                    ...prev,
                    starred: res.isStarred ? (prev.starred || 0) + 1 : Math.max(0, (prev.starred || 0) - 1)
                }));
                toast.success(res.isStarred ? 'Starred' : 'Unstarred');
            } else {
                toast.error(res.error || 'Failed to update star');
                loadThreads(currentFolder, searchQuery);
            }
        } catch (err) {
            toast.error('Failed to update star');
            loadThreads(currentFolder, searchQuery);
        }
    };

    const handleMoveFolder = async (threadId, folder) => {
        // Optimistic useState update: immediately remove from current list
        setThreads(prev => prev.filter(t => t.id !== threadId));
        if (selectedThreadId === threadId) {
            setSelectedThreadId(null);
            setThreadDetail(null);
        }

        try {
            const res = await updateMailboxThreadAction(workspaceId, {
                threadId,
                action: 'setFolder',
                folder
            });
            if (res.success) {
                toast.success(`Moved to ${folder.toLowerCase()}`);
                loadThreads(currentFolder, searchQuery);
            } else {
                toast.error(res.error || 'Failed to move thread');
                loadThreads(currentFolder, searchQuery);
            }
        } catch (err) {
            toast.error('Failed to move thread');
            loadThreads(currentFolder, searchQuery);
        }
    };

    // 5. Send Quick Reply via Server Action with immediate useState updates
    const handleSendReply = async () => {
        if (!replyBody.trim()) {
            toast.error('Please enter a reply message');
            return;
        }

        if (!threadDetail) return;

        const lastMsg = threadDetail.messages?.[threadDetail.messages.length - 1];
        const recipient = lastMsg?.direction === 'INBOUND' ? lastMsg.fromEmail : threadDetail.contact?.email;

        if (!recipient) {
            toast.error('No recipient address found for this thread');
            return;
        }

        const replyContent = replyBody;
        setIsSendingReply(true);
        try {
            const subject = threadDetail.subject.startsWith('Re:')
                ? threadDetail.subject
                : `Re: ${threadDetail.subject}`;

            const res = await sendMailboxEmailAction(workspaceId, {
                threadId: threadDetail.id,
                contactId: threadDetail.contactId,
                dealId: threadDetail.dealId,
                senderName: senderName || senderInfo?.name || undefined,
                to: [recipient],
                subject,
                bodyText: replyContent,
                bodyHtml: `<div style="font-family: sans-serif; font-size: 14px; line-height: 1.6; color: #1e293b;">${replyContent.replace(/\n/g, '<br/>')}</div>`
            });

            if (res.success) {
                toast.success('Reply sent successfully via Resend');
                setReplyBody('');

                const newMsg = res.data?.message;

                // 1. Direct useState update: Immediately append reply to thread conversation
                if (newMsg) {
                    setThreadDetail(prev => {
                        if (!prev || prev.id !== threadDetail.id) return prev;
                        return {
                            ...prev,
                            lastMessageAt: new Date().toISOString(),
                            snippet: replyContent.slice(0, 160),
                            messages: [...(prev.messages || []), newMsg]
                        };
                    });
                }

                // 2. Direct useState update: Update snippet, timestamp and count in threads list
                setThreads(prev => prev.map(t => {
                    if (t.id === threadDetail.id) {
                        return {
                            ...t,
                            snippet: replyContent.slice(0, 160),
                            lastMessageAt: new Date().toISOString(),
                            _count: {
                                messages: (t._count?.messages || t.messages?.length || 1) + 1
                            }
                        };
                    }
                    return t;
                }));

                // 3. Direct useState update: Increment Sent count badge
                setCounts(prev => ({
                    ...prev,
                    sent: (prev.sent || 0) + 1
                }));

                // 4. Background re-sync
                loadThreadDetail(threadDetail.id);
            } else {
                toast.error(res.error || 'Failed to send reply');
            }
        } catch (err) {
            toast.error('Error sending reply: ' + err.message);
        } finally {
            setIsSendingReply(false);
        }
    };

    // Open Full Compose Sheet prefilled for reply
    const handleOpenReplyInComposer = () => {
        if (!threadDetail) return;
        const lastMsg = threadDetail.messages?.[threadDetail.messages.length - 1];
        const recipient = lastMsg?.direction === 'INBOUND' ? lastMsg.fromEmail : threadDetail.contact?.email;
        setComposeTo(recipient || '');
        setComposeSubject(threadDetail.subject.startsWith('Re:') ? threadDetail.subject : `Re: ${threadDetail.subject}`);
        setComposeContactId(threadDetail.contactId || null);
        setComposeDealId(threadDetail.dealId || null);
        if (replyBody) {
            setComposeBody(`<p>${replyBody.replace(/\n/g, '<br/>')}</p>`);
            setComposeBodyText(replyBody);
        }
        setIsComposeOpen(true);
    };

    // 6. Send Compose Email via Server Action with immediate useState updates
    const handleSendCompose = async () => {
        if (!composeTo.trim()) {
            toast.error('Recipient email is required');
            return;
        }
        if (!composeSubject.trim()) {
            toast.error('Subject is required');
            return;
        }
        if (!composeBody.trim()) {
            toast.error('Email content is required');
            return;
        }

        setIsSendingCompose(true);
        try {
            const ccList = composeCc ? composeCc.split(/[,;]+/).map(s => s.trim()).filter(Boolean) : [];
            const bccList = composeBcc ? composeBcc.split(/[,;]+/).map(s => s.trim()).filter(Boolean) : [];
            const cleanText = composeBodyText || composeBody.replace(/<[^>]+>/g, '').trim();
            const cleanHtml = composeBody.startsWith('<')
                ? composeBody
                : `<div style="font-family: sans-serif; font-size: 14px; line-height: 1.6; color: #1e293b;">${composeBody.replace(/\n/g, '<br/>')}</div>`;

            const res = await sendMailboxEmailAction(workspaceId, {
                senderName: senderName || senderInfo?.name || undefined,
                to: [composeTo.trim()],
                cc: ccList,
                bcc: bccList,
                subject: composeSubject.trim(),
                bodyText: cleanText,
                bodyHtml: cleanHtml,
                contactId: composeContactId || null,
                dealId: composeDealId || null,
                attachments: composeAttachments
            });

            if (res.success) {
                toast.success('Email dispatched via Resend!');
                setIsComposeOpen(false);
                setComposeTo('');
                setComposeCc('');
                setComposeBcc('');
                setComposeSubject('');
                setComposeBody('');
                setComposeBodyText('');
                setComposeAttachments([]);
                setComposeContactId('');
                setComposeDealId('');

                // 1. Immediately switch view to SENT folder so the user sees the sent mail
                setCurrentFolder('SENT');

                // 2. Direct useState update: Increment Sent counter in sidebar badge
                setCounts(prev => ({
                    ...prev,
                    sent: (prev.sent || 0) + 1
                }));

                const newThread = res.data?.thread;
                const newMsg = res.data?.message;

                // 3. Direct useState update: Prepend the new sent thread to threads list
                if (newThread) {
                    setThreads(prev => [newThread, ...prev.filter(t => t.id !== newThread.id)]);
                    setSelectedThreadId(newThread.id);
                    setThreadDetail({
                        ...newThread,
                        messages: newMsg ? [newMsg] : (newThread.messages || [])
                    });
                }

                // 4. Background sync for 'SENT' folder
                loadThreads('SENT', searchQuery);
            } else {
                toast.error(res.error || 'Failed to send email');
            }
        } catch (err) {
            toast.error('Error sending email: ' + err.message);
        } finally {
            setIsSendingCompose(false);
        }
    };

    return (
        <div className="flex absolute inset-0 w-full overflow-hidden p-0">

            <div id='mailbox-frame' className='flex flex-1 h-full w-full min-h-0 overflow-hidden rounded-lg'>
                {/* PANE 1: Folders Navigation Sidebar */}
                <MailboxSidebar
                    currentFolder={currentFolder}
                    counts={counts}
                    onSelectFolder={handleSelectFolder}
                    onOpenCompose={() => setIsComposeOpen(true)}
                />

                {/* PANE 2: Searchable Thread List */}
                <MailboxThreadList
                    threads={threads}
                    selectedThreadId={selectedThreadId}
                    currentFolder={currentFolder}
                    searchQuery={searchQuery}
                    isLoading={isLoadingThreads}
                    onSearchChange={setSearchQuery}
                    onSearchSubmit={() => loadThreads(currentFolder, searchQuery)}
                    onRefresh={() => loadThreads(currentFolder, searchQuery)}
                    onSelectThread={handleSelectThread}
                    onToggleStar={handleToggleStar}
                />

                {/* PANE 3: Thread Detail & Quick Reply Composer */}
                <div className={`flex-1 flex flex-col bg-card overflow-hidden ${!selectedThreadId ? 'hidden md:flex' : 'flex'
                    }`}>
                    {!selectedThreadId ? (
                        <MailboxEmptyState onOpenCompose={() => setIsComposeOpen(true)} />
                    ) : (
                        <MailboxThreadDetail
                            thread={threadDetail}
                            isLoading={isLoadingDetail}
                            replyBody={replyBody}
                            isSendingReply={isSendingReply}
                            onBack={() => setSelectedThreadId(null)}
                            onToggleStar={handleToggleStar}
                            onMoveFolder={handleMoveFolder}
                            onReplyChange={setReplyBody}
                            onSendReply={handleSendReply}
                            onOpenFullComposer={handleOpenReplyInComposer}
                            onLinkQuotation={() => router.push(`/workspace/${workspaceId}/crm/quotations`)}
                        />
                    )}
                </div>

                {/* COMPOSE SHEET MODAL */}
                <MailboxComposeSheet
                    isOpen={isComposeOpen}
                    onOpenChange={setIsComposeOpen}
                    senderInfo={senderInfo}
                    senderName={senderName}
                    onSenderNameChange={setSenderName}
                    to={composeTo}
                    cc={composeCc}
                    bcc={composeBcc}
                    subject={composeSubject}
                    body={composeBody}
                    contactId={composeContactId}
                    dealId={composeDealId}
                    attachments={composeAttachments}
                    contactsList={contactsList}
                    dealsList={dealsList}
                    isSending={isSendingCompose}
                    onToChange={setComposeTo}
                    onCcChange={setComposeCc}
                    onBccChange={setComposeBcc}
                    onSubjectChange={setComposeSubject}
                    onBodyChange={(html, text) => {
                        setComposeBody(html);
                        setComposeBodyText(text || '');
                    }}
                    onContactSelect={(contactId) => {
                        const found = contactsList.find(c => c.id === contactId);
                        if (found?.email) {
                            setComposeTo(found.email);
                            setComposeContactId(found.id);
                        }
                    }}
                    onDealSelect={setComposeDealId}
                    onAttachmentsChange={setComposeAttachments}
                    onSend={handleSendCompose}
                />

            </div>
        </div>
    );
}
