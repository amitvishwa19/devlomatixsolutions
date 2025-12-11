'use client'
import React from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Clock, CheckCircle2, XCircle, Plus, Pill, } from 'lucide-react';
import { toast } from '@/hooks/useToast';
import { StatsCard } from './_components/StatsCard';
import { PrescriptionList } from './_components/PrescriptionList';
import { PrescriptionDetail } from './_components/PrescriptionDetai';
import { AddPrescriptionDialog } from './_components/AddPrescriptionDialog';
import { mockPrescriptions } from './data';







export default function PrescriptionPage() {
    const [prescriptions, setPrescriptions] = useState(mockPrescriptions);
    const [selectedPrescription, setSelectedPrescription] = useState(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [addDialogOpen, setAddDialogOpen] = useState(false);

    const stats = {
        total: prescriptions.length,
        pending: prescriptions.filter((p) => p.status === 'pending').length,
        dispensed: prescriptions.filter((p) => p.status === 'dispensed').length,
        cancelled: prescriptions.filter((p) => p.status === 'cancelled').length,
    };

    const handleViewPrescription = (prescription) => {
        setSelectedPrescription(prescription);
        setDetailOpen(true);
    };

    const handleStatusChange = (id) => {
        setPrescriptions((prev) =>
            prev.map((p) =>
                p.id === id
                    ? {
                        ...p,
                        status,
                        updatedAt: new Date(),
                        dispensedAt: status === 'dispensed' ? new Date() : p.dispensedAt,
                    }
                    : p
            )
        );
        setDetailOpen(false);
        toast({
            title: status === 'dispensed' ? 'Prescription Dispensed' : 'Prescription Cancelled',
            description: `Prescription has been marked as ${status}`,
        });
    };

    const handleAddPrescription = (newPrescription) => {
        const now = new Date();
        const prescription = {
            ...newPrescription,
            id: `${prescriptions.length + 1}`,
            prescriptionNumber: `RX-2024-${String(prescriptions.length + 1).padStart(3, '0')}`,
            createdAt: now,
            updatedAt: now,
        };
        setPrescriptions((prev) => [prescription, ...prev]);
        toast({
            title: 'Prescription Created',
            description: `${prescription.prescriptionNumber} has been created successfully`,
        });
    };


    return (
        <div className='absolute inset-0 flex flex-col gap-2 p-2'>

            <div className='w-full dark:bg-darkSecondaryBackground  p-4 rounded-lg border flex flex-row items-center justify-between'>
                <div>
                    <h2 className='text-xl'>Prescription Management</h2>
                    <h2 className='text-xs text-muted-foreground'>Digital Prescriptions: Doctors create Rx with dosage, frequency, duration, and instructions</h2>
                </div>
                <div>
                    <Button variant='outline' size='sm' onClick={() => setAddDialogOpen(true)}>
                        Add Prescription
                    </Button>
                </div>
            </div>

            <ScrollArea className='h-[85vh] flex flex-grow dark:bg-darkSecondaryBackground p-2 rounded-md pr-4'>

                <main className="">
                    {/* Stats Section */}
                    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <StatsCard
                            title="Total Prescriptions"
                            value={stats.total}
                            description="All time"
                            icon={FileText}
                            iconClassName="bg-primary/10 text-primary"
                        />
                        <StatsCard
                            title="Pending"
                            value={stats.pending}
                            description="Awaiting dispensing"
                            icon={Clock}
                            iconClassName="bg-warning/10 text-warning"
                        />
                        <StatsCard
                            title="Dispensed"
                            value={stats.dispensed}
                            description="Completed"
                            icon={CheckCircle2}
                            iconClassName="bg-success/10 text-success"
                        />
                        <StatsCard
                            title="Cancelled"
                            value={stats.cancelled}
                            description="Void prescriptions"
                            icon={XCircle}
                            iconClassName="bg-destructive/10 text-destructive"
                        />
                    </section>

                    {/* Prescriptions List */}
                    <section className="space-y-4">

                        <PrescriptionList
                            prescriptions={prescriptions}
                            onView={handleViewPrescription}
                        />
                    </section>
                </main>
                {/* Prescription Detail Dialog */}
                <PrescriptionDetail
                    prescription={selectedPrescription}
                    open={detailOpen}
                    onOpenChange={setDetailOpen}
                    onStatusChange={handleStatusChange}
                />

                {/* Add Prescription Dialog */}
                <AddPrescriptionDialog
                    open={addDialogOpen}
                    onOpenChange={setAddDialogOpen}
                    onAdd={handleAddPrescription}
                />

            </ScrollArea>

        </div >
    )
}
