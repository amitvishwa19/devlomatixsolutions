import { Search, List, TableProperties } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PATIENT_STATUSES, BLOOD_GROUPS, GENDERS } from './types';
import { TagFilterDropdown } from '@/carewell/taxonomy/components/TaxonomySelector';

export function PatientFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  genderFilter,
  onGenderFilterChange,
  bloodGroupFilter,
  onBloodGroupFilterChange,
  tagFilter = [],
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
            placeholder="Search patients..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 w-64 h-9"
          />
        </div>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-36 h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {PATIENT_STATUSES.map((status) => (
              <SelectItem key={status.id} value={status.id}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Gender Filter */}
        <Select value={genderFilter} onValueChange={onGenderFilterChange}>
          <SelectTrigger className="w-32 h-9">
            <SelectValue placeholder="Gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Gender</SelectItem>
            {GENDERS.map((gender) => (
              <SelectItem key={gender.id} value={gender.id}>
                {gender.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Blood Group Filter */}
        <Select value={bloodGroupFilter} onValueChange={onBloodGroupFilterChange}>
          <SelectTrigger className="w-36 h-9">
            <SelectValue placeholder="Blood Group" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Blood Groups</SelectItem>
            {BLOOD_GROUPS.map((bg) => (
              <SelectItem key={bg.id} value={bg.id}>
                {bg.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Tag Filter */}
        <TagFilterDropdown
          entityType="patient"
          selectedTags={tagFilter}
          onTagsChange={onTagFilterChange}
        />
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
        <Button
          variant={viewMode === 'list' ? 'default' : 'ghost'}
          size="sm"
          className="h-7 px-3"
          onClick={() => onViewModeChange('list')}
          title="Card View"
        >
          <List className="w-4 h-4" />
        </Button>
        <Button
          variant={viewMode === 'table' ? 'default' : 'ghost'}
          size="sm"
          className="h-7 px-3"
          onClick={() => onViewModeChange('table')}
          title="Table View"
        >
          <TableProperties className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
