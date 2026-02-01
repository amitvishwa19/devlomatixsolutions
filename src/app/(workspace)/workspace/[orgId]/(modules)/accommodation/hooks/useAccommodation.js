import * as React from 'react';
import { toast } from 'sonner';
import { isSameDay } from 'date-fns';
import { useLocalStorage } from './useLocalStorage';
import { 
  generateInitialData, 
  generateMockWaitlist, 
  generateMockReservations 
} from '../utils/mockData';
import { filterRooms, getUpcomingDischarges, getHousekeepingAlerts, calculateOccupancyStats } from '../utils/utils';

export function useAccommodation() {
  
  // Core state
  const [rooms, setRooms] = useLocalStorage('carewell-rooms', () => generateInitialData());
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

  // Bed operations
  const admitPatient = React.useCallback((data) => {
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
                admission: { ...data.admission, id: `adm_${Date.now()}` },
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
  }, [setRooms]);

  const transferPatient = React.useCallback((data) => {
    setRooms(prevRooms => {
      return prevRooms.map(room => {
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
    });
    toast.success(`Patient transferred from ${data.fromBed.bedNumber} to ${data.toBed.bedNumber}`);
  }, [setRooms]);

  const dischargePatient = React.useCallback((data) => {
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
  }, [setRooms]);

  const initiateDischarge = React.useCallback((data) => {
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
  }, [setRooms]);

  // Housekeeping
  const updateHousekeeping = React.useCallback((bedId, newStatus) => {
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
    toast.success(newStatus === 'clean' ? 'Bed marked as clean' : 'Cleaning started');
  }, [setRooms]);

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
