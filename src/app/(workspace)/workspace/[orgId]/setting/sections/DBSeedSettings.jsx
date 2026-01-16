import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Database, Upload, Download, Trash2, RefreshCw, AlertTriangle } from "lucide-react";
import { SeedDAtabase } from '@/utils/db-seeder'
import { seeder } from "@/utils/seeder";

const seedOptions = [
    { id: "department", name: "Departments", description: "10 sample departments", count: 10 },
    { id: "staff", name: "Staff Members", description: "50 sample staff profiles", count: 50 },
    { id: "patients", name: "Patients", description: "100 sample patient records", count: 100 },
    { id: "appointments", name: "Appointments", description: "200 sample appointments", count: 200 },
    { id: "services", name: "Services", description: "30 medical services", count: 30 },
    { id: "medications", name: "Medications", description: "500 medication entries", count: 500 },
    { id: "invoices", name: "Invoices", description: "150 sample invoices", count: 150 },
];



export function DBSeedSettings() {
    const [isSeeding, setIsSeeding] = useState(false);
    const [progress, setProgress] = useState(0);




    const handleSeed = async (type) => {
        const toastId = toast.loading(`Seeding ${type} data...`);
        setIsSeeding(true);
        setProgress(0);

        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setIsSeeding(false);
                    toast.success(`${type} data seeded successfully`, { id: toastId });
                    return 100;
                }
                return prev + 10;
            });
        }, 200);
    };

    const handleExport = async () => {
        const toastId = toast.loading("Exporting database...");
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success("Database exported successfully", { id: toastId });
        } catch (error) {
            toast.error("Failed to export database", { id: toastId });
        }
    };

    const handleReset = async () => {
        const toastId = toast.loading("Resetting database...");
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success("Database reset successfully", { id: toastId });
        } catch (error) {
            toast.error("Failed to reset database", { id: toastId });
        }
    };

    const handleDatabaseSeed = (type, data) => {
        console.log('Seed Database', type, data)
        // setLoading(type)
        // SeedDAtabase(type, data)

        // setTimeout(() => {
        //     toast.success('Database seeded with users successfully')
        //     setLoading(null)
        // }, 2000);
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-start justify-between pb-4 border-b border-border mb-6">
                <div>
                    <h2 className="text-lg font-semibold text-foreground">DB Seed</h2>
                    <p className="text-sm text-muted-foreground mt-1">Database seeding and management tools</p>
                </div>
            </div>

            <ScrollArea className="flex-1 p-2">
                <div className="space-y-8">
                    <div className="flex gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                        <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
                        <div>
                            <p className="font-medium text-yellow-600 dark:text-yellow-400">Development Only</p>
                            <p className="text-sm text-yellow-600/80 dark:text-yellow-400/80">
                                These tools are intended for development and testing purposes only.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-primary">
                            <Database className="h-4 w-4" />
                            <span className="text-sm font-medium">Seed Sample Data</span>
                        </div>

                        {isSeeding && (
                            <div className="rounded-lg border border-border p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm">Seeding database...</span>
                                    <span className="text-sm text-muted-foreground">{progress}%</span>
                                </div>
                                <Progress value={progress} className="h-2" />
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            {seedOptions.map((option) => (
                                <div key={option.id} className="rounded-lg border border-border p-4 flex items-center justify-between">
                                    <div>
                                        <div className="font-medium">{option.name}</div>
                                        <p className="text-sm text-muted-foreground">{option.description}</p>
                                    </div>
                                    <Button size="sm" onClick={() => handleSeed(option)} disabled={isSeeding}>
                                        <Upload className="h-4 w-4 mr-1" />
                                        Seed
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-primary">
                            <RefreshCw className="h-4 w-4" />
                            <span className="text-sm font-medium">Database Operations</span>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between rounded-lg border border-border p-4">
                                <div>
                                    <div className="font-medium">Export Database</div>
                                    <p className="text-sm text-muted-foreground">Download a complete backup</p>
                                </div>
                                <Button variant="outline" onClick={handleExport}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Export
                                </Button>
                            </div>

                            <div className="flex items-center justify-between rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                                <div>
                                    <div className="font-medium">Reset Database</div>
                                    <p className="text-sm text-muted-foreground">Delete all data and reset</p>
                                </div>
                                <Button variant="destructive" onClick={handleReset}>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Reset
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}