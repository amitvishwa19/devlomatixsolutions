import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const bedStatuses = [
    { value: 'available', label: 'Available' },
    { value: 'occupied', label: 'Occupied' },
    { value: 'reserved', label: 'Reserved' },
    { value: 'maintenance', label: 'Maintenance' },
];

export function BedDialog({ open, onOpenChange, bed, roomId, patients, onSave }) {
    const [formData, setFormData] = useState({
        bedNumber: '',
        status: 'available',
        patientId: '',
        admissionDate: '',
        notes: '',
    });

    useEffect(() => {
        if (bed) {
            setFormData({
                bedNumber: bed.bedNumber,
                status: bed.status,
                patientId: bed.patientId || '',
                admissionDate: bed.admissionDate || '',
                notes: bed.notes || '',
            });
        } else {
            setFormData({
                bedNumber: '',
                status: 'available',
                patientId: '',
                admissionDate: '',
                notes: '',
            });
        }
    }, [bed, open]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const patient = patients.find(p => p.id === formData.patientId);
        onSave({
            ...formData,
            id: bed?.id || `b${Date.now()}`,
            roomId,
            patient,
        });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle className="font-display">
                        {bed ? 'Edit Bed' : 'Add New Bed'}
                    </DialogTitle>
                    <DialogDescription>
                        {bed ? 'Update the bed details below.' : 'Fill in the details to add a new bed.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="bedNumber">Bed Number</Label>
                            <Input
                                id="bedNumber"
                                value={formData.bedNumber}
                                onChange={(e) => setFormData({ ...formData, bedNumber: e.target.value })}
                                placeholder="e.g., A1"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => setFormData({ ...formData, status: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {bedStatuses.map((status) => (
                                        <SelectItem key={status.value} value={status.value}>
                                            {status.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {formData.status === 'occupied' && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="patient">Patient</Label>
                                <Select
                                    value={formData.patientId}
                                    onValueChange={(value) => setFormData({ ...formData, patientId: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a patient" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {patients.map((patient) => (
                                            <SelectItem key={patient.id} value={patient.id}>
                                                {patient.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="admissionDate">Admission Date</Label>
                                <Input
                                    id="admissionDate"
                                    type="date"
                                    value={formData.admissionDate}
                                    onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                                />
                            </div>
                        </>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Additional notes..."
                            rows={2}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            {bed ? 'Save Changes' : 'Add Bed'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
