import React from 'react';
import { Search, List, TableProperties } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TEST_ORDER_STATUS, TEST_ORDER_STATUS_LABELS, PRIORITY_LEVELS, TEST_CATEGORIES } from '../utils/types';
import { TagFilterDropdown } from '@/carewell/taxonomy/components/TaxonomySelector';

export function LabFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  tagFilter,
  onTagFilterChange,
  viewMode,
  onViewModeChange,
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search orders, patients..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 w-64 h-9"
          />
        </div>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-40 h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.entries(TEST_ORDER_STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Priority Filter */}
        <Select value={priorityFilter} onValueChange={onPriorityFilterChange}>
          <SelectTrigger className="w-32 h-9">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            {PRIORITY_LEVELS.map((priority) => (
              <SelectItem key={priority.id} value={priority.id}>
                {priority.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Category Filter */}
        <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
          <SelectTrigger className="w-40 h-9">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {TEST_CATEGORIES.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Tag Filter */}
        <TagFilterDropdown
          entityType="laboratory"
          selectedTags={tagFilter}
          onTagsChange={onTagFilterChange}
        />
      </div>

      {/* View Toggle */}
      <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
        <Button
          variant={viewMode === 'list' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => onViewModeChange('list')}
          className={`h-7 px-2 ${viewMode === 'list' ? 'bg-background shadow-sm' : ''}`}
        >
          <List className="w-4 h-4" />
        </Button>
        <Button
          variant={viewMode === 'table' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => onViewModeChange('table')}
          className={`h-7 px-2 ${viewMode === 'table' ? 'bg-background shadow-sm' : ''}`}
        >
          <TableProperties className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
