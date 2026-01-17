import { useState } from "react";
import {
    LayoutDashboard,
    Calendar,
    Users,
    Stethoscope,
    BarChart3,
    Settings as SettingsIcon,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/appointment/_components/ThemeToggle";

// Import section components
import { DashboardContent } from "@/appointment/_components/sections/DashboardSection";
import { AppointmentsContent } from "@/appointment/_components/sections/AppointmentsSection";
import { DoctorsContent } from "@/appointment/_components/sections/DoctorsSection";
import { PatientsContent } from "@/appointment/_components/sections/PatientsSection";
import { ReportsContent } from "@/appointment/_components/sections/ReportsSection";
import { SettingsContent } from "@/appointment/_components/sections/SettingsSection";

const tabs = [
    { value: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { value: "appointments", label: "Appointments", icon: Calendar },
    { value: "doctors", label: "Doctors", icon: Stethoscope },
    { value: "patients", label: "Patients", icon: Users },
    { value: "reports", label: "Reports", icon: BarChart3 },
    { value: "settings", label: "Settings", icon: SettingsIcon },
];

const Index = () => {
    const [activeTab, setActiveTab] = useState("dashboard");

    return (
        <div className="min-h-screen bg-background">

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                {/* Header */}
                <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="container mx-auto px-4 py-3">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20">
                                    <Calendar className="h-5 w-5 text-primary" />
                                </div>
                                <div className="hidden sm:block">
                                    <h1 className="text-lg font-bold text-foreground">MediBook</h1>
                                    <p className="text-xs text-muted-foreground">Appointment System</p>
                                </div>
                            </div>

                            {/* Tab Navigation in Header */}
                            <TabsList className="flex flex-wrap justify-center gap-1 bg-secondary/60 border border-border/60 p-1.5 rounded-xl h-auto">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                        <TabsTrigger
                                            key={tab.value}
                                            value={tab.value}
                                            className={cn(
                                                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                                                "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow-sm"
                                            )}
                                        >
                                            <Icon className="h-4 w-4" />
                                            <span className="hidden lg:inline">{tab.label}</span>
                                        </TabsTrigger>
                                    );
                                })}
                            </TabsList>

                            <ThemeToggle />
                        </div>
                    </div>
                </header>


                {/* Main Content */}
                <div className="container mx-auto px-4 py-6">
                    <TabsContent value="dashboard" className="mt-0">
                        <DashboardContent />
                    </TabsContent>

                    <TabsContent value="appointments" className="mt-0">
                        <AppointmentsContent />
                    </TabsContent>

                    <TabsContent value="doctors" className="mt-0">
                        <DoctorsContent />
                    </TabsContent>

                    <TabsContent value="patients" className="mt-0">
                        <PatientsContent />
                    </TabsContent>

                    <TabsContent value="reports" className="mt-0">
                        <ReportsContent />
                    </TabsContent>

                    <TabsContent value="settings" className="mt-0">
                        <SettingsContent />
                    </TabsContent>
                </div>
            </Tabs>

        </div>
    );
};

export default Index;
