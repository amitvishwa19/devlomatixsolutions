import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Filter, X } from 'lucide-react';

const priorityOptions = [
  { value: 'high', label: 'High Priority' },
  { value: 'medium', label: 'Medium Priority' },
  { value: 'low', label: 'Low Priority' },
];

const categoryOptions = [
  { value: 'patient-care', label: 'Patient Care' },
  { value: 'administrative', label: 'Administrative' },
  { value: 'lab-work', label: 'Lab Work' },
  { value: 'surgery', label: 'Surgery' },
  { value: 'consultation', label: 'Consultation' },
];

export const FilterSheet = ({ filters, onFiltersChange }) => {
  const [open, setOpen] = useState(false);

  const handlePriorityChange = (priority, checked) => {
    const newPriorities = checked
      ? [...filters.priorities, priority]
      : filters.priorities.filter((p) => p !== priority);
    onFiltersChange({ ...filters, priorities: newPriorities });
  };

  const handleCategoryChange = (category, checked) => {
    const newCategories = checked
      ? [...filters.categories, category]
      : filters.categories.filter((c) => c !== category);
    onFiltersChange({ ...filters, categories: newCategories });
  };

  const clearFilters = () => {
    onFiltersChange({ searchQuery: '', priorities: [], categories: [] });
  };

  const activeFiltersCount = filters.priorities.length + filters.categories.length + (filters.searchQuery ? 1 : 0);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2 relative">
          <Filter className="w-4 h-4" />
          Filters
          {activeFiltersCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle>Filter Tasks</SheetTitle>
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-muted-foreground">
                <X className="w-3 h-3" />
                Clear all
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              value={filters.searchQuery}
              onChange={(e) => onFiltersChange({ ...filters, searchQuery: e.target.value })}
              placeholder="Search tasks, patients, doctors..."
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-semibold">Priority</Label>
            <div className="space-y-2">
              {priorityOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`priority-${option.value}`}
                    checked={filters.priorities.includes(option.value)}
                    onCheckedChange={(checked) => handlePriorityChange(option.value, checked)}
                  />
                  <label
                    htmlFor={`priority-${option.value}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-semibold">Category</Label>
            <div className="space-y-2">
              {categoryOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${option.value}`}
                    checked={filters.categories.includes(option.value)}
                    onCheckedChange={(checked) => handleCategoryChange(option.value, checked)}
                  />
                  <label
                    htmlFor={`category-${option.value}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
