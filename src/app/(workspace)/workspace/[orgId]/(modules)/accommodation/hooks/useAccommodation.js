import { filterRooms, getUpcomingDischarges, getHousekeepingAlerts, calculateOccupancyStats } from '../utils/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { getAccommodation } from '../_action/get-accommodation';
import { manageAccommodation } from '../_action/manage-accommodation';
import { useAction } from '@/hooks/use-action';

export function useAccommodation() {
  const { orgId } = useParams();
  const queryClient = useQueryClient();
  
  // Core state from DB
  const { data: roomsData, isLoading } = useQuery({
    queryKey: ['accommodation', orgId],
    queryFn: async () => {
      const response = await getAccommodation({ serverId: orgId });
      return response.data?.rooms || [];
    }
  });

  const rooms = roomsData || [];
  const [waitlist, setWaitlist] = useLocalStorage('carewell-waitlist', () => generateMockWaitlist());
  const [reservations, setReservations] = useLocalStorage('carewell-reservations', () => generateMockReservations());
  
  // UI state
  const [filters, setFilters] = React.useState({
    floor: 'all',
    wing: 'all',
    type: 'all',
    status: 'all',
    search: '',
  });
  const [viewMode, setViewMode] = React.useState('floor');

  // Computed values
  const filteredRooms = React.useMemo(() => filterRooms(rooms, filters), [rooms, filters]);
  const stats = React.useMemo(() => calculateOccupancyStats(rooms), [rooms]);
  const housekeepingAlerts = React.useMemo(() => getHousekeepingAlerts(rooms), [rooms]);
  const upcomingDischarges = React.useMemo(() => getUpcomingDischarges(rooms, 24), [rooms]);

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

  const todayReservations = React.useMemo(() => {
    const today = new Date();
    return reservations.filter(r => 
      r.status === 'confirmed' && 
      isSameDay(new Date(r.expectedArrival), today)
    ).length;
  }, [reservations]);

  const { execute: executeManage } = useAction(manageAccommodation, {
    onSuccess: () => queryClient.invalidateQueries(['accommodation', orgId])
  });

  // Bed operations
  const admitPatient = React.useCallback((data) => {
    executeManage({
      type: "ADMIT",
      serverId: orgId,
      patientId: data.patient?.id,
      bedId: data.bed?.id,
      notes: data.notes,
      reason: data.reason || data.admission?.reason,
    });
    toast.success(`Patient admitted to ${data.bed?.bedNumber}`);
  }, [executeManage, orgId]);

  const transferPatient = React.useCallback((data) => {
    executeManage({
      type: "TRANSFER",
      serverId: orgId,
      patientId: data.fromBed?.patient?.id,
      bedId: data.fromBed?.id,
      targetBedId: data.toBed?.id,
    });
    toast.success(`Patient transferred from ${data.fromBed?.bedNumber} to ${data.toBed?.bedNumber}`);
  }, [executeManage, orgId]);

  const dischargePatient = React.useCallback((data) => {
    executeManage({
      type: "DISCHARGE",
      serverId: orgId,
      bedId: data.bed?.id,
      notes: data.notes,
    });
    toast.success(`Patient discharged from ${data.bed?.bedNumber}`);
  }, [executeManage, orgId]);

  const initiateDischarge = React.useCallback((data) => {
    // For now, we'll just treat it as discharge or update a status
    toast.info(`Discharge initiated for ${data.bed.patient?.name}`);
  }, []);

  // Housekeeping
  const updateHousekeeping = React.useCallback((bedId, newStatus) => {
    executeManage({
      type: "CLEAN",
      serverId: orgId,
      bedId: bedId,
    });
    toast.success(newStatus === 'clean' ? 'Bed marked as clean' : 'Cleaning started');
  }, [executeManage, orgId]);

  // Room CRUD
  const addRoom = React.useCallback((newRoom) => {
    setRooms(prev => [...prev, newRoom]);
    toast.success(`Room ${newRoom.roomNumber} added`);
  }, [setRooms]);

  const updateRoom = React.useCallback((updatedRoom) => {
    setRooms(prev => prev.map(r => r.id === updatedRoom.id ? updatedRoom : r));
    toast.success('Room updated');
  }, [setRooms]);

  const deleteRoom = React.useCallback((roomId) => {
    setRooms(prev => prev.filter(r => r.id !== roomId));
    toast.success('Room deleted');
  }, [setRooms]);

  // Waitlist
  const addToWaitlist = React.useCallback((entry) => {
    setWaitlist(prev => [...prev, entry]);
    toast.success(`${entry.patientName} added to waitlist`);
  }, [setWaitlist]);

  const removeFromWaitlist = React.useCallback((id) => {
    setWaitlist(prev => prev.filter(w => w.id !== id));
  }, [setWaitlist]);

  // Reservations
  const addReservation = React.useCallback((reservation) => {
    setReservations(prev => [...prev, reservation]);
    setRooms(prevRooms => prevRooms.map(room => ({
      ...room,
      beds: room.beds.map(bed => {
        if (bed.id === reservation.specificBedId && bed.status === 'available') {
          return { ...bed, status: 'reserved', reservation };
        }
        return bed;
      }),
    })));
    toast.success(`Bed reserved for ${reservation.patientName}`);
  }, [setReservations, setRooms]);

  const cancelReservation = React.useCallback((id) => {
    const reservation = reservations.find(r => r.id === id);
    if (reservation) {
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
  }, [reservations, setReservations, setRooms]);

  // Invoice generation (self-contained - stores data for other modules to consume if needed)
  const generateInvoice = React.useCallback((invoiceData) => {
    sessionStorage.setItem('accommodation-invoice-data', JSON.stringify({
      ...invoiceData,
      source: 'accommodation',
      timestamp: new Date().toISOString(),
    }));
    toast.success('Invoice data saved to session. Navigate to Invoice module to view.');
  }, []);

  return {
    // Data
    rooms,
    filteredRooms,
    stats,
    waitlist,
    reservations,
    availableBeds,
    housekeepingAlerts,
    upcomingDischarges,
    todayReservations,
    
    // UI State
    filters,
    setFilters,
    viewMode,
    setViewMode,
    isLoading,
    
    // Actions
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
  };
}
