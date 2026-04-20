'use client'

import { ScrollArea } from '@/components/ui/scroll-area'
import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { FilePlus, Eye, Pencil, Trash2, User, Stethoscope, RefreshCw, Plus, ShieldAlert, BarChart3, } from 'lucide-react';
import { ContentTopbar } from '../../(misc)/_components/ContentTopbar';
import { mockPrescriptions } from './utils/mockPrescriptions';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useToast } from '@/hooks/use-toast';
import { MOCK_REFILL_REQUESTS } from './utils/refillData';
import { calculateStats, filterPrescriptions } from './utils/utils';
import { Badge } from '@/components/ui/badge';
import { PrescriptionStatsCards } from './components/PrescriptionStatsCards';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PrescriptionFilters } from './components/PrescriptionFilters';
import { PrescriptionDetailSheet } from './components/PrescriptionDetailSheet';
import { NewPrescriptionDialog } from './components/NewPrescriptionDialog';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { getPrescriptions } from './_action/get-prescriptions';
import { upsertPrescription } from './_action/upsert-prescription';
import { deletePrescription } from './_action/delete-prescription';
import { useAction } from '@/hooks/use-action';
import { Loader } from 'lucide-react';

export default function PrescriptionPage() {
    const { orgId } = useParams();
    const queryClient = useQueryClient();

    const { data: prescriptionsData, isLoading } = useQuery({
        queryKey: ['prescriptions', orgId],
        queryFn: async () => {
            const response = await getPrescriptions({ serverId: orgId });
            return response.data?.prescriptions || [];
        }
    });

    const prescriptions = prescriptionsData || [];
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [doctor, setDoctor] = useState('all');
    const [viewMode, setViewMode] = useState('grid');
    const [selectedPrescription, setSelectedPrescription] = useState(null);
    const [showNewDialog, setShowNewDialog] = useState(false);

    // Advanced feature states
    const [showInteractionChecker, setShowInteractionChecker] = useState(false);
    const [showEPrescribing, setShowEPrescribing] = useState(false);
    const [showRefillManagement, setShowRefillManagement] = useState(false);
    const [activeTab, setActiveTab] = useState('prescriptions');

    const { toast } = useToast();

    // Pending refills count
    const pendingRefillsCount = MOCK_REFILL_REQUESTS.filter(r => r.status === 'pending').length;

    // Get unique doctors for filter
    const doctors = useMemo(() => {
        const uniqueDoctors = [...new Set(prescriptions.map(rx => rx.doctor))];
        return uniqueDoctors.sort();
    }, [prescriptions]);

    // Filter prescriptions
    const filteredPrescriptions = useMemo(() => {
        return filterPrescriptions(prescriptions, { search, status, doctor });
    }, [prescriptions, search, status, doctor]);

    // Calculate stats
    const stats = useMemo(() => {
        return calculateStats(prescriptions);
    }, [prescriptions]);

    const { execute: executeUpsert } = useAction(upsertPrescription, {
        onSuccess: () => queryClient.invalidateQueries(['prescriptions', orgId])
    });

    const { execute: executeDelete } = useAction(deletePrescription, {
        onSuccess: () => {
            queryClient.invalidateQueries(['prescriptions', orgId]);
            setSelectedPrescription(null);
            toast({ title: 'Prescription deleted', description: 'Prescription has been removed.' });
        }
    });

    const handleAddPrescription = (newPrescription) => {
        // executeUpsert(newPrescription);
        queryClient.invalidateQueries(['prescriptions', orgId]);
    };

    const handleDeletePrescription = (rxId) => {
        executeDelete({ id: rxId, serverId: orgId });
    };

    const handleStatusChange = (rxId, newStatus) => {
        const rx = prescriptions.find(r => r.id === rxId);
        if (rx) {
            executeUpsert({
                ...rx,
                status: newStatus,
                serverId: orgId,
                patientId: rx.patientId,
                doctorId: rx.doctorId,
                items: rx.items
            });
            toast({ title: 'Status updated', description: `Prescription marked as ${newStatus}.` });
        }
    };

    const handleUpdatePrescription = (rxId, updates) => {
        const rx = prescriptions.find(r => r.id === rxId);
        if (rx) {
            executeUpsert({
                ...rx,
                ...updates,
                serverId: orgId,
                patientId: rx.patientId,
                doctorId: rx.doctorId,
                items: rx.items
            });
        }
    };

    const handleSendToPharmacy = () => {
        if (selectedPrescription) {
            setShowEPrescribing(true);
        }
    };

    return (
        <div className='absolute inset-0 flex flex-col gap-2 p-2'>

            <ContentTopbar
                title='Prescription Management'
                description='Manage and track patient prescriptions'
                icon='clipboard-plus'
                actionComp={<div className="flex items-center gap-2">
                    {/* Advanced Feature Buttons */}
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => setShowInteractionChecker(true)}
                    >
                        <ShieldAlert className="w-4 h-4" />
                        Interaction Check
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 relative"
                        onClick={() => setShowRefillManagement(true)}
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refills
                        {pendingRefillsCount > 0 && (
                            <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-amber-500 text-white text-xs">
                                {pendingRefillsCount}
                            </Badge>
                        )}
                    </Button>
                    <Button onClick={() => setShowNewDialog(true)} className="gap-2">
                        <Plus className="w-4 h-4" />
                        New Prescription
                    </Button>
                </div>}
            />

            {/* Stats */}
            <PrescriptionStatsCards stats={stats} />

            {/* Filters */}
            <PrescriptionFilters
                search={search}
                onSearchChange={setSearch}
                status={status}
                onStatusChange={setStatus}
                doctor={doctor}
                onDoctorChange={setDoctor}
                doctors={doctors}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
            />



            <ScrollArea className='h-[85vh] flex flex-grow  rounded-md '>
                {isLoading ? (
                    <div className='flex items-center justify-center h-[200px]'>
                        <Loader className='animate-spin text-muted-foreground' />
                    </div>
                ) : (
                    <>
                        {viewMode === 'grid' ? (
                            <PrescriptionList
                                prescriptions={filteredPrescriptions}
                                onSelectPrescription={setSelectedPrescription}
                            />
                        ) : (
                            <PrescriptionTableView
                                prescriptions={filteredPrescriptions}
                                onSelectPrescription={setSelectedPrescription}
                                onDeletePrescription={handleDeletePrescription}
                            />
                        )}
                    </>
                )}
            </ScrollArea>

            <div>
                {/* Detail Sheet */}
                <PrescriptionDetailSheet
                    prescription={selectedPrescription}
                    open={!!selectedPrescription}
                    onOpenChange={(open) => !open && setSelectedPrescription(null)}
                    onDelete={handleDeletePrescription}
                    onStatusChange={handleStatusChange}
                    onSendToPharmacy={handleSendToPharmacy}
                    onCheckInteractions={() => setShowInteractionChecker(true)}
                />

                {/* New Prescription Dialog */}
                <NewPrescriptionDialog
                    open={showNewDialog}
                    onOpenChange={setShowNewDialog}
                    onSave={handleAddPrescription}
                    onCheckInteractions={() => setShowInteractionChecker(true)}
                />

                {/* Drug Interaction Checker */}
                <DrugInteractionChecker
                    open={showInteractionChecker}
                    onOpenChange={setShowInteractionChecker}
                    medicines={selectedPrescription?.medicines || []}
                    patientMedications={[]}
                />

                {/* E-Prescribing Sheet */}
                <EPrescribingSheet
                    open={showEPrescribing}
                    onOpenChange={setShowEPrescribing}
                    prescription={selectedPrescription}
                    onSend={(sent) => {
                        toast({ title: 'E-Prescription sent', description: `Sent to ${sent.pharmacy.name}` });
                    }}
                />

                {/* Refill Management Sheet */}
                <RefillManagementSheet
                    open={showRefillManagement}
                    onOpenChange={setShowRefillManagement}
                    prescriptions={prescriptions}
                    onUpdatePrescription={handleUpdatePrescription}
                />
            </div>

        </div >
    )
}
