import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";



const UserRoleCard = ({ icon: Icon, title, description, className }) => {
    return (
        <div
            className={cn(
                "flex flex-col items-center text-center p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-card transition-all duration-300 group",
                className
            )}
        >
            <div className="w-14 h-14 rounded-2xl bg-gradient-hero flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Icon className="w-7 h-7 text-primary-foreground" />
            </div>
            <h4 className="font-display font-semibold text-foreground mb-2">{title}</h4>
            <p className="text-muted-foreground text-sm">{description}</p>
        </div>
    );
};

export default UserRoleCard;
