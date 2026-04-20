'use client'
import React, { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { ArrowUpDown, Eye, FilePenLine, MoreHorizontal, Pencil, Save, Trash2, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from '@/components/ui/scroll-area'
import { ContentTopbar } from '../../(misc)/_components/ContentTopbar'
import { mockPatients } from './utils/mockPatients'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { calculatePatientStats, filterPatients } from './utils/utils'
import { PatientStatsCards } from './components/PatientStatsCards'
import { PatientFilters } from './components/PatientFilters'
import { PatientList } from './components/PatientList'
import { PatientTableView } from './components/PatientTableView'
import { PatientDetailSheet } from './components/PatientDetailSheet'
import { NewPatientDialog } from './components/NewPatientDialog'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getPatients } from './_action/get-patients'
import { upsertpatient } from './_action/upsert-patient'
import { useParams } from 'next/navigation'
import { Loader } from 'lucide-react'



export default function PatientPage() {
    const { orgId } = useParams();
    const queryClient = useQueryClient();

    const { data: patientsData, isLoading } = useQuery({
        queryKey: ['patients', orgId],
        queryFn: async () => {
            const response = await getPatients({ serverId: orgId });
            return response.data?.patients || [];
        }
    });

    const patients = patientsData || [];
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [genderFilter, setGenderFilter] = useState('all');
    const [bloodGroupFilter, setBloodGroupFilter] = useState('all');
    const [tagFilter, setTagFilter] = useState([]);
    const [viewMode, setViewMode] = useState('list');
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [detailSheetOpen, setDetailSheetOpen] = useState(false);

    const stats = useMemo(() => calculatePatientStats(patients), [patients]);

    const filteredPatients = useMemo(() => {
        let result = filterPatients(patients, {
            search: searchQuery,
            status: statusFilter,
            gender: genderFilter,
            bloodGroup: bloodGroupFilter,
        });

        // Apply tag filter
        if (tagFilter.length > 0) {
            result = result.filter((patient) =>
                tagFilter.some((tagId) => patient.tags?.includes(tagId))
            );
        }

        return result;
    }, [patients, searchQuery, statusFilter, genderFilter, bloodGroupFilter, tagFilter]);

    const handlePatientClick = (patient) => {
        setSelectedPatient(patient);
        setDetailSheetOpen(true);
    };

    const handleAddPatient = async (newPatient) => {
        console.log('Adding patient:', newPatient);
        // The NewPatientDialog should ideally use the useAction hook, 
        // but for now we'll trigger a re-fetch after add.
        queryClient.invalidateQueries(['patients', orgId]);
    };

    const handleUpdatePatient = async (updatedPatient) => {
        console.log('Updating patient:', updatedPatient);
        queryClient.invalidateQueries(['patients', orgId]);
        setSelectedPatient(updatedPatient);
    };


    return (
        <div className='absolute inset-0 flex flex-col gap-2 p-2'>



            <ContentTopbar
                title='Patients'
                description='View, register, and manage all patient records'
                icon='accessibility'
                actionComp={<NewPatientDialog onAddPatient={handleAddPatient} />}
            />

            {/* Stats Cards */}
            <div className="shrink-0">
                <PatientStatsCards stats={stats} />
            </div>

            {/* Filters */}
            <div className="shrink-0">
                <PatientFilters
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    statusFilter={statusFilter}
                    onStatusFilterChange={setStatusFilter}
                    genderFilter={genderFilter}
                    onGenderFilterChange={setGenderFilter}
                    bloodGroupFilter={bloodGroupFilter}
                    onBloodGroupFilterChange={setBloodGroupFilter}
                    tagFilter={tagFilter}
                    onTagFilterChange={setTagFilter}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                />
            </div>

            <ScrollArea className='h-[85vh] w-full'>
                {/* Patient View */}
                <div className="flex-1 overflow-y-auto pb-4">
                    {isLoading ? (
                        <div className='flex items-center justify-center h-[200px]'>
                            <Loader className='animate-spin text-muted-foreground' />
                        </div>
                    ) : (
                        <>
                            {viewMode === 'list' && (
                                <PatientList
                                    patients={filteredPatients}
                                    onPatientClick={handlePatientClick}
                                />
                            )}
                            {viewMode === 'table' && (
                                <PatientTableView
                                    patients={filteredPatients}
                                    onPatientClick={handlePatientClick}
                                />
                            )}
                        </>
                    )}
                </div>

            </ScrollArea>


            {/* Patient Detail Sheet */}
            <PatientDetailSheet
                patient={selectedPatient}
                open={detailSheetOpen}
                onOpenChange={setDetailSheetOpen}
                onUpdatePatient={handleUpdatePatient}
            />

        </div>
    )
}


