import FeatureCard from "./FeatureCard";

import { Button } from "@/components/ui/button";
import {
    Cloud,
    Calendar,
    UserPlus,
    FileText,
    IndianRupee,
    Users,
    Building2,
    Mail,
    BarChart3,
    Pill,
    Warehouse,
    Share2,
    Microscope,
    ScanLine,
    Smartphone,
} from "lucide-react";
import SectionHeader from "./SectionHeader";

const features = [
    {
        icon: Cloud,
        title: "Auto Cloud Backup",
        description: "Schedule data backup with auto daily backup to cloud for secure storage",
        iconColor: "cyan",
    },
    {
        icon: Calendar,
        title: "Appointment Management",
        description: "Schedule and manage patient appointments with ease",
        iconColor: "pink",
    },
    {
        icon: UserPlus,
        title: "Patient Administration",
        description: "Patient registration, OPD/IPD case management and reminders",
        iconColor: "purple",
    },
    {
        icon: FileText,
        title: "Diagnosis & Treatment",
        description: "Detailed diagnosis sheets with treatment history tracking",
        iconColor: "green",
    },
    {
        icon: IndianRupee,
        title: "Billing & Collection",
        description: "OPD billing, daily billing for indoor patients, cash collection",
        iconColor: "amber",
    },
    {
        icon: Users,
        title: "User Management",
        description: "User rights, restrictions and account security management",
        iconColor: "blue",
    },
    {
        icon: Building2,
        title: "TPA & Company",
        description: "TPA tie-up management with customized billing charges",
        iconColor: "pink",
    },
    {
        icon: Mail,
        title: "Marketing Tools",
        description: "Custom SMS/mail templates and campaign management",
        iconColor: "cyan",
    },
    {
        icon: BarChart3,
        title: "Reports",
        description: "Comprehensive OPD, IPD and Pharmacy reports",
        iconColor: "purple",
    },
    {
        icon: Pill,
        title: "Pharmacy",
        description: "Pharmacy store with stock management and GST included",
        iconColor: "green",
    },
    {
        icon: Warehouse,
        title: "Central Store",
        description: "Central store stock and requisition management",
        iconColor: "amber",
    },
    {
        icon: Share2,
        title: "Sharing Report",
        description: "Define sharing policies and share reports instantly",
        iconColor: "blue",
    },
    {
        icon: Microscope,
        title: "Pathology",
        description: "Readymade database with 500+ reports and 1500+ parameters",
        iconColor: "cyan",
    },
    {
        icon: ScanLine,
        title: "Radiology",
        description: "Readymade database with 500+ templates",
        iconColor: "pink",
    },
    {
        icon: Smartphone,
        title: "Mobile Application",
        description: "Access IPD/OPD patient list and billing on mobile",
        iconColor: "green",
    },
];

const FeaturesSection = () => {
    return (
        <section className="py-20 md:py-28 bg-background">
            <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <SectionHeader
                    badge="Our Features"
                    title="Comprehensive Healthcare"
                    highlight="Solutions"
                    description="We offer a wide range of hospital management features to meet all your healthcare needs under one roof."
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
                    {features.map((feature, index) => (
                        <FeatureCard
                            key={index}
                            icon={feature.icon}
                            title={feature.title}
                            description={feature.description}
                            iconColor={feature.iconColor}
                        />
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <Button size="lg" className="px-8">
                        More About Us
                    </Button>
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;
