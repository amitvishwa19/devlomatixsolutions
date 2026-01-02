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

const roomTypes = [
    { value: 'general', label: 'General Ward' },
    { value: 'icu', label: 'ICU' },
    { value: 'private', label: 'Private' },
    { value: 'semi-private', label: 'Semi-Private' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'maternity', label: 'Maternity' },
    { value: 'pediatric', label: 'Pediatric' },
];

export function RoomDialog({ open, onOpenChange, room, doctors, onSave }) {
    const [formData, setFormData] = useState({
        roomNumber: '',
        floor: 1,
        roomType: 'general',
        capacity: 1,
        doctorId: '',
        description: '',
    });

    useEffect(() => {
        if (room) {
            setFormData({
                roomNumber: room.roomNumber,
                floor: room.floor,
                roomType: room.roomType,
                capacity: room.capacity,
                doctorId: room.doctorId || '',
                description: room.description || '',
            });
        } else {
            setFormData({
                roomNumber: '',
                floor: 1,
                roomType: 'general',
                capacity: 1,
                doctorId: '',
                description: '',
            });
        }
    }, [room, open]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...formData,
            id: room?.id,
            beds: room?.beds || [],
        });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="font-display">
                        {room ? 'Edit Room' : 'Add New Room'}
                    </DialogTitle>
                    <DialogDescription>
                        {room ? 'Update the room details below.' : 'Fill in the details to create a new room.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="roomNumber">Room Number</Label>
                            <Input
                                id="roomNumber"
                                value={formData.roomNumber}
                                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                                placeholder="e.g., 101"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="floor">Floor</Label>
                            <Input
                                id="floor"
                                type="number"
                                min={0}
                                value={formData.floor}
                                onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) })}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="roomType">Room Type</Label>
                            <Select
                                value={formData.roomType}
                                onValueChange={(value) => setFormData({ ...formData, roomType: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roomTypes.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="capacity">Capacity</Label>
                            <Input
                                id="capacity"
                                type="number"
                                min={1}
                                max={20}
                                value={formData.capacity}
                                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="doctor">Assigned Doctor</Label>
                        <Select
                            value={formData.doctorId}
                            onValueChange={(value) => setFormData({ ...formData, doctorId: value })}
                        >
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

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Room description or notes..."
                            rows={3}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            {room ? 'Save Changes' : 'Create Room'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
