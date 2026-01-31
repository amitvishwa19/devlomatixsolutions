import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { format } from 'date-fns';
import { CALENDAR_VIEWS } from './types';

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
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-semibold text-foreground">Calendar</h1>
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          <Button variant="outline" size="icon" onClick={() => onNavigate('prev')}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={onTodayClick}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={() => onNavigate('next')}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        
        <h2 className="text-lg font-medium text-foreground ml-4">
          {getHeaderTitle()}
        </h2>
      </div>

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
