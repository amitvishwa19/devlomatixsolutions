import { Search, Filter, Grid3X3, List, Calendar as CalendarIcon, TableProperties, BarChart3, GripVertical } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { APPOINTMENT_STATUSES, DEPARTMENTS, DOCTORS } from '../misc/types';
import { TagFilterDropdown } from '../../taxonomy/components';



export function AppointmentFilters({
    searchQuery,
    onSearchChange,
    statusFilter,
    onStatusFilterChange,
    departmentFilter,
    onDepartmentFilterChange,
    doctorFilter,
    onDoctorFilterChange,
    dateFilter,
    onDateFilterChange,
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
                        placeholder="Search patients, doctors..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-9 w-64 h-9"
                    />
                </div>

                {/* Date Picker */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="h-9 gap-2">
                            <CalendarIcon className="w-4 h-4" />
                            {dateFilter ? format(dateFilter, 'dd MMM yyyy') : 'Select Date'}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={dateFilter}
                            onSelect={onDateFilterChange}
                            initialFocus
                        />
                        {dateFilter && (
                            <div className="p-2 border-t">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full"
                                    onClick={() => onDateFilterChange(null)}
                                >
                                    Clear Date
                                </Button>
                            </div>
                        )}
                    </PopoverContent>
                </Popover>

                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                    <SelectTrigger className="w-36 h-9">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        {APPOINTMENT_STATUSES.map((status) => (
                            <SelectItem key={status.id} value={status.id}>
                                {status.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Department Filter */}
                <Select value={departmentFilter} onValueChange={onDepartmentFilterChange}>
                    <SelectTrigger className="w-44 h-9">
                        <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        {DEPARTMENTS.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id}>
                                {dept.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Doctor Filter */}
                <Select value={doctorFilter} onValueChange={onDoctorFilterChange}>
                    <SelectTrigger className="w-44 h-9">
                        <SelectValue placeholder="Doctor" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Doctors</SelectItem>
                        {DOCTORS.map((doctor) => (
                            <SelectItem key={doctor.id} value={doctor.id}>
                                {doctor.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Tag Filter */}
                <TagFilterDropdown
                    entityType="appointment"
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
                    title="List View"
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
                <Button
                    variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                    size="sm"
                    className="h-7 px-3"
                    onClick={() => onViewModeChange('calendar')}
                    title="Calendar View"
                >
                    <CalendarIcon className="w-4 h-4" />
                </Button>
                <Button
                    variant={viewMode === 'scheduler' ? 'default' : 'ghost'}
                    size="sm"
                    className="h-7 px-3"
                    onClick={() => onViewModeChange('scheduler')}
                    title="Scheduler (Drag & Drop)"
                >
                    <GripVertical className="w-4 h-4" />
                </Button>
                <Button
                    variant={viewMode === 'analytics' ? 'default' : 'ghost'}
                    size="sm"
                    className="h-7 px-3"
                    onClick={() => onViewModeChange('analytics')}
                    title="Analytics"
                >
                    <BarChart3 className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}
