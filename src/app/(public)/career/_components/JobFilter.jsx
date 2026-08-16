'use client';

import { Search, MapPin, Briefcase, X, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

export const JobFilter = ({ 
  search, 
  setSearch, 
  department, 
  setDepartment, 
  type, 
  setType, 
  location, 
  setLocation,
  departments = []
}) => {
  const handleReset = () => {
    setSearch('');
    setDepartment('ALL');
    setType('ALL');
    setLocation('ALL');
  };

  const isFiltered = search || department !== 'ALL' || type !== 'ALL' || location !== 'ALL';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-50" />
          <Input
            placeholder="Search for roles (e.g. Frontend Engineer)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 h-14 bg-card/60 backdrop-blur-xl border-border/40 rounded-2xl text-sm font-bold shadow-inner focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap gap-4">
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger className="w-[200px] h-14 bg-card/60 backdrop-blur-xl border-border/40 rounded-2xl font-bold text-xs uppercase tracking-widest px-4">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/20 shadow-2xl">
              <SelectItem value="ALL" className="font-bold text-[10px] uppercase tracking-widest py-3">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept} className="font-bold text-[10px] uppercase tracking-widest py-3">
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-[180px] h-14 bg-card/60 backdrop-blur-xl border-border/40 rounded-2xl font-bold text-xs uppercase tracking-widest px-4">
              <SelectValue placeholder="Job Type" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/20 shadow-2xl">
              <SelectItem value="ALL" className="font-bold text-[10px] uppercase tracking-widest py-3">All Types</SelectItem>
              <SelectItem value="Full-time" className="font-bold text-[10px] uppercase tracking-widest py-3">Full-time</SelectItem>
              <SelectItem value="Part-time" className="font-bold text-[10px] uppercase tracking-widest py-3">Part-time</SelectItem>
              <SelectItem value="Contract" className="font-bold text-[10px] uppercase tracking-widest py-3">Contract</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters */}
      {isFiltered && (
        <div className="flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground opacity-40">Active Filters</p>
          <div className="flex flex-wrap gap-2">
            {search && (
              <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/20 text-[10px] font-bold px-3 py-1 rounded-full group">
                &quot;{search}&quot;
                <X size={12} className="ml-2 cursor-pointer opacity-50 hover:opacity-100" onClick={() => setSearch('')}/>
              </Badge>
            )}
            {department !== 'ALL' && (
              <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/20 text-[10px] font-bold px-3 py-1 rounded-full group">
                {department}
                <X size={12} className="ml-2 cursor-pointer opacity-50 hover:opacity-100" onClick={() => setDepartment('ALL')}/>
              </Badge>
            )}
            {type !== 'ALL' && (
              <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/20 text-[10px] font-bold px-3 py-1 rounded-full group">
                {type}
                <X size={12} className="ml-2 cursor-pointer opacity-50 hover:opacity-100" onClick={() => setType('ALL')}/>
              </Badge>
            )}
            <Button
              variant="link"
              size="sm"
              onClick={handleReset}
              className="h-6 p-0 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
            >
              Reset All
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
