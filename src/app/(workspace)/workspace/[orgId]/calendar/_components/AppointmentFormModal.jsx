import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Clock, User, Mail, Phone, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { doctors } from '../_data/mockData';



const appointmentTypes = ['Consultation', 'Follow-up', 'Check-up', 'New Patient', 'Emergency', 'Procedure'];
const timeSlots = Array.from({ length: 20 }, (_, i) => {
    const hour = Math.floor(i / 2) + 8;
    const minute = i % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minute}`;
});

export function AppointmentFormModal({ isOpen, onClose, onSave, appointment }) {
    const [date, setDate] = useState(appointment?.date || new Date());
    const [startTime, setStartTime] = useState(appointment?.startTime || '09:00');
    const [endTime, setEndTime] = useState(appointment?.endTime || '09:30');
    const [doctorId, setDoctorId] = useState(appointment?.doctor.id || doctors[0].id);
    const [appointmentType, setAppointmentType] = useState(appointment?.type || 'Consultation');
    const [status, setStatus] = useState(appointment?.status || 'pending');
    const [notes, setNotes] = useState(appointment?.notes || '');

    const [patientName, setPatientName] = useState(appointment?.patient.name || '');
    const [patientAge, setPatientAge] = useState(appointment?.patient.age.toString() || '');
    const [patientPhone, setPatientPhone] = useState(appointment?.patient.phone || '');
    const [patientEmail, setPatientEmail] = useState(appointment?.patient.email || '');

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!date || !patientName.trim()) return;

        const selectedDoctor = doctors.find(d => d.id === doctorId) || doctors[0];

        const patient = {
            id: appointment?.patient.id || `p${Date.now()}`,
            name: patientName.trim(),
            age: parseInt(patientAge) || 0,
            phone: patientPhone.trim(),
            email: patientEmail.trim(),
        };

        onSave({
            patient,
            doctor: selectedDoctor,
            date,
            startTime,
            endTime,
            type: appointmentType,
            status,
            notes: notes.trim() || undefined,
        });

        onClose();
    };

    const isEditing = !!appointment;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">
                        {isEditing ? 'Edit Appointment' : 'New Appointment'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Patient Information */}
                    <div className="space-y-4">
                        <h3 className="font-medium text-foreground flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Patient Information
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="patientName">Full Name *</Label>
                                <Input
                                    id="patientName"
                                    value={patientName}
                                    onChange={(e) => setPatientName(e.target.value)}
                                    placeholder="Enter patient name"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="patientAge">Age</Label>
                                <Input
                                    id="patientAge"
                                    type="number"
                                    value={patientAge}
                                    onChange={(e) => setPatientAge(e.target.value)}
                                    placeholder="Enter age"
                                    min={0}
                                    max={150}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="patientPhone" className="flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    Phone
                                </Label>
                                <Input
                                    id="patientPhone"
                                    type="tel"
                                    value={patientPhone}
                                    onChange={(e) => setPatientPhone(e.target.value)}
                                    placeholder="555-0100"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="patientEmail" className="flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    Email
                                </Label>
                                <Input
                                    id="patientEmail"
                                    type="email"
                                    value={patientEmail}
                                    onChange={(e) => setPatientEmail(e.target.value)}
                                    placeholder="patient@email.com"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Appointment Details */}
                    <div className="space-y-4">
                        <h3 className="font-medium text-foreground flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4" />
                            Appointment Details
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Date *</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !date && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {date ? format(date, "PPP") : "Select date"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={date}
                                            onSelect={setDate}
                                            initialFocus
                                            className="pointer-events-auto"
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="space-y-2">
                                <Label>Doctor *</Label>
                                <Select value={doctorId} onValueChange={setDoctorId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select doctor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {doctors.map(doctor => (
                                            <SelectItem key={doctor.id} value={doctor.id}>
                                                {doctor.name} - {doctor.specialty}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    Start Time
                                </Label>
                                <Select value={startTime} onValueChange={setStartTime}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {timeSlots.map(time => (
                                            <SelectItem key={time} value={time}>{time}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    End Time
                                </Label>
                                <Select value={endTime} onValueChange={setEndTime}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {timeSlots.map(time => (
                                            <SelectItem key={time} value={time}>{time}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Type</Label>
                                <Select value={appointmentType} onValueChange={setAppointmentType}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {appointmentTypes.map(type => (
                                            <SelectItem key={type} value={type}>{type}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select value={status} onValueChange={(v) => setStatus(v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="confirmed">Confirmed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes" className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            Notes
                        </Label>
                        <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add any additional notes..."
                            rows={3}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            {isEditing ? 'Save Changes' : 'Create Appointment'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
