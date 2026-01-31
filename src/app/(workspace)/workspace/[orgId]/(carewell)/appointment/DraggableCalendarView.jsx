import { useState, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { isSameDay, format, addDays, subDays } from 'date-fns';
import { Clock, User, Stethoscope, GripVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import { APPOINTMENT_STATUSES, TIME_SLOTS } from './types';
import { sortAppointmentsByTime, getInitials } from './utils';
import { useToast } from '@/hooks/use-toast';

const statusStyles = {
  scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
  confirmed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'in-progress': 'bg-primary/10 text-primary border-primary/20',
  completed: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
  'no-show': 'bg-amber-100 text-amber-700 border-amber-200',
  waitlisted: 'bg-purple-100 text-purple-700 border-purple-200',
};

export function DraggableCalendarView({ appointments, onAppointmentClick, onReschedule }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekStartDate, setWeekStartDate] = useState(new Date());
  const { toast } = useToast();

  // Generate week days for the timeline
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStartDate, i));
  }, [weekStartDate]);

  const appointmentDates = [...new Set(appointments.map((apt) => format(new Date(apt.date), 'yyyy-MM-dd')))];

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const [dateStr, timeSlot] = destination.droppableId.split('|');

    const appointment = appointments.find((apt) => apt.id === draggableId);
    if (!appointment) return;

    const newDate = new Date(dateStr);
    const newTime = timeSlot;

    // Check if actually moved
    if (
      format(new Date(appointment.date), 'yyyy-MM-dd') === dateStr &&
      appointment.time === newTime
    ) {
      return;
    }

    onReschedule?.(appointment.id, newDate, newTime);
    toast({
      title: 'Appointment rescheduled',
      description: `Moved to ${format(newDate, 'dd MMM yyyy')} at ${newTime}`,
    });
  };

  const navigateWeek = (direction) => {
    setWeekStartDate((prev) => (direction === 'next' ? addDays(prev, 7) : subDays(prev, 7)));
  };

  // Get appointments for a specific date and time
  const getAppointmentsForSlot = (date, time) => {
    return appointments.filter(
      (apt) =>
        format(new Date(apt.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') &&
        apt.time === time
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
      {/* Calendar Sidebar */}
      <div className="lg:col-span-1">
        <div className="bg-card border border-border rounded-xl p-4 sticky top-0">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              if (date) {
                setSelectedDate(date);
                setWeekStartDate(date);
              }
            }}
            className="w-full"
            modifiers={{
              hasAppointment: (date) =>
                appointmentDates.includes(format(date, 'yyyy-MM-dd')),
            }}
            modifiersStyles={{
              hasAppointment: {
                fontWeight: 'bold',
                backgroundColor: 'hsl(var(--primary) / 0.1)',
                borderRadius: '50%',
              },
            }}
          />
          <div className="mt-4 p-3 bg-secondary/30 rounded-lg">
            <p className="text-xs text-muted-foreground mb-2">💡 Tip</p>
            <p className="text-xs text-muted-foreground">
              Drag and drop appointments to reschedule them to different time slots or dates.
            </p>
          </div>
        </div>
      </div>

      {/* Week Timeline */}
      <div className="lg:col-span-3 bg-card border border-border rounded-xl overflow-hidden">
        {/* Week Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Button variant="outline" size="sm" onClick={() => navigateWeek('prev')}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h3 className="text-sm font-semibold">
            {format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d, yyyy')}
          </h3>
          <Button variant="outline" size="sm" onClick={() => navigateWeek('next')}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <ScrollArea className="h-[600px]">
            <div className="min-w-[900px]">
              {/* Day Headers */}
              <div className="grid grid-cols-8 border-b border-border sticky top-0 bg-card z-10">
                <div className="p-2 text-xs font-medium text-muted-foreground border-r border-border">
                  Time
                </div>
                {weekDays.map((day) => {
                  const isToday = isSameDay(day, new Date());
                  return (
                    <div
                      key={format(day, 'yyyy-MM-dd')}
                      className={`p-2 text-center border-r border-border last:border-r-0 ${
                        isToday ? 'bg-primary/5' : ''
                      }`}
                    >
                      <p className="text-xs text-muted-foreground">{format(day, 'EEE')}</p>
                      <p className={`text-sm font-medium ${isToday ? 'text-primary' : ''}`}>
                        {format(day, 'd')}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Time Slots Grid */}
              {TIME_SLOTS.map((timeSlot) => (
                <div key={timeSlot} className="grid grid-cols-8 border-b border-border last:border-b-0">
                  <div className="p-2 text-xs text-muted-foreground border-r border-border flex items-center">
                    {timeSlot}
                  </div>
                  {weekDays.map((day) => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const droppableId = `${dateStr}|${timeSlot}`;
                    const slotAppointments = getAppointmentsForSlot(day, timeSlot);
                    const isToday = isSameDay(day, new Date());

                    return (
                      <Droppable key={droppableId} droppableId={droppableId}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`min-h-[60px] p-1 border-r border-border last:border-r-0 transition-colors ${
                              isToday ? 'bg-primary/5' : ''
                            } ${snapshot.isDraggingOver ? 'bg-primary/10' : ''}`}
                          >
                            {slotAppointments.map((apt, index) => {
                              const status = APPOINTMENT_STATUSES.find((s) => s.id === apt.status);
                              return (
                                <Draggable key={apt.id} draggableId={apt.id} index={index}>
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      onClick={() => onAppointmentClick?.(apt)}
                                      className={`p-2 mb-1 rounded-md border cursor-pointer transition-shadow ${
                                        statusStyles[apt.status]
                                      } ${snapshot.isDragging ? 'shadow-lg' : 'hover:shadow-sm'}`}
                                    >
                                      <div className="flex items-center gap-1">
                                        <GripVertical className="w-3 h-3 opacity-50" />
                                        <span className="text-xs font-medium truncate flex-1">
                                          {apt.patientName}
                                        </span>
                                      </div>
                                      <p className="text-[10px] opacity-75 truncate mt-0.5">
                                        {apt.doctorName?.replace('Dr. ', '')}
                                      </p>
                                    </div>
                                  )}
                                </Draggable>
                              );
                            })}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    );
                  })}
                </div>
              ))}
            </div>
          </ScrollArea>
        </DragDropContext>
      </div>
    </div>
  );
}
