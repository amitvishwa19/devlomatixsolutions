'use client'
import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import { Settings } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SettingsSearch } from './_components/SettingsSearch';
import { SettingsSidebar } from './_components/SettingsSidebar';
import { GeneralSettings } from './_components/sections/GeneralSettings';
import { DepartmentSettings } from './_components/sections/DepartmentSettings';
import { StaffSettings } from './_components/sections/StaffSettings';
import { PatientSettings } from './_components/sections/PatientSettings';
import { AppointmentSettings } from './_components/sections/AppointmentSettings';
import { PharmacySettings } from './_components/sections/PharmacySettings';
import { NotificationSettings } from './_components/sections/NotificationSettings';
import { SecuritySettings } from './_components/sections/SecuritySettings';
import { BillingSettings } from './_components/sections/BillingSettings';
import { IntegrationSettings } from './_components/sections/IntegrationSettings';
import { InvoiceSettings } from './_components/sections/InvoiceSettings';
import { InventorySettings } from './_components/sections/InventorySettings';
import { ServicesSettings } from './_components/sections/ServicesSettings';
import { PrescriptionSettings } from './_components/sections/PrescriptionSettings';





// const settingItems = [

//     {
//         title: 'General',
//         value: 'general',
//         icon: 'settings',
//         description: 'Manage organization details, structure, and preferences.',
//         component: <Organization />
//     },
//     {
//         title: 'Timings',
//         value: 'timings',
//         icon: 'clipboard-clock',
//         description: 'Add, remove, and manage team members.',
//         component: <Timings />
//     },
//     {
//         title: 'Members',
//         value: 'members',
//         icon: 'users',
//         description: 'Add, remove, and manage team members.',
//         component: <Members />
//     },
//     {
//         title: 'Setup Wizard',
//         value: 'setup',
//         icon: 'tool-case',
//         description: 'Application setup and configuration wizard.',
//         component: <SetupWizard />
//     },
//     {
//         title: 'Appearance',
//         value: 'appearance',
//         icon: 'monitor',
//         description: 'Customize themes, colors, and UI style.',
//         component: <TermsnCondition />
//     },
//     {
//         title: 'Profile',
//         value: 'profile',
//         icon: 'monitor',
//         description: 'Update profile information and personal settings.',
//         component: <Profile />
//     },
//     {
//         title: 'Notification',
//         value: 'notification',
//         icon: 'bell',
//         description: 'Control email, push, and in-app notifications.',
//         component: <TermsnCondition />
//     },
//     {
//         title: 'Auth',
//         value: 'auth',
//         icon: 'shield-user',
//         description: 'Manage authentication methods and security.',
//         component: <TermsnCondition />
//     },
//     {
//         title: 'Database',
//         value: 'database',
//         icon: 'database',
//         description: 'Configure database storage, backups, and settings.',
//         component: <Database />
//     },
//     {
//         title: 'Terms & Condition',
//         value: 'terms',
//         icon: 'handshake',
//         description: 'Edit and manage terms & conditions content.',
//         component: <TermsnCondition />
//     },
//     {
//         title: 'Privacy Policy',
//         value: 'privacy',
//         icon: 'globe-lock',
//         description: 'Manage and update privacy policy information.',
//         component: <PrivacyPolicy />
//     }
// ];



export default function SettingsModal({ isOpen, onClose, mode, settings }) {

    const [activeSection, setActiveSection] = useState("general");


    const handleOnClose = () => {
        onClose()
    }

    const renderSection = () => {
        switch (activeSection) {
            case "general": return <GeneralSettings />;
            case "departments": return <DepartmentSettings />;
            case "staff": return <StaffSettings />;
            case "patients": return <PatientSettings />;
            case "appointments": return <AppointmentSettings />;
            case "pharmacy": return <PharmacySettings />;
            case "notifications": return <NotificationSettings />;
            case "security": return <SecuritySettings />;
            case "billing": return <BillingSettings />;
            case "integrations": return <IntegrationSettings />;
            case "invoice": return <InvoiceSettings />;
            case "inventory": return <InventorySettings />;
            case "services": return <ServicesSettings />;
            case "prescription": return <PrescriptionSettings />;
            default: return <GeneralSettings />;
        }
    };


    return (
        <Dialog open={isOpen} onOpenChange={handleOnClose} modal={true}>

            <DialogContent className=" bg-card min-w-[95%] md:min-w-[90%] lg:min-w-[85%] min-h-[75%] max-h-[75%] rounded-lg p-0 overflow-hidden [&>button:last-child]:hidden" >
                <DialogTitle className='hidden'>

                </DialogTitle>
                <div className="flex h-full">
                    <div className="w-64  border-r  flex flex-col">
                        <div className="p-4  flex flex-row items-center gap-2">
                            <Settings className='h-5 w-5 text-sky-blue' />
                            <span className='text-sm'>Organization settings</span>
                        </div>
                        <SettingsSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
                    </div>
                    <div className="flex-1 overflow-hidden animate-fade-in " key={activeSection}>
                        {renderSection()}
                    </div>
                </div>


            </DialogContent>
        </Dialog>
    )
}
