import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, } from '@/components/ui/dialog';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger, } from "@/components/ui/sheet"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, User, Stethoscope, Pill } from 'lucide-react';
import { toast } from '@/hooks/useToast';
import { getDoctors, getPatients } from '../page';
import { ScrollArea } from '@/components/ui/scroll-area';

const emptyMedication = {
    name: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: '',
};

export function AddPrescriptionDialog({ open, onOpenChange, onAdd, }) {
    const patients = getPatients();
    const doctors = getDoctors();

    const [selectedPatientId, setSelectedPatientId] = useState('');
    const [selectedDoctorId, setSelectedDoctorId] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const [notes, setNotes] = useState('');
    const [medications, setMedications] = useState([{ ...emptyMedication }]);

    const handleAddMedication = () => {
        setMedications([...medications, { ...emptyMedication }]);
    };

    const handleRemoveMedication = (index) => {
        if (medications.length > 1) {
            setMedications(medications.filter((_, i) => i !== index));
        }
    };

    const handleMedicationChange = (
        index,
        field,
        value
    ) => {
        const updated = medications.map((med, i) =>
            i === index ? { ...med, [field]: value } : med
        );
        setMedications(updated);
    };

    const handleSubmit = () => {
        const patient = patients.find((p) => p.id === selectedPatientId);
        const doctor = doctors.find((d) => d.id === selectedDoctorId);

        if (!patient || !doctor || !diagnosis.trim()) {
            toast({
                title: 'Validation Error',
                description: 'Please fill in all required fields',
                variant: 'destructive',
            });
            return;
        }

        const validMedications = medications.filter(
            (m) => m.name.trim() && m.dosage.trim() && m.frequency.trim() && m.duration.trim()
        );

        if (validMedications.length === 0) {
            toast({
                title: 'Validation Error',
                description: 'Please add at least one medication with all required fields',
                variant: 'destructive',
            });
            return;
        }

        onAdd({
            patient,
            doctor,
            diagnosis: diagnosis.trim(),
            notes: notes.trim() || undefined,
            medications: validMedications.map((m, i) => ({ ...m, id: `new-${i}` })),
            status: 'pending',
        });

        // Reset form
        setSelectedPatientId('');
        setSelectedDoctorId('');
        setDiagnosis('');
        setNotes('');
        setMedications([{ ...emptyMedication }]);
        onOpenChange(false);
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="dark:bg-darkPrimaryBackground min-w-[620px]">

                <SheetHeader className={'px-4 self-center'}>
                    <SheetTitle className="text-xl font-display">Create New Prescription</SheetTitle>
                </SheetHeader>

                <ScrollArea className=" h-[92vh] p-4">
                    <div className='flex flex-col gap-4'>
                        <div className='flex flex-col gap-4'>

                            {/* Patient Selection */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-primary" />
                                    <Label className="text-sm font-semibold">Patient *</Label>
                                </div>
                                <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a patient" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {patients.map((patient) => (
                                            <SelectItem key={patient.id} value={patient.id}>
                                                {patient.name} ({patient.age}y, {patient.gender})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Doctor Selection */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Stethoscope className="h-4 w-4 text-primary" />
                                    <Label className="text-sm font-semibold">Prescribing Doctor *</Label>
                                </div>
                                <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a doctor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {doctors.map((doctor) => (
                                            <SelectItem key={doctor.id} value={doctor.id}>
                                                {doctor.name} - {doctor.specialization}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Diagnosis */}
                            <div className="space-y-3">
                                <Label className="text-sm font-semibold">Diagnosis *</Label>
                                <Textarea
                                    placeholder="Enter the diagnosis..."
                                    rows='4'
                                    value={diagnosis}
                                    onChange={(e) => setDiagnosis(e.target.value)}
                                    className="min-h-[80px]"
                                />
                            </div>

                            <Separator />

                            {/* Medications */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Pill className="h-4 w-4 text-accent" />
                                        <Label className="text-sm font-semibold">Medications *</Label>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleAddMedication}
                                        className="gap-1"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add Medication
                                    </Button>
                                </div>

                                {medications?.map((medication, index) => (
                                    <div
                                        key={index}
                                        className="bg-muted/50 rounded-lg p-4 space-y-4 relative"
                                    >
                                        {medications.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-destructive"
                                                onClick={() => handleRemoveMedication(index)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs">Medication Name *</Label>
                                                <Input
                                                    placeholder="e.g., Amoxicillin"
                                                    value={medication.name}
                                                    onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs">Dosage *</Label>
                                                <Input
                                                    placeholder="e.g., 500mg"
                                                    value={medication.dosage}
                                                    onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs">Frequency *</Label>
                                                <Input
                                                    placeholder="e.g., Three times daily"
                                                    value={medication.frequency}
                                                    onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs">Duration *</Label>
                                                <Input
                                                    placeholder="e.g., 7 days"
                                                    value={medication.duration}
                                                    onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs">Special Instructions</Label>
                                            <Input
                                                placeholder="e.g., Take with food"
                                                value={medication.instructions}
                                                onChange={(e) => handleMedicationChange(index, 'instructions', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Separator />

                            {/* Notes */}
                            <div className="space-y-3">
                                <Label className="text-sm font-semibold">Additional Notes</Label>
                                <Textarea
                                    placeholder="Any additional notes or instructions..."
                                    rows='4'
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="min-h-[60px]"
                                />
                            </div>

                        </div>
                        <div className='flex flex-row justify-end mt-4'>
                            <Button variant="ghost" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button variant={'save'} onClick={handleSubmit} className="gap-2">
                                <Plus className="h-4 w-4" />
                                Create Prescription
                            </Button>
                        </div>
                    </div>
                </ScrollArea>

            </SheetContent>
        </Sheet>
    );
}
