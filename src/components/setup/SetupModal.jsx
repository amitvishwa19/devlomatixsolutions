import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { StepIndicator } from "./StepIndicator";
import { HospitalInfoStep } from "./steps/HospitalInfoStep.";
import { AdminSetupStep } from "./steps/AdminSetupStep.";
import { DepartmentStep } from "./steps/DepartmentStep";
import { SystemSettingsStep } from "./steps/SystemSettings";
import { CompletionStep } from "./steps/CompletionStep.t";


const initialData = {
    hospitalName: "",
    hospitalType: "",
    address: "",
    phone: "",
    email: "",
    adminName: "",
    adminEmail: "",
    adminPassword: "",
    departments: [],
    // System Settings defaults
    openTime: "08:00",
    closeTime: "18:00",
    appointmentDuration: "30",
    timezone: "UTC",
    currency: "USD",
    emailNotifications: true,
    smsNotifications: false,
    autoBackup: true,
};


const steps = [
    { id: 1, title: "Hospital", description: "Basic details" },
    { id: 2, title: "Admin", description: "Create account" },
    { id: 3, title: "Departments", description: "Configure" },
    { id: 4, title: "Settings", description: "Preferences" },
    { id: 5, title: "Complete", description: "Ready to go" },
];



export function SetupModal({ open, onComplete }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [data, setData] = useState(initialData);

    const updateData = (updates) => {
        setData((prev) => ({ ...prev, ...updates }));
    };

    const nextStep = () => {
        if (currentStep < steps.length) {
            setCurrentStep((prev) => prev + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    const handleComplete = () => {
        onComplete(data);
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <HospitalInfoStep
                        data={data}
                        updateData={updateData}
                        onNext={nextStep}
                    />
                );
            case 2:
                return (
                    <AdminSetupStep
                        data={data}
                        updateData={updateData}
                        onNext={nextStep}
                        onPrev={prevStep}
                    />
                );
            case 3:
                return (
                    <DepartmentStep
                        data={data}
                        updateData={updateData}
                        onNext={nextStep}
                        onPrev={prevStep}
                    />
                );
            case 4:
                return (
                    <SystemSettingsStep
                        data={data}
                        updateData={updateData}
                        onNext={nextStep}
                        onPrev={prevStep}
                    />
                );
            case 5:
                return (
                    <CompletionStep
                        data={data}
                        onComplete={handleComplete}
                        onPrev={prevStep}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <Dialog open={open}>
            <DialogContent className=" p-0 gap-0 overflow-hidden border-0 shadow-elevated min-w-[50%]">

                <DialogHeader className="mb-0 pb-0 hidden">
                    <DialogTitle className="sr-only">
                        {/* Title exists for accessibility, visually hidden */}
                    </DialogTitle>
                </DialogHeader>


                <div className="gradient-primary p-6 text-primary-foreground dark:bg-sky-500">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center backdrop-blur-sm">
                            <svg
                                className="w-7 h-7"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-2xl font-semibold tracking-tight">
                                Hospital Setup Wizard
                            </h2>
                            <p className="text-primary-foreground/80 text-sm">
                                Configure your hospital management system
                            </p>
                        </div>
                    </div>
                    <StepIndicator steps={steps} currentStep={currentStep} />
                </div>

                <div className="p-6 bg-card min-h-[400px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {renderStep()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </DialogContent>
        </Dialog>
    );
}
