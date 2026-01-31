'use client'
import { Button } from '@/components/ui/button'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { ContentTopbar } from '../../(misc)/_components/ContentTopbar';
import { mockIPDPatients, mockOPDPatients } from './_misc/mockPatients';
import { useCallback, useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { calculateStats, filterPatients } from './_misc/utils';
import { IPD_STAGES, OPD_STAGES } from './_misc/types';
import { useToast } from '@/hooks/use-toast';
import { NewPatientDialog } from './_components/NewPatientDialog';
import { StatsCards } from './_components/StatsCards';
import { WorkflowFilters } from './_components/WorkflowFilters';
import { WorkflowTabs } from './_components/WorkflowTabs';
import { DragDropContext } from '@hello-pangea/dnd';
import { WorkflowColumn } from './_components/WorkflowColumn';
import { PatientDetailSheet } from './_components/PatientDetailSheet';


export default function IpdOpdPage() {
    const [activeTab, setActiveTab] = useState('opd');
    const [opdPatients, setOpdPatients] = useLocalStorage('hms_opd_patients', mockOPDPatients);
    const [ipdPatients, setIpdPatients] = useLocalStorage('hms_ipd_patients', mockIPDPatients);

    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [viewMode, setViewMode] = useState('grid');
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [selectedStageName, setSelectedStageName] = useState('');
    const [detailSheetOpen, setDetailSheetOpen] = useState(false);

    // Collapsed columns state
    const [collapsedColumns, setCollapsedColumns] = useState({});

    const handlePatientClick = (patient, stageName) => {
        setSelectedPatient(patient);
        setSelectedStageName(stageName);
        setDetailSheetOpen(true);
    };

    const handleToggleCollapse = (stageId) => {
        setCollapsedColumns(prev => ({
            ...prev,
            [stageId]: !prev[stageId]
        }));
    };

    const stats = calculateStats(opdPatients, ipdPatients);

    const currentPatients = activeTab === 'opd' ? opdPatients : ipdPatients;
    const currentStages = activeTab === 'opd' ? OPD_STAGES : IPD_STAGES;
    const setCurrentPatients = activeTab === 'opd' ? setOpdPatients : setIpdPatients;

    const opdCount = Object.values(opdPatients).flat().length;
    const ipdCount = Object.values(ipdPatients).flat().length;

    const getFilteredPatients = useCallback(
        (stagePatients) => {
            return filterPatients(stagePatients, searchQuery, statusFilter);
        },
        [searchQuery, statusFilter]
    );

    const handleDragEnd = (result) => {
        const { source, destination } = result;

        if (!destination) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        console.log('Drag end:', { source, destination });

        setCurrentPatients((prev) => {
            const newPatients = { ...prev };
            const sourcePatients = [...newPatients[source.droppableId]];
            const [movedPatient] = sourcePatients.splice(source.index, 1);

            movedPatient.stageEnteredAt = new Date();

            if (source.droppableId === destination.droppableId) {
                sourcePatients.splice(destination.index, 0, movedPatient);
                newPatients[source.droppableId] = sourcePatients;
            } else {
                const destPatients = [...newPatients[destination.droppableId]];
                destPatients.splice(destination.index, 0, movedPatient);
                newPatients[source.droppableId] = sourcePatients;
                newPatients[destination.droppableId] = destPatients;
            }

            return newPatients;
        });
    };

    const handleAddPatient = (patient, stageId) => {
        console.log('Adding workflow patient:', { patient, stageId });
        if (patient.workflowType === 'opd') {
            setOpdPatients((prev) => ({
                ...prev,
                [stageId]: [...prev[stageId], patient],
            }));
        } else {
            setIpdPatients((prev) => ({
                ...prev,
                [stageId]: [...prev[stageId], patient],
            }));
        }
    };

    const { toast } = useToast();

    const handleMoveToNextStage = (patient, currentStageId, nextStageId, nextStageName) => {
        console.log('Moving patient to next stage:', { patient, currentStageId, nextStageId });

        setCurrentPatients((prev) => {
            const newPatients = { ...prev };
            const sourcePatients = [...newPatients[currentStageId]];
            const patientIndex = sourcePatients.findIndex(p => p.id === patient.id);

            if (patientIndex === -1) return prev;

            const [movedPatient] = sourcePatients.splice(patientIndex, 1);
            movedPatient.stageEnteredAt = new Date();

            const destPatients = [...newPatients[nextStageId]];
            destPatients.push(movedPatient);

            newPatients[currentStageId] = sourcePatients;
            newPatients[nextStageId] = destPatients;

            return newPatients;
        });

        toast({
            title: 'Patient moved',
            description: `${patient.name} moved to ${nextStageName}`,
        });
    };


    return (
        <div className='absolute inset-0 flex flex-col gap-2 p-2'>

            <ContentTopbar
                title='Workflow Management'
                description='Track and manage patient journeys from admission to discharge. Comprehensive management of OPD consultations and IPD admissions'
                icon='workflow'



                actionComp={
                    <NewPatientDialog onAddPatient={handleAddPatient} workflowType={activeTab} />
                }
            />

            <div className='h-[85vh] flex flex-grow   rounded-md '>
                <div className='  rounded-md flex flex-col gap-2 animate-fade-in overflow-hidden' style={{ animationDelay: '0.1s' }} >
                    <div>
                        {/* Stats Cards */}
                        <StatsCards stats={stats} />
                    </div>
                    <ScrollArea className='h-[72vh] flex flex-grow relative overflow-hidden p-2'>
                        {/* Sticky Header Section */}
                        <div className="sticky top-0 z-20 bg-background border-b border-border">
                            <div className="p-6 space-y-4">


                                {/* Filters */}
                                <WorkflowFilters
                                    searchQuery={searchQuery}
                                    onSearchChange={setSearchQuery}
                                    typeFilter={typeFilter}
                                    onTypeFilterChange={setTypeFilter}
                                    statusFilter={statusFilter}
                                    onStatusFilterChange={setStatusFilter}
                                    viewMode={viewMode}
                                    onViewModeChange={setViewMode}
                                />

                                {/* Workflow Tabs */}
                                <WorkflowTabs
                                    activeTab={activeTab}
                                    onTabChange={setActiveTab}
                                    opdCount={opdCount}
                                    ipdCount={ipdCount}
                                />
                            </div>
                        </div>

                        {/* Kanban Board - Scrollable Content */}
                        <div className="flex-1 p-6 pt-4">
                            <DragDropContext onDragEnd={handleDragEnd}>
                                {viewMode === 'grid' ? (
                                    <div className="overflow-x-auto pb-4">
                                        <div className="flex gap-4" style={{ minWidth: 'max-content' }}>
                                            {currentStages.map((stage, index) => {
                                                const isLastStage = index === currentStages.length - 1;
                                                const nextStage = isLastStage ? null : currentStages[index + 1];
                                                return (
                                                    <WorkflowColumn
                                                        key={stage.id}
                                                        stage={stage}
                                                        patients={getFilteredPatients(currentPatients[stage.id] || [])}
                                                        index={index}
                                                        viewMode="grid"
                                                        onPatientClick={handlePatientClick}
                                                        isCollapsed={collapsedColumns[stage.id] || false}
                                                        onToggleCollapse={() => handleToggleCollapse(stage.id)}
                                                        nextStageName={nextStage?.name}
                                                        isLastStage={isLastStage}
                                                        onMoveToNextStage={(patient) => handleMoveToNextStage(patient, stage.id, nextStage?.id, nextStage?.name)}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4 pb-4">
                                        {currentStages.map((stage, index) => {
                                            const isLastStage = index === currentStages.length - 1;
                                            const nextStage = isLastStage ? null : currentStages[index + 1];
                                            return (
                                                <WorkflowColumn
                                                    key={stage.id}
                                                    stage={stage}
                                                    patients={getFilteredPatients(currentPatients[stage.id] || [])}
                                                    index={index}
                                                    viewMode="list"
                                                    onPatientClick={handlePatientClick}
                                                    isCollapsed={collapsedColumns[stage.id] || false}
                                                    onToggleCollapse={() => handleToggleCollapse(stage.id)}
                                                    nextStageName={nextStage?.name}
                                                    isLastStage={isLastStage}
                                                    onMoveToNextStage={(patient) => handleMoveToNextStage(patient, stage.id, nextStage?.id, nextStage?.name)}
                                                />
                                            );
                                        })}
                                    </div>
                                )}
                            </DragDropContext>
                        </div>

                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>

                </div>

                {/* Patient Detail Sheet */}
                <PatientDetailSheet
                    patient={selectedPatient}
                    open={detailSheetOpen}
                    onOpenChange={setDetailSheetOpen}
                    currentStage={selectedStageName}
                />

            </div>

        </div >
    )
}
