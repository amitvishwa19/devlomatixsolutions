import { useState, useMemo, useEffect, useCallback } from 'react';
import { MailboxSidebar } from './MailboxSidebar';
import { MessageList } from './MessageList';
import { MessageDetail } from './MessageDetail';
import { ComposeModal } from './ComposeModal';
//import { currentUser, mockEmails, mockDrafts as initialMockDrafts } from '@/mailer/_data/mockData';
import { toast } from 'sonner';
import { useNotifications } from '../_hooks/useNotifications';
import { useDrafts } from '../_hooks/useDrafts';
import { currentUser, mockDrafts as initialMockDrafts, mockEmails } from '../_data/mockData';
import { useSession } from 'next-auth/react';

// Helper to convert Gmail message to internal Message format
function gmailToMessage(gmail) {
  const sender = {
    id: gmail.sender_email || gmail.id,
    name: gmail.sender || 'Unknown',
    role: 'admin',
    department: 'External',
  };

  // Determine folder based on Gmail labels
  let folder = 'inbox';
  if (gmail.labels?.includes('SENT')) {
    folder = 'sent';
  } else if (gmail.labels?.includes('TRASH')) {
    folder = 'trash';
  }

  return {
    id: gmail.id,
    from: sender,
    to: [currentUser],
    subject: gmail.subject || '(No Subject)',
    body: gmail.body_text || gmail.body_html || gmail.snippet || '',
    timestamp: gmail.received_at ? new Date(gmail.received_at) : new Date(gmail.created_at),
    isRead: gmail.is_read ?? false,
    isStarred: gmail.is_starred ?? false,
    priority: 'normal',
    folder,
  };
}

export function Mailbox({ gmail, isLiveMode = false }) {
  const { emails: gmailEmails, isLoading, isSyncing, syncGmail, markAsRead, toggleStar, refetch } = gmail;

  // Use mock data for local mode, Gmail data for live mode
  const messages = useMemo(() => {
    if (!isLiveMode) {
      return mockEmails;
    }
    return gmailEmails.map(gmailToMessage);
  }, [gmailEmails, isLiveMode]);

  // Use mock drafts for local mode
  const [localMockDrafts, setLocalMockDrafts] = useState(initialMockDrafts);

  const [selectedMessage, setSelectedMessage] = useState(null);
  const [currentFolder, setCurrentFolder] = useState('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [selectedMessages, setSelectedMessages] = useState(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [editingDraft, setEditingDraft] = useState(null);

  const { notifyNewMail, requestNotificationPermission } = useNotifications();
  const { drafts: liveDrafts, saveDraft: saveLiveDraft, deleteDraft: deleteLiveDraft } = useDrafts();

  // Use appropriate drafts based on mode
  const drafts = isLiveMode ? liveDrafts : localMockDrafts;

  const saveDraft = isLiveMode
    ? saveLiveDraft
    : (draft) => {
      const newDraft = { ...draft, id: `draft-${Date.now()}`, savedAt: new Date() };
      setLocalMockDrafts(prev => [...prev, newDraft]);
    };

  const deleteDraft = isLiveMode
    ? deleteLiveDraft
    : (draftId) => {
      setLocalMockDrafts(prev => prev.filter(d => d.id !== draftId));
    };

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission();
  }, [requestNotificationPermission]);

  // Local state for mock messages (for marking read/starred in local mode)
  const [localMessages, setLocalMessages] = useState(mockEmails);

  // Get the actual messages to display
  const displayMessages = useMemo(() => {
    if (!isLiveMode) {
      return localMessages;
    }
    return messages;
  }, [isLiveMode, localMessages, messages]);

  // Filter messages based on current folder and search
  const filteredMessages = useMemo(() => {
    let filtered = displayMessages.filter(msg => {
      if (currentFolder === 'starred') {
        return msg.isStarred;
      }
      if (currentFolder === 'drafts') {
        return false; // Drafts are handled separately
      }
      return msg.folder === currentFolder;
    });

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(msg =>
        msg.subject.toLowerCase().includes(query) ||
        msg.from.name.toLowerCase().includes(query) ||
        msg.body.toLowerCase().includes(query)
      );
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [displayMessages, currentFolder, searchQuery]);

  // Calculate folder counts
  const folderCounts = useMemo(() => {
    return {
      inbox: displayMessages.filter(m => m.folder === 'inbox').length,
      sent: displayMessages.filter(m => m.folder === 'sent').length,
      starred: displayMessages.filter(m => m.isStarred).length,
      trash: displayMessages.filter(m => m.folder === 'trash').length,
      drafts: drafts.length,
    };
  }, [displayMessages, drafts.length]);

  const unreadCount = useMemo(() => {
    return displayMessages.filter(m => !m.isRead && m.folder === 'inbox').length;
  }, [displayMessages]);

  const handleMessageSelect = async (message) => {
    if (isSelectMode) {
      setSelectedMessages(prev => {
        const next = new Set(prev);
        if (next.has(message.id)) {
          next.delete(message.id);
        } else {
          next.add(message.id);
        }
        return next;
      });
    } else {
      setSelectedMessage(message);
      // Mark as read
      if (!message.isRead) {
        if (isLiveMode) {
          await markAsRead(message.id);
        } else {
          // Update local mock data
          setLocalMessages(prev => prev.map(m =>
            m.id === message.id ? { ...m, isRead: true } : m
          ));
        }
      }
    }
  };

  const handleToggleStar = async (messageId) => {
    if (isLiveMode) {
      // Update in database
      await toggleStar(messageId);
    } else {
      // Update local mock data
      setLocalMessages(prev => prev.map(m =>
        m.id === messageId ? { ...m, isStarred: !m.isStarred } : m
      ));
    }

    // Update local selected message state if needed
    if (selectedMessage?.id === messageId) {
      setSelectedMessage(prev => prev ? { ...prev, isStarred: !prev.isStarred } : null);
    }
  };

  const handleDelete = (messageId) => {
    setSelectedMessage(null);
    toast.success('Message moved to trash');
    // TODO: Update in database
  };

  const handleSendMessage = (to, subject, body, priority) => {
    // Use the sendEmail function from useGmail hook
    // For now, just show success toast
    setReplyTo(null);

    // If we were editing a draft, delete it
    if (editingDraft) {
      deleteDraft(editingDraft.id);
      setEditingDraft(null);
    }

    toast.success('Message sent successfully');
  };

  const handleSaveDraft = (recipientId, subject, body, priority) => {
    if (editingDraft) {
      // Update existing draft - for now just save a new one and delete old
      deleteDraft(editingDraft.id);
    }
    saveDraft({ recipientId, subject, body, priority });
    setEditingDraft(null);
    toast.success('Draft saved');
  };

  const handleReply = () => {
    if (selectedMessage) {
      setReplyTo({
        to: selectedMessage.from,
        subject: selectedMessage.subject,
      });
      setIsComposeOpen(true);
    }
  };

  const handleCompose = () => {
    setReplyTo(null);
    setEditingDraft(null);
    setIsComposeOpen(true);
  };

  const handleEditDraft = (draft) => {
    setEditingDraft(draft);
    setReplyTo(null);
    setIsComposeOpen(true);
  };

  const handleDeleteDraft = (draftId) => {
    deleteDraft(draftId);
    toast.success('Draft deleted');
  };

  // Bulk actions
  const handleBulkDelete = useCallback(() => {
    setSelectedMessages(new Set());
    setIsSelectMode(false);
    toast.success(`${selectedMessages.size} messages moved to trash`);
    // TODO: Update in database
  }, [selectedMessages]);

  const handleBulkMarkRead = useCallback(() => {
    setSelectedMessages(new Set());
    setIsSelectMode(false);
    toast.success(`${selectedMessages.size} messages marked as read`);
    // TODO: Update in database
  }, [selectedMessages]);

  const handleBulkStar = useCallback(() => {
    setSelectedMessages(new Set());
    setIsSelectMode(false);
    toast.success(`${selectedMessages.size} messages starred`);
    // TODO: Update in database
  }, [selectedMessages]);

  const handleSelectAll = useCallback(() => {
    if (selectedMessages.size === filteredMessages.length) {
      setSelectedMessages(new Set());
    } else {
      setSelectedMessages(new Set(filteredMessages.map(m => m.id)));
    }
  }, [filteredMessages, selectedMessages.size]);

  const handleToggleSelectMode = useCallback(() => {
    setIsSelectMode(prev => !prev);
    setSelectedMessages(new Set());
    setSelectedMessage(null);
  }, []);

  const { data: session } = useSession()

  console.log(session)

  return (
    <div className="flex h-full w-full overflow-hidden bg-card  hover:border-primary/30 transition-colors animate-fade-in rounded-md">
      <MailboxSidebar
        currentFolder={currentFolder}
        onFolderChange={(folder) => {
          setCurrentFolder(folder);
          setSelectedMessage(null);
          setIsSelectMode(false);
          setSelectedMessages(new Set());
        }}
        onCompose={handleCompose}
        folderCounts={folderCounts}
        unreadCount={unreadCount}
      />

      <MessageList
        messages={filteredMessages}
        selectedMessageId={selectedMessage?.id || null}
        currentFolder={currentFolder}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onMessageSelect={handleMessageSelect}
        onToggleStar={handleToggleStar}
        isSelectMode={isSelectMode}
        selectedMessages={selectedMessages}
        onToggleSelectMode={handleToggleSelectMode}
        onSelectAll={handleSelectAll}
        onBulkDelete={handleBulkDelete}
        onBulkMarkRead={handleBulkMarkRead}
        onBulkStar={handleBulkStar}
        drafts={drafts}
        onEditDraft={handleEditDraft}
        onDeleteDraft={handleDeleteDraft}
        onSync={syncGmail}
        isSyncing={isSyncing}
      />

      <MessageDetail
        message={selectedMessage}
        onBack={() => setSelectedMessage(null)}
        onReply={handleReply}
        onToggleStar={handleToggleStar}
        onDelete={handleDelete}
      />

      <ComposeModal
        isOpen={isComposeOpen}
        onClose={() => {
          setIsComposeOpen(false);
          setReplyTo(null);
          setEditingDraft(null);
        }}
        onSend={handleSendMessage}
        onSaveDraft={handleSaveDraft}
        replyTo={replyTo}
        editingDraft={editingDraft}
      />
    </div>
  );
}