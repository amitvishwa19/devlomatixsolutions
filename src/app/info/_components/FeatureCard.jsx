import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";



const FeatureCard = ({ icon: Icon, title, description, items, className, delay = 0 }) => {
    return (
        <div
            className={cn(
                "group relative bg-card rounded-2xl p-6 shadow-card hover:shadow-elevated transition-all duration-500 border border-border/50 hover:border-primary/30 overflow-hidden",
                className
            )}
            style={{ animationDelay: `${delay}ms` }}
        >
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                    <Icon className="w-6 h-6 text-primary" />
                </div>

                <h3 className="font-display font-semibold text-lg text-foreground mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">{description}</p>

                {items && items.length > 0 && (
                    <ul className="space-y-2">
                        {items.map((item, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default FeatureCard;
