import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NotificationBellProps {
  unreadCount: number;
  onClick?: () => void;
}

export function NotificationBell({ unreadCount, onClick }: NotificationBellProps) {
  const hasUrgent = unreadCount > 0;
  
  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative h-10 w-10 rounded-full"
      onClick={onClick}
    >
      <Bell className={cn(
        'h-5 w-5 transition-colors',
        hasUrgent ? 'text-foreground' : 'text-muted-foreground'
      )} />
      
      {unreadCount > 0 && (
        <span className={cn(
          'absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground',
          hasUrgent && 'pulse-ring'
        )}>
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Button>
  );
}
