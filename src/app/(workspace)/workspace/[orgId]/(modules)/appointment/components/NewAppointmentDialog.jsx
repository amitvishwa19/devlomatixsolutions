import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Calendar as CalendarIcon, Clock, Users, Sparkles, Sun, Moon, Sunset, Building2, Video, MessageCircle, Phone, Save, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { format, addDays, addWeeks, addMonths } from 'date-fns';
import { cn } from '@/lib/utils';
import { APPOINTMENT_TYPES, DEPARTMENTS, DOCTORS, RECURRENCE_PATTERNS } from '../misc/types';
import { useToast } from '@/hooks/use-toast';
import { useFormValidationToast } from '../../hooks/useFormValidationToast';


const PREFERRED_SLOTS = [
  { id: 'morning', label: 'Morning', time: '09:00 AM - 12:00 PM', icon: Sun },
  { id: 'noon', label: 'Noon', time: '12:00 PM - 03:00 PM', icon: Sun },
  { id: 'evening', label: 'Evening', time: '03:00 PM - 06:00 PM', icon: Sunset },
  { id: 'night', label: 'Night', time: '06:00 PM - 09:00 PM', icon: Moon },
];

const TIME_SLOTS_BY_PERIOD = {
  morning: ['09:00 AM', '09:15 AM', '09:30 AM', '09:45 AM', '10:00 AM', '10:15 AM', '10:30 AM', '10:45 AM', '11:00 AM', '11:15 AM', '11:30 AM', '11:45 AM'],
  noon: ['12:00 PM', '12:15 PM', '12:30 PM', '12:45 PM', '01:00 PM', '01:15 PM', '01:30 PM', '01:45 PM', '02:00 PM', '02:15 PM', '02:30 PM', '02:45 PM'],
  evening: ['03:00 PM', '03:15 PM', '03:30 PM', '03:45 PM', '04:00 PM', '04:15 PM', '04:30 PM', '04:45 PM', '05:00 PM', '05:15 PM', '05:30 PM', '05:45 PM'],
  night: ['06:00 PM', '06:15 PM', '06:30 PM', '06:45 PM', '07:00 PM', '07:15 PM', '07:30 PM', '07:45 PM', '08:00 PM', '08:15 PM', '08:30 PM', '08:45 PM'],
};

const APPOINTMENT_MODES = [
  { id: 'in-person', label: 'In-Person', description: 'Visit clinic', icon: Building2 },
  { id: 'video', label: 'Video', description: 'Video call', icon: Video },
  { id: 'chat', label: 'Chat', description: 'Text chat', icon: MessageCircle },
  { id: 'phone', label: 'Phone', description: 'Voice call', icon: Phone },
];

const MOCK_PATIENTS = [
  { id: 'p1', name: 'Rahul Sharma', mrn: 'MRN-2024-0001' },
  { id: 'p2', name: 'Sneha Gupta', mrn: 'MRN-2024-0002' },
  { id: 'p3', name: 'Amit Patel', mrn: 'MRN-2024-0003' },
  { id: 'p4', name: 'Priya Verma', mrn: 'MRN-2024-0004' },
  { id: 'p5', name: 'Vikram Mehta', mrn: 'MRN-2024-0005' },
];

// Zod schema for appointment form
const appointmentSchema = z.object({
  doctorId: z.string().min(1, 'Doctor is required'),
  patientId: z.string().min(1, 'Patient is required'),
  date: z.date({ required_error: 'Date is required' }),
  visitType: z.string().optional(),
  preferredSlot: z.string().default('morning'),
  time: z.string().min(1, 'Time is required'),
  appointmentMode: z.string().default('in-person'),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
  recurrence: z.string().default('none'),
  recurrenceCount: z.number().min(2).max(12).default(4),
});

export function NewAppointmentDialog({ onAddAppointment, prefillData }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { showValidationErrors } = useFormValidationToast();

  const form = useForm({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      doctorId: prefillData?.doctorId || '',
      patientId: prefillData?.patientId || '',
      date: prefillData?.date || null,
      visitType: '',
      preferredSlot: 'morning',
      time: '',
      appointmentMode: 'in-person',
      notes: '',
      recurrence: 'none',
      recurrenceCount: 4,
    },
  });

  useEffect(() => {
    if (prefillData) {
      form.reset({
        ...form.getValues(),
        doctorId: prefillData.doctorId || '',
        patientId: prefillData.patientId || '',
        date: prefillData.date || null,
      });
    }
  }, [prefillData, form]);

  const preferredSlot = form.watch('preferredSlot');
  const recurrence = form.watch('recurrence');
  const timeSlots = TIME_SLOTS_BY_PERIOD[preferredSlot] || [];

  const generateRecurringDates = (startDate, pattern, count) => {
    const dates = [startDate];
    for (let i = 1; i < count; i++) {
      switch (pattern) {
        case 'daily':
          dates.push(addDays(startDate, i));
          break;
        case 'weekly':
          dates.push(addWeeks(startDate, i));
          break;
        case 'biweekly':
          dates.push(addWeeks(startDate, i * 2));
          break;
        case 'monthly':
          dates.push(addMonths(startDate, i));
          break;
        default:
          break;
      }
    }
    return dates;
  };

  const onSubmit = (data) => {
    console.log('New Appointment Form Data:', data);

    const patient = MOCK_PATIENTS.find((p) => p.id === data.patientId);
    const doctor = DOCTORS.find((d) => d.id === data.doctorId);

    const createAppointment = (date, seriesId = null, seriesIndex = 0) => ({
      id: `apt-${Date.now()}-${seriesIndex}`,
      patientName: patient?.name || '',
      patientId: patient?.mrn || `MRN-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
      patientPhone: '-',
      patientAge: 0,
      patientGender: 'Not specified',
      doctorId: data.doctorId,
      doctorName: doctor?.name || '',
      department: doctor?.department || '',
      appointmentType: data.visitType || 'consultation',
      appointmentMode: data.appointmentMode,
      date: date,
      time: data.time,
      status: 'scheduled',
      notes: data.notes || '',
      createdAt: new Date(),
      isRecurring: data.recurrence !== 'none',
      recurrencePattern: data.recurrence,
      seriesId: seriesId,
      tags: [],
      categories: [],
    });

    if (data.recurrence !== 'none') {
      const seriesId = `series-${Date.now()}`;
      const dates = generateRecurringDates(data.date, data.recurrence, data.recurrenceCount);
      dates.forEach((date, index) => {
        onAddAppointment(createAppointment(date, seriesId, index));
      });
      toast({
        title: 'Recurring appointments scheduled',
        description: `${dates.length} appointments created for ${patient?.name}.`
      });
    } else {
      onAddAppointment(createAppointment(data.date));
      toast({ title: 'Appointment scheduled', description: `Appointment for ${patient?.name} has been scheduled.` });
    }

    form.reset();
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New Appointment
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-[550px] p-0 flex flex-col h-full">
        <SheetHeader className="p-6 pb-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <SheetTitle className="text-lg">New Appointment</SheetTitle>
              <p className="text-sm text-muted-foreground">Schedule a new appointment with our healthcare professionals</p>
            </div>
          </div>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, showValidationErrors)} className="flex flex-col flex-1 overflow-hidden">
            <ScrollArea className="flex-1 px-6">
              <div className="py-4 space-y-6">
                {/* People Section */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">People</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="doctorId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground">Select Doctor *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="Select a doctor" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {DOCTORS.map((doc) => (
                                <SelectItem key={doc.id} value={doc.id}>{doc.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="patientId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground">Select Patient *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="Select a patient" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {MOCK_PATIENTS.map((patient) => (
                                <SelectItem key={patient.id} value={patient.id}>{patient.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </section>

                {/* Schedule Section */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <CalendarIcon className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">Schedule</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground">Issue Date *</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button variant="outline" className="w-full h-10 justify-start text-left font-normal">
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {field.value ? format(field.value, 'dd MMM yyyy') : 'Select date'}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                initialFocus
                                className={cn("p-3 pointer-events-auto")}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="visitType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground">Visit Type *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {APPOINTMENT_TYPES.map((type) => (
                                <SelectItem key={type.id} value={type.id}>{type.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </section>

                {/* Preferred Slots Section */}
                <section>
                  <FormField
                    control={form.control}
                    name="preferredSlot"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-muted-foreground mb-3 block">Preferred Slots *</FormLabel>
                        <div className="grid grid-cols-4 gap-3">
                          {PREFERRED_SLOTS.map((slot) => {
                            const isSelected = field.value === slot.id;
                            const IconComponent = slot.icon;
                            return (
                              <button
                                key={slot.id}
                                type="button"
                                onClick={() => {
                                  field.onChange(slot.id);
                                  form.setValue('time', '');
                                }}
                                className={cn(
                                  "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                                  isSelected
                                    ? "border-primary bg-primary/10"
                                    : "border-border bg-secondary/30 hover:border-primary/50"
                                )}
                              >
                                <div className={cn(
                                  "w-10 h-10 rounded-lg flex items-center justify-center",
                                  isSelected ? "bg-primary/20" : "bg-secondary"
                                )}>
                                  <IconComponent className={cn("w-5 h-5", isSelected ? "text-primary" : "text-muted-foreground")} />
                                </div>
                                <span className={cn("text-sm font-medium", isSelected ? "text-primary" : "text-foreground")}>{slot.label}</span>
                                <span className="text-[10px] text-muted-foreground text-center leading-tight">{slot.time}</span>
                              </button>
                            );
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </section>

                {/* Time Slots Section */}
                <section>
                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-muted-foreground mb-1 block">Time *</FormLabel>
                        <p className="text-xs text-muted-foreground mb-3">
                          Showing 15-minute slots for {preferredSlot} ({timeSlots.length} slots)
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {timeSlots.map((slot) => {
                            const isSelected = field.value === slot;
                            return (
                              <button
                                key={slot}
                                type="button"
                                onClick={() => field.onChange(slot)}
                                className={cn(
                                  "px-3 py-1.5 rounded-md text-xs font-medium transition-all border",
                                  isSelected
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-secondary/50 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                                )}
                              >
                                {slot}
                              </button>
                            );
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </section>

                {/* Appointment Mode Section */}
                <section>
                  <FormField
                    control={form.control}
                    name="appointmentMode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-muted-foreground mb-3 block">Appointment Mode *</FormLabel>
                        <div className="grid grid-cols-4 gap-3">
                          {APPOINTMENT_MODES.map((mode) => {
                            const isSelected = field.value === mode.id;
                            const IconComponent = mode.icon;
                            return (
                              <button
                                key={mode.id}
                                type="button"
                                onClick={() => field.onChange(mode.id)}
                                className={cn(
                                  "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                                  isSelected
                                    ? "border-primary bg-primary/10"
                                    : "border-border bg-secondary/30 hover:border-primary/50"
                                )}
                              >
                                <div className={cn(
                                  "w-10 h-10 rounded-lg flex items-center justify-center",
                                  isSelected ? "bg-primary/20" : "bg-secondary"
                                )}>
                                  <IconComponent className={cn("w-5 h-5", isSelected ? "text-primary" : "text-muted-foreground")} />
                                </div>
                                <span className={cn("text-sm font-medium", isSelected ? "text-primary" : "text-foreground")}>{mode.label}</span>
                                <span className="text-[10px] text-muted-foreground">{mode.description}</span>
                              </button>
                            );
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </section>

                {/* Recurrence Section */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Repeat className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">Recurring Appointment</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="recurrence"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground">Repeat Pattern</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-10">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {RECURRENCE_PATTERNS.map((pattern) => (
                                <SelectItem key={pattern.id} value={pattern.id}>{pattern.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {recurrence !== 'none' && (
                      <FormField
                        control={form.control}
                        name="recurrenceCount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs text-muted-foreground">Number of Occurrences</FormLabel>
                            <Select onValueChange={(val) => field.onChange(parseInt(val))} value={String(field.value)}>
                              <FormControl>
                                <SelectTrigger className="h-10">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {[2, 3, 4, 5, 6, 8, 10, 12].map((count) => (
                                  <SelectItem key={count} value={String(count)}>{count} appointments</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </section>

                {/* Notes Section */}
                <section>
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-muted-foreground mb-2 block">Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Add any notes or special requirements..."
                            {...field}
                            rows={3}
                            className="resize-none"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </section>
              </div>
            </ScrollArea>

            <SheetFooter className="p-4 border-t border-border shrink-0">
              <div className="flex justify-end gap-3 w-full">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Close
                </Button>
                <Button type="submit" className="gap-2">
                  <Save className="w-4 h-4" />
                  Save Appointment
                </Button>
              </div>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
