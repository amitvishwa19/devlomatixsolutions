import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Filter, X, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';




export function AdvancedFilters({
    filters,
    onFiltersChange,
    doctors,
    departments
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [localFilters, setLocalFilters] = useState < AdvancedFilterValues > (filters);

    const activeFiltersCount = Object.values(filters).filter(Boolean).length;

    const handleApply = () => {
        onFiltersChange(localFilters);
        setIsOpen(false);
    };

    const handleClear = () => {
        const emptyFilters = {};
        setLocalFilters(emptyFilters);
        onFiltersChange(emptyFilters);
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" className="relative gap-2">
                    <Filter className="h-4 w-4" />
                    Advanced Filters
                    {activeFiltersCount > 0 && (
                        <span className="ml-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                            {activeFiltersCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-4" align="start">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-foreground">Advanced Filters</h4>
                        {activeFiltersCount > 0 && (
                            <Button variant="ghost" size="sm" onClick={handleClear} className="h-8 text-xs">
                                <X className="w-3 h-3 mr-1" />
                                Clear all
                            </Button>
                        )}
                    </div>

                    {/* Doctor Filter */}
                    <div className="space-y-2">
                        <Label htmlFor="doctor">Assigned Doctor</Label>
                        <Select
                            value={localFilters.doctor || ''}
                            onValueChange={(value) =>
                                setLocalFilters(prev => ({ ...prev, doctor: value || undefined }))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="All doctors" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All doctors</SelectItem>
                                {doctors.map(doctor => (
                                    <SelectItem key={doctor} value={doctor}>{doctor}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Department Filter */}
                    <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Select
                            value={localFilters.department || ''}
                            onValueChange={(value) =>
                                setLocalFilters(prev => ({ ...prev, department: value || undefined }))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="All departments" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All departments</SelectItem>
                                {departments.map(dept => (
                                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label>From Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            'w-full justify-start text-left font-normal',
                                            !localFilters.dateFrom && 'text-muted-foreground'
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {localFilters.dateFrom ? format(localFilters.dateFrom, 'MMM dd') : 'Pick date'}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={localFilters.dateFrom}
                                        onSelect={(date) =>
                                            setLocalFilters(prev => ({ ...prev, dateFrom: date }))
                                        }
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2">
                            <Label>To Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            'w-full justify-start text-left font-normal',
                                            !localFilters.dateTo && 'text-muted-foreground'
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {localFilters.dateTo ? format(localFilters.dateTo, 'MMM dd') : 'Pick date'}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={localFilters.dateTo}
                                        onSelect={(date) =>
                                            setLocalFilters(prev => ({ ...prev, dateTo: date }))
                                        }
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    {/* Age Range */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label htmlFor="ageMin">Min Age</Label>
                            <Input
                                id="ageMin"
                                type="number"
                                min={0}
                                max={120}
                                placeholder="0"
                                value={localFilters.ageMin || ''}
                                onChange={(e) =>
                                    setLocalFilters(prev => ({
                                        ...prev,
                                        ageMin: e.target.value ? parseInt(e.target.value) : undefined
                                    }))
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ageMax">Max Age</Label>
                            <Input
                                id="ageMax"
                                type="number"
                                min={0}
                                max={120}
                                placeholder="120"
                                value={localFilters.ageMax || ''}
                                onChange={(e) =>
                                    setLocalFilters(prev => ({
                                        ...prev,
                                        ageMax: e.target.value ? parseInt(e.target.value) : undefined
                                    }))
                                }
                            />
                        </div>
                    </div>

                    <Button onClick={handleApply} className="w-full gradient-primary text-primary-foreground">
                        Apply Filters
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
