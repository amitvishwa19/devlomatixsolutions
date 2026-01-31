import React, { useState } from 'react';
import { Users, Clock, UserPlus, ArrowUpCircle, Trash2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { format, formatDistanceToNow } from 'date-fns';
import { DOCTORS, DEPARTMENTS } from './types';
import { useToast } from '@/hooks/use-toast';
import { getInitials } from './utils';

const MOCK_PATIENTS = [
  { id: 'p1', name: 'Rahul Sharma', mrn: 'MRN-2024-0001' },
  { id: 'p2', name: 'Sneha Gupta', mrn: 'MRN-2024-0002' },
  { id: 'p3', name: 'Amit Patel', mrn: 'MRN-2024-0003' },
  { id: 'p4', name: 'Priya Verma', mrn: 'MRN-2024-0004' },
  { id: 'p5', name: 'Vikram Mehta', mrn: 'MRN-2024-0005' },
];

export function WaitlistSheet({ waitlist, onUpdateWaitlist, onScheduleFromWaitlist }) {
  const [open, setOpen] = useState(false);
  const [localWaitlist, setLocalWaitlist] = useState(waitlist || []);
  const [newEntry, setNewEntry] = useState({ patientId: '', doctorId: '', priority: 'normal' });
  const { toast } = useToast();

  const handleAddToWaitlist = () => {
    if (!newEntry.patientId || !newEntry.doctorId) {
      toast({ title: 'Please select patient and doctor', variant: 'destructive' });
      return;
    }

    const patient = MOCK_PATIENTS.find((p) => p.id === newEntry.patientId);
    const doctor = DOCTORS.find((d) => d.id === newEntry.doctorId);

    const entry = {
      id: `wl-${Date.now()}`,
      patientId: patient.id,
      patientName: patient.name,
      patientMrn: patient.mrn,
      doctorId: doctor.id,
      doctorName: doctor.name,
      department: doctor.department,
      priority: newEntry.priority,
      addedAt: new Date(),
      status: 'waiting',
    };

    const updated = [...localWaitlist, entry];
    setLocalWaitlist(updated);
    onUpdateWaitlist?.(updated);
    setNewEntry({ patientId: '', doctorId: '', priority: 'normal' });
    toast({ title: 'Added to waitlist', description: `${patient.name} has been added to the waitlist.` });
  };

  const handleRemoveFromWaitlist = (id) => {
    const updated = localWaitlist.filter((entry) => entry.id !== id);
    setLocalWaitlist(updated);
    onUpdateWaitlist?.(updated);
    toast({ title: 'Removed from waitlist' });
  };

  const handleSchedule = (entry) => {
    onScheduleFromWaitlist?.(entry);
    handleRemoveFromWaitlist(entry.id);
    setOpen(false);
  };

  const handleChangePriority = (id, priority) => {
    const updated = localWaitlist.map((entry) =>
      entry.id === id ? { ...entry, priority } : entry
    );
    setLocalWaitlist(updated);
    onUpdateWaitlist?.(updated);
  };

  // Sort by priority (urgent first) then by addedAt
  const sortedWaitlist = [...localWaitlist].sort((a, b) => {
    const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return new Date(a.addedAt) - new Date(b.addedAt);
  });

  const priorityColors = {
    urgent: 'bg-destructive text-destructive-foreground',
    high: 'bg-amber-500 text-white',
    normal: 'bg-blue-500 text-white',
    low: 'bg-muted text-muted-foreground',
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Users className="w-4 h-4" />
          Waitlist
          {localWaitlist.length > 0 && (
            <Badge variant="secondary" className="ml-1">{localWaitlist.length}</Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-[550px] p-0 flex flex-col h-full">
        <SheetHeader className="p-6 pb-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <SheetTitle className="text-lg">Appointment Waitlist</SheetTitle>
              <p className="text-sm text-muted-foreground">Manage patients waiting for available slots</p>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="py-4 space-y-6">
            {/* Add to waitlist */}
            <div className="p-4 bg-secondary/30 rounded-lg border border-border space-y-4">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Add to Waitlist
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Patient</Label>
                  <Select value={newEntry.patientId} onValueChange={(val) => setNewEntry({ ...newEntry, patientId: val })}>
                    <SelectTrigger className="h-9 mt-1">
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {MOCK_PATIENTS.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Preferred Doctor</Label>
                  <Select value={newEntry.doctorId} onValueChange={(val) => setNewEntry({ ...newEntry, doctorId: val })}>
                    <SelectTrigger className="h-9 mt-1">
                      <SelectValue placeholder="Select doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {DOCTORS.map((d) => (
                        <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Priority</Label>
                <Select value={newEntry.priority} onValueChange={(val) => setNewEntry({ ...newEntry, priority: val })}>
                  <SelectTrigger className="h-9 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddToWaitlist} className="w-full gap-2">
                <UserPlus className="w-4 h-4" />
                Add to Waitlist
              </Button>
            </div>

            {/* Waitlist entries */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">
                Waiting ({sortedWaitlist.length})
              </h4>
              {sortedWaitlist.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No patients in waitlist</p>
                </div>
              ) : (
                sortedWaitlist.map((entry, index) => {
                  const dept = DEPARTMENTS.find((d) => d.id === entry.department);
                  return (
                    <div
                      key={entry.id}
                      className="p-4 bg-card border border-border rounded-lg space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium text-sm">
                            {getInitials(entry.patientName)}
                          </div>
                          <div>
                            <h5 className="font-medium text-sm">{entry.patientName}</h5>
                            <p className="text-xs text-muted-foreground">{entry.patientMrn}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge className={priorityColors[entry.priority]}>
                            {entry.priority}
                          </Badge>
                          <span className="text-xs text-muted-foreground ml-2">#{index + 1}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Dr. {entry.doctorName}</span>
                        <span>•</span>
                        <span>{dept?.label}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(entry.addedAt), { addSuffix: true })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-border">
                        <Select
                          value={entry.priority}
                          onValueChange={(val) => handleChangePriority(entry.id, val)}
                        >
                          <SelectTrigger className="h-8 w-28 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="urgent">Urgent</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex-1" />
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs gap-1"
                          onClick={() => handleSchedule(entry)}
                        >
                          <CheckCircle className="w-3 h-3" />
                          Schedule
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleRemoveFromWaitlist(entry.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
