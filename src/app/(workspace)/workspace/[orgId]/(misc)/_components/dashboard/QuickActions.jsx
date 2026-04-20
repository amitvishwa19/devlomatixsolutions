import { useState } from "react";
import { useParams } from "next/navigation";
import { UserPlus, Calendar, FileText, Pill, Upload, BedDouble } from "lucide-react";
import { NewPatientDialog } from "../../../(modules)/patient/components/NewPatientDialog";
import { NewAppointmentDialog } from "../../../(modules)/appointment/components/NewAppointmentDialog";
import { GenerateInvoiceSheet } from "../../../(modules)/invoice/components/GenerateInvoiceSheet";
import { NewPrescriptionDialog } from "../../../(modules)/prescription/components/NewPrescriptionDialog";
import { UploadDocumentDialog } from "../../../(modules)/document/_components/UploadDocumentDialog";
import { BedManagementDialog } from "../../../(modules)/accommodation/components/BedManagementDialog";

const actions = [
    { id: "add-patient", label: "Add Patient", icon: UserPlus },
    { id: "new-appointment", label: "New Appointment", icon: Calendar },
    { id: "create-invoice", label: "Create Invoice", icon: FileText },
    { id: "prescription", label: "Prescription", icon: Pill },
    { id: "upload-doc", label: "Upload Doc", icon: Upload },
    { id: "manage-beds", label: "Manage Beds", icon: BedDouble },
];

export function QuickActions() {
    const { orgId } = useParams();
    const [activeModal, setActiveModal] = useState(null);

    // Handlers for closing modals
    const closeModal = () => setActiveModal(null);

    // Mock data for specific modals
    const mockRoom = {
        roomNumber: "101",
        type: "deluxe",
        beds: [
            { id: "b1", bedNumber: "101-A", status: "available" },
            { id: "b2", bedNumber: "101-B", status: "occupied" }
        ]
    };

    return (
        <div className="bg-card rounded-xl border border-border p-5">
            <div className="mb-4">
                <h3 className="text-sm font-semibold text-foreground">Quick Actions</h3>
                <p className="text-xs text-muted-foreground">Frequently used tasks</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
                {actions.map((action) => (
                    <button
                        key={action.id}
                        onClick={() => setActiveModal(action.id)}
                        className="flex flex-col items-center gap-2 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group"
                    >
                        <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                            <action.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors text-center">
                            {action.label}
                        </span>
                    </button>
                ))}
            </div>

            {/* Modals */}
            <NewPatientDialog
                open={activeModal === "add-patient"}
                onOpenChange={closeModal}
                onAddPatient={(data) => console.log("Patient added:", data)}
            />

            <NewAppointmentDialog
                open={activeModal === "new-appointment"}
                onOpenChange={closeModal}
                onAddAppointment={(data) => console.log("Appointment added:", data)}
            />

            <GenerateInvoiceSheet
                open={activeModal === "create-invoice"}
                onOpenChange={closeModal}
                onGenerate={(data) => console.log("Invoice generated:", data)}
                existingInvoices={[]}
            />

            <NewPrescriptionDialog
                open={activeModal === "prescription"}
                onOpenChange={closeModal}
                onSave={(data) => console.log("Prescription saved:", data)}
            />

            <UploadDocumentDialog
                open={activeModal === "upload-doc"}
                onOpenChange={closeModal}
                onUpload={(data) => console.log("Document uploaded:", data)}
            />

            <BedManagementDialog
                open={activeModal === "manage-beds"}
                onOpenChange={closeModal}
                room={mockRoom}
                onSave={(data) => console.log("Beds updated:", data)}
            />
        </div>
    );
}
