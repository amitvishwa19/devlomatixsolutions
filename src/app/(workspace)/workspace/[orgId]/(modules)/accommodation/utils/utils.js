import { differenceInDays, differenceInHours, format } from 'date-fns';
import { ROOM_TYPES, BED_STATUSES, FLOORS, WINGS, HOUSEKEEPING_STATUS, BED_FEATURES } from './types.js';

export const getRoomTypeById = (typeId) => {
  return ROOM_TYPES.find(t => t.id === typeId) || { name: typeId, icon: 'Bed', color: 'bg-gray-100 text-gray-800' };
};

export const getBedStatusById = (statusId) => {
  return BED_STATUSES.find(s => s.id === statusId) || BED_STATUSES[0];
};

export const getFloorById = (floorId) => {
  return FLOORS.find(f => f.id === floorId) || { name: floorId, shortName: '?' };
};

export const getWingById = (wingId) => {
  return WINGS.find(w => w.id === wingId) || { name: wingId, shortName: '?' };
};

export const getHousekeepingStatusById = (statusId) => {
  return HOUSEKEEPING_STATUS.find(h => h.id === statusId) || HOUSEKEEPING_STATUS[0];
};

export const getFeatureById = (featureId) => {
  return BED_FEATURES.find(f => f.id === featureId) || { name: featureId, icon: 'Circle' };
};

// Calculate occupancy statistics
export const calculateOccupancyStats = (rooms) => {
  let totalBeds = 0;
  let occupiedBeds = 0;
  let availableBeds = 0;
  let reservedBeds = 0;
  let maintenanceBeds = 0;
  let cleaningBeds = 0;
  let dischargePendingBeds = 0;

  rooms.forEach(room => {
    room.beds.forEach(bed => {
      totalBeds++;
      switch (bed.status) {
        case 'occupied':
          occupiedBeds++;
          break;
        case 'available':
          availableBeds++;
          break;
        case 'reserved':
          reservedBeds++;
          break;
        case 'maintenance':
          maintenanceBeds++;
          break;
        case 'cleaning':
          cleaningBeds++;
          break;
        case 'discharge_pending':
          dischargePendingBeds++;
          break;
      }
    });
  });

  const occupancyRate = totalBeds > 0 ? ((occupiedBeds + dischargePendingBeds) / totalBeds * 100).toFixed(1) : 0;

  return {
    totalBeds,
    occupiedBeds,
    availableBeds,
    reservedBeds,
    maintenanceBeds,
    cleaningBeds,
    dischargePendingBeds,
    occupancyRate,
  };
};

// Calculate stats by room type
export const calculateStatsByRoomType = (rooms) => {
  const stats = {};

  ROOM_TYPES.forEach(type => {
    stats[type.id] = {
      ...type,
      totalBeds: 0,
      occupiedBeds: 0,
      availableBeds: 0,
    };
  });

  rooms.forEach(room => {
    if (stats[room.type]) {
      room.beds.forEach(bed => {
        stats[room.type].totalBeds++;
        if (bed.status === 'occupied' || bed.status === 'discharge_pending') {
          stats[room.type].occupiedBeds++;
        } else if (bed.status === 'available') {
          stats[room.type].availableBeds++;
        }
      });
    }
  });

  return Object.values(stats).filter(s => s.totalBeds > 0);
};

// Calculate stats by floor
export const calculateStatsByFloor = (rooms) => {
  const stats = {};

  FLOORS.forEach(floor => {
    stats[floor.id] = {
      ...floor,
      totalBeds: 0,
      occupiedBeds: 0,
      availableBeds: 0,
      rooms: 0,
    };
  });

  rooms.forEach(room => {
    if (stats[room.floor]) {
      stats[room.floor].rooms++;
      room.beds.forEach(bed => {
        stats[room.floor].totalBeds++;
        if (bed.status === 'occupied' || bed.status === 'discharge_pending') {
          stats[room.floor].occupiedBeds++;
        } else if (bed.status === 'available') {
          stats[room.floor].availableBeds++;
        }
      });
    }
  });

  return Object.values(stats).filter(s => s.totalBeds > 0);
};

// Get housekeeping alerts
export const getHousekeepingAlerts = (rooms) => {
  const alerts = [];

  rooms.forEach(room => {
    room.beds.forEach(bed => {
      if (bed.housekeeping === 'needs_cleaning' || bed.housekeeping === 'deep_clean') {
        alerts.push({
          id: bed.id,
          bedNumber: bed.bedNumber,
          roomNumber: room.roomNumber,
          roomType: room.type,
          floor: room.floor,
          wing: room.wing,
          status: bed.housekeeping,
          lastCleaned: bed.lastCleaned,
          priority: bed.housekeeping === 'deep_clean' ? 'high' : 'medium',
        });
      }
    });
  });

  return alerts.sort((a, b) => (a.priority === 'high' ? -1 : 1));
};

// Get upcoming discharges
export const getUpcomingDischarges = (rooms, hoursAhead = 24) => {
  const discharges = [];
  const now = new Date();

  rooms.forEach(room => {
    room.beds.forEach(bed => {
      if ((bed.status === 'occupied' || bed.status === 'discharge_pending') && bed.expectedDischarge) {
        const hoursUntil = differenceInHours(new Date(bed.expectedDischarge), now);
        if (hoursUntil >= 0 && hoursUntil <= hoursAhead) {
          discharges.push({
            id: bed.id,
            bedNumber: bed.bedNumber,
            roomNumber: room.roomNumber,
            roomType: room.type,
            patient: bed.patient,
            expectedDischarge: bed.expectedDischarge,
            hoursUntil,
            isPending: bed.status === 'discharge_pending',
          });
        }
      }
    });
  });

  return discharges.sort((a, b) => a.hoursUntil - b.hoursUntil);
};

// Get length of stay for a patient
export const getLengthOfStay = (admissionDate) => {
  if (!admissionDate) return 0;
  return differenceInDays(new Date(), new Date(admissionDate));
};

// Format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Calculate estimated bill
export const calculateEstimatedBill = (room, bed) => {
  if (!bed.admission) return 0;
  const days = getLengthOfStay(bed.admission.admittedAt) || 1;
  return days * room.dailyRate;
};

// Filter rooms
export const filterRooms = (rooms, filters) => {
  return rooms.filter(room => {
    if (filters.floor && filters.floor !== 'all' && room.floor !== filters.floor) return false;
    if (filters.wing && filters.wing !== 'all' && room.wing !== filters.wing) return false;
    if (filters.type && filters.type !== 'all' && room.type !== filters.type) return false;
    if (filters.status && filters.status !== 'all') {
      const hasMatchingBed = room.beds.some(bed => bed.status === filters.status);
      if (!hasMatchingBed) return false;
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesRoom = room.roomNumber.toLowerCase().includes(searchLower);
      const matchesPatient = room.beds.some(bed => 
        bed.patient?.name?.toLowerCase().includes(searchLower) ||
        bed.patient?.mrn?.toLowerCase().includes(searchLower)
      );
      if (!matchesRoom && !matchesPatient) return false;
    }
    return true;
  });
};

// Get bed by ID from rooms
export const getBedById = (rooms, bedId) => {
  for (const room of rooms) {
    const bed = room.beds.find(b => b.id === bedId);
    if (bed) return { room, bed };
  }
  return null;
};

// Calculate revenue summary
export const calculateRevenueSummary = (rooms) => {
  let dailyRevenue = 0;
  let projectedMonthly = 0;

  rooms.forEach(room => {
    room.beds.forEach(bed => {
      if (bed.status === 'occupied' || bed.status === 'discharge_pending') {
        dailyRevenue += room.dailyRate;
      }
    });
  });

  projectedMonthly = dailyRevenue * 30;

  return { dailyRevenue, projectedMonthly };
};
