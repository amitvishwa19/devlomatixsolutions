import { cn } from "@/lib/utils";
import { LucideIcon, ArrowRight } from "lucide-react";



const gradientClasses = {
    teal: "from-primary/10 via-primary/5 to-transparent border-primary/20",
    coral: "from-accent/10 via-accent/5 to-transparent border-accent/20",
    blue: "from-blue-500/10 via-blue-500/5 to-transparent border-blue-500/20",
    purple: "from-violet-500/10 via-violet-500/5 to-transparent border-violet-500/20",
    green: "from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/20",
};

const iconBgClasses = {
    teal: "bg-primary/15 text-primary",
    coral: "bg-accent/15 text-accent",
    blue: "bg-blue-500/15 text-blue-500",
    purple: "bg-violet-500/15 text-violet-500",
    green: "bg-emerald-500/15 text-emerald-500",
};

const AdvancedFeatureCard = ({
    icon: Icon,
    title,
    description,
    features,
    gradient = "teal",
    className
}) => {
    return (
        <div
            className={cn(
                "group relative rounded-2xl p-6 border bg-gradient-to-br transition-all duration-500 hover:shadow-elevated overflow-hidden",
                gradientClasses[gradient],
                className
            )}
        >
            {/* Hover glow effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10">
                <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110",
                    iconBgClasses[gradient]
                )}>
                    <Icon className="w-7 h-7" />
                </div>

                <h3 className="font-display font-bold text-xl text-foreground mb-3">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-5">{description}</p>

                <ul className="space-y-2.5 mb-5">
                    {features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2.5 text-sm">
                            <div className={cn(
                                "w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                                iconBgClasses[gradient]
                            )}>
                                <span className="text-[10px] font-bold">✓</span>
                            </div>
                            <span className="text-foreground/80">{feature}</span>
                        </li>
                    ))}
                </ul>

                <button className="flex items-center gap-2 text-sm font-medium text-primary hover:gap-3 transition-all duration-300">
                    Learn more
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default AdvancedFeatureCard;
