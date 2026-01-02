'use client'
import { Button } from '@/components/ui/button'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Divide, User, Workflow } from 'lucide-react'
import { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { LayoutGrid, Columns3 } from 'lucide-react';
import { mockPatients } from './_hooks/mockPatients';
import { WorkflowStats } from './_components/workflow/WorkflowStats';
import { WorkflowFilters } from './_components/workflow/WorkflowFilters';
import { PatientCard } from './_components/workflow/PatientCard';
import { IPD_WORKFLOW_STEPS, OPD_WORKFLOW_STEPS } from './_hooks/types';
import { PatientDetailModal } from './_components/workflow/PatientDetailModal';
import { useFlow } from './_provider/flowProvider';
import { DraggableKanban } from './_components/workflow/DraggableKanban';
import { AddPatientModal } from './_components/workflow/AddPatientModal';

export default function IpdOpdPage() {
    const [mockpatients, setPatients] = useState(mockPatients);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [advancedFilters, setAdvancedFilters] = useState({});
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [viewMode, setViewMode] = useState('kanban');

    const { patients, doctors } = useFlow()

    console.log('allPatients', patients)

    const [addPatientModal, setAddPatientModal] = useState({
        isOpen: false,
        mode: 'add',
        patient: null
    })

    const filteredPatients = useMemo(() => {
        return mockpatients?.filter((patient) => {
            const matchesSearch =
                searchQuery === '' ||
                patient.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                patient.uuid.toLowerCase().includes(searchQuery.toLowerCase())
            //patient.assignedDoctor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            //patient.department?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesType = selectedType === 'all' || patient.workflowType === selectedType;
            const matchesStatus = selectedStatus === 'all' || patient.status === selectedStatus;

            // Advanced filters
            const matchesDoctor = !advancedFilters.doctor || patient.assignedDoctor === advancedFilters.doctor;
            const matchesDepartment = !advancedFilters.department || patient.department === advancedFilters.department;
            const matchesDateFrom = !advancedFilters.dateFrom || new Date(patient.admissionDate) >= advancedFilters.dateFrom;
            const matchesDateTo = !advancedFilters.dateTo || new Date(patient.admissionDate) <= advancedFilters.dateTo;
            const matchesAgeMin = !advancedFilters.ageMin || patient.age >= advancedFilters.ageMin;
            const matchesAgeMax = !advancedFilters.ageMax || patient.age <= advancedFilters.ageMax;

            return matchesSearch && matchesType && matchesStatus &&
                matchesDoctor && matchesDepartment && matchesDateFrom &&
                matchesDateTo && matchesAgeMin && matchesAgeMax;
        });
    }, [mockpatients, searchQuery, selectedType, selectedStatus, advancedFilters]);

    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => {
            setIsRefreshing(false);
            toast.success('Workflow data refreshed');
        }, 1000);
    };

    const handleMovePatient = (patientId, newStage) => {
        setPatients((prev) =>
            prev.map((patient) => {
                if (patient.id !== patientId) return patient;

                const now = new Date().toISOString();

                // Update the current stage history entry with completion time
                const updatedHistory = patient.stageHistory.map((h) => {
                    if (h.stage === patient.currentStage && !h.completedAt) {
                        return { ...h, completedAt: now, completedBy: 'Current User' };
                    }
                    return h;
                });

                // Add new stage entry
                updatedHistory.push({
                    stage: newStage,
                    enteredAt: now,
                });

                return {
                    ...patient,
                    currentStage: newStage,
                    stageHistory: updatedHistory,
                };
            })
        );
    };

    const handleAdvanceStage = (patientId) => {
        const patient = patients.find(p => p.id === patientId);
        if (!patient) return;

        const steps = patient.workflowType === 'OPD' ? OPD_WORKFLOW_STEPS : IPD_WORKFLOW_STEPS;
        const currentIndex = steps.findIndex((s) => s.id === patient.currentStage);
        if (currentIndex >= steps.length - 1) return;

        const nextStage = steps[currentIndex + 1].id;
        handleMovePatient(patientId, nextStage);
        toast.success(`Patient moved to ${steps[currentIndex + 1].name}`);
    };

    const handleViewDetails = (patient) => {
        setSelectedPatient(patient);
    };

    const handleViewPatientById = (patientId) => {
        const patient = patients.find(p => p.id === patientId);
        if (patient) setSelectedPatient(patient);
    };

    const handleAddPatient = (patient) => {
        //setPatients((prev) => [patient, ...prev]);
        toast.success(`Patient ${patient.name} added successfully`);
    };

    const handleUpdatePatient = (patientId, updates) => {
        setPatients((prev) =>
            prev.map((patient) =>
                patient.id === patientId ? { ...patient, ...updates } : patient
            )
        );
        // Also update the selected patient for immediate UI refresh
        setSelectedPatient((prev) =>
            prev?.id === patientId ? { ...prev, ...updates } : prev
        );
    };

    return (
        <div className='absolute inset-0 flex flex-col gap-2 p-2'>

            <div className='w-full dark:bg-darkSecondaryBackground  p-4 rounded-md border flex flex-row items-center justify-between'>
                <div>
                    <h2 className='text-xl'>
                        Workflow Management
                    </h2>
                    <h2 className='text-xs text-muted-foreground'>Track and manage patient journeys from admission to discharge. Comprehensive management of OPD consultations and IPD admissions </h2>
                </div>
                <div>
                    <Button variant={'save'} size={'sm'} className='' onClick={() => {

                        setAddPatientModal({
                            isOpen: true,
                            mode: 'add',
                            patient: null,
                        })
                    }}>
                        <Workflow />
                        Create Flow
                    </Button>
                </div>
            </div>

            <div className='dark:bg-darkSecondaryBackground bg-card rounded-md flex flex-col animate-fade-in overflow-hidden' style={{ animationDelay: '0.1s' }} >

                {/* Stats */}
                <div className="animate-fade-in p-2">
                    <WorkflowStats patients={patients} />
                </div>


                {/* Filters & View Toggle */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-2 animate-fade-in dark:bg-darkSecondaryBackground bg-card rounded-md" >
                    <WorkflowFilters
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        selectedType={selectedType}
                        onTypeChange={setSelectedType}
                        selectedStatus={selectedStatus}
                        onStatusChange={setSelectedStatus}
                    />
                    <div className="flex items-center gap-1 bg-muted p-[2px] rounded-md">
                        <button
                            onClick={() => setViewMode('cards')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'cards'
                                ? 'bg-card text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('kanban')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'kanban'
                                ? 'bg-card text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <Columns3 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <ScrollArea className='h-[72vh] flex flex-grow dark:bg-darkSecondaryBackground relative overflow-hidden p-2'>


                    {/* Content */}
                    {viewMode === 'cards' ? (
                        <section className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                            {filteredPatients.length === 0 ? (
                                <div className="text-center py-16">
                                    <p className="text-muted-foreground">No patients found matching your criteria</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {filteredPatients.map((patient, index) => (
                                        <div
                                            key={patient.id}
                                            className="animate-slide-up"
                                            style={{ animationDelay: `${index * 0.05}s` }}
                                        >
                                            <PatientCard
                                                patient={patient}
                                                onAdvanceStage={handleAdvanceStage}
                                                onViewDetails={handleViewDetails}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    ) : (
                        <section className="animate-fade-in " style={{ animationDelay: '0.2s' }}>
                            <Tabs defaultValue="OPD" className="w-full ">
                                <TabsList className="bg-muted">
                                    <TabsTrigger value="OPD">OPD Workflow</TabsTrigger>
                                    <TabsTrigger value="IPD">IPD Workflow</TabsTrigger>
                                </TabsList>
                                <TabsContent value="OPD" className=" h-full p-0">
                                    <DraggableKanban
                                        patients={filteredPatients}
                                        workflowType="OPD"
                                        onViewDetails={handleViewDetails}
                                        onMovePatient={handleMovePatient}
                                    />
                                </TabsContent>
                                <TabsContent value="IPD" className=" h-full p-0">
                                    <DraggableKanban
                                        patients={filteredPatients}
                                        workflowType="IPD"
                                        onViewDetails={handleViewDetails}
                                        onMovePatient={handleMovePatient}
                                    />
                                </TabsContent>
                            </Tabs>
                        </section>
                    )}
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </div>
            {/* Patient Detail Modal */}
            <PatientDetailModal
                patient={selectedPatient}
                open={!!selectedPatient}
                onClose={() => setSelectedPatient(null)}
                onAdvanceStage={handleAdvanceStage}
            />

            <AddPatientModal
                patients={patients}
                doctors={doctors}
                open={addPatientModal.isOpen}
                mode={addPatientModal.mode}
                onClose={() =>
                    setAddPatientModal({
                        isOpen: false,
                    })
                }
                onAddPatient={handleAddPatient}
                existingPatients={mockpatients}
            />


        </div>
    )
}
