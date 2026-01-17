import React from 'react'
import { useHospitalData } from '../../_hooks/useHospitalData';
import { StatCard } from '../dashboard/StatCard';
import { BedDouble, DoorOpen, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Dashboard() {
    const { rooms, allBeds, stats, lastUpdate, assignPatientToBed, dischargeBed, addRoom, addBed } = useHospitalData();
    const floors = [1, 2, 3, 4]
    return (
        <div className='flex flex-col gap-2'>


            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">

                <StatCard
                    title="Total Rooms"
                    value={stats.totalRooms}
                    icon={DoorOpen}
                    variant="default"
                />

                <StatCard
                    title="Total Beds"
                    value={stats?.totalBeds}
                    icon={BedDouble}
                    variant="default"
                    subtitle={`Across ${stats?.totalRooms} rooms`}
                />

                <StatCard
                    title="Available Beds"
                    value={stats.availableBeds}
                    icon={BedDouble}
                    variant="default"
                    trend={{ value: 5, positive: true }}
                />
                <StatCard
                    title="Occupied Beds"
                    value={stats.occupiedBeds}
                    icon={Users}
                    variant="default"
                    subtitle={`${stats.occupancyRate}% occupancy rate`}
                />

            </div>

            {/* Live Status */}
            <div className="space-y-6">

                {/* Quick Stats */}
                <div className="flex flex-wrap gap-4 p-4 bg-card rounded-lg border border-border">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-sm font-medium">{stats.availableBeds} Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-orange-500" />
                        <span className="text-sm font-medium">{stats.occupiedBeds} Occupied</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-blue-500" />
                        <span className="text-sm font-medium">{stats.reservedBeds} Reserved</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-yellow-500" />
                        <span className="text-sm font-medium">{stats.maintenanceBeds} Maintenance</span>
                    </div>
                </div>

                {/* Floor-wise View */}
                {/* <div className="space-y-6">
                    {floors?.map((floor, index) => {
                        const floorRooms = rooms.filter((r) => r.floor === floor);
                        if (floorRooms.length === 0) return null;


                        return (
                            <div key={index} className="animate-fade-in" style={{ animationDelay: `${floor * 100}ms` }}>
                                <h3 className="text-lg font-semibold text-foreground mb-3">Floor {floor}</h3>

                                <div className="bg-card rounded-2xl border border-border p-2 shadow-card">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                                        {floorRooms.map((room) => (
                                            <div
                                                key={room.id}
                                                className="p-3 rounded-xl border border-border bg-muted/30"
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-medium text-sm text-foreground">
                                                        {room.number}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground capitalize">
                                                        {room.type.replace('-', ' ')}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-2 gap-1.5">
                                                    {room.beds.map((bed) => (
                                                        <div
                                                            key={bed.id}
                                                            className={cn(
                                                                "p-1.5 rounded text-center text-xs font-medium",
                                                                bed.status === 'available' && "bg-green-500/50 text-status-available",
                                                                bed.status === 'occupied' && "bg-orange-500/50 text-status-occupied",
                                                                bed.status === 'reserved' && "bg-blue-500/50 text-status-reserved",
                                                                bed.status === 'maintenance' && "bg-yellow-500/50 text-status-maintenance"
                                                            )}
                                                        >
                                                            {bed.number}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div> */}

                {/* Floor-wise View */}
                <div className="space-y-8">
                    {[1, 2, 3, 4].map((floor) => {
                        const floorRooms = rooms.filter((r) => r.floor === floor);

                        return (
                            <div key={floor} className="animate-fade-in" style={{ animationDelay: `${floor * 100}ms` }}>
                                <h3 className="text-xl font-semibold text-foreground mb-4">Floor {floor}</h3>

                                <div className="bg-card rounded-2xl border border-border p-2 shadow-card overflow-x-auto">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 min-w-max sm:min-w-0">
                                        {floorRooms.map((room) => (
                                            <div
                                                key={room.id}
                                                className="p-4 rounded-xl border border-border bg-muted/30"
                                            >
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="font-semibold text-foreground">
                                                        Room {room.number}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground capitalize">
                                                        {room.type.replace('-', ' ')}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-2 gap-2">
                                                    {room.beds.map((bed) => (
                                                        <div
                                                            key={bed.id}
                                                            className={cn(
                                                                "relative p-2 rounded-md text-center text-xs font-medium transition-all",
                                                                bed.status === 'available' && "bg-green-500/20 text-status-available border border-green-500/30",
                                                                bed.status === 'occupied' && "bg-orange-500/20 text-status-occupied border border-orange-500/30",
                                                                bed.status === 'reserved' && "bg-blue-500/20 text-status-reserved border border-blue-500/30",
                                                                bed.status === 'maintenance' && "bg-yellow-500/20 text-status-maintenance border border-yellow-500/30"
                                                            )}
                                                            title={bed.patient?.name || bed.status}
                                                        >
                                                            {bed.number.split('-').pop()}
                                                            {bed.status === 'available' && (
                                                                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-lg bg-green-500 animate-pulse" />
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

        </div>
    )
}
