import React, { useState } from 'react'
import { Plus, Calendar, FileText, UserPlus, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from 'next/navigation';
import { useModal } from '@/hooks/useModal';
import PatientAdd from '../../../patient/_component/patient-management/PatientAdd';
import AppointmentEditor from '../../../appointment/_components/appointment-manager/AppointmentEditor';




export default function QuickActions() {
    const router = useRouter()
    const { orgId } = useParams()
    const { onOpen } = useModal()

    const actions = [
        {
            id: 'quick-appointment',
            label: "Book Appointment",
            icon: Calendar,
            variant: "outline",

        },
        {
            id: 'new-patient',
            label: "New Patient",
            icon: UserPlus,
            variant: "outline",
        },
        {
            id: 'new-prescription',
            label: "Write Prescription",
            icon: FileText,
            variant: "outline",
        },
        {
            id: 'new-consultation',
            label: "Start Consultation",
            icon: Stethoscope,
            variant: "outline",
        },
    ];

    const [patientAdd, setPatientAdd] = useState({
        isOpen: false,
        mode: 'add',
        patient: null,
    })

    const [appointmentEditor, setAppointmentEditor] = useState({
        isOpen: false,
        mode: 'edit',
        appointment: null
    });

    const handleActionClick = (action) => {
        console.log('handleActionClick Clicked:', action.id)
        // do something based on action.id or action.label

        if (action.id === 'quick-appointment') {
            onOpen(action.id)
        }


        if (action.id === 'new-patient') {
            console.log('@ Add new patient')
            setPatientAdd({
                isOpen: true
            })
        }

        if (action.id === 'quick-appointment') {
            setAppointmentEditor({
                isOpen: true,
                mode: 'add',
            })
        }

    }


    return (
        <div className="rounded-xl border border-border/50 bg-card dark:bg-darkSecondaryBackground p-5 shadow-card animate-slide-up" style={{ animationDelay: "400ms" }}>
            <h3 className="mb-4 text-lg font-semibold text-foreground">Quick Actions</h3>

            <div className="grid grid-cols-2 gap-3">
                {actions.map((action) => (
                    <Button
                        key={action.label}
                        variant={action.variant}
                        className="h-auto flex-col gap-2 py-4"
                        onClick={() => { handleActionClick(action) }}
                    >
                        <action.icon className="h-5 w-5" />
                        <span className="text-xs font-medium">{action.label}</span>
                    </Button>
                ))}
            </div>

            <PatientAdd
                isOpen={patientAdd.isOpen}
                onClose={() => {
                    setPatientAdd({
                        isOpen: false
                    })
                }}
                onSave={(patient) => {
                    if (patient) {
                        // setPatients(prev =>
                        //     prev.some(item => item.id === patient.id)
                        //         ? prev.map(item =>
                        //             item.id === patient.id ? { ...item, ...patient } : item
                        //         )
                        //         : [patient, ...prev]
                        // );
                    }
                }}
            />

            <AppointmentEditor
                isOpen={appointmentEditor.isOpen}
                mode={appointmentEditor.mode}
                onClose={() => {
                    setAppointmentEditor({
                        isOpen: false,
                        mode: 'add',
                    })
                }}
                appointment={appointmentEditor.appointment}
            />


        </div>
    )
}
