import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { format } from 'date-fns';
import { CALENDAR_VIEWS } from '../utils/types';

export function CalendarHeader({
    currentDate,
    view,
    onViewChange,
    onNavigate,
    onTodayClick
}) {
    const getHeaderTitle = () => {
        switch (view) {
            case 'month':
                return format(currentDate, 'MMMM yyyy');
            case 'week':
                return format(currentDate, "'Week of' MMM d, yyyy");
            case 'day':
                return format(currentDate, 'EEEE, MMMM d, yyyy');
            default:
                return format(currentDate, 'MMMM yyyy');
        }
    };

    return (
        <div className="flex items-center justify-between p-4 border-b border-border bg-card">


            <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-1">
                {CALENDAR_VIEWS.map((v) => (
                    <Button
                        key={v.id}
                        variant={view === v.id ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => onViewChange(v.id)}
                        className={view === v.id ? '' : 'text-muted-foreground'}
                    >
                        {v.label}
                    </Button>
                ))}
            </div>
        </div>
    );
}
