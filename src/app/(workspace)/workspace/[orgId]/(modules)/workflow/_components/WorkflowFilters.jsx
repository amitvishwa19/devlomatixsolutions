import { Search, Building2, BedDouble, LayoutGrid, List } from 'lucide-react';
import { Input } from '@/components/ui/input';

const typeFilters = [
  { value: 'all', label: 'All', icon: null },
  { value: 'opd', label: 'OPD', icon: Building2 },
  { value: 'ipd', label: 'IPD', icon: BedDouble },
];

const statusFilters = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'critical', label: 'Critical' },
];

export function WorkflowFilters({
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  statusFilter,
  onStatusFilterChange,
  viewMode,
  onViewModeChange,
}) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search patients by name"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 w-64"
        />
      </div>

      {/* Type Filter */}
      <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1 shadow-sm">
        {typeFilters.map((filter) => {
          const Icon = filter.icon;
          const isActive = typeFilter === filter.value;
          return (
            <button
              key={filter.value}
              onClick={() => onTypeFilterChange(filter.value)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              {Icon && <Icon className="w-4 h-4" />}
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1 shadow-sm">
        {statusFilters.map((filter) => {
          const isActive = statusFilter === filter.value;
          return (
            <button
              key={filter.value}
              onClick={() => onStatusFilterChange(filter.value)}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center gap-1 ml-auto">
        <button
          onClick={() => onViewModeChange('grid')}
          className={`p-2 rounded-lg transition-colors ${
            viewMode === 'grid' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <LayoutGrid className="w-5 h-5" />
        </button>
        <button
          onClick={() => onViewModeChange('list')}
          className={`p-2 rounded-lg transition-colors ${
            viewMode === 'list' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <List className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
