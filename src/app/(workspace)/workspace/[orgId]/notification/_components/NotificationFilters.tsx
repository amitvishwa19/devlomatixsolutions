import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { NotificationType, NotificationCategory } from '@/types/notification';
import { cn } from '@/lib/utils';

interface NotificationFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedType: NotificationType | 'all';
  onTypeChange: (type: NotificationType | 'all') => void;
  selectedCategory: NotificationCategory | 'all';
  onCategoryChange: (category: NotificationCategory | 'all') => void;
}

const types: Array<{ value: NotificationType | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'warning', label: 'Warning' },
  { value: 'info', label: 'Info' },
  { value: 'success', label: 'Success' },
];

const categories: Array<{ value: NotificationCategory | 'all'; label: string }> = [
  { value: 'all', label: 'All Categories' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'patient', label: 'Patient' },
  { value: 'appointment', label: 'Appointment' },
  { value: 'lab', label: 'Lab Results' },
  { value: 'pharmacy', label: 'Pharmacy' },
  { value: 'system', label: 'System' },
];

const typeColors = {
  all: 'hover:bg-muted',
  urgent: 'data-[active=true]:bg-urgent-bg data-[active=true]:text-urgent-foreground hover:bg-urgent-bg/50',
  warning: 'data-[active=true]:bg-warning-bg data-[active=true]:text-warning-foreground hover:bg-warning-bg/50',
  info: 'data-[active=true]:bg-info-bg data-[active=true]:text-info-foreground hover:bg-info-bg/50',
  success: 'data-[active=true]:bg-success-bg data-[active=true]:text-success-foreground hover:bg-success-bg/50',
};

export function NotificationFilters({
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
  selectedCategory,
  onCategoryChange,
}: NotificationFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search notifications..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <div className="flex flex-wrap gap-2">
        {types.map((type) => (
          <Button
            key={type.value}
            variant="ghost"
            size="sm"
            data-active={selectedType === type.value}
            onClick={() => onTypeChange(type.value)}
            className={cn(
              'rounded-full transition-colors',
              selectedType === type.value 
                ? 'bg-muted font-medium' 
                : 'text-muted-foreground',
              typeColors[type.value],
            )}
          >
            {type.label}
          </Button>
        ))}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category.value}
            variant="ghost"
            size="sm"
            onClick={() => onCategoryChange(category.value)}
            className={cn(
              'rounded-full text-xs transition-colors',
              selectedCategory === category.value 
                ? 'bg-accent text-accent-foreground font-medium' 
                : 'text-muted-foreground hover:bg-muted'
            )}
          >
            {category.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
