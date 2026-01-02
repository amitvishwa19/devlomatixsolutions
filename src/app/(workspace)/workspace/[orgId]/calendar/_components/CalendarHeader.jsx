import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';




export function CalendarHeader({
    currentDate,
    viewMode,
    onPrevious,
    onNext,
    onToday,
    onViewChange,
}) {
    const getDateDisplay = () => {
        switch (viewMode) {
            case 'day':
                return format(currentDate, 'EEEE, MMMM d, yyyy');
            case 'week':
                return format(currentDate, 'MMMM yyyy');
            case 'month':
            default:
                return format(currentDate, 'MMMM yyyy');
        }
    };

    return (
        <div className="flex bg-card flex-col gap-4 sm:flex-row sm:items-center  sm:justify-between p-2 rounded-md w-full border">


            <div className="flex items-center gap-3">


                <div className="flex items-center gap-1 bg-secondary rounded-md p-1">
                    {(['day', 'week', 'month']).map((view) => (
                        <Button
                            key={view}
                            variant={viewMode === view ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => onViewChange(view)}
                            className={viewMode === view ? 'shadow-sm' : ''}
                        >
                            {view.charAt(0).toUpperCase() + view.slice(1)}
                        </Button>
                    ))}
                </div>

                <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" onClick={onPrevious}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" onClick={onToday} className="px-4">
                        Today
                    </Button>
                    <Button variant="outline" size="icon" onClick={onNext}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                <span className="text-lg font-medium text-foreground min-w-[200px] text-right">
                    {getDateDisplay()}
                </span>
            </div>
        </div>
    );
}
