import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";




const PricingCard = ({
    name,
    description,
    price,
    period,
    features,
    highlighted = false,
    buttonText = "Get Started",
    className
}) => {
    return (
        <div
            className={cn(
                "relative rounded-2xl p-8 transition-all duration-300",
                highlighted
                    ? "bg-gradient-hero text-primary-foreground shadow-elevated scale-105"
                    : "bg-card border border-border/50 hover:border-primary/30 hover:shadow-card",
                className
            )}
        >
            {highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent text-accent-foreground text-sm font-medium rounded-full">
                    Most Popular
                </div>
            )}

            <div className="mb-6">
                <h3 className={cn(
                    "font-display font-bold text-xl mb-2",
                    highlighted ? "text-primary-foreground" : "text-foreground"
                )}>{name}</h3>
                <p className={cn(
                    "text-sm",
                    highlighted ? "text-primary-foreground/70" : "text-muted-foreground"
                )}>{description}</p>
            </div>

            <div className="mb-6">
                <span className={cn(
                    "font-display text-4xl font-bold",
                    highlighted ? "text-primary-foreground" : "text-foreground"
                )}>{price}</span>
                <span className={cn(
                    "text-sm ml-1",
                    highlighted ? "text-primary-foreground/70" : "text-muted-foreground"
                )}>/{period}</span>
            </div>

            <ul className="space-y-3 mb-8">
                {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                        <div className={cn(
                            "w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                            highlighted ? "bg-primary-foreground/20" : "bg-primary/10"
                        )}>
                            <Check className={cn("w-3 h-3", highlighted ? "text-primary-foreground" : "text-primary")} />
                        </div>
                        <span className={cn(
                            "text-sm",
                            highlighted ? "text-primary-foreground/90" : "text-foreground/80"
                        )}>{feature}</span>
                    </li>
                ))}
            </ul>

            <Button
                variant={highlighted ? "secondary" : "hero"}
                className={cn(
                    "w-full",
                    highlighted && "bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                )}
            >
                {buttonText}
            </Button>
        </div>
    );
};

export default PricingCard;
