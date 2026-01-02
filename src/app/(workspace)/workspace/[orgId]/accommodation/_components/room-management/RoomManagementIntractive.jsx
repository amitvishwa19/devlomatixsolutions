import { useState, useMemo } from 'react';
import { mockRooms, mockDoctors, mockPatients, calculateDashboardStats, groupRoomsByFloor } from '@/data/mockData';
import { Header } from '@/components/hospital/Header';
import { StatCard } from '@/components/hospital/StatCard';
import { RoomDialog } from '@/components/hospital/RoomDialog';
import { RoomDetailSheet } from '@/components/hospital/RoomDetailSheet';
import { BedStatusLegend } from '@/components/hospital/BedStatusLegend';
import { FloorSection } from '@/components/hospital/FloorSection';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Building2,
    Bed as BedIcon,
    CheckCircle,
    Users,
    Plus
} from 'lucide-react';
import { toast } from 'sonner';

const RoomManagementIntractive = () => {
    const [rooms, setRooms] = useState(mockRooms);
    const [roomDialogOpen, setRoomDialogOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);
    const [viewingRoom, setViewingRoom] = useState(null);
    const [deleteRoom, setDeleteRoom] = useState(null);

    const stats = calculateDashboardStats(rooms);
    const floorMap = useMemo(() => groupRoomsByFloor(rooms), [rooms]);
    const sortedFloors = useMemo(() => Array.from(floorMap.keys()).sort((a, b) => a - b), [floorMap]);

    const handleAddRoom = () => {
        setEditingRoom(null);
        setRoomDialogOpen(true);
    };

    const handleViewRoom = (room) => {
        setViewingRoom(room);
    };

    const confirmDeleteRoom = () => {
        if (deleteRoom) {
            setRooms(rooms.filter(r => r.id !== deleteRoom.id));
            toast.success(`Room ${deleteRoom.roomNumber} deleted successfully`);
            setDeleteRoom(null);
        }
    };

    const handleSaveRoom = (roomData) => {
        if (editingRoom) {
            const doctor = mockDoctors.find(d => d.id === roomData.doctorId);
            setRooms(rooms.map(r =>
                r.id === editingRoom.id
                    ? { ...r, ...roomData, doctor }
                    : r
            ));
            toast.success(`Room ${roomData.roomNumber} updated successfully`);
        } else {
            const doctor = mockDoctors.find(d => d.id === roomData.doctorId);
            const newRoom = {
                id: `r${Date.now()}`,
                roomNumber: roomData.roomNumber || '',
                floor: roomData.floor || 1,
                roomType: roomData.roomType || 'general',
                capacity: roomData.capacity || 1,
                beds: [],
                doctorId: roomData.doctorId,
                doctor,
                description: roomData.description,
            };
            setRooms([...rooms, newRoom]);
            toast.success(`Room ${newRoom.roomNumber} created successfully`);
        }
    };

    const handleUpdateBeds = (roomId, beds) => {
        setRooms(rooms.map(r =>
            r.id === roomId ? { ...r, beds } : r
        ));
        setViewingRoom(prev => prev && prev.id === roomId ? { ...prev, beds } : prev);
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container mx-auto px-6 py-8">
                {/* Dashboard Stats */}
                <section className="mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="sr-only">Dashboard Overview</h2>
                        <Button onClick={handleAddRoom} className="ml-auto">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Room
                        </Button>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <StatCard
                            title="Total Rooms"
                            value={stats.totalRooms}
                            icon={Building2}
                            variant="default"
                        />
                        <StatCard
                            title="Total Beds"
                            value={stats.totalBeds}
                            subtitle={`Across ${stats.totalRooms} rooms`}
                            icon={BedIcon}
                            variant="default"
                        />
                        <StatCard
                            title="Available Beds"
                            value={stats.availableBeds}
                            subtitle="↑ 5% from yesterday"
                            icon={CheckCircle}
                            variant="default"
                        />
                        <StatCard
                            title="Occupied Beds"
                            value={stats.occupiedBeds}
                            subtitle={`${stats.occupancyRate}% occupancy rate`}
                            icon={Users}
                            variant="default"
                        />
                    </div>

                    {/* Legend */}
                    <BedStatusLegend
                        stats={{
                            available: stats.availableBeds,
                            occupied: stats.occupiedBeds,
                            reserved: stats.reservedBeds,
                            maintenance: stats.maintenanceBeds,
                        }}
                    />
                </section>

                {/* Floor Sections */}
                <section className="mt-8">
                    {sortedFloors.map((floor) => (
                        <FloorSection
                            key={floor}
                            floor={floor}
                            rooms={floorMap.get(floor) || []}
                            onRoomClick={handleViewRoom}
                        />
                    ))}
                </section>
            </main>

            {/* Dialogs */}
            <RoomDialog
                open={roomDialogOpen}
                onOpenChange={setRoomDialogOpen}
                room={editingRoom}
                doctors={mockDoctors}
                onSave={handleSaveRoom}
            />

            <RoomDetailSheet
                room={viewingRoom}
                open={!!viewingRoom}
                onOpenChange={(open) => !open && setViewingRoom(null)}
                patients={mockPatients}
                onUpdateBeds={handleUpdateBeds}
            />

            <AlertDialog open={!!deleteRoom} onOpenChange={(open) => !open && setDeleteRoom(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Room</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete Room {deleteRoom?.roomNumber}? This action cannot be undone and will also remove all beds in this room.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDeleteRoom} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default RoomManagementIntractive;
