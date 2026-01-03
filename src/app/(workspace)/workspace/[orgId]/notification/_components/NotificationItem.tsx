import { formatDistanceToNow } from 'date-fns';
import { Check, MoreHorizontal, Trash2 } from 'lucide-react';
import { Notification } from '@/types/notification';
import { NotificationIcon } from './NotificationIcon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const typeBadgeVariant = {
  urgent: 'urgent',
  warning: 'warning',
  info: 'info',
  success: 'success',
} as const;

export function NotificationItem({ notification, onMarkAsRead, onDelete }: NotificationItemProps) {
  const { id, type, category, title, message, timestamp, isRead, patientName, roomNumber } = notification;

  return (
    <div
      className={cn(
        'group relative flex gap-4 rounded-lg border p-4 transition-all duration-200 hover:shadow-card animate-slide-in-right',
        isRead 
          ? 'bg-card border-border' 
          : 'bg-card border-l-4',
        !isRead && type === 'urgent' && 'border-l-urgent',
        !isRead && type === 'warning' && 'border-l-warning',
        !isRead && type === 'info' && 'border-l-info',
        !isRead && type === 'success' && 'border-l-success',
      )}
    >
      <NotificationIcon category={category} type={type} />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className={cn(
              'text-sm',
              isRead ? 'font-medium text-foreground' : 'font-semibold text-foreground'
            )}>
              {title}
            </h4>
            <Badge variant={typeBadgeVariant[type]} className="text-[10px] uppercase tracking-wider">
              {type}
            </Badge>
          </div>
          
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatDistanceToNow(timestamp, { addSuffix: true })}
            </span>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {!isRead && (
                  <DropdownMenuItem onClick={() => onMarkAsRead(id)}>
                    <Check className="mr-2 h-4 w-4" />
                    Mark as read
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  onClick={() => onDelete(id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
          {message}
        </p>
        
        {(patientName || roomNumber) && (
          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            {patientName && (
              <span className="flex items-center gap-1">
                <span className="font-medium">Patient:</span> {patientName}
              </span>
            )}
            {roomNumber && (
              <span className="flex items-center gap-1">
                <span className="font-medium">Room:</span> {roomNumber}
              </span>
            )}
          </div>
        )}
      </div>
      
      {!isRead && (
        <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-primary" />
      )}
    </div>
  );
}
