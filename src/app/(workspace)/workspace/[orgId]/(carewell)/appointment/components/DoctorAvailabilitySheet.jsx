import React, { useState } from 'react';
import { Settings, Clock, Calendar, Ban, Plus, Trash2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { DOCTORS, TIME_SLOTS, DEFAULT_WORKING_HOURS, DOCTOR_SCHEDULES } from './types';
import { useToast } from '@/hooks/use-toast';

const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export function DoctorAvailabilitySheet({ doctorSchedules, onUpdateSchedules }) {
  const [open, setOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState('dr1');
  const [schedules, setSchedules] = useState(doctorSchedules || DOCTOR_SCHEDULES);
  const [newBlockedDate, setNewBlockedDate] = useState(null);
  const [newBlockedTime, setNewBlockedTime] = useState('');
  const [newBlockedReason, setNewBlockedReason] = useState('');
  const { toast } = useToast();

  const currentSchedule = schedules[selectedDoctor] || {
    workingHours: { ...DEFAULT_WORKING_HOURS },
    blockedSlots: [],
  };

  const handleWorkingHoursChange = (day, field, value) => {
    const updated = {
      ...schedules,
      [selectedDoctor]: {
        ...currentSchedule,
        workingHours: {
          ...currentSchedule.workingHours,
          [day]: {
            ...currentSchedule.workingHours[day],
            [field]: value,
          },
        },
      },
    };
    setSchedules(updated);
  };

  const handleAddBlockedSlot = () => {
    if (!newBlockedDate || !newBlockedTime) {
      toast({ title: 'Please select date and time', variant: 'destructive' });
      return;
    }

    const updated = {
      ...schedules,
      [selectedDoctor]: {
        ...currentSchedule,
        blockedSlots: [
          ...currentSchedule.blockedSlots,
          { date: newBlockedDate, time: newBlockedTime, reason: newBlockedReason || 'Blocked' },
        ],
      },
    };
    setSchedules(updated);
    setNewBlockedDate(null);
    setNewBlockedTime('');
    setNewBlockedReason('');
    toast({ title: 'Time slot blocked successfully' });
  };

  const handleRemoveBlockedSlot = (index) => {
    const updated = {
      ...schedules,
      [selectedDoctor]: {
        ...currentSchedule,
        blockedSlots: currentSchedule.blockedSlots.filter((_, i) => i !== index),
      },
    };
    setSchedules(updated);
  };

  const handleSave = () => {
    onUpdateSchedules?.(schedules);
    toast({ title: 'Schedules updated', description: 'Doctor availability has been saved.' });
    setOpen(false);
  };

  const doctor = DOCTORS.find((d) => d.id === selectedDoctor);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Settings className="w-4 h-4" />
          Doctor Availability
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-[600px] p-0 flex flex-col h-full">
        <SheetHeader className="p-6 pb-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <SheetTitle className="text-lg">Doctor Availability</SheetTitle>
              <p className="text-sm text-muted-foreground">Manage working hours and blocked time slots</p>
            </div>
          </div>
        </SheetHeader>

        <div className="px-6 py-4 border-b border-border shrink-0">
          <Label className="text-xs text-muted-foreground mb-2 block">Select Doctor</Label>
          <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DOCTORS.map((doc) => (
                <SelectItem key={doc.id} value={doc.id}>
                  {doc.name} - {doc.specialization}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <ScrollArea className="flex-1">
          <Tabs defaultValue="hours" className="p-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="hours">Working Hours</TabsTrigger>
              <TabsTrigger value="blocked">Blocked Slots</TabsTrigger>
            </TabsList>

            <TabsContent value="hours" className="mt-4 space-y-4">
              {DAYS_OF_WEEK.map((day) => {
                const daySchedule = currentSchedule.workingHours[day];
                return (
                  <div key={day} className="flex items-center gap-4 p-3 bg-secondary/30 rounded-lg border border-border">
                    <div className="w-24">
                      <span className="text-sm font-medium capitalize">{day}</span>
                    </div>
                    <Switch
                      checked={daySchedule?.enabled}
                      onCheckedChange={(checked) => handleWorkingHoursChange(day, 'enabled', checked)}
                    />
                    {daySchedule?.enabled && (
                      <>
                        <Select
                          value={daySchedule.start}
                          onValueChange={(val) => handleWorkingHoursChange(day, 'start', val)}
                        >
                          <SelectTrigger className="w-28 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TIME_SLOTS.map((slot) => (
                              <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span className="text-muted-foreground">to</span>
                        <Select
                          value={daySchedule.end}
                          onValueChange={(val) => handleWorkingHoursChange(day, 'end', val)}
                        >
                          <SelectTrigger className="w-28 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TIME_SLOTS.map((slot) => (
                              <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </>
                    )}
                    {!daySchedule?.enabled && (
                      <span className="text-sm text-muted-foreground">Not available</span>
                    )}
                  </div>
                );
              })}
            </TabsContent>

            <TabsContent value="blocked" className="mt-4 space-y-4">
              {/* Add new blocked slot */}
              <div className="p-4 bg-secondary/30 rounded-lg border border-border space-y-4">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Ban className="w-4 h-4" />
                  Block Time Slot
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="justify-start h-9">
                        <Calendar className="mr-2 h-4 w-4" />
                        {newBlockedDate ? format(newBlockedDate, 'dd MMM yyyy') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={newBlockedDate}
                        onSelect={setNewBlockedDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Select value={newBlockedTime} onValueChange={setNewBlockedTime}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_SLOTS.map((slot) => (
                        <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  placeholder="Reason (optional)"
                  value={newBlockedReason}
                  onChange={(e) => setNewBlockedReason(e.target.value)}
                  className="h-9"
                />
                <Button onClick={handleAddBlockedSlot} className="w-full gap-2">
                  <Plus className="w-4 h-4" />
                  Block Slot
                </Button>
              </div>

              {/* Blocked slots list */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Blocked Slots ({currentSchedule.blockedSlots.length})
                </h4>
                {currentSchedule.blockedSlots.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">No blocked slots</p>
                ) : (
                  currentSchedule.blockedSlots.map((slot, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-destructive/5 rounded-lg border border-destructive/20"
                    >
                      <div className="flex items-center gap-3">
                        <Ban className="w-4 h-4 text-destructive" />
                        <div>
                          <p className="text-sm font-medium">
                            {format(new Date(slot.date), 'dd MMM yyyy')} at {slot.time}
                          </p>
                          <p className="text-xs text-muted-foreground">{slot.reason}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleRemoveBlockedSlot(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </ScrollArea>

        <SheetFooter className="p-4 border-t border-border shrink-0">
          <div className="flex justify-end gap-3 w-full">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} className="gap-2">
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
