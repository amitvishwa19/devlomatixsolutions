import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BedList } from './BedList';
import { BedDialog } from './BedDialog';
import { Building2, User as UserIcon, Plus } from 'lucide-react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';

const roomTypeLabels = {
    general: 'General Ward',
    icu: 'ICU',
    private: 'Private',
    'semi-private': 'Semi-Private',
    emergency: 'Emergency',
    maternity: 'Maternity',
    pediatric: 'Pediatric',
};

export function RoomDetailSheet({ room, open, onOpenChange, patients, onUpdateBeds }) {
    const [bedDialogOpen, setBedDialogOpen] = useState(false);
    const [editingBed, setEditingBed] = useState(null);

    if (!room) return null;

    const handleEditBed = (bed) => {
        setEditingBed(bed);
        setBedDialogOpen(true);
    };

    const handleAddBed = () => {
        setEditingBed(null);
        setBedDialogOpen(true);
    };

    const handleSaveBed = (bedData) => {
        let updatedBeds;

        if (editingBed) {
            updatedBeds = room.beds.map(b =>
                b.id === editingBed.id ? { ...b, ...bedData } : b
            );
        } else {
            const newBed = {
                id: `b${Date.now()}`,
                bedNumber: bedData.bedNumber || '',
                status: bedData.status || 'available',
                roomId: room.id,
                patientId: bedData.patientId,
                patient: bedData.patient,
                admissionDate: bedData.admissionDate,
                notes: bedData.notes,
            };
            updatedBeds = [...room.beds, newBed];
        }

        onUpdateBeds(room.id, updatedBeds);
        setBedDialogOpen(false);
    };

    const handleChangeBedStatus = (bed, status) => {
        const updatedBeds = room.beds.map(b =>
            b.id === bed.id
                ? {
                    ...b,
                    status,
                    patientId: status !== 'occupied' ? undefined : b.patientId,
                    patient: status !== 'occupied' ? undefined : b.patient,
                    admissionDate: status !== 'occupied' ? undefined : b.admissionDate,
                }
                : b
        );
        onUpdateBeds(room.id, updatedBeds);
    };

    return (
        <>
            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetContent className="sm:max-w-[540px] overflow-y-auto">
                    <SheetHeader className="space-y-4 pb-6 border-b border-border">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-primary/10">
                                <Building2 className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <SheetTitle className="font-display text-xl">
                                    Room {room.roomNumber}
                                </SheetTitle>
                                <SheetDescription>
                                    Floor {room.floor} • {roomTypeLabels[room.roomType]}
                                </SheetDescription>
                            </div>
                        </div>

                        {room.doctor && (
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                                <UserIcon className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm font-medium">{room.doctor.name}</span>
                                <Badge variant="secondary">{room.doctor.specialization}</Badge>
                            </div>
                        )}

                        {room.description && (
                            <p className="text-sm text-muted-foreground">{room.description}</p>
                        )}
                    </SheetHeader>

                    <div className="py-6">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-display font-semibold">
                                Beds ({room.beds.length} / {room.capacity})
                            </h4>
                            <Button
                                size="sm"
                                onClick={handleAddBed}
                                disabled={room.beds.length >= room.capacity}
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Add Bed
                            </Button>
                        </div>

                        <BedList
                            beds={room.beds}
                            onEditBed={handleEditBed}
                            onChangeBedStatus={handleChangeBedStatus}
                        />
                    </div>
                </SheetContent>
            </Sheet>

            <BedDialog
                open={bedDialogOpen}
                onOpenChange={setBedDialogOpen}
                bed={editingBed}
                roomId={room.id}
                patients={patients}
                onSave={handleSaveBed}
            />
        </>
    );
}
