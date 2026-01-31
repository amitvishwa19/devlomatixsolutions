import React, { useState } from 'react';
import { Tag, FolderTree, X, Plus, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { TAG_COLORS } from '../misc/types';
import { mockCategories, mockTags } from '../misc/mockData';

export function TaxonomySelector({
  entityType,
  selectedCategories = [],
  selectedTags = [],
  onCategoriesChange,
  onTagsChange,
  compact = false,
}) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('tags');

  // Filter by entity type
  const availableCategories = mockCategories.filter(
    (c) => c.entityTypes.includes(entityType)
  );
  const availableTags = mockTags.filter(
    (t) => t.entityTypes.includes(entityType)
  );

  // Filter by search
  const filteredCategories = availableCategories.filter(
    (c) => c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredTags = availableTags.filter(
    (t) => t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleCategory = (categoryId) => {
    if (selectedCategories.includes(categoryId)) {
      onCategoriesChange?.(selectedCategories.filter((id) => id !== categoryId));
    } else {
      onCategoriesChange?.([...selectedCategories, categoryId]);
    }
  };

  const toggleTag = (tagId) => {
    if (selectedTags.includes(tagId)) {
      onTagsChange?.(selectedTags.filter((id) => id !== tagId));
    } else {
      onTagsChange?.([...selectedTags, tagId]);
    }
  };

  const removeCategory = (categoryId, e) => {
    e.stopPropagation();
    onCategoriesChange?.(selectedCategories.filter((id) => id !== categoryId));
  };

  const removeTag = (tagId, e) => {
    e.stopPropagation();
    onTagsChange?.(selectedTags.filter((id) => id !== tagId));
  };

  const getColorConfig = (colorId) => {
    return TAG_COLORS.find((c) => c.id === colorId) || TAG_COLORS[0];
  };

  const selectedCategoryObjects = selectedCategories
    .map((id) => mockCategories.find((c) => c.id === id))
    .filter(Boolean);
  const selectedTagObjects = selectedTags
    .map((id) => mockTags.find((t) => t.id === id))
    .filter(Boolean);

  const totalSelected = selectedCategories.length + selectedTags.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size={compact ? 'sm' : 'default'}
          className={cn(
            'justify-start gap-2 font-normal',
            compact ? 'h-8 px-2' : 'h-9'
          )}
        >
          <Tag className="w-4 h-4 text-muted-foreground" />
          {totalSelected > 0 ? (
            <span className="text-foreground">
              {totalSelected} selected
            </span>
          ) : (
            <span className="text-muted-foreground">Add tags...</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-3 border-b">
          <Input
            placeholder="Search tags & categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8"
          />
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            className={cn(
              'flex-1 px-4 py-2 text-sm font-medium transition-colors',
              activeTab === 'tags'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
            onClick={() => setActiveTab('tags')}
          >
            <Tag className="w-3 h-3 inline mr-1" />
            Tags ({availableTags.length})
          </button>
          <button
            className={cn(
              'flex-1 px-4 py-2 text-sm font-medium transition-colors',
              activeTab === 'categories'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
            onClick={() => setActiveTab('categories')}
          >
            <FolderTree className="w-3 h-3 inline mr-1" />
            Categories ({availableCategories.length})
          </button>
        </div>

        <ScrollArea className="h-64">
          <div className="p-2 space-y-1">
            {activeTab === 'tags' && (
              <>
                {filteredTags.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No tags available for this entity
                  </p>
                ) : (
                  filteredTags.map((tag) => {
                    const colorConfig = getColorConfig(tag.color);
                    const isSelected = selectedTags.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        className={cn(
                          'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors text-left',
                          isSelected
                            ? 'bg-primary/10 text-primary'
                            : 'hover:bg-secondary'
                        )}
                        onClick={() => toggleTag(tag.id)}
                      >
                        <div
                          className={cn(
                            'w-3 h-3 rounded-full shrink-0',
                            colorConfig.bg
                          )}
                        />
                        <span className="flex-1 truncate">{tag.name}</span>
                        {isSelected && <Check className="w-4 h-4 shrink-0" />}
                      </button>
                    );
                  })
                )}
              </>
            )}

            {activeTab === 'categories' && (
              <>
                {filteredCategories.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No categories available for this entity
                  </p>
                ) : (
                  filteredCategories.map((category) => {
                    const colorConfig = getColorConfig(category.color);
                    const isSelected = selectedCategories.includes(category.id);
                    return (
                      <button
                        key={category.id}
                        className={cn(
                          'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors text-left',
                          isSelected
                            ? 'bg-primary/10 text-primary'
                            : 'hover:bg-secondary'
                        )}
                        onClick={() => toggleCategory(category.id)}
                      >
                        <div
                          className={cn(
                            'w-3 h-3 rounded-full shrink-0',
                            colorConfig.bg
                          )}
                        />
                        <span className="flex-1 truncate">{category.name}</span>
                        {category.parentId && (
                          <span className="text-xs text-muted-foreground">
                            (sub)
                          </span>
                        )}
                        {isSelected && <Check className="w-4 h-4 shrink-0" />}
                      </button>
                    );
                  })
                )}
              </>
            )}
          </div>
        </ScrollArea>

        {/* Selected Items Preview */}
        {totalSelected > 0 && (
          <>
            <Separator />
            <div className="p-2">
              <p className="text-xs text-muted-foreground mb-2">Selected:</p>
              <div className="flex flex-wrap gap-1">
                {selectedCategoryObjects.map((cat) => {
                  const colorConfig = getColorConfig(cat.color);
                  return (
                    <Badge
                      key={cat.id}
                      variant="outline"
                      className={cn(
                        'text-xs gap-1 pr-1',
                        colorConfig.bg,
                        colorConfig.text,
                        colorConfig.border
                      )}
                    >
                      <FolderTree className="w-3 h-3" />
                      {cat.name}
                      <button
                        className="ml-1 hover:bg-black/10 rounded-full p-0.5"
                        onClick={(e) => removeCategory(cat.id, e)}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  );
                })}
                {selectedTagObjects.map((tag) => {
                  const colorConfig = getColorConfig(tag.color);
                  return (
                    <Badge
                      key={tag.id}
                      variant="outline"
                      className={cn(
                        'text-xs gap-1 pr-1',
                        colorConfig.bg,
                        colorConfig.text,
                        colorConfig.border
                      )}
                    >
                      {tag.name}
                      <button
                        className="ml-1 hover:bg-black/10 rounded-full p-0.5"
                        onClick={(e) => removeTag(tag.id, e)}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}

// Display-only component for showing assigned tags
export function AssignedTags({ tagIds = [], categoryIds = [], compact = false }) {
  const tags = tagIds
    .map((id) => mockTags.find((t) => t.id === id))
    .filter(Boolean);
  const categories = categoryIds
    .map((id) => mockCategories.find((c) => c.id === id))
    .filter(Boolean);

  const getColorConfig = (colorId) => {
    return TAG_COLORS.find((c) => c.id === colorId) || TAG_COLORS[0];
  };

  if (tags.length === 0 && categories.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {categories.map((cat) => {
        const colorConfig = getColorConfig(cat.color);
        return (
          <Badge
            key={cat.id}
            variant="outline"
            className={cn(
              compact ? 'text-[10px] px-1.5 py-0' : 'text-xs',
              colorConfig.bg,
              colorConfig.text,
              colorConfig.border
            )}
          >
            <FolderTree className={cn(compact ? 'w-2.5 h-2.5' : 'w-3 h-3', 'mr-1')} />
            {cat.name}
          </Badge>
        );
      })}
      {tags.map((tag) => {
        const colorConfig = getColorConfig(tag.color);
        return (
          <Badge
            key={tag.id}
            variant="outline"
            className={cn(
              compact ? 'text-[10px] px-1.5 py-0' : 'text-xs',
              colorConfig.bg,
              colorConfig.text,
              colorConfig.border
            )}
          >
            {tag.name}
          </Badge>
        );
      })}
    </div>
  );
}

// Tag filter dropdown for list views
export function TagFilterDropdown({
  entityType,
  selectedTags = [],
  onTagsChange,
  className
}) {
  const [open, setOpen] = useState(false);

  const availableTags = mockTags.filter(
    (t) => t.entityTypes.includes(entityType)
  );

  const getColorConfig = (colorId) => {
    return TAG_COLORS.find((c) => c.id === colorId) || TAG_COLORS[0];
  };

  const toggleTag = (tagId) => {
    if (selectedTags.includes(tagId)) {
      onTagsChange?.(selectedTags.filter((id) => id !== tagId));
    } else {
      onTagsChange?.([...selectedTags, tagId]);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={cn('h-9 gap-2', className)}>
          <Tag className="w-4 h-4" />
          Tags
          {selectedTags.length > 0 && (
            <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
              {selectedTags.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="start">
        <ScrollArea className="max-h-64">
          <div className="space-y-1">
            {availableTags.map((tag) => {
              const colorConfig = getColorConfig(tag.color);
              const isSelected = selectedTags.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  className={cn(
                    'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors text-left',
                    isSelected
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-secondary'
                  )}
                  onClick={() => toggleTag(tag.id)}
                >
                  <div
                    className={cn('w-3 h-3 rounded-full shrink-0', colorConfig.bg)}
                  />
                  <span className="flex-1 truncate">{tag.name}</span>
                  {isSelected && <Check className="w-4 h-4 shrink-0" />}
                </button>
              );
            })}
          </div>
        </ScrollArea>
        {selectedTags.length > 0 && (
          <div className="pt-2 border-t mt-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-7 text-xs"
              onClick={() => onTagsChange?.([])}
            >
              Clear all
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
