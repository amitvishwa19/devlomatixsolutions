import { Search, Filter, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { PRIORITY_CONFIG, TASK_TYPE_CONFIG } from '../utils/types';

export function KanbanFilters({
  filters,
  onFiltersChange,
  departments = [],
  assignees = []
}) {
  const activeFilterCount = [
    filters.priority,
    filters.taskType,
    filters.department,
    filters.assignee,
  ].filter(Boolean).length + (filters.search ? 1 : 0);

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      priority: '',
      taskType: '',
      department: '',
      assignee: '',
    });
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-[300px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search patients, tasks..."
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className="pl-9"
        />
      </div>

      {/* Quick Filters */}
      <Select
        value={filters.priority}
        onValueChange={(value) => onFiltersChange({ ...filters, priority: value })}
      >
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priorities</SelectItem>
          {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
            <SelectItem key={key} value={key}>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${config.color}`} />
                {config.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.taskType}
        onValueChange={(value) => onFiltersChange({ ...filters, taskType: value })}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Task Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          {Object.entries(TASK_TYPE_CONFIG).map(([key, config]) => (
            <SelectItem key={key} value={key}>{config.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Advanced Filters */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <SlidersHorizontal className="w-4 h-4" />
            More Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px]" align="end">
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Department</Label>
              <Select
                value={filters.department}
                onValueChange={(value) => onFiltersChange({ ...filters, department: value })}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Assigned To</Label>
              <Select
                value={filters.assignee}
                onValueChange={(value) => onFiltersChange({ ...filters, assignee: value })}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="All Assignees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assignees</SelectItem>
                  {assignees.map((assignee) => (
                    <SelectItem key={assignee} value={assignee}>{assignee}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="overdue"
                checked={filters.showOverdueOnly}
                onCheckedChange={(checked) =>
                  onFiltersChange({ ...filters, showOverdueOnly: checked })
                }
              />
              <Label htmlFor="overdue" className="text-sm">Show overdue only</Label>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Clear Filters */}
      {activeFilterCount > 0 && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
          <X className="w-4 h-4" />
          Clear
        </Button>
      )}
    </div>
  );
}
