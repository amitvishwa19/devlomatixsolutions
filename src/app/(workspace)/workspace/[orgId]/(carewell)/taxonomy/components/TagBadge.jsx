import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { TAG_COLORS } from '../types';
import { cn } from '@/lib/utils';

export function TagBadge({ tag, onRemove, onClick, size = 'default', showCount = false }) {
  const colorConfig = TAG_COLORS.find(c => c.id === tag.color) || TAG_COLORS[0];

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    default: 'text-sm px-2.5 py-0.5',
    lg: 'text-sm px-3 py-1',
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        colorConfig.bg,
        colorConfig.text,
        colorConfig.border,
        sizeClasses[size],
        'font-medium gap-1.5 cursor-pointer hover:opacity-80 transition-opacity',
        onClick && 'cursor-pointer'
      )}
      onClick={onClick}
    >
      <span className="truncate max-w-[120px]">{tag.name}</span>
      {showCount && tag.usageCount !== undefined && (
        <span className="text-xs opacity-70">({tag.usageCount})</span>
      )}
      {onRemove && (
        <Button
          variant="ghost"
          size="icon"
          className="h-4 w-4 p-0 hover:bg-transparent"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(tag);
          }}
        >
          <X className="w-3 h-3" />
        </Button>
      )}
    </Badge>
  );
}
