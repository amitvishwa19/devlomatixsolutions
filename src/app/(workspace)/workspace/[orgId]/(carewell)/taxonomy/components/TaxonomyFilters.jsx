import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X } from 'lucide-react';
import { ENTITY_TYPES, TAG_COLORS } from '../types';

export function TaxonomyFilters({ filters, onFiltersChange, type = 'category' }) {
  const handleSearchChange = (value) => {
    onFiltersChange({ ...filters, search: value });
  };

  const handleEntityTypeChange = (value) => {
    onFiltersChange({ ...filters, entityType: value === 'all' ? '' : value });
  };

  const handleColorChange = (value) => {
    onFiltersChange({ ...filters, color: value === 'all' ? '' : value });
  };

  const clearFilters = () => {
    onFiltersChange({ search: '', entityType: '', color: '' });
  };

  const hasActiveFilters = filters.search || filters.entityType || filters.color;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={`Search ${type === 'category' ? 'categories' : 'tags'}...`}
          value={filters.search || ''}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <Select value={filters.entityType || 'all'} onValueChange={handleEntityTypeChange}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="All Entities" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Entities</SelectItem>
          {ENTITY_TYPES.map(entity => (
            <SelectItem key={entity.id} value={entity.id}>
              {entity.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.color || 'all'} onValueChange={handleColorChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="All Colors" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Colors</SelectItem>
          {TAG_COLORS.map(color => (
            <SelectItem key={color.id} value={color.id}>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded ${color.bg}`} />
                {color.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
          <X className="w-4 h-4" />
          Clear
        </Button>
      )}
    </div>
  );
}
