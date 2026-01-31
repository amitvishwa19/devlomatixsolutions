import { addDays, subDays, addHours, subHours } from 'date-fns';

// Generate rooms with beds
export const generateMockRooms = () => {
  const rooms = [];
  const roomConfigs = [
    // ICU - Ground Floor, Central
    { floor: 'ground', wing: 'central', type: 'icu', prefix: 'ICU', count: 6, bedsPerRoom: 1 },
    // Emergency - Ground Floor, East
    { floor: 'ground', wing: 'east', type: 'emergency', prefix: 'ER', count: 8, bedsPerRoom: 1 },
    // Operation Theaters - Ground Floor, West
    { floor: 'ground', wing: 'west', type: 'operation_theater', prefix: 'OT', count: 4, bedsPerRoom: 1 },
    // Recovery - Ground Floor, West
    { floor: 'ground', wing: 'west', type: 'recovery', prefix: 'REC', count: 4, bedsPerRoom: 2 },
    // Private Rooms - 1st Floor
    { floor: 'first', wing: 'east', type: 'private', prefix: '1E', count: 10, bedsPerRoom: 1 },
    { floor: 'first', wing: 'west', type: 'private', prefix: '1W', count: 10, bedsPerRoom: 1 },
    // Semi-Private - 2nd Floor
    { floor: 'second', wing: 'east', type: 'semi_private', prefix: '2E', count: 8, bedsPerRoom: 2 },
    { floor: 'second', wing: 'west', type: 'semi_private', prefix: '2W', count: 8, bedsPerRoom: 2 },
    // General Ward - 3rd Floor
    { floor: 'third', wing: 'east', type: 'general_ward', prefix: '3E', count: 6, bedsPerRoom: 6 },
    { floor: 'third', wing: 'west', type: 'general_ward', prefix: '3W', count: 6, bedsPerRoom: 6 },
    // Pediatric - 4th Floor, East
    { floor: 'fourth', wing: 'east', type: 'pediatric', prefix: 'PED', count: 8, bedsPerRoom: 2 },
    // Maternity - 4th Floor, West
    { floor: 'fourth', wing: 'west', type: 'maternity', prefix: 'MAT', count: 8, bedsPerRoom: 2 },
    // Isolation - 4th Floor, Central
    { floor: 'fourth', wing: 'central', type: 'isolation', prefix: 'ISO', count: 4, bedsPerRoom: 1 },
  ];

  let roomId = 1;
  let bedId = 1;

  roomConfigs.forEach(config => {
    for (let i = 1; i <= config.count; i++) {
      const roomNumber = `${config.prefix}-${String(i).padStart(2, '0')}`;
      const beds = [];

      for (let b = 1; b <= config.bedsPerRoom; b++) {
        const bedLetter = String.fromCharCode(64 + b); // A, B, C...
        beds.push({
          id: `bed_${bedId}`,
          bedNumber: `${roomNumber}-${bedLetter}`,
          status: getRandomBedStatus(),
          features: getRandomFeatures(config.type),
          housekeeping: getRandomHousekeeping(),
          patient: null,
          admission: null,
          expectedDischarge: null,
          lastCleaned: subHours(new Date(), Math.floor(Math.random() * 48)),
          notes: '',
        });
        bedId++;
      }

      rooms.push({
        id: `room_${roomId}`,
        roomNumber,
        type: config.type,
        floor: config.floor,
        wing: config.wing,
        beds,
        dailyRate: getRoomRate(config.type),
        amenities: getRoomAmenities(config.type),
        isActive: true,
        lastInspection: subDays(new Date(), Math.floor(Math.random() * 30)),
      });
      roomId++;
    }
  });

  return rooms;
};

const getRandomBedStatus = () => {
  const rand = Math.random();
  if (rand < 0.55) return 'occupied';
  if (rand < 0.75) return 'available';
  if (rand < 0.85) return 'reserved';
  if (rand < 0.92) return 'cleaning';
  if (rand < 0.97) return 'discharge_pending';
  return 'maintenance';
};

const getRandomHousekeeping = () => {
  const rand = Math.random();
  if (rand < 0.7) return 'clean';
  if (rand < 0.85) return 'needs_cleaning';
  if (rand < 0.95) return 'in_progress';
  return 'deep_clean';
};

const getRandomFeatures = (roomType) => {
  const baseFeatures = ['iv_stand', 'call_bell'];
  const typeFeatures = {
    icu: ['electric', 'oxygen', 'suction', 'monitor', 'ventilator'],
    emergency: ['oxygen', 'suction', 'monitor'],
    operation_theater: ['electric', 'oxygen', 'suction', 'monitor', 'ventilator'],
    recovery: ['electric', 'oxygen', 'monitor'],
    private: ['electric', 'bathroom', 'tv', 'ac'],
    semi_private: ['electric', 'bathroom', 'tv'],
    general_ward: ['electric'],
    pediatric: ['electric', 'oxygen', 'monitor', 'tv'],
    maternity: ['electric', 'bathroom', 'tv', 'monitor'],
    isolation: ['electric', 'oxygen', 'suction', 'monitor', 'bathroom'],
  };
  return [...baseFeatures, ...(typeFeatures[roomType] || [])];
};

const getRoomRate = (roomType) => {
  const rates = {
    icu: 15000,
    emergency: 5000,
    operation_theater: 25000,
    recovery: 8000,
    private: 6000,
    semi_private: 3500,
    general_ward: 1500,
    pediatric: 4000,
    maternity: 5000,
    isolation: 10000,
  };
  return rates[roomType] || 2000;
};

const getRoomAmenities = (roomType) => {
  const amenities = {
    icu: ['24/7 Monitoring', 'Dedicated Nurse', 'Emergency Support'],
    emergency: ['Immediate Care', 'Triage Support'],
    operation_theater: ['Surgical Equipment', 'Anesthesia'],
    recovery: ['Post-Op Care', 'Pain Management'],
    private: ['TV', 'AC', 'Attached Bath', 'Attendant Bed', 'WiFi'],
    semi_private: ['Shared TV', 'AC', 'Attached Bath'],
    general_ward: ['Basic Amenities', 'Shared Bathroom'],
    pediatric: ['Child-Friendly', 'Play Area Access', 'Parent Stay'],
    maternity: ['Newborn Care', 'Lactation Support', 'Private Bath'],
    isolation: ['Negative Pressure', 'PPE Access', 'Dedicated Staff'],
  };
  return amenities[roomType] || [];
};

// Mock patients for occupied beds
export const mockPatients = [
  { id: 'pat_001', name: 'Rajesh Kumar', age: 45, gender: 'M', mrn: 'MRN-2024-001', phone: '+91 98765 43210', condition: 'Post-Surgery Recovery' },
  { id: 'pat_002', name: 'Priya Sharma', age: 32, gender: 'F', mrn: 'MRN-2024-002', phone: '+91 98765 43211', condition: 'Pneumonia' },
  { id: 'pat_003', name: 'Amit Patel', age: 58, gender: 'M', mrn: 'MRN-2024-003', phone: '+91 98765 43212', condition: 'Cardiac Monitoring' },
  { id: 'pat_004', name: 'Sunita Devi', age: 67, gender: 'F', mrn: 'MRN-2024-004', phone: '+91 98765 43213', condition: 'Hip Replacement Recovery' },
  { id: 'pat_005', name: 'Arun Mehta', age: 29, gender: 'M', mrn: 'MRN-2024-005', phone: '+91 98765 43214', condition: 'Appendectomy' },
  { id: 'pat_006', name: 'Kavitha Reddy', age: 41, gender: 'F', mrn: 'MRN-2024-006', phone: '+91 98765 43215', condition: 'Diabetes Management' },
  { id: 'pat_007', name: 'Mohan Singh', age: 72, gender: 'M', mrn: 'MRN-2024-007', phone: '+91 98765 43216', condition: 'Respiratory Infection' },
  { id: 'pat_008', name: 'Lakshmi Iyer', age: 35, gender: 'F', mrn: 'MRN-2024-008', phone: '+91 98765 43217', condition: 'Maternity - Normal Delivery' },
  { id: 'pat_009', name: 'Vikram Joshi', age: 50, gender: 'M', mrn: 'MRN-2024-009', phone: '+91 98765 43218', condition: 'Knee Surgery Recovery' },
  { id: 'pat_010', name: 'Ananya Das', age: 8, gender: 'F', mrn: 'MRN-2024-010', phone: '+91 98765 43219', condition: 'Pediatric Fever' },
];

// Generate initial data with some occupied beds
export const generateInitialData = () => {
  const rooms = generateMockRooms();
  let patientIndex = 0;

  rooms.forEach(room => {
    room.beds.forEach(bed => {
      if (bed.status === 'occupied' && patientIndex < mockPatients.length) {
        bed.patient = mockPatients[patientIndex];
        bed.admission = {
          id: `adm_${patientIndex + 1}`,
          type: ['emergency', 'elective', 'transfer'][Math.floor(Math.random() * 3)],
          admittedAt: subDays(new Date(), Math.floor(Math.random() * 10) + 1),
          admittedBy: 'Dr. ' + ['Sharma', 'Patel', 'Kumar', 'Singh', 'Gupta'][Math.floor(Math.random() * 5)],
          diagnosis: bed.patient.condition,
        };
        bed.expectedDischarge = addDays(new Date(), Math.floor(Math.random() * 5) + 1);
        patientIndex++;
      } else if (bed.status === 'reserved') {
        bed.reservation = {
          patientName: 'Reserved Patient ' + Math.floor(Math.random() * 100),
          expectedArrival: addHours(new Date(), Math.floor(Math.random() * 24) + 1),
          reason: 'Scheduled Admission',
        };
      } else if (bed.status === 'discharge_pending' && patientIndex < mockPatients.length) {
        bed.patient = mockPatients[patientIndex];
        bed.expectedDischarge = addHours(new Date(), Math.floor(Math.random() * 8) + 1);
        patientIndex++;
      }
    });
  });

  return rooms;
};

// Mock housekeeping staff
export const housekeepingStaff = [
  { id: 'hk_001', name: 'Ramesh', shift: 'morning', assignedFloor: 'ground' },
  { id: 'hk_002', name: 'Sunita', shift: 'morning', assignedFloor: 'first' },
  { id: 'hk_003', name: 'Gopal', shift: 'afternoon', assignedFloor: 'second' },
  { id: 'hk_004', name: 'Meera', shift: 'afternoon', assignedFloor: 'third' },
  { id: 'hk_005', name: 'Raju', shift: 'night', assignedFloor: 'fourth' },
];

// Mock bed transfer history
export const mockTransferHistory = [
  { id: 'tr_001', patientName: 'Rajesh Kumar', fromBed: 'ER-01-A', toBed: 'ICU-02-A', reason: 'Critical care needed', transferredAt: subHours(new Date(), 12), approvedBy: 'Dr. Sharma' },
  { id: 'tr_002', patientName: 'Priya Sharma', fromBed: 'ICU-03-A', toBed: '1E-05-A', reason: 'Condition stabilized', transferredAt: subHours(new Date(), 24), approvedBy: 'Dr. Patel' },
  { id: 'tr_003', patientName: 'Amit Patel', fromBed: '2E-02-A', toBed: '2E-02-B', reason: 'Room preference', transferredAt: subHours(new Date(), 36), approvedBy: 'Dr. Kumar' },
];
