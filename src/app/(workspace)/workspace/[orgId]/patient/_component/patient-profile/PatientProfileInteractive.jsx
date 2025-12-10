'use client';

import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';
import PatientHeader from './PatientHeader';
import DemographicsCard from './DemographicsCard';
import InsuranceCard from './InsuranceCard';
import VitalSignsCard from './VitalSignsCard';
import MedicalHistoryTab from './MedicalHistoryTab';
import MedicationsTab from './MedicationsTab';
import AllergiesTab from './AllergiesTab';
import VisitHistoryTab from './VisitHistoryTab';
import DocumentsTab from './DocumentsTab';
import { Tabs, TabsContent, TabsList, TabsTrigger, } from "@/components/ui/tabs"

export default function PatientProfileInteractive({ patientData, patient }) {
    const [activeTab, setActiveTab] = useState('overview');

    const tabs = [
        { id: 'overview', label: 'Overview', icon: 'HomeIcon' },
        { id: 'history', label: 'Medical History', icon: 'ClipboardDocumentListIcon' },
        { id: 'medications', label: 'Medications', icon: 'BeakerIcon' },
        { id: 'allergies', label: 'Allergies', icon: 'ExclamationTriangleIcon' },
        { id: 'visits', label: 'Visit History', icon: 'ClockIcon' },
        { id: 'documents', label: 'Documents', icon: 'DocumentIcon' }
    ];

    const handleQuickAction = (actionId) => {
        console.log('Quick action triggered:', actionId);
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="space-y-2">

                        <VitalSignsCard vitals={patientData?.vitals} />
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <DemographicsCard demographics={patientData?.demographics} />
                            <InsuranceCard insurance={patientData?.insurance} />
                        </div>

                    </div>
                );
            case 'history':
                return <MedicalHistoryTab history={patientData?.medicalHistory} />;
            case 'medications':
                return <MedicationsTab medications={patientData?.medications} />;
            case 'allergies':
                return <AllergiesTab allergies={patientData?.allergies} />;
            case 'visits':
                return <VisitHistoryTab visits={patientData?.visitHistory} />;
            case 'documents':
                return <DocumentsTab documents={patientData?.documents} />;
            default:
                return null;
        }
    };

    useEffect(() => {
        console.log('@active tab', activeTab)
    }, [activeTab])

    return (
        <div className="space-y-6">

            <Tabs defaultValue={activeTab} className='w-full flex flex-col gap-4' onValueChange={(e) => { setActiveTab(e) }}>
                <TabsList className='flex w-full justify-between rounded-md'>
                    {
                        tabs.map((tab) => {
                            return (
                                <TabsTrigger key={tab.id} value={tab.id} className='w-full rounded-md'>{tab.label}</TabsTrigger>
                            )
                        })
                    }

                </TabsList>
                <div>
                    {renderTabContent()}
                </div>
            </Tabs>
        </div>
    );
}

