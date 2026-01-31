import { Search, Filter, LayoutGrid, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PRESCRIPTION_STATUSES } from './types';
import { TagFilterDropdown } from '@/carewell/taxonomy/components/TaxonomySelector';

export function PrescriptionFilters({ 
  search, 
  onSearchChange, 
  status, 
  onStatusChange,
  doctor,
  onDoctorChange,
  doctors,
  tagFilter = [],
  onTagFilterChange,
  viewMode, 
  onViewModeChange 
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
      <div className="flex flex-wrap gap-3 items-center flex-1">
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search prescriptions..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Status Filter */}
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {PRESCRIPTION_STATUSES.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Doctor Filter */}
        <Select value={doctor} onValueChange={onDoctorChange}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Doctor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Doctors</SelectItem>
            {doctors.map((d) => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Tag Filter */}
        <TagFilterDropdown
          entityType="prescription"
          selectedTags={tagFilter}
          onTagsChange={onTagFilterChange}
        />
      </div>

      {/* View Toggle */}
      <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
        <Button
          variant={viewMode === 'grid' ? 'default' : 'ghost'}
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onViewModeChange('grid')}
        >
          <LayoutGrid className="w-4 h-4" />
        </Button>
        <Button
          variant={viewMode === 'table' ? 'default' : 'ghost'}
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onViewModeChange('table')}
        >
          <List className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
