import * as React from "react";
import { Check, icons, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover";

// Helper to convert kebab-case to PascalCase for icon lookup
const toIconName = (name) => {
    return name
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("");
};

const DepartmentIcon = ({ iconName, color }) => {
    const pascalName = toIconName(iconName);
    const LucideIcon = icons[pascalName];

    if (!LucideIcon) {
        return null;
    }

    return <LucideIcon className="h-4 w-4 shrink-0" style={{ color: color || "currentColor" }} />;
};



const departmentSeed = [
    // CLINICAL DEPARTMENTS (17)
    {
        value: "emergency", name: "Emergency (ER)", code: "ER", category: "Clinical", image: "🚨", icon: "sirens", color: "#ef4444",
        description: "24/7 Emergency & Trauma Care", headDoctorId: null, floorNumber: 1, roomCount: 12, bedCount: 25, isActive: true
    },
    {
        value: "cardiology", name: "Cardiology", code: "CAR", category: "Clinical", image: "❤️", icon: "heart", color: "#dc2626",
        description: "Heart & Vascular Conditions", headDoctorId: null, floorNumber: 3, roomCount: 8, bedCount: 20, isActive: true
    },
    {
        value: "neurology", name: "Neurology", code: "NEU", category: "Clinical", image: "🧠", icon: "brain", color: "#8b5cf6",
        description: "Brain, Spine & Nervous System", headDoctorId: null, floorNumber: 4, roomCount: 10, bedCount: 18, isActive: true
    },
    {
        value: "pediatrics", name: "Pediatrics", code: "PED", category: "Clinical", image: "👶", icon: "baby", color: "#06b6d4",
        description: "Child & Adolescent Care", headDoctorId: null, floorNumber: 2, roomCount: 15, bedCount: 30, isActive: true
    },
    {
        value: "orthopedics", name: "Orthopedics", code: "ORT", category: "Clinical", image: "🦴", icon: "activity", color: "#10b981",
        description: "Bone, Joint & Musculoskeletal", headDoctorId: null, floorNumber: 3, roomCount: 12, bedCount: 22, isActive: true
    },
    {
        value: "oncology", name: "Oncology", code: "ONC", category: "Clinical", image: "🎗️", icon: "zap", color: "#7c3aed",
        description: "Cancer Treatment & Chemotherapy", headDoctorId: null, floorNumber: 4, roomCount: 10, bedCount: 15, isActive: true
    },
    {
        value: "dermatology", name: "Dermatology", code: "DER", category: "Clinical", image: "🩹", icon: "sun", color: "#ec4899",
        description: "Skin, Hair & Nail Conditions", headDoctorId: null, floorNumber: 3, roomCount: 8, bedCount: 12, isActive: true
    },
    {
        value: "gastroenterology", name: "Gastroenterology", code: "GAS", category: "Clinical", image: "🫁", icon: "stomach", color: "#f97316",
        description: "Digestive System Disorders", headDoctorId: null, floorNumber: 3, roomCount: 8, bedCount: 16, isActive: true
    },
    {
        value: "nephrology", name: "Nephrology", code: "NEP", category: "Clinical", image: "🫘", icon: "droplets", color: "#3b82f6",
        description: "Kidney Disease & Dialysis", headDoctorId: null, floorNumber: 4, roomCount: 8, bedCount: 14, isActive: true
    },
    {
        value: "pulmonology", name: "Pulmonology", code: "PUL", category: "Clinical", image: "🌬️", icon: "lungs", color: "#14b8a6",
        description: "Lung & Respiratory Care", headDoctorId: null, floorNumber: 4, roomCount: 10, bedCount: 18, isActive: true
    },
    {
        value: "endocrinology", name: "Endocrinology", code: "END", category: "Clinical", image: "⚗️", icon: "beaker", color: "#f59e0b",
        description: "Hormone & Endocrine Disorders", headDoctorId: null, floorNumber: 4, roomCount: 6, bedCount: 12, isActive: true
    },
    {
        value: "rheumatology", name: "Rheumatology", code: "RHE", category: "Clinical", image: "💪", icon: "zap", color: "#84cc16",
        description: "Autoimmune & Joint Diseases", headDoctorId: null, floorNumber: 4, roomCount: 6, bedCount: 10, isActive: true
    },
    {
        value: "urology", name: "Urology", code: "URO", category: "Clinical", image: "🔬", icon: "microwave", color: "#a855f7",
        description: "Kidney, Bladder & Prostate", headDoctorId: null, floorNumber: 4, roomCount: 8, bedCount: 14, isActive: true
    },
    {
        value: "ophthalmology", name: "Ophthalmology", code: "OFT", category: "Clinical", image: "👁️", icon: "eye", color: "#ef4444",
        description: "Eye Care & Vision Services", headDoctorId: null, floorNumber: 3, roomCount: 6, bedCount: 10, isActive: true
    },
    {
        value: "ent", name: "ENT (Otolaryngology)", code: "ENT", category: "Clinical", image: "👂", icon: "ear", color: "#06b6d4",
        description: "Ear, Nose & Throat", headDoctorId: null, floorNumber: 3, roomCount: 8, bedCount: 14, isActive: true
    },
    {
        value: "psychiatry", name: "Psychiatry", code: "PSY", category: "Clinical", image: "🧘", icon: "headphones", color: "#8b5cf6",
        description: "Mental Health & Counseling", headDoctorId: null, floorNumber: 2, roomCount: 6, bedCount: 12, isActive: true
    },
    {
        value: "obstetrics", name: "Obstetrics & Gynecology", code: "OBS", category: "Clinical", image: "🤰", icon: "baby-carriage", color: "#ec4899",
        description: "Women's Health & Maternity", headDoctorId: null, floorNumber: 2, roomCount: 10, bedCount: 20, isActive: true
    },
    {
        value: "geriatrics", name: "Geriatrics", code: "GER", category: "Clinical", image: "👴", icon: "user", color: "#6b7280",
        description: "Elderly Care & Management", headDoctorId: null, floorNumber: 2, roomCount: 10, bedCount: 20, isActive: true
    },

    // SURGICAL DEPARTMENTS (6)
    {
        value: "general-surgery", name: "General Surgery", code: "GEN", category: "Surgical", image: "🔪", icon: "scissors", color: "#10b981",
        description: "General Surgical Procedures", headDoctorId: null, floorNumber: 5, roomCount: 6, bedCount: 12, isActive: true
    },
    {
        value: "cardiac-surgery", name: "Cardiac Surgery", code: "CAR", category: "Surgical", image: "💓", icon: "heart-pulse", color: "#dc2626",
        description: "Heart Surgery & Procedures", headDoctorId: null, floorNumber: 5, roomCount: 4, bedCount: 8, isActive: true
    },
    {
        value: "neuro-surgery", name: "Neurosurgery", code: "NEU", category: "Surgical", image: "🧬", icon: "brain-circuit", color: "#8b5cf6",
        description: "Brain & Spine Surgery", headDoctorId: null, floorNumber: 5, roomCount: 4, bedCount: 8, isActive: true
    },
    {
        value: "plastic-surgery", name: "Plastic Surgery", code: "PLA", category: "Surgical", image: "✨", icon: "wand-2", color: "#f59e0b",
        description: "Reconstructive & Cosmetic Surgery", headDoctorId: null, floorNumber: 5, roomCount: 4, bedCount: 8, isActive: true
    },
    {
        value: "vascular-surgery", name: "Vascular Surgery", code: "VAS", category: "Surgical", image: "🩸", icon: "droplets", color: "#ef4444",
        description: "Vascular & Circulatory Surgery", headDoctorId: null, floorNumber: 5, roomCount: 4, bedCount: 8, isActive: true
    },
    {
        value: "transplant", name: "Transplant Surgery", code: "TRA", category: "Surgical", image: "🫀", icon: "heart", color: "#7c3aed",
        description: "Organ Transplant Procedures", headDoctorId: null, floorNumber: 5, roomCount: 4, bedCount: 8, isActive: true
    },

    // CRITICAL CARE DEPARTMENTS (5)
    {
        value: "icu", name: "ICU (Intensive Care)", code: "ICU", category: "Critical Care", image: "🏥", icon: "monitor", color: "#dc2626",
        description: "Intensive Care Unit for Critical Patients", headDoctorId: null, floorNumber: 1, roomCount: 6, bedCount: 12, isActive: true
    },
    {
        value: "nicu", name: "NICU (Neonatal ICU)", code: "NICU", category: "Critical Care", image: "👼", icon: "baby", color: "#06b6d4",
        description: "Neonatal Intensive Care Unit", headDoctorId: null, floorNumber: 2, roomCount: 4, bedCount: 8, isActive: true
    },
    {
        value: "picu", name: "PICU (Pediatric ICU)", code: "PICU", category: "Critical Care", image: "🧒", icon: "users", color: "#f97316",
        description: "Pediatric Intensive Care Unit", headDoctorId: null, floorNumber: 2, roomCount: 4, bedCount: 8, isActive: true
    },
    {
        value: "ccu", name: "CCU (Coronary Care)", code: "CCU", category: "Critical Care", image: "💗", icon: "heart", color: "#ec4899",
        description: "Coronary Care Unit", headDoctorId: null, floorNumber: 1, roomCount: 4, bedCount: 8, isActive: true
    },
    {
        value: "burn-unit", name: "Burn Unit", code: "BUR", category: "Critical Care", image: "🔥", icon: "flame", color: "#f59e0b",
        description: "Burn Treatment & Care", headDoctorId: null, floorNumber: 1, roomCount: 4, bedCount: 8, isActive: true
    },

    // DIAGNOSTIC DEPARTMENTS (4)
    {
        value: "radiology", name: "Radiology", code: "RAD", category: "Diagnostic", image: "📷", icon: "camera", color: "#3b82f6",
        description: "X-ray, CT, MRI & Imaging Services", headDoctorId: null, floorNumber: 0, roomCount: 8, bedCount: 0, isActive: true
    },
    {
        value: "pathology", name: "Pathology", code: "PAT", category: "Diagnostic", image: "🔬", icon: "microscope", color: "#14b8a6",
        description: "Laboratory & Tissue Analysis", headDoctorId: null, floorNumber: 0, roomCount: 6, bedCount: 0, isActive: true
    },
    {
        value: "laboratory", name: "Laboratory", code: "LAB", category: "Diagnostic", image: "🧪", icon: "test-tube", color: "#10b981",
        description: "Pathology & Diagnostic Testing", headDoctorId: null, floorNumber: 0, roomCount: 5, bedCount: 0, isActive: true
    },
    {
        value: "nuclear-medicine", name: "Nuclear Medicine", code: "NUC", category: "Diagnostic", image: "☢️", icon: "radio", color: "#f97316",
        description: "Nuclear Imaging & Therapy", headDoctorId: null, floorNumber: 0, roomCount: 4, bedCount: 0, isActive: true
    },

    // SUPPORT DEPARTMENTS (8)
    {
        value: "pharmacy", name: "Pharmacy", code: "PHM", category: "Support", image: "💊", icon: "pill", color: "#8b5cf6",
        description: "Medication Dispensing & Management", headDoctorId: null, floorNumber: 0, roomCount: 3, bedCount: 0, isActive: true
    },
    {
        value: "physical-therapy", name: "Physical Therapy", code: "PHY", category: "Support", image: "🏃", icon: "dumbbell", color: "#10b981",
        description: "Physical Rehabilitation & Therapy", headDoctorId: null, floorNumber: 0, roomCount: 6, bedCount: 0, isActive: true
    },
    {
        value: "occupational-therapy", name: "Occupational Therapy", code: "OCC", category: "Support", image: "🎯", icon: "target", color: "#f59e0b",
        description: "Occupational Rehabilitation", headDoctorId: null, floorNumber: 0, roomCount: 4, bedCount: 0, isActive: true
    },
    {
        value: "speech-therapy", name: "Speech Therapy", code: "SPE", category: "Support", image: "🗣️", icon: "volume", color: "#ec4899",
        description: "Speech & Language Therapy", headDoctorId: null, floorNumber: 0, roomCount: 4, bedCount: 0, isActive: true
    },
    {
        value: "nutrition", name: "Nutrition & Dietetics", code: "NUT", category: "Support", image: "🥗", icon: "apple", color: "#84cc16",
        description: "Nutrition & Diet Planning", headDoctorId: null, floorNumber: 0, roomCount: 4, bedCount: 0, isActive: true
    },
    {
        value: "social-work", name: "Social Work", code: "SOC", category: "Support", image: "🤝", icon: "users", color: "#6b7280",
        description: "Patient Advocacy & Counseling", headDoctorId: null, floorNumber: 0, roomCount: 4, bedCount: 0, isActive: true
    },
    {
        value: "blood-bank", name: "Blood Bank", code: "BLD", category: "Support", image: "🩸", icon: "droplets", color: "#ef4444",
        description: "Blood Storage & Transfusion", headDoctorId: null, floorNumber: 0, roomCount: 4, bedCount: 0, isActive: true
    },
    {
        value: "dialysis", name: "Dialysis Center", code: "DIA", category: "Support", image: "💉", icon: "syringe", color: "#3b82f6",
        description: "Dialysis Treatment Services", headDoctorId: null, floorNumber: 0, roomCount: 4, bedCount: 0, isActive: true
    },

    // ADMINISTRATIVE DEPARTMENTS (6)
    {
        value: "admissions", name: "Admissions", code: "ADM", category: "Administrative", image: "📝", icon: "clipboard-list", color: "#06b6d4",
        description: "Patient Registration & Admissions", headDoctorId: null, floorNumber: 0, roomCount: 4, bedCount: 0, isActive: true
    },
    {
        value: "billing", name: "Billing & Insurance", code: "BIL", category: "Administrative", image: "💳", icon: "credit-card", color: "#f97316",
        description: "Financial Operations & Claims", headDoctorId: null, floorNumber: 0, roomCount: 3, bedCount: 0, isActive: true
    },
    {
        value: "medical-records", name: "Medical Records", code: "REC", category: "Administrative", image: "📁", icon: "folder", color: "#6b7280",
        description: "Patient Records & Documentation", headDoctorId: null, floorNumber: 0, roomCount: 4, bedCount: 0, isActive: true
    },
    {
        value: "hr", name: "Human Resources", code: "HR", category: "Administrative", image: "👥", icon: "users", color: "#8b5cf6",
        description: "Staff Management & Recruitment", headDoctorId: null, floorNumber: 0, roomCount: 3, bedCount: 0, isActive: true
    },
    {
        value: "quality", name: "Quality Assurance", code: "QUA", category: "Administrative", image: "✅", icon: "check-circle", color: "#10b981",
        description: "Quality Control & Accreditation", headDoctorId: null, floorNumber: 0, roomCount: 3, bedCount: 0, isActive: true
    },
    {
        value: "infection-control", name: "Infection Control", code: "INF", category: "Administrative", image: "🦠", icon: "shield", color: "#ef4444",
        description: "Infection Prevention & Control", headDoctorId: null, floorNumber: 0, roomCount: 3, bedCount: 0, isActive: true
    }
];

// Extract unique categories in order of appearance
//const categoryOrder = [...new Set(departmentSeed.map((dept) => dept.category))];




export function DepartmentMultiSelect({ selectedDepartments, onSelectionChange, placeholder = "Select departments...", departments }) {
    const [open, setOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [selDept, setSelDept] = React.useState([])

    const categoryOrder = React.useMemo(() => {
        return [...new Set(departments.map((dept) => dept.category))];
    }, [departments]);

    const groupedDepartments = React.useMemo(() => {
        return departments.reduce((acc, dept) => {
            if (!acc[dept.category]) {
                acc[dept.category] = [];
            }
            acc[dept.category].push(dept);
            return acc;
        }, {});
    }, [departments]);


    // Filter departments based on search query
    const filteredGroupedDepartments = React.useMemo(() => {
        if (!searchQuery.trim()) return groupedDepartments;

        const query = searchQuery.toLowerCase();
        const filtered = {};

        for (const category of categoryOrder) {
            const depts = groupedDepartments[category];
            if (!depts) continue;

            const categoryMatches = category.toLowerCase().includes(query);
            const matchingDepts = categoryMatches
                ? depts
                : depts.filter(
                    (dept) =>
                        dept.name.toLowerCase().includes(query) ||
                        dept.description.toLowerCase().includes(query) ||
                        dept.code.toLowerCase().includes(query)
                );

            if (matchingDepts.length > 0) {
                filtered[category] = matchingDepts;
            }
        }

        return filtered;
    }, [searchQuery]);

    const toggleDepartment = (departmentValue) => {
        if (selectedDepartments.includes(departmentValue)) {
            onSelectionChange(selectedDepartments.filter((v) => v !== departmentValue));
            setSelDept(selectedDepartments.filter((v) => v !== departmentValue))
        } else {
            onSelectionChange([...selectedDepartments, departmentValue]);
            setSelDept([...selectedDepartments, departmentValue])
        }
    };

    const selectedCount = selectedDepartments.length;
    const selectedDepartment = departments.filter((department) => selectedDepartments.includes(department.id));

    console.log('selectedDepartment', selectedDepartment)

    return (

        <Select open={open} onOpenChange={setOpen}>
            <SelectTrigger className="w-full">
                <SelectValue placeholder={placeholder}>
                    {selectedCount > 0
                        ? `${selectedCount} department${selectedCount > 1 ? "s" : ""} selected`
                        : placeholder}
                    dsdsd
                </SelectValue>
            </SelectTrigger>
            <SelectContent className="w-[--radix-select-trigger-width] p-0 bg-card border  max-h-[400px] overflow-hidden">

                <div className="p-2 border-b border-border sticky top-0 bg-dropdown z-10">
                    {JSON.stringify(selDept)}
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search departments..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8 h-8 text-sm"
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
                <ScrollArea className="h-[340px]">
                    <div className="p-2 space-y-3">
                        {categoryOrder.map((category) => {
                            const depts = filteredGroupedDepartments[category];
                            if (!depts || depts.length === 0) return null;

                            return (
                                <div key={category}>
                                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        {category}
                                    </div>
                                    <div className="grid grid-cols-2 gap-1">
                                        {depts.map((dept) => {
                                            const isSelected = selectedDepartments.includes(dept.value);
                                            return (
                                                <button
                                                    key={dept.value}
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        toggleDepartment(dept.value);
                                                    }}
                                                    className={cn(
                                                        "flex items-start gap-2 rounded-md p-2 text-left transition-colors",
                                                        "hover:bg-dropdown-hover",
                                                        isSelected && "bg-dropdown-item"
                                                    )}
                                                >
                                                    <div
                                                        className={cn(
                                                            "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                                                            isSelected
                                                                ? "border-primary bg-primary"
                                                                : "border-primary bg-transparent"
                                                        )}
                                                    >
                                                        {isSelected && (
                                                            <Check className="h-3 w-3 text-primary-foreground" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <span className="font-medium text-dropdown-text text-sm truncate block">
                                                            {dept.name}
                                                        </span>
                                                        <p className="text-xs text-dropdown-muted mt-0.5 leading-relaxed line-clamp-2">
                                                            {dept.description}
                                                        </p>

                                                    </div>
                                                    <span className="shrink-0 mt-0.5">
                                                        <DepartmentIcon iconName={dept.icon} color={dept.color} />
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>
            </SelectContent>
        </Select>
    );
}
