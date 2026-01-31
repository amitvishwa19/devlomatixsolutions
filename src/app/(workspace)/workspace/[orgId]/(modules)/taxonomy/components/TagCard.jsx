import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, Tag, Palette } from 'lucide-react';
import { TAG_COLORS, ENTITY_TYPES } from '../misc/types';

export function TagCard({ tag, onEdit, onDelete, onViewDetails }) {
  const colorConfig = TAG_COLORS.find(c => c.id === tag.color) || TAG_COLORS[0];

  const getEntityLabel = (entityId) => {
    const entity = ENTITY_TYPES.find(e => e.id === entityId);
    return entity?.label || entityId;
  };

  return (
    <Card className="group hover:shadow-md transition-all duration-200 border-border">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div
            className="flex items-start gap-3 flex-1 cursor-pointer"
            onClick={() => onViewDetails?.(tag)}
          >
            <div className={`w-10 h-10 rounded-lg ${colorConfig.bg} ${colorConfig.text} flex items-center justify-center shrink-0 relative`}>
              <Tag className="w-5 h-5" />
              {/* Color indicator dot */}
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card ${colorConfig.bg}`}
                style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant="outline"
                  className={`${colorConfig.bg} ${colorConfig.text} ${colorConfig.border}`}
                >
                  {tag.name}
                </Badge>
                {/* Color label badge */}
                <Badge variant="secondary" className="text-xs gap-1">
                  <Palette className="w-3 h-3" />
                  {colorConfig.label}
                </Badge>
              </div>
              {tag.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1.5">
                  {tag.description}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant="secondary" className="text-xs">
                  Used {tag.usageCount} times
                </Badge>
                {tag.entityTypes?.slice(0, 2).map(entityId => (
                  <Badge key={entityId} variant="outline" className="text-xs">
                    {getEntityLabel(entityId)}
                  </Badge>
                ))}
                {tag.entityTypes?.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{tag.entityTypes.length - 2}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(tag)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete?.(tag)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
