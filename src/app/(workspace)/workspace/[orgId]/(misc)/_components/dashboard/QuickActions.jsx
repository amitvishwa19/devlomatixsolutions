import React from 'react'
import { Plus, Calendar, FileText, UserPlus, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from 'next/navigation';
import { useModal } from '@/hooks/useModal';




export default function QuickActions() {
    const router = useRouter()
    const { orgId } = useParams()
    const { onOpen } = useModal()

    const actions = [
        {
            id: 'add-appointment-modal',
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

    const handleActionClick = (action) => {
        console.log('handleActionClick Clicked:', action.id)
        // do something based on action.id or action.label

        if (action.id === 'add-appointment-modal') {
            onOpen(action.id)
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
        </div>
    )
}
