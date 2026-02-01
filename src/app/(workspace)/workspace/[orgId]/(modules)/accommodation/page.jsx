'use client'
import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bed, Plus, RefreshCw, LayoutGrid, List, Sparkles, BarChart3, CalendarCheck, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useAccommodation } from './hooks';
import { ContentTopbar } from '../../(misc)/_components/ContentTopbar'
import {
    OccupancyStatsCards,
    FloorPlanView,
    RoomListView,
    BedDetailSheet,
    AdmitPatientDialog,
    TransferPatientDialog,
    DischargePatientDialog,
    DischargeBillingDialog,
    HousekeepingPanel,
    AccommodationAnalytics,
    AccommodationFilters,
    WaitingListPanel,
    BedReservationPanel,
    AddRoomDialog,
    EditRoomDialog,
    DeleteRoomDialog,
    BedManagementDialog,
} from './components';
import { ScrollArea } from '@/components/ui/scroll-area';



export default function AccomodationPage() {
    const {
        rooms,
        filteredRooms,
        waitlist,
        reservations,
        availableBeds,
        housekeepingAlerts,
        todayReservations,
        filters,
        setFilters,
        viewMode,
        setViewMode,
        admitPatient,
        transferPatient,
        dischargePatient,
        initiateDischarge,
        updateHousekeeping,
        addRoom,
        updateRoom,
        deleteRoom,
        addToWaitlist,
        removeFromWaitlist,
        addReservation,
        cancelReservation,
        generateInvoice,
    } = useAccommodation();

    const [activeTab, setActiveTab] = React.useState('beds');

    // Dialog states
    const [selectedBed, setSelectedBed] = React.useState(null);
    const [selectedRoom, setSelectedRoom] = React.useState(null);
    const [bedDetailOpen, setBedDetailOpen] = React.useState(false);
    const [admitDialogOpen, setAdmitDialogOpen] = React.useState(false);
    const [transferDialogOpen, setTransferDialogOpen] = React.useState(false);
    const [dischargeDialogOpen, setDischargeDialogOpen] = React.useState(false);
    const [dischargeBillingOpen, setDischargeBillingOpen] = React.useState(false);
    const [addRoomDialogOpen, setAddRoomDialogOpen] = React.useState(false);
    const [editRoomDialogOpen, setEditRoomDialogOpen] = React.useState(false);
    const [deleteRoomDialogOpen, setDeleteRoomDialogOpen] = React.useState(false);
    const [roomToEdit, setRoomToEdit] = React.useState(null);
    const [bedManagementOpen, setBedManagementOpen] = React.useState(false);
    const [roomForBedManagement, setRoomForBedManagement] = React.useState(null);

    // Handlers
    const handleSelectBed = (bed, room) => {
        setSelectedBed(bed);
        setSelectedRoom(room);
        setBedDetailOpen(true);
    };

    const handleAssignPatient = (bed, room) => {
        setSelectedBed(bed);
        setSelectedRoom(room);
        setAdmitDialogOpen(true);
    };

    const handleTransfer = (bed, room) => {
        setSelectedBed(bed);
        setSelectedRoom(room);
        setTransferDialogOpen(true);
    };

    const handleDischarge = (bed, room) => {
        setSelectedBed(bed);
        setSelectedRoom(room || rooms.find(r => r.beds.some(b => b.id === bed.id)));
        if (bed.status === 'occupied' || bed.status === 'discharge_pending') {
            setDischargeBillingOpen(true);
        } else {
            setDischargeDialogOpen(true);
        }
    };

    const handleAdmitPatient = (data) => {
        admitPatient(data);
        setAdmitDialogOpen(false);
    };

    const handleTransferPatient = (data) => {
        transferPatient(data);
        setTransferDialogOpen(false);
        setBedDetailOpen(false);
    };

    const handleCompleteDischarge = (data) => {
        dischargePatient(data);
        setBedDetailOpen(false);
        setDischargeBillingOpen(false);
        setDischargeDialogOpen(false);
    };

    const handleAssignFromWaitlist = (entry) => {
        const match = availableBeds.find(({ room }) =>
            entry.preferredRoomType === 'any' || room.type === entry.preferredRoomType
        );
        if (match) {
            setSelectedBed(match.bed);
            setSelectedRoom(match.room);
            setAdmitDialogOpen(true);
            removeFromWaitlist(entry.id);
        }
    };

    return (
        <div className='absolute inset-0 flex flex-col gap-2'>



            <ContentTopbar
                title='Bed & Room Management'
                description='Comprehensive hospital accommodation management system'
                icon='bed-double'
                actionComp={<div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => toast.success('Data refreshed')}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                    <Button size="sm" onClick={() => setAddRoomDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Room
                    </Button>
                </div>}
            />

            {/* Stats Cards */}
            <div className='p-2'>
                <OccupancyStatsCards rooms={rooms} />
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>

                <TabsList className='p-2'>
                    <TabsTrigger value="beds" className="flex items-center gap-1.5">
                        <LayoutGrid className="h-4 w-4" />
                        Beds
                    </TabsTrigger>
                    <TabsTrigger value="reservations" className="flex items-center gap-1.5">
                        <CalendarCheck className="h-4 w-4" />
                        Reservations
                        {todayReservations > 0 && (
                            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
                                {todayReservations}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="waitlist" className="flex items-center gap-1.5">
                        <Users className="h-4 w-4" />
                        Waitlist
                        {waitlist.length > 0 && (
                            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
                                {waitlist.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="housekeeping" className="flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4" />
                        Housekeeping
                        {housekeepingAlerts.length > 0 && (
                            <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-[10px]">
                                {housekeepingAlerts.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="flex items-center gap-1.5">
                        <BarChart3 className="h-4 w-4" />
                        Analytics
                    </TabsTrigger>
                </TabsList>

                <ScrollArea className='h-[65vh] flex flex-grow  rounded-md'>
                    {/* Beds Tab */}
                    <TabsContent value="beds" className="mt-4 space-y-4">
                        <AccommodationFilters
                            filters={filters}
                            onFiltersChange={setFilters}
                            viewMode={viewMode}
                            onViewModeChange={setViewMode}
                            totalRooms={rooms.length}
                            filteredRooms={filteredRooms.length}
                        />

                        {viewMode === 'floor' && (
                            <FloorPlanView
                                rooms={filteredRooms}
                                onSelectBed={handleSelectBed}
                                onSelectRoom={(room) => {
                                    setSelectedRoom(room);
                                    if (room.beds.length === 1) {
                                        handleSelectBed(room.beds[0], room);
                                    }
                                }}
                            />
                        )}

                        {viewMode === 'list' && (
                            <RoomListView
                                rooms={filteredRooms}
                                onSelectBed={handleSelectBed}
                                onSelectRoom={setSelectedRoom}
                                onAssignPatient={handleAssignPatient}
                                onTransfer={handleTransfer}
                                onEditRoom={(room) => {
                                    setRoomToEdit(room);
                                    setEditRoomDialogOpen(true);
                                }}
                                onDeleteRoom={(room) => {
                                    setRoomToEdit(room);
                                    setDeleteRoomDialogOpen(true);
                                }}
                                onManageBeds={(room) => {
                                    setRoomForBedManagement(room);
                                    setBedManagementOpen(true);
                                }}
                            />
                        )}

                        {viewMode === 'grid' && (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                                {filteredRooms.map(room => (
                                    <Card
                                        key={room.id}
                                        className="cursor-pointer hover:border-primary/50 transition-colors"
                                        onClick={() => {
                                            setSelectedRoom(room);
                                            if (room.beds.length === 1) {
                                                handleSelectBed(room.beds[0], room);
                                            }
                                        }}
                                    >
                                        <CardContent className="p-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <Badge variant="outline" className="text-xs">{room.roomNumber}</Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    {room.beds.filter(b => b.status === 'occupied').length}/{room.beds.length}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {room.beds.map(bed => {
                                                    const colors = {
                                                        available: 'bg-green-500',
                                                        occupied: 'bg-blue-500',
                                                        reserved: 'bg-amber-500',
                                                        cleaning: 'bg-purple-500',
                                                        maintenance: 'bg-gray-500',
                                                        discharge_pending: 'bg-orange-500',
                                                    };
                                                    return (
                                                        <div
                                                            key={bed.id}
                                                            className={`w-6 h-6 rounded ${colors[bed.status] || 'bg-gray-300'}`}
                                                            title={`${bed.bedNumber}: ${bed.status}`}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* Reservations Tab */}
                    <TabsContent value="reservations" className="mt-4">
                        <BedReservationPanel
                            reservations={reservations}
                            rooms={rooms}
                            onAdd={addReservation}
                            onCancel={cancelReservation}
                            onConfirm={(id) => toast.success('Reservation confirmed')}
                            onConvertToAdmission={(reservation) => {
                                toast.info('Opening admission form...');
                            }}
                        />
                    </TabsContent>

                    {/* Waitlist Tab */}
                    <TabsContent value="waitlist" className="mt-4">
                        <WaitingListPanel
                            waitlist={waitlist}
                            availableBeds={availableBeds}
                            onAdd={addToWaitlist}
                            onRemove={removeFromWaitlist}
                            onAssign={handleAssignFromWaitlist}
                            onUpdatePriority={(id, direction) => toast.info('Priority updated')}
                        />
                    </TabsContent>

                    {/* Housekeeping Tab */}
                    <TabsContent value="housekeeping" className="mt-4">
                        <HousekeepingPanel
                            rooms={rooms}
                            onUpdateHousekeeping={updateHousekeeping}
                        />
                    </TabsContent>

                    {/* Analytics Tab */}
                    <TabsContent value="analytics" className="mt-4">
                        <AccommodationAnalytics rooms={rooms} />
                    </TabsContent>
                </ScrollArea>

            </Tabs>

            <div>
                {/* Dialogs */}
                <BedDetailSheet
                    open={bedDetailOpen}
                    onOpenChange={setBedDetailOpen}
                    bed={selectedBed}
                    room={selectedRoom}
                    onDischarge={(bed) => handleDischarge(bed, selectedRoom)}
                    onTransfer={(bed) => handleTransfer(bed, selectedRoom)}
                    onClean={(bed) => updateHousekeeping(bed.id, bed.housekeeping === 'clean' ? 'needs_cleaning' : 'clean')}
                    onMaintenance={(bed) => toast.info('Maintenance toggled')}
                />

                <AdmitPatientDialog
                    open={admitDialogOpen}
                    onOpenChange={setAdmitDialogOpen}
                    bed={selectedBed}
                    room={selectedRoom}
                    onAdmit={handleAdmitPatient}
                />

                <TransferPatientDialog
                    open={transferDialogOpen}
                    onOpenChange={setTransferDialogOpen}
                    bed={selectedBed}
                    room={selectedRoom}
                    allRooms={rooms}
                    onTransfer={handleTransferPatient}
                />

                <DischargePatientDialog
                    open={dischargeDialogOpen}
                    onOpenChange={setDischargeDialogOpen}
                    bed={selectedBed}
                    room={selectedRoom}
                    onDischarge={handleCompleteDischarge}
                    onInitiateDischarge={(data) => initiateDischarge(data)}
                />

                <DischargeBillingDialog
                    open={dischargeBillingOpen}
                    onOpenChange={setDischargeBillingOpen}
                    bed={selectedBed}
                    room={selectedRoom}
                    onDischarge={handleCompleteDischarge}
                    onGenerateInvoice={generateInvoice}
                />

                <AddRoomDialog
                    open={addRoomDialogOpen}
                    onOpenChange={setAddRoomDialogOpen}
                    existingRoomNumbers={rooms.map(r => r.roomNumber)}
                    onAdd={addRoom}
                />

                <EditRoomDialog
                    open={editRoomDialogOpen}
                    onOpenChange={setEditRoomDialogOpen}
                    room={roomToEdit}
                    existingRoomNumbers={rooms.map(r => r.roomNumber)}
                    onSave={updateRoom}
                />

                <DeleteRoomDialog
                    open={deleteRoomDialogOpen}
                    onOpenChange={setDeleteRoomDialogOpen}
                    room={roomToEdit}
                    onDelete={deleteRoom}
                />

                <BedManagementDialog
                    open={bedManagementOpen}
                    onOpenChange={setBedManagementOpen}
                    room={roomForBedManagement}
                    onSave={updateRoom}
                />
            </div>


        </div >
    )
}
