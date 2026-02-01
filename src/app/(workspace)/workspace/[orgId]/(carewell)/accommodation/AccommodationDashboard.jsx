import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bed, Plus, RefreshCw, LayoutGrid, Map, List,
  Sparkles, BarChart3, Clock, DoorOpen, AlertCircle,
  Users, Stethoscope, Monitor, FileText, Activity, CalendarCheck, TrendingUp, Wrench
} from 'lucide-react';
import { toast } from 'sonner';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { generateInitialData } from './utils/mockData';
import { filterRooms, getUpcomingDischarges, getHousekeepingAlerts, calculateOccupancyStats } from './utils/utils';
import { isSameDay } from 'date-fns';




export function AccommodationDashboard() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useLocalStorage('carewell-rooms', () => generateInitialData());
  const [waitlist, setWaitlist] = useLocalStorage('carewell-waitlist', () => generateMockWaitlist());
  const [wardRounds, setWardRounds] = useLocalStorage('carewell-ward-rounds', () => generateMockRounds());
  const [equipment, setEquipment] = useLocalStorage('carewell-equipment', () => generateMockEquipment());
  const [handovers, setHandovers] = useLocalStorage('carewell-handovers', () => generateMockHandovers());
  const [reservations, setReservations] = useLocalStorage('carewell-reservations', () => generateMockReservations());

  const [activeTab, setActiveTab] = React.useState('beds');
  const [viewMode, setViewMode] = React.useState('floor');
  const [filters, setFilters] = React.useState({
    floor: 'all',
    wing: 'all',
    type: 'all',
    status: 'all',
    search: '',
  });

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

  // Computed values
  const filteredRooms = React.useMemo(() => filterRooms(rooms, filters), [rooms, filters]);
  const stats = React.useMemo(() => calculateOccupancyStats(rooms), [rooms]);
  const housekeepingAlerts = React.useMemo(() => getHousekeepingAlerts(rooms), [rooms]);
  const upcomingDischarges = React.useMemo(() => getUpcomingDischarges(rooms, 24), [rooms]);
  const currentShift = getCurrentShift();

  // Available beds for waitlist
  const availableBeds = React.useMemo(() => {
    const beds = [];
    rooms.forEach(room => {
      room.beds.forEach(bed => {
        if (bed.status === 'available') {
          beds.push({ bed, room });
        }
      });
    });
    return beds;
  }, [rooms]);

  // Pending handovers count
  const pendingHandovers = handovers.filter(h => h.status === 'pending').length;

  // Critical patients count
  const criticalPatients = React.useMemo(() => {
    let count = 0;
    rooms.forEach(room => {
      room.beds.forEach(bed => {
        if (bed.patientCondition === 'critical' || bed.patientCondition === 'deteriorating') {
          count++;
        }
      });
    });
    return count;
  }, [rooms]);

  // Today's reservations
  const todayReservations = React.useMemo(() => {
    const today = new Date();
    return reservations.filter(r =>
      r.status === 'confirmed' &&
      isSameDay(new Date(r.expectedArrival), today)
    ).length;
  }, [reservations]);

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
    // Use billing dialog for occupied beds
    if (bed.status === 'occupied' || bed.status === 'discharge_pending') {
      setDischargeBillingOpen(true);
    } else {
      setDischargeDialogOpen(true);
    }
  };

  const handleAdmitPatient = (data) => {
    setRooms(prevRooms => prevRooms.map(room => {
      if (room.id === data.room.id) {
        return {
          ...room,
          beds: room.beds.map(bed => {
            if (bed.id === data.bed.id) {
              return {
                ...bed,
                status: 'occupied',
                patient: data.patient,
                admission: {
                  ...data.admission,
                  id: `adm_${Date.now()}`,
                },
                expectedDischarge: data.expectedDischarge,
                patientCondition: 'stable',
              };
            }
            return bed;
          }),
        };
      }
      return room;
    }));
    toast.success(`Patient ${data.patient.name} admitted to ${data.bed.bedNumber}`);
  };

  const handleTransferPatient = (data) => {
    setRooms(prevRooms => {
      const updatedRooms = prevRooms.map(room => {
        if (room.id === data.fromRoom.id) {
          return {
            ...room,
            beds: room.beds.map(bed => {
              if (bed.id === data.fromBed.id) {
                return {
                  ...bed,
                  status: 'cleaning',
                  patient: null,
                  admission: null,
                  expectedDischarge: null,
                  housekeeping: 'needs_cleaning',
                  patientCondition: null,
                };
              }
              return bed;
            }),
          };
        }
        if (room.id === data.toRoom.id) {
          return {
            ...room,
            beds: room.beds.map(bed => {
              if (bed.id === data.toBed.id) {
                return {
                  ...bed,
                  status: 'occupied',
                  patient: data.fromBed.patient,
                  admission: data.fromBed.admission,
                  expectedDischarge: data.fromBed.expectedDischarge,
                  patientCondition: data.fromBed.patientCondition,
                };
              }
              return bed;
            }),
          };
        }
        return room;
      });
      return updatedRooms;
    });
    toast.success(`Patient transferred from ${data.fromBed.bedNumber} to ${data.toBed.bedNumber}`);
    setBedDetailOpen(false);
  };

  const handleInitiateDischarge = (data) => {
    setRooms(prevRooms => prevRooms.map(room => ({
      ...room,
      beds: room.beds.map(bed => {
        if (bed.id === data.bed.id) {
          return { ...bed, status: 'discharge_pending' };
        }
        return bed;
      }),
    })));
    toast.info(`Discharge initiated for ${data.bed.patient?.name}`);
  };

  const handleCompleteDischarge = (data) => {
    setRooms(prevRooms => prevRooms.map(room => ({
      ...room,
      beds: room.beds.map(bed => {
        if (bed.id === data.bed.id) {
          return {
            ...bed,
            status: data.scheduleCleanup ? 'cleaning' : 'available',
            patient: null,
            admission: null,
            expectedDischarge: null,
            housekeeping: data.scheduleCleanup ? 'needs_cleaning' : 'clean',
            patientCondition: null,
          };
        }
        return bed;
      }),
    })));
    toast.success(`Patient discharged from ${data.bed.bedNumber}`);
    setBedDetailOpen(false);
    setDischargeBillingOpen(false);
  };

  const handleGenerateInvoice = (invoiceData) => {
    // Store invoice data in sessionStorage for the invoice module
    sessionStorage.setItem('accommodation-invoice-data', JSON.stringify({
      ...invoiceData,
      source: 'accommodation',
      timestamp: new Date().toISOString(),
    }));
    toast.success('Invoice data prepared. Redirecting to Invoice module...');
    // Navigate to invoice module
    setTimeout(() => {
      navigate('/invoice?from=accommodation');
    }, 1000);
  };

  const handleUpdateHousekeeping = (bedId, newStatus) => {
    setRooms(prevRooms => prevRooms.map(room => ({
      ...room,
      beds: room.beds.map(bed => {
        if (bed.id === bedId) {
          const updates = { housekeeping: newStatus };
          if (newStatus === 'clean') {
            updates.status = 'available';
            updates.lastCleaned = new Date();
          }
          return { ...bed, ...updates };
        }
        return bed;
      }),
    })));
    if (newStatus === 'clean') {
      toast.success('Bed marked as clean and available');
    } else if (newStatus === 'in_progress') {
      toast.info('Cleaning started');
    }
  };

  // Waitlist handlers
  const handleAddToWaitlist = (entry) => {
    setWaitlist(prev => [...prev, entry]);
    toast.success(`${entry.patientName} added to waitlist`);
  };

  const handleRemoveFromWaitlist = (id) => {
    setWaitlist(prev => prev.filter(w => w.id !== id));
    toast.success('Removed from waitlist');
  };

  const handleAssignFromWaitlist = (entry) => {
    const match = availableBeds.find(({ room }) =>
      entry.preferredRoomType === 'any' || room.type === entry.preferredRoomType
    );
    if (match) {
      setSelectedBed(match.bed);
      setSelectedRoom(match.room);
      setAdmitDialogOpen(true);
      handleRemoveFromWaitlist(entry.id);
    }
  };

  // Reservation handlers
  const handleAddReservation = (reservation) => {
    setReservations(prev => [...prev, reservation]);
    // Mark the bed as reserved
    setRooms(prevRooms => prevRooms.map(room => ({
      ...room,
      beds: room.beds.map(bed => {
        if (bed.id === reservation.specificBedId && bed.status === 'available') {
          return { ...bed, status: 'reserved', reservation };
        }
        return bed;
      }),
    })));
    toast.success(`Bed ${reservation.bedNumber} reserved for ${reservation.patientName}`);
  };

  const handleCancelReservation = (id) => {
    const reservation = reservations.find(r => r.id === id);
    if (reservation) {
      // Mark bed as available again
      setRooms(prevRooms => prevRooms.map(room => ({
        ...room,
        beds: room.beds.map(bed => {
          if (bed.id === reservation.specificBedId && bed.status === 'reserved') {
            return { ...bed, status: 'available', reservation: null };
          }
          return bed;
        }),
      })));
    }
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'cancelled' } : r));
    toast.success('Reservation cancelled');
  };

  const handleConfirmReservation = (id) => {
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'confirmed' } : r));
    toast.success('Reservation confirmed');
  };

  const handleConvertReservationToAdmission = (reservation) => {
    // Find the bed
    let targetBed = null;
    let targetRoom = null;
    rooms.forEach(room => {
      room.beds.forEach(bed => {
        if (bed.id === reservation.specificBedId) {
          targetBed = bed;
          targetRoom = room;
        }
      });
    });

    if (targetBed && targetRoom) {
      // Create mock patient from reservation
      const patient = {
        id: `pat_${Date.now()}`,
        name: reservation.patientName,
        phone: reservation.patientPhone,
        mrn: `MRN-${Date.now().toString().slice(-6)}`,
        condition: reservation.diagnosis,
      };

      // Admit the patient
      setRooms(prevRooms => prevRooms.map(room => {
        if (room.id === targetRoom.id) {
          return {
            ...room,
            beds: room.beds.map(bed => {
              if (bed.id === targetBed.id) {
                return {
                  ...bed,
                  status: 'occupied',
                  patient,
                  admission: {
                    id: `adm_${Date.now()}`,
                    type: reservation.admissionType,
                    diagnosis: reservation.diagnosis,
                    admittedAt: new Date(),
                    admittedBy: `Dr. ${reservation.doctor}`,
                    depositPaid: reservation.depositPaid ? reservation.depositAmount : 0,
                  },
                  expectedDischarge: null,
                  patientCondition: 'stable',
                  reservation: null,
                };
              }
              return bed;
            }),
          };
        }
        return room;
      }));

      // Update reservation status
      setReservations(prev => prev.map(r => r.id === reservation.id ? { ...r, status: 'admitted' } : r));
      toast.success(`${reservation.patientName} admitted from reservation`);
    }
  };

  // Ward rounds handlers
  const handleAddRound = (round) => {
    setWardRounds(prev => [...prev, round]);
    toast.success('Ward round scheduled');
  };

  const handleUpdateRoundStatus = (roundId, status) => {
    setWardRounds(prev => prev.map(r => r.id === roundId ? { ...r, status } : r));
    toast.success(status === 'completed' ? 'Round completed' : 'Round started');
  };

  // Equipment handlers
  const handleAddEquipment = (eq) => {
    setEquipment(prev => [...prev, eq]);
    toast.success('Equipment added');
  };

  const handleUpdateEquipment = (id, updates) => {
    setEquipment(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    toast.success('Equipment updated');
  };

  // Handover handlers
  const handleCreateHandover = (handover) => {
    setHandovers(prev => [...prev, handover]);
    toast.success('Shift handover created');
  };

  const handleAcknowledgeHandover = (id) => {
    setHandovers(prev => prev.map(h => h.id === id ? { ...h, status: 'acknowledged', acknowledgedAt: new Date() } : h));
    toast.success('Handover acknowledged');
  };

  // Patient condition handler
  const handleUpdateCondition = (bedId, condition) => {
    setRooms(prevRooms => prevRooms.map(room => ({
      ...room,
      beds: room.beds.map(bed => {
        if (bed.id === bedId) {
          return { ...bed, patientCondition: condition, conditionUpdatedAt: new Date() };
        }
        return bed;
      }),
    })));
    toast.success('Patient condition updated');
  };

  const handleRefresh = () => {
    toast.success('Data refreshed');
  };

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bed className="h-6 w-6" />
            Bed & Room Management
          </h1>
          <p className="text-muted-foreground text-sm">
            Comprehensive hospital accommodation management system
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setAddRoomDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Room
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <OccupancyStatsCards rooms={rooms} />

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="beds" className="flex items-center gap-1.5">
            <LayoutGrid className="h-4 w-4" />
            Beds
          </TabsTrigger>
          <TabsTrigger value="reservations" className="flex items-center gap-1.5">
            <CalendarCheck className="h-4 w-4" />
            Reservations
            {todayReservations > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-[10px] flex items-center justify-center">
                {todayReservations}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="conditions" className="flex items-center gap-1.5">
            <Activity className="h-4 w-4" />
            Conditions
            {criticalPatients > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-[10px] flex items-center justify-center">
                {criticalPatients}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="waitlist" className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            Waitlist
            {waitlist.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-[10px] flex items-center justify-center">
                {waitlist.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="rounds" className="flex items-center gap-1.5">
            <Stethoscope className="h-4 w-4" />
            Rounds
          </TabsTrigger>
          <TabsTrigger value="housekeeping" className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4" />
            Housekeeping
            {housekeepingAlerts.length > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-[10px] flex items-center justify-center">
                {housekeepingAlerts.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="discharges" className="flex items-center gap-1.5">
            <DoorOpen className="h-4 w-4" />
            Discharges
            {upcomingDischarges.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-[10px] flex items-center justify-center">
                {upcomingDischarges.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="equipment" className="flex items-center gap-1.5">
            <Monitor className="h-4 w-4" />
            Equipment
          </TabsTrigger>
          <TabsTrigger value="handover" className="flex items-center gap-1.5">
            <FileText className="h-4 w-4" />
            Handover
            {pendingHandovers > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-[10px] flex items-center justify-center">
                {pendingHandovers}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="flex items-center gap-1.5">
            <Wrench className="h-4 w-4" />
            Maintenance
          </TabsTrigger>
          <TabsTrigger value="planning" className="flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4" />
            Planning
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-1.5">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

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

        <TabsContent value="reservations" className="mt-4">
          <BedReservationPanel
            reservations={reservations}
            rooms={rooms}
            onAdd={handleAddReservation}
            onCancel={handleCancelReservation}
            onConfirm={handleConfirmReservation}
            onConvertToAdmission={handleConvertReservationToAdmission}
          />
        </TabsContent>

        <TabsContent value="conditions" className="mt-4">
          <PatientConditionBoard
            rooms={rooms}
            onUpdateCondition={handleUpdateCondition}
          />
        </TabsContent>

        <TabsContent value="waitlist" className="mt-4">
          <WaitingListPanel
            waitlist={waitlist}
            availableBeds={availableBeds}
            onAdd={handleAddToWaitlist}
            onRemove={handleRemoveFromWaitlist}
            onAssign={handleAssignFromWaitlist}
            onUpdatePriority={(id, direction) => {
              const priorities = ['low', 'normal', 'high', 'critical'];
              setWaitlist(prev => prev.map(w => {
                if (w.id === id) {
                  const currentIdx = priorities.indexOf(w.priority);
                  const newIdx = direction === 'up'
                    ? Math.min(currentIdx + 1, priorities.length - 1)
                    : Math.max(currentIdx - 1, 0);
                  return { ...w, priority: priorities[newIdx] };
                }
                return w;
              }));
            }}
          />
        </TabsContent>

        <TabsContent value="rounds" className="mt-4">
          <WardRoundsPanel
            rounds={wardRounds}
            rooms={rooms}
            onAddRound={handleAddRound}
            onCompleteRound={handleUpdateRoundStatus}
          />
        </TabsContent>

        <TabsContent value="housekeeping" className="mt-4">
          <HousekeepingPanel
            rooms={rooms}
            onUpdateHousekeeping={handleUpdateHousekeeping}
          />
        </TabsContent>

        <TabsContent value="discharges" className="mt-4">
          <UpcomingDischargesPanel
            rooms={rooms}
            onInitiateDischarge={(discharge) => {
              const room = rooms.find(r => r.beds.some(b => b.id === discharge.id));
              const bed = room?.beds.find(b => b.id === discharge.id);
              if (bed && room) handleDischarge(bed, room);
            }}
            onViewBed={(discharge) => {
              const room = rooms.find(r => r.beds.some(b => b.id === discharge.id));
              const bed = room?.beds.find(b => b.id === discharge.id);
              if (bed && room) handleSelectBed(bed, room);
            }}
          />
        </TabsContent>

        <TabsContent value="equipment" className="mt-4">
          <EquipmentTrackingPanel
            equipment={equipment}
            rooms={rooms}
            onAdd={handleAddEquipment}
            onUpdate={handleUpdateEquipment}
            onAssign={(eq) => toast.info('Equipment assignment dialog coming soon')}
          />
        </TabsContent>

        <TabsContent value="handover" className="mt-4">
          <ShiftHandoverPanel
            handovers={handovers}
            rooms={rooms}
            currentShift={currentShift}
            onCreateHandover={handleCreateHandover}
            onAcknowledge={handleAcknowledgeHandover}
          />
        </TabsContent>

        <TabsContent value="maintenance" className="mt-4">
          <MaintenanceSchedulePanel rooms={rooms} />
        </TabsContent>

        <TabsContent value="planning" className="mt-4">
          <CapacityPlanningPanel rooms={rooms} reservations={reservations} />
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <AccommodationAnalytics rooms={rooms} />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <BedDetailSheet
        open={bedDetailOpen}
        onOpenChange={setBedDetailOpen}
        bed={selectedBed}
        room={selectedRoom}
        onDischarge={(bed) => handleDischarge(bed, selectedRoom)}
        onTransfer={(bed) => handleTransfer(bed, selectedRoom)}
        onClean={(bed) => handleUpdateHousekeeping(bed.id, bed.housekeeping === 'clean' ? 'needs_cleaning' : 'clean')}
        onMaintenance={(bed) => {
          setRooms(prevRooms => prevRooms.map(room => ({
            ...room,
            beds: room.beds.map(b => {
              if (b.id === bed.id) {
                return { ...b, status: b.status === 'maintenance' ? 'available' : 'maintenance' };
              }
              return b;
            }),
          })));
          toast.success(bed.status === 'maintenance' ? 'Maintenance completed' : 'Bed set to maintenance');
        }}
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
        onInitiateDischarge={handleInitiateDischarge}
      />

      <DischargeBillingDialog
        open={dischargeBillingOpen}
        onOpenChange={setDischargeBillingOpen}
        bed={selectedBed}
        room={selectedRoom}
        onDischarge={handleCompleteDischarge}
        onGenerateInvoice={handleGenerateInvoice}
      />

      <AddRoomDialog
        open={addRoomDialogOpen}
        onOpenChange={setAddRoomDialogOpen}
        existingRoomNumbers={rooms.map(r => r.roomNumber)}
        onAdd={(newRoom) => {
          setRooms(prev => [...prev, newRoom]);
        }}
      />

      <EditRoomDialog
        open={editRoomDialogOpen}
        onOpenChange={setEditRoomDialogOpen}
        room={roomToEdit}
        existingRoomNumbers={rooms.map(r => r.roomNumber)}
        onSave={(updatedRoom) => {
          setRooms(prev => prev.map(r => r.id === updatedRoom.id ? updatedRoom : r));
        }}
      />

      <DeleteRoomDialog
        open={deleteRoomDialogOpen}
        onOpenChange={setDeleteRoomDialogOpen}
        room={roomToEdit}
        onDelete={(roomId) => {
          setRooms(prev => prev.filter(r => r.id !== roomId));
        }}
      />

      <BedManagementDialog
        open={bedManagementOpen}
        onOpenChange={setBedManagementOpen}
        room={roomForBedManagement}
        onSave={(updatedRoom) => {
          setRooms(prev => prev.map(r => r.id === updatedRoom.id ? updatedRoom : r));
        }}
      />
    </div>
  );
}
