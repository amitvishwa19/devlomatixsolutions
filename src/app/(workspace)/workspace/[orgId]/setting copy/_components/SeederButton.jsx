import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, Database, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { SeedDAtabase } from "@/utils/db-seeder";
import { toast } from "sonner";



const SeedButton = ({ name, label, icon, seedDatabase, seeder }) => {
    const [status, setStatus] = useState("idle");

    const handleSeed = async (type, data) => {
        console.log(`${name} seeder`, seeder)
        setStatus("seeding");
        try {
            await SeedDAtabase(name, seeder)
            setStatus("complete");
            setStatus("idle")
            toast.success(`Database seeding completing "${name}" completed successfully`)
        } catch (error) {
            console.error(`Failed to seed ${name}:`, error);
            toast.error(`Failed to seed ${name}`)
            setStatus("error");
            setTimeout(() => setStatus("idle"), 3000);
        }
    };

    const statusConfig = {
        idle: {
            icon: icon || <Database className="h-4 w-4" />,
            text: "Seed",
            className: "text-muted-foreground group-hover:text-primary",
        },
        seeding: {
            icon: <Loader2 className="h-4 w-4 animate-spin" />,
            text: "Seeding...",
            className: "text-primary",
        },
        complete: {
            icon: <CheckCircle2 className="h-4 w-4" />,
            text: "Done!",
            className: "text-success",
        },
        error: {
            icon: <AlertCircle className="h-4 w-4" />,
            text: "Failed",
            className: "text-destructive",
        },
    };

    const current = statusConfig[status];

    return (
        <motion.button
            onClick={handleSeed}
            disabled={status === "seeding"}
            whileHover={{ scale: status === "idle" ? 1.01 : 1 }}
            whileTap={{ scale: status === "idle" ? 0.99 : 1 }}
            className={cn(
                "group relative w-full flex items-center gap-4 p-4 rounded-xl",
                "bg-card border border-border/60 hover:border-primary/30",
                "transition-all duration-200 ease-out",
                "hover:shadow-md hover:shadow-primary/5",
                "disabled:opacity-70 disabled:cursor-not-allowed",
                status === "complete" && "border-success/30 bg-success/5",
                status === "error" && "border-destructive/30 bg-destructive/5"
            )}
        >
            {/* Icon container */}
            <div
                className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-lg",
                    "bg-secondary/80 transition-colors duration-200",
                    "group-hover:bg-primary/10",
                    status === "complete" && "bg-success/10",
                    status === "error" && "bg-destructive/10"
                )}
            >
                <span className={cn("transition-colors duration-200", current.className)}>
                    {current.icon}
                </span>
            </div>

            {/* Label */}
            <div className="flex-1 text-left">
                <p className="font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">
                    {status === "idle" && `Populate ${name} table`}
                    {status === "seeding" && "Please wait..."}
                    {status === "complete" && "Successfully seeded!"}
                    {status === "error" && "Something went wrong"}
                </p>
            </div>

            {/* Status badge */}
            <div
                className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium",
                    "transition-all duration-200",
                    status === "idle" && "bg-secondary text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary",
                    status === "seeding" && "bg-primary/10 text-primary",
                    status === "complete" && "bg-success/10 text-success",
                    status === "error" && "bg-destructive/10 text-destructive"
                )}
            >
                {current.text}
            </div>

            {/* Progress bar for seeding state */}
            {/* {status === "seeding" && (
                <motion.div
                    className="absolute bottom-0 left-0 h-0.5 bg-primary rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                />
            )} */}
        </motion.button>
    );
};

export default SeedButton;
