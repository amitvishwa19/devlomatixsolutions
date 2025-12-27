import { useState, useEffect, useCallback, useMemo } from 'react';
import { initialRooms } from './mockData';


export const useHospitalData = () => {
    const [rooms, setRooms] = useState(initialRooms);
    const [lastUpdate, setLastUpdate] = useState(new Date());

    // Simulate real-time updates
    useEffect(() => {
        const interval = setInterval(() => {
            setRooms(prevRooms => {
                const newRooms = [...prevRooms];
                const randomRoomIndex = Math.floor(Math.random() * newRooms.length);
                const randomRoom = { ...newRooms[randomRoomIndex] };

                if (randomRoom.beds.length > 0) {
                    const randomBedIndex = Math.floor(Math.random() * randomRoom.beds.length);
                    const randomBed = { ...randomRoom.beds[randomBedIndex] };

                    if (Math.random() > 0.7) {
                        randomBed.lastUpdated = new Date().toISOString();
                        randomRoom.beds[randomBedIndex] = randomBed;
                        newRooms[randomRoomIndex] = randomRoom;
                    }
                }

                return newRooms;
            });
            setLastUpdate(new Date());
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    const allBeds = useMemo(() => {
        return rooms.flatMap(room =>
            room.beds.map(bed => ({ ...bed, roomNumber: room.number, roomType: room.type, department: room.department }))
        );
    }, [rooms]);

    const stats = useMemo(() => {
        const beds = allBeds;
        const totalBeds = beds.length;
        const availableBeds = beds.filter(b => b.status === 'available').length;
        const occupiedBeds = beds.filter(b => b.status === 'occupied').length;
        const maintenanceBeds = beds.filter(b => b.status === 'maintenance').length;
        const reservedBeds = beds.filter(b => b.status === 'reserved').length;

        return {
            totalBeds,
            availableBeds,
            occupiedBeds,
            maintenanceBeds,
            reservedBeds,
            totalRooms: rooms.length,
            occupancyRate: totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0,
        };
    }, [allBeds, rooms]);

    const updateBedStatus = useCallback((bedId, status, patient) => {
        setRooms(prevRooms => {
            return prevRooms.map(room => ({
                ...room,
                beds: room.beds.map(bed => {
                    if (bed.id === bedId) {
                        return {
                            ...bed,
                            status,
                            patient: status === 'occupied' ? patient : undefined,
                            lastUpdated: new Date().toISOString(),
                        };
                    }
                    return bed;
                }),
            }));
        });
        setLastUpdate(new Date());
    }, []);

    const assignPatientToBed = useCallback((bedId, patient) => {
        updateBedStatus(bedId, 'occupied', patient);
    }, [updateBedStatus]);

    const dischargeBed = useCallback((bedId) => {
        updateBedStatus(bedId, 'available');
    }, [updateBedStatus]);

    const getBedsByRoom = useCallback((roomId) => {
        const room = rooms.find(r => r.id === roomId);
        return room?.beds || [];
    }, [rooms]);

    const getBedsByStatus = useCallback((status) => {
        return allBeds.filter(bed => bed.status === status);
    }, [allBeds]);

    const addRoom = useCallback((roomData) => {
        const roomId = `room-${roomData.number}-${Date.now()}`;

        // Generate beds based on capacity
        const beds = Array.from({ length: roomData.capacity }, (_, i) => ({
            id: `bed-${roomId}-${i + 1}`,
            number: `${roomData.number}-B${i + 1}`,
            roomId,
            status: 'available',
            lastUpdated: new Date().toISOString(),
        }));

        const newRoom = {
            id: roomId,
            number: roomData.number,
            floor: roomData.floor,
            type: roomData.type,
            capacity: roomData.capacity,
            beds,
            department: roomData.department,
            features: roomData.features,
        };

        setRooms(prevRooms => [...prevRooms, newRoom]);
        setLastUpdate(new Date());

        return newRoom;
    }, []);

    const addBed = useCallback((bedData) => {
        const newBed = {
            id: `bed-${bedData.roomId}-${Date.now()}`,
            number: bedData.number,
            roomId: bedData.roomId,
            status: bedData.status,
            lastUpdated: new Date().toISOString(),
        };

        setRooms(prevRooms => {
            return prevRooms.map(room => {
                if (room.id === bedData.roomId) {
                    return {
                        ...room,
                        beds: [...room.beds, newBed],
                        capacity: room.capacity + 1,
                    };
                }
                return room;
            });
        });
        setLastUpdate(new Date());

        return newBed;
    }, []);

    return {
        rooms,
        allBeds,
        stats,
        lastUpdate,
        updateBedStatus,
        assignPatientToBed,
        dischargeBed,
        getBedsByRoom,
        getBedsByStatus,
        addRoom,
        addBed,
    };
};
