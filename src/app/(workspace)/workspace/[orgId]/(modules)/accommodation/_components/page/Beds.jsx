import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Bed, Plus, Search } from 'lucide-react'
import React, { useMemo, useState } from 'react'
import { StatusFilter } from '../shared/StatusFilter'
import { useHospitalData } from '../../_hooks/useHospitalData'
import { BedCard } from '../beds/BedCard'
import { CreateBedDialog } from '../beds/CreateBedDialog'
import { AssignPatientDialog } from '../beds/AssignPatientDialog'
import { toast } from 'sonner'

export default function Beds() {
    const { rooms, allBeds, stats, lastUpdate, assignPatientToBed, dischargeBed, addRoom, addBed } = useHospitalData()

    // Beds state
    const [bedStatusFilter, setBedStatusFilter] = useState('all');
    const [bedSearchQuery, setBedSearchQuery] = useState('');
    const [selectedBed, setSelectedBed] = useState(null);
    const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
    const [isCreateBedDialogOpen, setIsCreateBedDialogOpen] = useState(false);


    // Filtered data
    const filteredBeds = useMemo(() => {
        return allBeds.filter((bed) => {
            const matchesStatus = bedStatusFilter === 'all' || bed.status === bedStatusFilter;
            const matchesSearch =
                bed.number.toLowerCase().includes(bedSearchQuery.toLowerCase()) ||
                bed.roomNumber.toLowerCase().includes(bedSearchQuery.toLowerCase()) ||
                bed.department.toLowerCase().includes(bedSearchQuery.toLowerCase()) ||
                (bed.patient?.name.toLowerCase().includes(bedSearchQuery.toLowerCase()));

            return matchesStatus && matchesSearch;
        });
    }, [allBeds, bedStatusFilter, bedSearchQuery]);

    // Handlers
    const handleAssign = (bed) => {
        setSelectedBed(bed);
        setIsAssignDialogOpen(true);
    };

    const handleDischarge = (bedId) => {
        dischargeBed(bedId);
        toast.success('Patient Discharged, The bed is now available for new patients.');
    };

    const handleAssignPatient = (bedId, patient) => {
        assignPatientToBed(bedId, patient);
        toast.success(`Patient Assigned, ${patient.name} has been assigned to the bed successfully.`);
    };

    const handleCreateBed = (data) => {
        addBed(data);
        toast.success({
            title: "Bed Created",
            description: `Bed ${data.number} has been added successfully.`,
        });
    };

    return (
        <div className='flex flex-col gap-4 p-2' >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative flex-1 ">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search beds, rooms, or patients..."
                        value={bedSearchQuery}
                        onChange={(e) => setBedSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Button onClick={() => setIsCreateBedDialogOpen(true)} variant='save' className="">
                    <Bed className="h-4 w-4 mr-2" />
                    Add Bed
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">

                <StatusFilter selectedStatus={bedStatusFilter} onStatusChange={setBedStatusFilter} />
            </div>

            {/* Results count */}
            <p className="text-sm text-muted-foreground">
                Showing {filteredBeds.length} of {allBeds.length} beds
            </p>

            {/* Beds Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredBeds.map((bed) => (
                    <BedCard
                        key={bed.id}
                        bed={bed}
                        onAssign={handleAssign}
                        onDischarge={handleDischarge}
                    />
                ))}
            </div>

            {filteredBeds.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">No beds found matching your criteria.</p>
                </div>
            )}

            <AssignPatientDialog
                bed={selectedBed}
                open={isAssignDialogOpen}
                onOpenChange={setIsAssignDialogOpen}
                onAssign={handleAssignPatient}
            />

            <CreateBedDialog
                open={isCreateBedDialogOpen}
                onOpenChange={setIsCreateBedDialogOpen}
                onCreateBed={handleCreateBed}
                rooms={rooms}
            />
        </div>
    )
}
