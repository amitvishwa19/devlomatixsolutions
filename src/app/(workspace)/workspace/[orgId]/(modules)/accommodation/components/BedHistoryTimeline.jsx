import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  User, DoorOpen, ArrowRightLeft, Sparkles, Wrench, 
  Clock, Activity, AlertCircle, CheckCircle, FileText
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

export function BedHistoryTimeline({ history, bedNumber }) {
  const getEventIcon = (type) => {
    switch (type) {
      case 'admission': return <User className="h-4 w-4" />;
      case 'discharge': return <DoorOpen className="h-4 w-4" />;
      case 'transfer_in': return <ArrowRightLeft className="h-4 w-4" />;
      case 'transfer_out': return <ArrowRightLeft className="h-4 w-4" />;
      case 'cleaning': return <Sparkles className="h-4 w-4" />;
      case 'maintenance': return <Wrench className="h-4 w-4" />;
      case 'status_change': return <Activity className="h-4 w-4" />;
      case 'note': return <FileText className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getEventColor = (type) => {
    switch (type) {
      case 'admission': return 'bg-green-500';
      case 'discharge': return 'bg-orange-500';
      case 'transfer_in': return 'bg-blue-500';
      case 'transfer_out': return 'bg-purple-500';
      case 'cleaning': return 'bg-pink-500';
      case 'maintenance': return 'bg-gray-500';
      case 'status_change': return 'bg-amber-500';
      case 'note': return 'bg-slate-500';
      default: return 'bg-gray-400';
    }
  };

  const getEventLabel = (type) => {
    switch (type) {
      case 'admission': return 'Patient Admitted';
      case 'discharge': return 'Patient Discharged';
      case 'transfer_in': return 'Transfer In';
      case 'transfer_out': return 'Transfer Out';
      case 'cleaning': return 'Cleaning Completed';
      case 'maintenance': return 'Maintenance';
      case 'status_change': return 'Status Changed';
      case 'note': return 'Note Added';
      default: return 'Event';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Bed History
        </h3>
        <Badge variant="outline">{bedNumber}</Badge>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="relative pl-6 pr-4">
          {/* Timeline line */}
          <div className="absolute left-[11px] top-0 bottom-0 w-0.5 bg-border" />

          {history.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No history available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((event, index) => (
                <div key={event.id || index} className="relative">
                  {/* Timeline dot */}
                  <div className={`absolute -left-6 w-5 h-5 rounded-full ${getEventColor(event.type)} flex items-center justify-center text-white`}>
                    {getEventIcon(event.type)}
                  </div>

                  <Card className="ml-2">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{getEventLabel(event.type)}</span>
                            {event.priority === 'high' && (
                              <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                            )}
                          </div>
                          {event.patientName && (
                            <p className="text-sm text-primary mt-0.5">{event.patientName}</p>
                          )}
                          {event.description && (
                            <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
                          )}
                          {event.performedBy && (
                            <p className="text-xs text-muted-foreground mt-1">
                              By: {event.performedBy}
                            </p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(event.timestamp), 'dd MMM, HH:mm')}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      
                      {event.details && (
                        <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
                          {Object.entries(event.details).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="capitalize">{key.replace('_', ' ')}:</span>
                              <span className="font-medium">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
