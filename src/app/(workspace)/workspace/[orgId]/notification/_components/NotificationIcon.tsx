import { 
  AlertTriangle, 
  Bell, 
  Calendar, 
  FlaskConical, 
  Heart, 
  Pill, 
  Settings,
  Siren
} from 'lucide-react';
import { NotificationCategory, NotificationType } from '@/types/notification';
import { cn } from '@/lib/utils';

interface NotificationIconProps {
  category: NotificationCategory;
  type: NotificationType;
  className?: string;
}

const categoryIcons = {
  patient: Heart,
  appointment: Calendar,
  lab: FlaskConical,
  pharmacy: Pill,
  emergency: Siren,
  system: Settings,
};

const typeStyles = {
  urgent: 'bg-urgent-bg text-urgent',
  warning: 'bg-warning-bg text-warning',
  info: 'bg-info-bg text-info',
  success: 'bg-success-bg text-success',
};

export function NotificationIcon({ category, type, className }: NotificationIconProps) {
  const Icon = categoryIcons[category] || Bell;
  
  return (
    <div className={cn(
      'flex h-10 w-10 items-center justify-center rounded-full shrink-0',
      typeStyles[type],
      className
    )}>
      <Icon className="h-5 w-5" />
    </div>
  );
}
