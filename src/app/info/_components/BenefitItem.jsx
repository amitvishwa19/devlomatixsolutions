import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";



const BenefitItem = ({ icon: Icon, title, items, accentColor = "primary", className }) => {
    const colorClasses = {
        primary: "bg-primary/10 text-primary",
        accent: "bg-accent/10 text-accent",
        teal: "bg-primary/10 text-primary"
    };

    return (
        <div className={cn("space-y-4", className)}>
            <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", colorClasses[accentColor])}>
                    <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground">{title}</h3>
            </div>
            <ul className="space-y-2 pl-13">
                {items.map((item, index) => (
                    <li key={index} className="flex items-start gap-3 text-muted-foreground">
                        <span className={cn("w-1.5 h-1.5 rounded-full mt-2 shrink-0",
                            accentColor === "accent" ? "bg-accent" : "bg-primary"
                        )} />
                        <span className="text-sm">{item}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default BenefitItem;
