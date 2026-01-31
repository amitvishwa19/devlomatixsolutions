import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, X, Filter, LayoutGrid, List, Map } from 'lucide-react';
import { FLOORS, WINGS, ROOM_TYPES, BED_STATUSES } from '../types';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export function AccommodationFilters({ 
  filters, 
  onFiltersChange, 
  viewMode, 
  onViewModeChange,
  totalRooms,
  filteredRooms 
}) {
  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => 
    value && value !== 'all' && key !== 'search'
  ).length + (filters.search ? 1 : 0);

  const clearFilters = () => {
    onFiltersChange({
      floor: 'all',
      wing: 'all',
      type: 'all',
      status: 'all',
      search: '',
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search room, bed, or patient..."
            value={filters.search || ''}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="pl-9 h-9"
          />
          {filters.search && (
            <button
              onClick={() => onFiltersChange({ ...filters, search: '' })}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Floor Filter */}
        <Select 
          value={filters.floor || 'all'} 
          onValueChange={(value) => onFiltersChange({ ...filters, floor: value })}
        >
          <SelectTrigger className="w-36 h-9">
            <SelectValue placeholder="Floor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Floors</SelectItem>
            {FLOORS.map(floor => (
              <SelectItem key={floor.id} value={floor.id}>{floor.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Wing Filter */}
        <Select 
          value={filters.wing || 'all'} 
          onValueChange={(value) => onFiltersChange({ ...filters, wing: value })}
        >
          <SelectTrigger className="w-36 h-9">
            <SelectValue placeholder="Wing" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Wings</SelectItem>
            {WINGS.map(wing => (
              <SelectItem key={wing.id} value={wing.id}>{wing.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Room Type Filter */}
        <Select 
          value={filters.type || 'all'} 
          onValueChange={(value) => onFiltersChange({ ...filters, type: value })}
        >
          <SelectTrigger className="w-40 h-9">
            <SelectValue placeholder="Room Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {ROOM_TYPES.map(type => (
              <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select 
          value={filters.status || 'all'} 
          onValueChange={(value) => onFiltersChange({ ...filters, status: value })}
        >
          <SelectTrigger className="w-40 h-9">
            <SelectValue placeholder="Bed Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {BED_STATUSES.map(status => (
              <SelectItem key={status.id} value={status.id}>{status.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9">
            <X className="h-4 w-4 mr-1" />
            Clear ({activeFiltersCount})
          </Button>
        )}

        <div className="flex-1" />

        {/* Results Count */}
        <div className="text-sm text-muted-foreground">
          Showing {filteredRooms} of {totalRooms} rooms
        </div>

        {/* View Mode Toggle */}
        <ToggleGroup type="single" value={viewMode} onValueChange={(v) => v && onViewModeChange(v)}>
          <ToggleGroupItem value="floor" aria-label="Floor Plan View" className="h-9 w-9 p-0">
            <Map className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="grid" aria-label="Grid View" className="h-9 w-9 p-0">
            <LayoutGrid className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label="List View" className="h-9 w-9 p-0">
            <List className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Active filters:</span>
          {filters.search && (
            <Badge variant="secondary" className="text-xs">
              Search: "{filters.search}"
              <button onClick={() => onFiltersChange({ ...filters, search: '' })} className="ml-1">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.floor && filters.floor !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              {FLOORS.find(f => f.id === filters.floor)?.name}
              <button onClick={() => onFiltersChange({ ...filters, floor: 'all' })} className="ml-1">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.wing && filters.wing !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              {WINGS.find(w => w.id === filters.wing)?.name}
              <button onClick={() => onFiltersChange({ ...filters, wing: 'all' })} className="ml-1">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.type && filters.type !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              {ROOM_TYPES.find(t => t.id === filters.type)?.name}
              <button onClick={() => onFiltersChange({ ...filters, type: 'all' })} className="ml-1">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.status && filters.status !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              {BED_STATUSES.find(s => s.id === filters.status)?.name}
              <button onClick={() => onFiltersChange({ ...filters, status: 'all' })} className="ml-1">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
