import { Search, Flag, AlertCircle, AlertTriangle, CheckSquare, Square, Trash2, Mail, MoreHorizontal, FileEdit, X, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { format, isToday, isYesterday } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

function formatMessageDate(date) {
  if (isToday(date)) {
    return format(date, 'h:mm a');
  }
  if (isYesterday(date)) {
    return 'Yesterday';
  }
  return format(date, 'MMM d');
}

function getPriorityIcon(priority) {
  if (priority === 'urgent') {
    return <AlertCircle className="w-3.5 h-3.5 text-urgent" />;
  }
  if (priority === 'high') {
    return <AlertTriangle className="w-3.5 h-3.5 text-warning" />;
  }
  return null;
}

export function MessageList({
  messages,
  selectedMessageId,
  currentFolder,
  searchQuery,
  onSearchChange,
  onMessageSelect,
  onToggleStar,
  isSelectMode,
  selectedMessages,
  onToggleSelectMode,
  onSelectAll,
  onBulkDelete,
  onBulkMarkRead,
  onBulkStar,
  drafts,
  onEditDraft,
  onDeleteDraft,
  onSync,
  isSyncing,
}) {
  const folderLabels = {
    inbox: 'Inbox',
    sent: 'Sent',
    starred: 'Flagged',
    trash: 'Trash',
    drafts: 'Drafts',
  };

  const showDrafts = currentFolder === 'drafts';

  return (
    <div className="w-96 border-r border-l border-border flex flex-col bg-card h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground">
            {folderLabels[currentFolder]}
          </h2>
          <div className="flex items-center gap-1">
            {onSync && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onSync}
                disabled={isSyncing}
                className="h-8 px-2"
                title="Sync Gmail"
              >
                <RefreshCw className={cn(
                  "w-4 h-4 transition-colors",
                  isSyncing && "animate-spin text-green-500"
                )} />
              </Button>
            )}
            {!showDrafts && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleSelectMode}
                className={cn(
                  "h-8 px-2",
                  isSelectMode && "bg-primary/10 text-primary"
                )}
              >
                {isSelectMode ? <X className="w-4 h-4" /> : <CheckSquare className="w-4 h-4" />}
              </Button>
            )}
          </div>
        </div>

        {/* Bulk Actions */}
        {isSelectMode && selectedMessages.size > 0 && (
          <div className="flex items-center gap-2 mb-3 p-2 bg-secondary/50 rounded-lg">
            <span className="text-sm text-muted-foreground">
              {selectedMessages.size} selected
            </span>
            <div className="flex-1" />
            <Button variant="ghost" size="sm" onClick={onBulkMarkRead} className="h-7 px-2">
              <Mail className="w-3.5 h-3.5 mr-1" />
              Read
            </Button>
            <Button variant="ghost" size="sm" onClick={onBulkStar} className="h-7 px-2">
              <Flag className="w-3.5 h-3.5 mr-1" />
              Flag
            </Button>
            <Button variant="ghost" size="sm" onClick={onBulkDelete} className="h-7 px-2 text-destructive hover:text-destructive">
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Delete
            </Button>
          </div>
        )}

        {/* Select All */}
        {isSelectMode && (
          <div className="flex items-center gap-2 mb-3">
            <Checkbox
              checked={selectedMessages.size === messages.length && messages.length > 0}
              onCheckedChange={onSelectAll}
            />
            <span className="text-sm text-muted-foreground">Select all</span>
          </div>
        )}

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-secondary/50 border-0 focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>
      </div>

      {/* Message List or Drafts List */}
      <ScrollArea className="flex-1 overflow-y-auto  ">
        {showDrafts ? (
          // Drafts View
          drafts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <FileEdit className="w-12 h-12 mb-2 opacity-50" />
              <p className="text-sm">No drafts</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {drafts.map((draft) => (
                <li key={draft.id}>
                  <button
                    onClick={() => onEditDraft(draft)}
                    className="w-full text-left p-4 transition-all duration-200 hover:bg-secondary/50"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-muted-foreground">
                            Draft
                          </span>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatMessageDate(draft.savedAt)}
                          </span>
                        </div>
                        <p className="text-sm truncate mb-1 text-foreground/70">
                          {draft.subject || '(No subject)'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {draft.body.substring(0, 80) || '(No content)'}...
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteDraft(draft.id);
                        }}
                        className="p-1 hover:bg-secondary rounded transition-colors text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <p className="text-sm">No messages found</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {messages.map((message) => {
              const isSelected = selectedMessageId === message.id;
              const isChecked = selectedMessages.has(message.id);
              const displayName = currentFolder === 'sent'
                ? message.to[0]?.name
                : message.from.name;

              return (
                <li key={message.id}>
                  <button
                    onClick={() => onMessageSelect(message)}
                    className={cn(
                      "w-full text-left p-4 transition-all duration-200 animate-fade-in",
                      isSelected
                        ? "bg-primary/10 border-l-3 border-l-primary"
                        : "hover:bg-secondary/50",
                      !message.isRead && !isSelected && "bg-primary/5 border-l-3 border-l-primary/60",
                      message.isRead && !isSelected && "bg-transparent border-l-3 border-l-transparent",
                      isSelectMode && isChecked && "bg-primary/10"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox or Unread Indicator */}
                      <div className="pt-1.5">
                        {isSelectMode ? (
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={() => onMessageSelect(message)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <>
                            {!message.isRead && (
                              <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                            )}
                            {message.isRead && <div className="w-2.5 h-2.5" />}
                          </>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Top Row: Name, Priority, Time */}
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn(
                            "text-sm truncate flex-1",
                            !message.isRead ? "font-bold text-foreground" : "font-normal text-muted-foreground"
                          )}>
                            {displayName}
                          </span>
                          {getPriorityIcon(message.priority)}
                          <span className={cn(
                            "text-xs whitespace-nowrap",
                            !message.isRead ? "font-medium text-foreground/80" : "text-muted-foreground"
                          )}>
                            {formatMessageDate(message.timestamp)}
                          </span>
                        </div>

                        {/* Subject */}
                        <p className={cn(
                          "text-sm truncate mb-1",
                          !message.isRead ? "font-semibold text-foreground" : "font-normal text-muted-foreground"
                        )}>
                          {message.subject}
                        </p>

                        {/* Preview */}
                        <p className="text-xs text-muted-foreground/70 truncate">
                          {message.body.substring(0, 80)}...
                        </p>
                      </div>

                      {/* Flag Button */}
                      {!isSelectMode && (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleStar(message.id);
                          }}
                          className="p-1 hover:bg-secondary rounded transition-colors"
                        >
                          <Flag className={cn(
                            "w-4 h-4 transition-colors",
                            message.isStarred
                              ? "fill-destructive text-destructive"
                              : "text-muted-foreground hover:text-foreground"
                          )} />
                        </div>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </ScrollArea>
    </div>
  );
}