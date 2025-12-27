import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Plus, Search } from 'lucide-react'
import React, { useMemo, useState } from 'react'
import { useHospitalData } from '../../_hooks/useHospitalData';
import { RoomCard } from '../rooms/RoomCard';
import { CreateRoomDialog } from '../rooms/CreateRoomDialog';
import { RoomBedsDialog } from '../rooms/RoomBedsDialog';
import { AssignPatientDialog } from '../beds/AssignPatientDialog';


const roomTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'general', label: 'General' },
    { value: 'icu', label: 'ICU' },
    { value: 'private', label: 'Private' },
    { value: 'semi-private', label: 'Semi-Private' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'pediatric', label: 'Pediatric' },
    { value: 'maternity', label: 'Maternity' },
];


export default function Rooms() {
    const [bedStatusFilter, setBedStatusFilter] = useState('all');
    const [bedSearchQuery, setBedSearchQuery] = useState('');

    const [roomSearchQuery, setRoomSearchQuery] = useState('');
    const [roomTypeFilter, setRoomTypeFilter] = useState('all');
    const [isCreateRoomDialogOpen, setIsCreateRoomDialogOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [isRoomDialogOpen, setIsRoomDialogOpen] = useState(false);
    const [selectedBed, setSelectedBed] = useState(null);
    const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

    const { rooms, allBeds, stats, lastUpdate, assignPatientToBed, dischargeBed, addRoom, addBed } = useHospitalData()

    const filteredRooms = useMemo(() => {
        return rooms.filter((room) => {
            const matchesType = roomTypeFilter === 'all' || room.type === roomTypeFilter;
            const matchesSearch =
                room.number.toLowerCase().includes(roomSearchQuery.toLowerCase()) ||
                room.department.toLowerCase().includes(roomSearchQuery.toLowerCase());

            return matchesType && matchesSearch;
        });
    }, [rooms, roomTypeFilter, roomSearchQuery]);

    const handleViewBeds = (room) => {
        setSelectedRoom(room);
        setIsRoomDialogOpen(true);
    };

    const handleAssignFromRoom = (bed) => {
        setSelectedBed(bed);
        setIsRoomDialogOpen(false);
        setIsAssignDialogOpen(true);
    };

    const handleDischarge = (bedId) => {
        dischargeBed(bedId);
        toast.success('Patient Discharged,The bed is now available for new patients.');
    };

    const handleAssignPatient = (bedId, patient) => {
        assignPatientToBed(bedId, patient);
        toast.success(`Patient Assigned, ${patient.name} has been assigned to the bed successfully.`);
    };




    const handleCreateRoom = (data) => {
        addRoom(data);
        toast.success(`Room Created, Room ${data.number} has been created with ${data.capacity} beds.`);
    };

    return (
        <div className='flex flex-col gap-4 p-2'>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search rooms or departments..."
                        value={roomSearchQuery}
                        onChange={(e) => setRoomSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Button onClick={() => setIsCreateRoomDialogOpen(true)} variant='save' size=''>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Room
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
                {roomTypes.map((type) => (
                    <Button
                        key={type.value}
                        variant="outline"
                        size="sm"
                        onClick={() => setRoomTypeFilter(type.value)}
                        className={cn(
                            "rounded-md border transition-all",
                            roomTypeFilter === type.value
                                ? "gradient-primary "
                                : "bg-muted/50 text-muted-foreground hover:bg-muted"
                        )}
                    >
                        {type.label}
                    </Button>
                ))}
            </div>

            {/* Results count */}
            <p className="text-xs text-muted-foreground">
                Showing {filteredRooms.length} of {rooms.length} rooms
            </p>

            {/* Rooms Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredRooms.map((room) => (
                    <RoomCard key={room.id} room={room} onViewBeds={handleViewBeds} />
                ))}
            </div>

            {filteredRooms.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">No rooms found matching your criteria.</p>
                </div>
            )}

            <AssignPatientDialog
                bed={selectedBed}
                open={isAssignDialogOpen}
                onOpenChange={setIsAssignDialogOpen}
                onAssign={handleAssignPatient}
            />


            <CreateRoomDialog
                open={isCreateRoomDialogOpen}
                onOpenChange={setIsCreateRoomDialogOpen}
                onCreateRoom={handleCreateRoom}
            />

            <RoomBedsDialog
                room={selectedRoom}
                open={isRoomDialogOpen}
                onOpenChange={setIsRoomDialogOpen}
                onAssign={handleAssignFromRoom}
                onDischarge={handleDischarge}
            />

        </div>
    )
}
