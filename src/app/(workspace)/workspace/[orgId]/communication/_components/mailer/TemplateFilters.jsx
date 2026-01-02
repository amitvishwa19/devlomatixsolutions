import { Button } from "@/components/ui/button";
import { getCategoryIcon } from "../../_lib/emailTemplates";


const categories = [
    { value: "all", label: "All Templates" },
    { value: "appointment", label: "Appointment" },
    { value: "billing", label: "Billing" },
    { value: "lab", label: "Lab Results" },
    { value: "general", label: "General" },
    { value: "emergency", label: "Emergency" },
];

export const TemplateFilters = ({ activeFilter, onFilterChange }) => {
    return (
        <div className="flex flex-wrap gap-2 mb-6 animate-slide-up">
            {categories.map((category) => (
                <Button
                    key={category.value}
                    variant={activeFilter === category.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => onFilterChange(category.value)}
                    className={
                        activeFilter === category.value
                            ? "gradient-primary text-primary-foreground border-0"
                            : "border-border/50 hover:border-primary/30"
                    }
                >
                    {category.value !== "all" && (
                        <span className="mr-1">{getCategoryIcon(category.value)}</span>
                    )}
                    {category.label}
                </Button>
            ))}
        </div>
    );
};
