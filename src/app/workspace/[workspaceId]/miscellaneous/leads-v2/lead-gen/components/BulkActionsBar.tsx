// @ts-nocheck
"use client";
import { useState } from 'react';
import { CheckSquare, Trash2, Tag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { Lead } from '../data/mockLeads';

interface BulkActionsBarProps {
  selectedCount: number;
  onBulkStatusChange: (status: Lead['status']) => void;
  onBulkDelete: () => void;
  onBulkTag: (tag: string) => void;
  existingTags: string[];
}

const BulkActionsBar = ({
  selectedCount,
  onBulkStatusChange,
  onBulkDelete,
  onBulkTag,
  existingTags,
}: BulkActionsBarProps) => {
  const [newTag, setNewTag] = useState('');

  if (selectedCount === 0) return null;

  return (
    <div className="glass-card rounded-xl px-4 py-3 flex flex-wrap items-center gap-3 animate-slide-up border-primary/30">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <CheckSquare className="h-4 w-4 text-primary" />
        <span>{selectedCount} selected</span>
      </div>

      <div className="h-5 w-px bg-border" />

      {/* Bulk Status Change */}
      <Select onValueChange={(v) => onBulkStatusChange(v as Lead['status'])}>
        <SelectTrigger className="w-[150px] h-8 text-xs">
          <span className="flex items-center gap-1.5">
            <ArrowRight className="h-3.5 w-3.5" />
            Change Status
          </span>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="new">New</SelectItem>
          <SelectItem value="contacted">Contacted</SelectItem>
          <SelectItem value="qualified">Qualified</SelectItem>
          <SelectItem value="converted">Converted</SelectItem>
        </SelectContent>
      </Select>

      {/* Bulk Tag */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
            <Tag className="h-3.5 w-3.5" />
            Add Tag
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3 space-y-3">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Existing Tags</label>
            <div className="flex flex-wrap gap-1.5">
              {existingTags.length > 0 ? (
                existingTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary/20 transition-colors text-xs"
                    onClick={() => onBulkTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">No tags yet</p>
              )}
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">New Tag</label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="h-8 text-xs"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newTag.trim()) {
                    onBulkTag(newTag.trim());
                    setNewTag('');
                  }
                }}
              />
              <Button
                size="sm"
                className="h-8 text-xs"
                disabled={!newTag.trim()}
                onClick={() => {
                  onBulkTag(newTag.trim());
                  setNewTag('');
                }}
              >
                Add
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Bulk Delete */}
      <Button
        variant="destructive"
        size="sm"
        className="h-8 text-xs gap-1.5"
        onClick={onBulkDelete}
      >
        <Trash2 className="h-3.5 w-3.5" />
        Delete
      </Button>
    </div>
  );
};

export default BulkActionsBar;
