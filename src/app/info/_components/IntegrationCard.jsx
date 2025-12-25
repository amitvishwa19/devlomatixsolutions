import { cn } from "@/lib/utils";
import { LucideIcon, Check } from "lucide-react";


const IntegrationCard = ({ icon: Icon, name, category, status = "available", className }) => {
    return (
        <div
            className={cn(
                "group flex items-center gap-4 p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-card transition-all duration-300",
                className
            )}
        >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Icon className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-display font-semibold text-foreground truncate">{name}</h4>
                <p className="text-xs text-muted-foreground">{category}</p>
            </div>
            {status === "available" ? (
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary" />
                </div>
            ) : (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">Soon</span>
            )}
        </div>
    );
};

export default IntegrationCard;
