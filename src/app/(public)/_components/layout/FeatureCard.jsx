import { LucideIcon, ArrowRight } from "lucide-react";





const iconColorClasses = {
    cyan: "bg-icon-cyan",
    pink: "bg-icon-pink",
    purple: "bg-icon-purple",
    green: "bg-icon-green",
    amber: "bg-icon-amber",
    blue: "bg-icon-blue",
};

const textColorClasses = {
    cyan: "text-icon-cyan",
    pink: "text-icon-pink",
    purple: "text-icon-purple",
    green: "text-icon-green",
    amber: "text-icon-amber",
    blue: "text-icon-blue",
};

const FeatureCard = ({ icon: Icon, title, description, iconColor }) => {
    return (
        <div className="group rounded-xl bg-card border border-border p-6 hover:border-primary/30 transition-all duration-300">
            <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 p-3 rounded-xl ${iconColorClasses[iconColor]}`}>
                    <Icon className="h-6 w-6 text-white" strokeWidth={2} />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                        {title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        {description}
                    </p>
                </div>
            </div>
            <div className="mt-6">
                <a
                    href="#"
                    className={`inline-flex items-center gap-2 text-sm font-medium ${textColorClasses[iconColor]} hover:gap-3 transition-all duration-200`}
                >
                    Learn more
                    <ArrowRight className="h-4 w-4" />
                </a>
            </div>
        </div>
    );
};

export default FeatureCard;
