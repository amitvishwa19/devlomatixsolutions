import React, { useState } from 'react'
import { useModal } from '@/hooks/useModal';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, } from "@/components/ui/accordion"
import AppointmentEditor from './AppointmentEditor';
import VitalSignsCard from '../../../patient/_component/patient-profile/VitalSignsCard';
import DemographicsCard from '../../../patient/_component/patient-profile/DemographicsCard';
import MedicalHistoryTab from '../../../patient/_component/patient-profile/MedicalHistoryTab';
import { ScrollArea } from '@/components/ui/scroll-area';
import MedicationsTab from '../../../patient/_component/patient-profile/MedicationsTab';
import AllergiesTab from '../../../patient/_component/patient-profile/AllergiesTab';
import VisitHistoryTab from '../../../patient/_component/patient-profile/VisitHistoryTab';
import DocumentsTab from '../../../patient/_component/patient-profile/DocumentsTab';
import { BookHeart, BookText, ClipboardPlus, Eye, Footprints, NotebookText, Pill, ReceiptText, TriangleAlert } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import NotesTab from '../../../patient/_component/patient-profile/NotesTab';
import PrescriptionTab from '../../../prescription/_components/PrescriptionTab';
import AppointmentDetails from './AppointmentDetails';
import InsuranceCard from '../../../patient/_component/patient-profile/InsuranceCard';
import { Tabs, TabsContent, TabsList, TabsTrigger, } from "@/components/ui/tabs"
import { DynamicIcon } from 'lucide-react/dynamic';

export default function ViewAppointment({ isOpen, onClose, mode, appointment }) {
    //const { isOpen, onClose, type: dtype, data } = useModal();
    //const isModalOpen = isOpen && dtype === "view-appointment";
    const [activeTab, setActiveTab] = useState('overview');



    const nav = [
        { id: 'overview', label: 'Overview', icon: 'eye' },
        { id: 'history', label: 'Medical History', icon: 'receipt-text' },
        { id: 'medications', label: 'Medications', icon: 'pill' },
        { id: 'allergies', label: 'Allergies', icon: 'triangle-alert' },
        { id: 'visits', label: 'Visit History', icon: 'footprints' },
        { id: 'documents', label: 'Documents', icon: 'clipboard-plus' },
        { id: 'notes', label: 'Notes', icon: 'notebook-text' },
        { id: 'prescription', label: 'Prescription', icon: 'book-heart' }
    ]

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="flex flex-col gap-4">
                        <VitalSignsCard />
                        <div className='flex flex-row justify-between w-full gap-4'>
                            <DemographicsCard />
                            <InsuranceCard />
                        </div>
                    </div>
                );
            case 'history':
                return <MedicalHistoryTab />;
            case 'medications':
                return <MedicationsTab />;
            case 'allergies':
                return <AllergiesTab />;
            case 'visits':
                return <VisitHistoryTab />;
            case 'documents':
                return <DocumentsTab />;
            case 'notes':
                return <NotesTab />;
            case 'prescription':
                return <PrescriptionTab />;
            default:
                return null;
        }
    };


    const handleOpenChange = () => {
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>

            <DialogContent className='min-w-[90%] min-h-[90%] max-h-[90%] p-0 overflow-hidden [&>button:last-child]:hidden'>

                <DialogHeader className={'hidden'}>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete your account
                        and remove your data from our servers.
                    </DialogDescription>
                </DialogHeader>


                <div className='p-2'>
                    <Tabs defaultValue={activeTab} className="w-full p-0" onValueChange={(e) => { setActiveTab(e) }}>
                        <TabsList className='flex flex-row justify-between p-0'>
                            {nav?.map((tab, index) => (
                                <TabsTrigger key={tab.id} value={tab.id} className='w-full flex flex-row gap-2'>
                                    <DynamicIcon name={tab.icon} size={18} />
                                    {tab.label}
                                </TabsTrigger>
                            ))}

                        </TabsList>
                    </Tabs>
                </div>

                <ScrollArea className='w-full h-[84vh] m-0'>
                    <div className='p-4'>
                        {renderTabContent()}
                    </div>
                </ScrollArea>
            </DialogContent >
        </Dialog >
    )
}
