import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { seeder } from "@/utils/seeder";



export const useDatabaseSeed = () => {
    const [seedStates, setSeedStates] = useState({});
    const { users: user, roleSeed: role, permissionSeed: permission, doctor: doctor, patient: patient, categorySeed, inventorySeed, serviceSeed, paymentSeed, invoicesSeed } = seeder()
    const { toast } = useToast();

    const seedDatabase = useCallback(async (name) => {
        setSeedStates((prev) => ({ ...prev, [name]: "seeding" }));

        try {
            // TODO: Replace with your actual database seeding implementation
            // Example: await supabase.rpc('seed_' + name);
            console.log(`Seeding ${name}...`);
            await new Promise((resolve) => setTimeout(resolve, 2000));

            setSeedStates((prev) => ({ ...prev, [name]: "complete" }));
            toast({
                title: "Success",
                description: `${name.charAt(0).toUpperCase() + name.slice(1)} seeded successfully!`,
            });

            // Reset to idle after 3 seconds
            setTimeout(() => {
                setSeedStates((prev) => ({ ...prev, [name]: "idle" }));
            }, 3000);
        } catch (error) {
            console.error(`Error seeding ${name}:`, error);
            setSeedStates((prev) => ({ ...prev, [name]: "error" }));
            toast({
                title: "Error",
                description: `Failed to seed ${name}. Please try again.`,
                variant: "destructive",
            });

            // Reset to idle after 3 seconds
            setTimeout(() => {
                setSeedStates((prev) => ({ ...prev, [name]: "idle" }));
            }, 3000);
        }
    }, [toast]);

    const getStatus = useCallback((name) => {
        return seedStates[name] || "idle";
    }, [seedStates]);

    const seedAll = useCallback(async (names) => {
        for (const name of names) {
            await seedDatabase(name);
        }
    }, [seedDatabase]);

    return { seedDatabase, getStatus, seedAll };
};
