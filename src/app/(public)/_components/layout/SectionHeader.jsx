import { Stethoscope } from "lucide-react";



const SectionHeader = ({ badge, title, highlight, description }) => {
    return (
        <div className="text-center max-w-2xl mx-auto">
            {badge && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border text-sm font-medium text-muted-foreground mb-6">
                    <Stethoscope className="h-4 w-4 text-primary" />
                    {badge}
                </div>
            )}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                {title}
                {highlight && (
                    <>
                        <br />
                        <span className="text-primary">{highlight}</span>
                    </>
                )}
            </h2>
            {description && (
                <p className="text-muted-foreground text-lg mt-6 max-w-xl mx-auto">
                    {description}
                </p>
            )}
        </div>
    );
};

export default SectionHeader;
