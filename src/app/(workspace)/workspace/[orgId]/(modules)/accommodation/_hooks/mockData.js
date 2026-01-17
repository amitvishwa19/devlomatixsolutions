

const generatePatient = (id) => ({
    id,
    name: ['John Smith', 'Sarah Johnson', 'Michael Brown', 'Emily Davis', 'James Wilson', 'Maria Garcia', 'Robert Miller', 'Jennifer Taylor'][Math.floor(Math.random() * 8)],
    age: Math.floor(Math.random() * 60) + 20,
    gender: ['male', 'female', 'other'][Math.floor(Math.random() * 3)],
    contactNumber: `+1-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
    admissionDate: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString(),
    diagnosis: ['Cardiac Monitoring', 'Post-Surgery Recovery', 'Respiratory Infection', 'Fracture Treatment', 'General Checkup'][Math.floor(Math.random() * 5)],
});

const roomTypes = ['general', 'icu', 'private', 'semi-private', 'emergency', 'pediatric', 'maternity'];
const departments = ['Cardiology', 'Neurology', 'Orthopedics', 'General Medicine', 'Pediatrics', 'Oncology', 'Emergency'];

const generateBeds = (roomId, count, roomNumber) => {
    return Array.from({ length: count }, (_, i) => {
        const status = ['available', 'occupied', 'maintenance', 'reserved'][Math.floor(Math.random() * 4)];
        return {
            id: `bed-${roomId}-${i + 1}`,
            number: `${roomNumber}-B${i + 1}`,
            roomId,
            status,
            patient: status === 'occupied' ? generatePatient(`patient-${roomId}-${i + 1}`) : undefined,
            lastUpdated: new Date(Date.now() - Math.floor(Math.random() * 24 * 60 * 60 * 1000)).toISOString(),
        };
    });
};

export const generateRooms = () => {
    const rooms = [];

    for (let floor = 1; floor <= 4; floor++) {
        for (let room = 1; room <= 6; room++) {
            const roomNumber = `${floor}0${room}`;
            const roomId = `room-${roomNumber}`;
            const type = roomTypes[Math.floor(Math.random() * roomTypes.length)];
            const capacity = type === 'icu' ? 1 : type === 'private' ? 1 : type === 'semi-private' ? 2 : Math.floor(Math.random() * 4) + 2;

            rooms.push({
                id: roomId,
                number: roomNumber,
                floor,
                type,
                capacity,
                beds: generateBeds(roomId, capacity, roomNumber),
                department: departments[Math.floor(Math.random() * departments.length)],
                features: ['Oxygen Supply', 'Monitor', 'AC', 'Attached Bathroom', 'TV'].slice(0, Math.floor(Math.random() * 4) + 1),
            });
        }
    }

    return rooms;
};

export const initialRooms = generateRooms();
