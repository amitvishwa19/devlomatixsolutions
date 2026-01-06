import {
  Inbox,
  Send,
  Star,
  Trash2,
  PenSquare,
  Building2,
  FileEdit,
  Flag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const folders = [
  { id: 'inbox', label: 'Inbox', icon: Inbox },
  { id: 'sent', label: 'Sent', icon: Send },
  { id: 'drafts', label: 'Drafts', icon: FileEdit },
  { id: 'starred', label: 'Flagged', icon: Flag },
  { id: 'trash', label: 'Trash', icon: Trash2 },
];

export function MailboxSidebar({
  currentFolder,
  onFolderChange,
  onCompose,
  folderCounts,
  unreadCount
}) {
  return (
    <aside className="w-64  text-sidebar-foreground flex flex-col h-full">
      {/* Compose Button */}
      <div className="p-4">
        <Button
          onClick={onCompose}
          className="w-full bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground gap-2 shadow-md"
        >
          <PenSquare className="w-4 h-4" />
          Compose
        </Button>
      </div>

      {/* Folders */}
      <nav className="flex-1 px-3">
        <ul className="space-y-1">
          {folders.map((folder) => {
            const Icon = folder.icon;
            const isActive = currentFolder === folder.id;
            const count = folder.id === 'inbox' ? unreadCount : folderCounts[folder.id];

            return (
              <li key={folder.id}>
                <button
                  onClick={() => onFolderChange(folder.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <Icon className={cn(
                    "w-4 h-4",
                    isActive && folder.id === 'starred' && "fill-current"
                  )} />
                  <span className="flex-1 text-left">{folder.label}</span>
                  {count > 0 && (
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full",
                      folder.id === 'inbox' && unreadCount > 0
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "bg-sidebar-accent text-sidebar-foreground/60"
                    )}>
                      {count}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}