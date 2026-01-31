import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, ChevronRight, Palette } from 'lucide-react';
import * as Icons from 'lucide-react';
import { TAG_COLORS, ENTITY_TYPES } from '../misc/types';

export function CategoryCard({ category, onEdit, onDelete, onViewDetails, children }) {
  const colorConfig = TAG_COLORS.find(c => c.id === category.color) || TAG_COLORS[0];
  const IconComponent = Icons[category.icon] || Icons.Folder;

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
            onClick={() => onViewDetails?.(category)}
          >
            <div className={`w-10 h-10 rounded-lg ${colorConfig.bg} ${colorConfig.text} flex items-center justify-center shrink-0 relative`}>
              <IconComponent className="w-5 h-5" />
              {/* Color indicator dot */}
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card ${colorConfig.bg}`}
                style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-foreground truncate">{category.name}</h3>
                {/* Color badge */}
                <Badge variant="outline" className={`text-xs ${colorConfig.bg} ${colorConfig.text} ${colorConfig.border}`}>
                  <Palette className="w-3 h-3 mr-1" />
                  {colorConfig.label}
                </Badge>
                {children && (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              {category.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                  {category.description}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant="secondary" className="text-xs">
                  {category.itemCount} items
                </Badge>
                {category.entityTypes?.slice(0, 2).map(entityId => (
                  <Badge key={entityId} variant="outline" className="text-xs">
                    {getEntityLabel(entityId)}
                  </Badge>
                ))}
                {category.entityTypes?.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{category.entityTypes.length - 2}
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
              <DropdownMenuItem onClick={() => onEdit?.(category)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete?.(category)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {children && (
          <div className="mt-3 pl-12 border-l-2 border-muted ml-5 space-y-2">
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
