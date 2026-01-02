import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { doctors } from '../_data/mockData';





export function SearchFilters({ filters, onFiltersChange }) {
    const hasActiveFilters =
        filters.search ||
        filters.status !== 'all' ||
        filters.doctorId !== 'all' ||
        filters.dateFrom ||
        filters.dateTo;

    const clearFilters = () => {
        onFiltersChange({
            search: '',
            status: 'all',
            doctorId: 'all',
            dateFrom: undefined,
            dateTo: undefined,
        });
    };

    const activeFilterCount = [
        filters.status !== 'all',
        filters.doctorId !== 'all',
        filters.dateFrom,
        filters.dateTo,
    ].filter(Boolean).length;

    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search patients, doctors..."
                    value={filters.search}
                    onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
                    className="pl-9"
                />
            </div>

            {/* Status Filter */}
            <Select
                value={filters.status}
                onValueChange={(v) => onFiltersChange({ ...filters, status: v })}
            >
                <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="delegated">Delegated</SelectItem>
                </SelectContent>
            </Select>

            {/* Doctor Filter */}
            <Select
                value={filters.doctorId}
                onValueChange={(v) => onFiltersChange({ ...filters, doctorId: v })}
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Doctor" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Doctors</SelectItem>
                    {doctors.map(doctor => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                            {doctor.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Date Range */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[140px] justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateFrom ? format(filters.dateFrom, "MMM d") : "From"}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className=" p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={filters.dateFrom}
                        onSelect={(date) => onFiltersChange({ ...filters, dateFrom: date })}
                        className="pointer-events-auto w-60 bg-card rounded-md"
                    />
                </PopoverContent>
            </Popover>

            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[140px] justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateTo ? format(filters.dateTo, "MMM d") : "To"}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={filters.dateTo}
                        onSelect={(date) => onFiltersChange({ ...filters, dateTo: date })}
                        className="pointer-events-auto w-60 bg-card rounded-md"
                    />
                </PopoverContent>
            </Popover>

            {/* Clear Filters */}
            {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
                    <X className="h-4 w-4" />
                    Clear
                    {activeFilterCount > 0 && (
                        <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                            {activeFilterCount}
                        </Badge>
                    )}
                </Button>
            )}
        </div>
    );
}
