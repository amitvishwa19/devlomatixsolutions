import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Search, User } from 'lucide-react';
import { format } from 'date-fns';
import { ADMISSION_TYPES } from '../utils/types';
import { getRoomTypeById, formatCurrency } from '../utils/utils';
import { mockPatients } from '../utils/mockData';

export function AdmitPatientDialog({ open, onOpenChange, bed, room, onAdmit }) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedPatient, setSelectedPatient] = React.useState(null);
  const [admissionType, setAdmissionType] = React.useState('elective');
  const [diagnosis, setDiagnosis] = React.useState('');
  const [expectedDischarge, setExpectedDischarge] = React.useState(null);
  const [attendingDoctor, setAttendingDoctor] = React.useState('');
  const [notes, setNotes] = React.useState('');

  const filteredPatients = React.useMemo(() => {
    if (!searchQuery) return mockPatients.slice(0, 5);
    const query = searchQuery.toLowerCase();
    return mockPatients.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.mrn.toLowerCase().includes(query) ||
      p.phone.includes(query)
    );
  }, [searchQuery]);

  const handleSubmit = () => {
    if (!selectedPatient) return;

    onAdmit?.({
      bed,
      room,
      patient: selectedPatient,
      admission: {
        type: admissionType,
        diagnosis,
        admittedAt: new Date(),
        admittedBy: attendingDoctor,
        notes,
      },
      expectedDischarge,
    });

    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setSearchQuery('');
    setSelectedPatient(null);
    setAdmissionType('elective');
    setDiagnosis('');
    setExpectedDischarge(null);
    setAttendingDoctor('');
    setNotes('');
  };

  if (!bed || !room) return null;

  const roomType = getRoomTypeById(room.type);

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) resetForm();
      onOpenChange(open);
    }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Admit Patient
          </DialogTitle>
          <div className="flex items-center gap-2 mt-2">
            <Badge className={roomType.color}>{bed.bedNumber}</Badge>
            <span className="text-sm text-muted-foreground">{roomType.name}</span>
            <span className="text-sm text-muted-foreground">•</span>
            <span className="text-sm font-medium">{formatCurrency(room.dailyRate)}/day</span>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Patient Search */}
          <div className="space-y-2">
            <Label>Search Patient</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, MRN, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            {/* Patient Results */}
            <div className="max-h-40 overflow-y-auto border rounded-lg divide-y">
              {filteredPatients.map(patient => (
                <div
                  key={patient.id}
                  className={`p-3 cursor-pointer transition-colors ${
                    selectedPatient?.id === patient.id
                      ? 'bg-primary/10 border-primary'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedPatient(patient)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{patient.name}</p>
                      <p className="text-xs text-muted-foreground">{patient.mrn}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {patient.gender === 'M' ? 'Male' : 'Female'}, {patient.age}y
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedPatient && (
            <>
              {/* Admission Type */}
              <div className="space-y-2">
                <Label>Admission Type</Label>
                <Select value={admissionType} onValueChange={setAdmissionType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ADMISSION_TYPES.map(type => (
                      <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Diagnosis */}
              <div className="space-y-2">
                <Label>Diagnosis / Reason for Admission</Label>
                <Input
                  placeholder="Enter diagnosis..."
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                />
              </div>

              {/* Attending Doctor */}
              <div className="space-y-2">
                <Label>Attending Doctor</Label>
                <Input
                  placeholder="Dr. ..."
                  value={attendingDoctor}
                  onChange={(e) => setAttendingDoctor(e.target.value)}
                />
              </div>

              {/* Expected Discharge */}
              <div className="space-y-2">
                <Label>Expected Discharge Date (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {expectedDischarge ? format(expectedDischarge, 'PPP') : 'Select date...'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={expectedDischarge}
                      onSelect={setExpectedDischarge}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label>Additional Notes</Label>
                <Textarea
                  placeholder="Any special requirements or notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!selectedPatient}>
            Admit Patient
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
