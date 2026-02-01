import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, DoorOpen, User, AlertCircle } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { getUpcomingDischarges, getRoomTypeById } from '../utils/utils';

export function UpcomingDischargesPanel({ rooms, onInitiateDischarge, onViewBed }) {
  const discharges = React.useMemo(() => getUpcomingDischarges(rooms, 48), [rooms]);

  const categorized = React.useMemo(() => {
    return {
      overdue: discharges.filter(d => d.hoursUntil < 0),
      urgent: discharges.filter(d => d.hoursUntil >= 0 && d.hoursUntil <= 4),
      today: discharges.filter(d => d.hoursUntil > 4 && d.hoursUntil <= 24),
      tomorrow: discharges.filter(d => d.hoursUntil > 24 && d.hoursUntil <= 48),
    };
  }, [discharges]);

  const renderDischargeCard = (discharge) => {
    const roomType = getRoomTypeById(discharge.roomType);
    const isOverdue = discharge.hoursUntil < 0;
    const isUrgent = discharge.hoursUntil >= 0 && discharge.hoursUntil <= 4;

    return (
      <Card 
        key={discharge.id} 
        className={`border ${isOverdue ? 'border-red-200 bg-red-50/50' : isUrgent ? 'border-amber-200 bg-amber-50/50' : ''}`}
      >
        <CardContent className="p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${discharge.isPending ? 'bg-orange-100' : 'bg-muted'}`}>
                {discharge.isPending ? (
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                ) : (
                  <Clock className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{discharge.patient?.name}</span>
                  {discharge.isPending && (
                    <Badge variant="outline" className="text-orange-600 border-orange-200 text-[10px]">
                      Pending
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{discharge.patient?.mrn}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={`${roomType.color} text-[10px]`}>{discharge.bedNumber}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(discharge.expectedDischarge), 'HH:mm')}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className={`text-xs font-medium ${isOverdue ? 'text-red-600' : isUrgent ? 'text-amber-600' : 'text-muted-foreground'}`}>
                {isOverdue ? 'Overdue' : formatDistanceToNow(new Date(discharge.expectedDischarge), { addSuffix: true })}
              </p>
              <div className="flex gap-1 mt-2">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-7 text-xs"
                  onClick={() => onViewBed?.(discharge)}
                >
                  View
                </Button>
                {!discharge.isPending && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-7 text-xs"
                    onClick={() => onInitiateDischarge?.(discharge)}
                  >
                    <DoorOpen className="h-3 w-3 mr-1" />
                    Start
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <DoorOpen className="h-5 w-5" />
          Upcoming Discharges
        </h3>
        <Badge variant="outline">
          {discharges.length} total
        </Badge>
      </div>

      <ScrollArea className="h-[calc(100vh-360px)]">
        <div className="space-y-4 pr-4">
          {/* Overdue */}
          {categorized.overdue.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="destructive">Overdue</Badge>
                <span className="text-xs text-muted-foreground">({categorized.overdue.length})</span>
              </div>
              {categorized.overdue.map(renderDischargeCard)}
            </div>
          )}

          {/* Urgent (Next 4 hours) */}
          {categorized.urgent.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-amber-100 text-amber-800">Next 4 Hours</Badge>
                <span className="text-xs text-muted-foreground">({categorized.urgent.length})</span>
              </div>
              {categorized.urgent.map(renderDischargeCard)}
            </div>
          )}

          {/* Today */}
          {categorized.today.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Today</Badge>
                <span className="text-xs text-muted-foreground">({categorized.today.length})</span>
              </div>
              {categorized.today.map(renderDischargeCard)}
            </div>
          )}

          {/* Tomorrow */}
          {categorized.tomorrow.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Tomorrow</Badge>
                <span className="text-xs text-muted-foreground">({categorized.tomorrow.length})</span>
              </div>
              {categorized.tomorrow.map(renderDischargeCard)}
            </div>
          )}

          {discharges.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No upcoming discharges in the next 48 hours</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
