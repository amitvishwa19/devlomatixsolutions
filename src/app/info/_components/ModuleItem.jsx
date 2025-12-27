import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";



const ModuleItem = ({ icon: Icon, name, description, className }) => {
    return (
        <div
            className={cn(
                "flex items-start gap-4 p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors duration-300 group cursor-pointer",
                className
            )}
        >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
                <h4 className="font-display font-semibold text-foreground mb-1">{name}</h4>
                <p className="text-muted-foreground text-sm">{description}</p>
            </div>
        </div>
    );
};

export default ModuleItem;
