import { Plus, X, Stethoscope } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";




const suggestedDepartments = [
    "Emergency",
    "Cardiology",
    "Neurology",
    "Orthopedics",
    "Pediatrics",
    "Radiology",
    "Surgery",
    "ICU",
    "Pharmacy",
    "Laboratory",
    "OPD",
    "Gynecology",
];

export function DepartmentStep({
    data,
    updateData,
    onNext,
    onPrev,
}) {
    const [customDept, setCustomDept] = useState("");

    const addDepartment = (dept) => {
        if (dept && !data.departments.includes(dept)) {
            updateData({ departments: [...data.departments, dept] });
        }
    };

    const removeDepartment = (dept) => {
        updateData({
            departments: data.departments.filter((d) => d !== dept),
        });
    };

    const handleAddCustom = () => {
        if (customDept.trim()) {
            addDepartment(customDept.trim());
            setCustomDept("");
        }
    };

    const isValid = data.departments.length >= 1;

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-semibold text-foreground mb-1">
                    Configure Departments
                </h3>
                <p className="text-sm text-muted-foreground">
                    Select the departments your hospital will manage
                </p>
            </div>

            <div>
                <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-primary" />
                    Quick Add Departments
                </p>
                <div className="flex flex-wrap gap-2">
                    {suggestedDepartments.map((dept) => {
                        const isSelected = data.departments.includes(dept);
                        return (
                            <button
                                key={dept}
                                onClick={() =>
                                    isSelected ? removeDepartment(dept) : addDepartment(dept)
                                }
                                className={`px-3 py-1.5 text-sm rounded-full transition-all duration-200 border ${isSelected
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-secondary text-secondary-foreground border-border hover:border-primary/50"
                                    }`}
                            >
                                {dept}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="flex gap-2">
                <Input
                    placeholder="Add custom department..."
                    value={customDept}
                    onChange={(e) => setCustomDept(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddCustom()}
                />
                <Button variant="outline" onClick={handleAddCustom} size="icon">
                    <Plus className="w-4 h-4" />
                </Button>
            </div>

            {data.departments.length > 0 && (
                <div>
                    <p className="text-sm font-medium text-foreground mb-3">
                        Selected Departments ({data.departments.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {data.departments.map((dept) => (
                            <Badge
                                key={dept}
                                variant="secondary"
                                className="pl-3 pr-1 py-1.5 gap-1 text-sm"
                            >
                                {dept}
                                <button
                                    onClick={() => removeDepartment(dept)}
                                    className="ml-1 hover:bg-muted rounded-full p-0.5 transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </Badge>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={onPrev} size="lg">
                    Back
                </Button>
                <Button onClick={onNext} disabled={!isValid} size="lg">
                    Continue
                </Button>
            </div>
        </div>
    );
}
