import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Search, Building2, Bed, X } from 'lucide-react';


export function WorkflowFilters({
    searchQuery,
    onSearchChange,
    selectedType,
    onTypeChange,
    selectedStatus,
    onStatusChange,
}) {
    const types = [
        { value: 'all', label: 'All' },
        { value: 'OPD', label: 'OPD', icon: Building2 },
        { value: 'IPD', label: 'IPD', icon: Bed },
    ];

    const statuses = [
        { value: 'all', label: 'All Status', color: 'bg-muted text-muted-foreground' },
        { value: 'pending', label: 'Pending', color: 'bg-warning/10 text-warning' },
        { value: 'in-progress', label: 'In Progress', color: 'bg-info/10 text-info' },
        { value: 'completed', label: 'Completed', color: 'bg-success/10 text-success' },
        { value: 'critical', label: 'Critical', color: 'bg-destructive/10 text-destructive' },
    ];

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-2">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Search patients by name, MRN, or doctor..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-10 bg-card border-border"
                />
                {searchQuery && (
                    <button
                        onClick={() => onSearchChange('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-1 bg-muted p-[2px] rounded-md border">
                {types.map((type) => (
                    <Button
                        key={type.value}
                        variant="ghost"
                        size="sm"
                        onClick={() => onTypeChange(type.value)}
                        className={cn(
                            'h-8 px-3 rounded-md dark:hover:bg-card transition-all ',
                            selectedType === type.value
                                ? 'bg-card text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                        )}
                    >
                        {type.icon && <type.icon className="w-4 h-4 mr-1.5" />}
                        {type.label}
                    </Button>
                ))}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2 flex-wrap">
                {statuses.map((status) => (
                    <Button
                        key={status.value}
                        variant='ghost'
                        onClick={() => onStatusChange(status.value)}
                        className={cn(
                            'px-3 py-1.5  text-xs font-medium transition-all border',
                            selectedStatus === status.value
                                ? `${status.color} bg-primary/10 dark:bg-darkFocusColor ring-[0.6px]`
                                : 'text-muted-foreground hover:bg-muted/80'
                        )}
                    >
                        {status.label}
                    </Button>
                ))}
            </div>
        </div>
    );
}
