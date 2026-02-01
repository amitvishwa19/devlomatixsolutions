import { addDays, subDays, addHours, subHours } from 'date-fns';

// Generate rooms with beds
export const generateMockRooms = () => {
  const rooms = [];
  const roomConfigs = [
    { floor: 'ground', wing: 'central', type: 'icu', prefix: 'ICU', count: 4, bedsPerRoom: 1 },
    { floor: 'ground', wing: 'east', type: 'emergency', prefix: 'ER', count: 4, bedsPerRoom: 1 },
    { floor: 'first', wing: 'east', type: 'private', prefix: '1E', count: 6, bedsPerRoom: 1 },
    { floor: 'second', wing: 'east', type: 'semi_private', prefix: '2E', count: 4, bedsPerRoom: 2 },
    { floor: 'third', wing: 'east', type: 'general_ward', prefix: '3E', count: 3, bedsPerRoom: 4 },
  ];

  let roomId = 1;
  let bedId = 1;

  roomConfigs.forEach(config => {
    for (let i = 1; i <= config.count; i++) {
      const roomNumber = `${config.prefix}-${String(i).padStart(2, '0')}`;
      const beds = [];

      for (let b = 1; b <= config.bedsPerRoom; b++) {
        const bedLetter = String.fromCharCode(64 + b);
        beds.push({
          id: `bed_${bedId}`,
          bedNumber: `${roomNumber}-${bedLetter}`,
          status: getRandomBedStatus(),
          features: getRandomFeatures(config.type),
          housekeeping: 'clean',
          patient: null,
          admission: null,
          expectedDischarge: null,
          lastCleaned: subHours(new Date(), Math.floor(Math.random() * 24)),
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
        isActive: true,
      });
      roomId++;
    }
  });

  return rooms;
};

const getRandomBedStatus = () => {
  const rand = Math.random();
  if (rand < 0.5) return 'occupied';
  if (rand < 0.8) return 'available';
  if (rand < 0.9) return 'reserved';
  return 'cleaning';
};

const getRandomFeatures = (roomType) => {
  const baseFeatures = ['iv_stand', 'call_bell'];
  const typeFeatures = {
    icu: ['electric', 'oxygen', 'monitor', 'ventilator'],
    emergency: ['oxygen', 'monitor'],
    private: ['electric', 'bathroom', 'tv', 'ac'],
    semi_private: ['electric', 'bathroom', 'tv'],
    general_ward: ['electric'],
  };
  return [...baseFeatures, ...(typeFeatures[roomType] || [])];
};

const getRoomRate = (roomType) => {
  const rates = {
    icu: 15000,
    emergency: 5000,
    private: 6000,
    semi_private: 3500,
    general_ward: 1500,
  };
  return rates[roomType] || 2000;
};

// Mock patients
export const mockPatients = [
  { id: 'pat_001', name: 'Rajesh Kumar', age: 45, gender: 'M', mrn: 'MRN-2024-001', phone: '+91 98765 43210', condition: 'Post-Surgery Recovery' },
  { id: 'pat_002', name: 'Priya Sharma', age: 32, gender: 'F', mrn: 'MRN-2024-002', phone: '+91 98765 43211', condition: 'Pneumonia' },
  { id: 'pat_003', name: 'Amit Patel', age: 58, gender: 'M', mrn: 'MRN-2024-003', phone: '+91 98765 43212', condition: 'Cardiac Monitoring' },
  { id: 'pat_004', name: 'Sunita Devi', age: 67, gender: 'F', mrn: 'MRN-2024-004', phone: '+91 98765 43213', condition: 'Hip Replacement' },
  { id: 'pat_005', name: 'Arun Mehta', age: 29, gender: 'M', mrn: 'MRN-2024-005', phone: '+91 98765 43214', condition: 'Appendectomy' },
];

// Generate initial data with patients
export const generateInitialData = () => {
  const rooms = generateMockRooms();
  let patientIndex = 0;

  rooms.forEach(room => {
    room.beds.forEach(bed => {
      if (bed.status === 'occupied' && patientIndex < mockPatients.length) {
        bed.patient = mockPatients[patientIndex];
        bed.admission = {
          id: `adm_${patientIndex + 1}`,
          type: 'elective',
          admittedAt: subDays(new Date(), Math.floor(Math.random() * 5) + 1),
          admittedBy: 'Dr. Sharma',
          diagnosis: bed.patient.condition,
        };
        bed.expectedDischarge = addDays(new Date(), Math.floor(Math.random() * 3) + 1);
        patientIndex++;
      }
    });
  });

  return rooms;
};

// Waitlist mock
export const generateMockWaitlist = () => [
  { id: 'wl_1', patientName: 'Ramesh Gupta', patientPhone: '+91 98765 43220', preferredRoomType: 'icu', priority: 'critical', reason: 'Post-surgery ICU monitoring', addedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), status: 'waiting' },
  { id: 'wl_2', patientName: 'Suman Verma', patientPhone: '+91 98765 43221', preferredRoomType: 'private', priority: 'normal', reason: 'Elective surgery', addedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), status: 'waiting' },
];

// Reservations mock
export const generateMockReservations = () => [
  { id: 'res_1', patientName: 'Anil Kumar', patientPhone: '+91 98765 43230', roomType: 'private', expectedArrival: new Date(Date.now() + 24 * 60 * 60 * 1000), diagnosis: 'Knee replacement', doctor: 'Patel', depositAmount: 50000, depositPaid: true, status: 'confirmed', createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000) },
];

// Mock housekeeping staff (used by HousekeepingPanel)
export const housekeepingStaff = [
  { id: 'hk_001', name: 'Ramesh', shift: 'morning', assignedFloor: 'ground' },
  { id: 'hk_002', name: 'Sunita', shift: 'morning', assignedFloor: 'first' },
  { id: 'hk_003', name: 'Gopal', shift: 'afternoon', assignedFloor: 'second' },
  { id: 'hk_004', name: 'Meera', shift: 'afternoon', assignedFloor: 'third' },
  { id: 'hk_005', name: 'Raju', shift: 'night', assignedFloor: 'third' },
];
