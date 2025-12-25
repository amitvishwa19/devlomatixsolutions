import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";



const CompactFeature = ({ icon: Icon, title, description, className }) => {
    return (
        <div className={cn("flex items-start gap-4", className)}>
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
                <h4 className="font-display font-semibold text-foreground mb-1">{title}</h4>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
        </div>
    );
};

export default CompactFeature;
