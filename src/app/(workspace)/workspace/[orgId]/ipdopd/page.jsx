'use client'
import { Button } from '@/components/ui/button'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { User } from 'lucide-react'
import { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { LayoutGrid, Columns3 } from 'lucide-react';
import { mockPatients } from './_hooks/mockPatients';
import { WorkflowStats } from './_components/workflow/WorkflowStats';
import { WorkflowFilters } from './_components/workflow/WorkflowFilters';
import { PatientCard } from './_components/workflow/PatientCard';
import { IPD_WORKFLOW_STEPS, OPD_WORKFLOW_STEPS } from './_hooks/types';
import { WorkflowKanban } from './_components/workflow/WorkflowKanban';
import { PatientDetailModal } from './_components/workflow/PatientDetailModal';

export default function IpdOpdPage() {
    const [patients, setPatients] = useState(mockPatients);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [viewMode, setViewMode] = useState('cards');

    const [addPatientModal, setAddPatientModal] = useState({
        isOpen: false,
        mode: 'add',
        patient: null
    })

    const filteredPatients = useMemo(() => {
        return patients.filter((patient) => {
            const matchesSearch =
                searchQuery === '' ||
                patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                patient.mrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
                patient.assignedDoctor?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesType = selectedType === 'all' || patient.workflowType === selectedType;
            const matchesStatus = selectedStatus === 'all' || patient.status === selectedStatus;

            return matchesSearch && matchesType && matchesStatus;
        });
    }, [patients, searchQuery, selectedType, selectedStatus]);

    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => {
            setIsRefreshing(false);
            toast.success('Workflow data refreshed');
        }, 1000);
    };

    const handleAdvanceStage = (patientId) => {
        setPatients((prev) =>
            prev.map((patient) => {
                if (patient.id !== patientId) return patient;

                const steps = patient.workflowType === 'OPD' ? OPD_WORKFLOW_STEPS : IPD_WORKFLOW_STEPS;
                const currentIndex = steps.findIndex((s) => s.id === patient.currentStage);

                if (currentIndex >= steps.length - 1) return patient;

                const nextStage = steps[currentIndex + 1].id;
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
                    stage: nextStage,
                    enteredAt: now,
                });

                toast.success(`Patient moved to ${steps[currentIndex + 1].name}`);

                return {
                    ...patient,
                    currentStage: nextStage,
                    stageHistory: updatedHistory,
                };
            })
        );
    };

    const handleViewDetails = (patient) => {
        setSelectedPatient(patient);
    };

    return (
        <div className='absolute inset-0 flex flex-col gap-2 p-2'>

            <div className='w-full dark:bg-darkSecondaryBackground  p-4 rounded-md border flex flex-row items-center justify-between'>
                <div>
                    <h2 className='text-xl'>
                        Ipd -Opd
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
                        <User />
                        Add New Patient
                    </Button>
                </div>
            </div>

            <ScrollArea className='h-[85vh] flex flex-grow dark:bg-darkSecondaryBackground rounded-md p-2'>
                <div className='flex flex-col gap-4'>

                    {/* Stats */}
                    <section className="animate-fade-in">
                        <WorkflowStats patients={patients} />
                    </section>

                    {/* Filters & View Toggle */}
                    <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 animate-fade-in pr-2" style={{ animationDelay: '0.1s' }}>
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
                    </section>

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
                        <section className="space-y-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                            <Tabs defaultValue="OPD" className="w-full">
                                <TabsList className="bg-muted">
                                    <TabsTrigger value="OPD">OPD Workflow</TabsTrigger>
                                    <TabsTrigger value="IPD">IPD Workflow</TabsTrigger>
                                </TabsList>
                                <TabsContent value="OPD" className="mt-4">
                                    <WorkflowKanban
                                        patients={filteredPatients}
                                        workflowType="OPD"
                                        onViewDetails={handleViewDetails}
                                    />
                                </TabsContent>
                                <TabsContent value="IPD" className="mt-4">
                                    <WorkflowKanban
                                        patients={filteredPatients}
                                        workflowType="IPD"
                                        onViewDetails={handleViewDetails}
                                    />
                                </TabsContent>
                            </Tabs>
                        </section>
                    )}
                </div>
                {/* Patient Detail Modal */}
                <PatientDetailModal
                    patient={selectedPatient}
                    open={!!selectedPatient}
                    onClose={() => setSelectedPatient(null)}
                    onAdvanceStage={handleAdvanceStage}
                />
            </ScrollArea>


        </div>
    )
}
