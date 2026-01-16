import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Settings2, Building2, Stethoscope, Scissors, AlertTriangle, Search as SearchIcon, FlaskConical, HeartHandshake, ClipboardList } from "lucide-react";
import SectionHeader from "../_components/SectionHeader";
import { toast } from "sonner";

const departmentSeed = [
    // CLINICAL DEPARTMENTS (18)
    { value: "emergency", name: "Emergency (ER)", code: "ER", category: "Clinical", image: "🚨", icon: "sirens", color: "#ef4444", description: "24/7 Emergency & Trauma Care", headDoctorId: null, floorNumber: 1, roomCount: 12, bedCount: 25, isActive: true },
    { value: "cardiology", name: "Cardiology", code: "CAR", category: "Clinical", image: "❤️", icon: "heart", color: "#dc2626", description: "Heart & Vascular Conditions", headDoctorId: null, floorNumber: 3, roomCount: 8, bedCount: 20, isActive: true },
    { value: "neurology", name: "Neurology", code: "NEU", category: "Clinical", image: "🧠", icon: "brain", color: "#8b5cf6", description: "Brain, Spine & Nervous System", headDoctorId: null, floorNumber: 4, roomCount: 10, bedCount: 18, isActive: true },
    { value: "pediatrics", name: "Pediatrics", code: "PED", category: "Clinical", image: "👶", icon: "baby", color: "#06b6d4", description: "Child & Adolescent Care", headDoctorId: null, floorNumber: 2, roomCount: 15, bedCount: 30, isActive: true },
    { value: "orthopedics", name: "Orthopedics", code: "ORT", category: "Clinical", image: "🦴", icon: "activity", color: "#10b981", description: "Bone, Joint & Musculoskeletal", headDoctorId: null, floorNumber: 3, roomCount: 12, bedCount: 22, isActive: true },
    { value: "oncology", name: "Oncology", code: "ONC", category: "Clinical", image: "🎗️", icon: "zap", color: "#7c3aed", description: "Cancer Treatment & Chemotherapy", headDoctorId: null, floorNumber: 4, roomCount: 10, bedCount: 15, isActive: false },
    { value: "dermatology", name: "Dermatology", code: "DER", category: "Clinical", image: "🩹", icon: "sun", color: "#ec4899", description: "Skin, Hair & Nail Conditions", headDoctorId: null, floorNumber: 3, roomCount: 8, bedCount: 12, isActive: false },
    { value: "gastroenterology", name: "Gastroenterology", code: "GAS", category: "Clinical", image: "🫁", icon: "stomach", color: "#f97316", description: "Digestive System Disorders", headDoctorId: null, floorNumber: 3, roomCount: 8, bedCount: 16, isActive: false },
    { value: "nephrology", name: "Nephrology", code: "NEP", category: "Clinical", image: "🫘", icon: "droplets", color: "#3b82f6", description: "Kidney Disease & Dialysis", headDoctorId: null, floorNumber: 4, roomCount: 8, bedCount: 14, isActive: false },
    { value: "pulmonology", name: "Pulmonology", code: "PUL", category: "Clinical", image: "🌬️", icon: "lungs", color: "#14b8a6", description: "Lung & Respiratory Care", headDoctorId: null, floorNumber: 4, roomCount: 10, bedCount: 18, isActive: false },
    { value: "endocrinology", name: "Endocrinology", code: "END", category: "Clinical", image: "⚗️", icon: "beaker", color: "#f59e0b", description: "Hormone & Endocrine Disorders", headDoctorId: null, floorNumber: 4, roomCount: 6, bedCount: 12, isActive: false },
    { value: "rheumatology", name: "Rheumatology", code: "RHE", category: "Clinical", image: "💪", icon: "zap", color: "#84cc16", description: "Autoimmune & Joint Diseases", headDoctorId: null, floorNumber: 4, roomCount: 6, bedCount: 10, isActive: false },
    { value: "urology", name: "Urology", code: "URO", category: "Clinical", image: "🔬", icon: "microwave", color: "#a855f7", description: "Kidney, Bladder & Prostate", headDoctorId: null, floorNumber: 4, roomCount: 8, bedCount: 14, isActive: false },
    { value: "ophthalmology", name: "Ophthalmology", code: "OFT", category: "Clinical", image: "👁️", icon: "eye", color: "#ef4444", description: "Eye Care & Vision Services", headDoctorId: null, floorNumber: 3, roomCount: 6, bedCount: 10, isActive: false },
    { value: "ent", name: "ENT (Otolaryngology)", code: "ENT", category: "Clinical", image: "👂", icon: "ear", color: "#06b6d4", description: "Ear, Nose & Throat", headDoctorId: null, floorNumber: 3, roomCount: 8, bedCount: 14, isActive: false },
    { value: "psychiatry", name: "Psychiatry", code: "PSY", category: "Clinical", image: "🧘", icon: "headphones", color: "#8b5cf6", description: "Mental Health & Counseling", headDoctorId: null, floorNumber: 2, roomCount: 6, bedCount: 12, isActive: false },
    { value: "obstetrics", name: "Obstetrics & Gynecology", code: "OBS", category: "Clinical", image: "🤰", icon: "baby-carriage", color: "#ec4899", description: "Women's Health & Maternity", headDoctorId: null, floorNumber: 2, roomCount: 10, bedCount: 20, isActive: false },
    { value: "geriatrics", name: "Geriatrics", code: "GER", category: "Clinical", image: "👴", icon: "user", color: "#6b7280", description: "Elderly Care & Management", headDoctorId: null, floorNumber: 2, roomCount: 10, bedCount: 20, isActive: false },

    // SURGICAL DEPARTMENTS (6)
    { value: "general-surgery", name: "General Surgery", code: "GEN", category: "Surgical", image: "🔪", icon: "scissors", color: "#10b981", description: "General Surgical Procedures", headDoctorId: null, floorNumber: 5, roomCount: 6, bedCount: 12, isActive: true },
    { value: "cardiac-surgery", name: "Cardiac Surgery", code: "CAR", category: "Surgical", image: "💓", icon: "heart-pulse", color: "#dc2626", description: "Heart Surgery & Procedures", headDoctorId: null, floorNumber: 5, roomCount: 4, bedCount: 8, isActive: true },
    { value: "neuro-surgery", name: "Neurosurgery", code: "NEU", category: "Surgical", image: "🧬", icon: "brain-circuit", color: "#8b5cf6", description: "Brain & Spine Surgery", headDoctorId: null, floorNumber: 5, roomCount: 4, bedCount: 8, isActive: false },
    { value: "plastic-surgery", name: "Plastic Surgery", code: "PLA", category: "Surgical", image: "✨", icon: "wand-2", color: "#f59e0b", description: "Reconstructive & Cosmetic Surgery", headDoctorId: null, floorNumber: 5, roomCount: 4, bedCount: 8, isActive: false },
    { value: "vascular-surgery", name: "Vascular Surgery", code: "VAS", category: "Surgical", image: "🩸", icon: "droplets", color: "#ef4444", description: "Vascular & Circulatory Surgery", headDoctorId: null, floorNumber: 5, roomCount: 4, bedCount: 8, isActive: false },
    { value: "transplant", name: "Transplant Surgery", code: "TRA", category: "Surgical", image: "🫀", icon: "heart", color: "#7c3aed", description: "Organ Transplant Procedures", headDoctorId: null, floorNumber: 5, roomCount: 4, bedCount: 8, isActive: false },

    // CRITICAL CARE DEPARTMENTS (5)
    { value: "icu", name: "ICU (Intensive Care)", code: "ICU", category: "Critical Care", image: "🏥", icon: "monitor", color: "#dc2626", description: "Intensive Care Unit for Critical Patients", headDoctorId: null, floorNumber: 1, roomCount: 6, bedCount: 12, isActive: true },
    { value: "nicu", name: "NICU (Neonatal ICU)", code: "NICU", category: "Critical Care", image: "👼", icon: "baby", color: "#06b6d4", description: "Neonatal Intensive Care Unit", headDoctorId: null, floorNumber: 2, roomCount: 4, bedCount: 8, isActive: true },
    { value: "picu", name: "PICU (Pediatric ICU)", code: "PICU", category: "Critical Care", image: "🧒", icon: "users", color: "#f97316", description: "Pediatric Intensive Care Unit", headDoctorId: null, floorNumber: 2, roomCount: 4, bedCount: 8, isActive: false },
    { value: "ccu", name: "CCU (Coronary Care)", code: "CCU", category: "Critical Care", image: "💗", icon: "heart", color: "#ec4899", description: "Coronary Care Unit", headDoctorId: null, floorNumber: 1, roomCount: 4, bedCount: 8, isActive: false },
    { value: "burn-unit", name: "Burn Unit", code: "BUR", category: "Critical Care", image: "🔥", icon: "flame", color: "#f59e0b", description: "Burn Treatment & Care", headDoctorId: null, floorNumber: 1, roomCount: 4, bedCount: 8, isActive: false },

    // DIAGNOSTIC DEPARTMENTS (4)
    { value: "radiology", name: "Radiology", code: "RAD", category: "Diagnostic", image: "📷", icon: "camera", color: "#3b82f6", description: "X-ray, CT, MRI & Imaging Services", headDoctorId: null, floorNumber: 0, roomCount: 8, bedCount: 0, isActive: true },
    { value: "pathology", name: "Pathology", code: "PAT", category: "Diagnostic", image: "🔬", icon: "microscope", color: "#14b8a6", description: "Laboratory & Tissue Analysis", headDoctorId: null, floorNumber: 0, roomCount: 6, bedCount: 0, isActive: false },
    { value: "laboratory", name: "Laboratory", code: "LAB", category: "Diagnostic", image: "🧪", icon: "test-tube", color: "#10b981", description: "Pathology & Diagnostic Testing", headDoctorId: null, floorNumber: 0, roomCount: 5, bedCount: 0, isActive: false },
    { value: "nuclear-medicine", name: "Nuclear Medicine", code: "NUC", category: "Diagnostic", image: "☢️", icon: "radio", color: "#f97316", description: "Nuclear Imaging & Therapy", headDoctorId: null, floorNumber: 0, roomCount: 4, bedCount: 0, isActive: false },

    // SUPPORT DEPARTMENTS (8)
    { value: "pharmacy", name: "Pharmacy", code: "PHM", category: "Support", image: "💊", icon: "pill", color: "#8b5cf6", description: "Medication Dispensing & Management", headDoctorId: null, floorNumber: 0, roomCount: 3, bedCount: 0, isActive: true },
    { value: "physical-therapy", name: "Physical Therapy", code: "PHY", category: "Support", image: "🏃", icon: "dumbbell", color: "#10b981", description: "Physical Rehabilitation & Therapy", headDoctorId: null, floorNumber: 0, roomCount: 6, bedCount: 0, isActive: false },
    { value: "occupational-therapy", name: "Occupational Therapy", code: "OCC", category: "Support", image: "🎯", icon: "target", color: "#f59e0b", description: "Occupational Rehabilitation", headDoctorId: null, floorNumber: 0, roomCount: 4, bedCount: 0, isActive: false },
    { value: "speech-therapy", name: "Speech Therapy", code: "SPE", category: "Support", image: "🗣️", icon: "volume", color: "#ec4899", description: "Speech & Language Therapy", headDoctorId: null, floorNumber: 0, roomCount: 4, bedCount: 0, isActive: false },
    { value: "nutrition", name: "Nutrition & Dietetics", code: "NUT", category: "Support", image: "🥗", icon: "apple", color: "#84cc16", description: "Nutrition & Diet Planning", headDoctorId: null, floorNumber: 0, roomCount: 4, bedCount: 0, isActive: false },
    { value: "social-work", name: "Social Work", code: "SOC", category: "Support", image: "🤝", icon: "users", color: "#6b7280", description: "Patient Advocacy & Counseling", headDoctorId: null, floorNumber: 0, roomCount: 4, bedCount: 0, isActive: false },
    { value: "blood-bank", name: "Blood Bank", code: "BLD", category: "Support", image: "🩸", icon: "droplets", color: "#ef4444", description: "Blood Storage & Transfusion", headDoctorId: null, floorNumber: 0, roomCount: 4, bedCount: 0, isActive: false },
    { value: "dialysis", name: "Dialysis Center", code: "DIA", category: "Support", image: "💉", icon: "syringe", color: "#3b82f6", description: "Dialysis Treatment Services", headDoctorId: null, floorNumber: 0, roomCount: 4, bedCount: 0, isActive: false },

    // ADMINISTRATIVE DEPARTMENTS (6)
    { value: "admissions", name: "Admissions", code: "ADM", category: "Administrative", image: "📝", icon: "clipboard-list", color: "#06b6d4", description: "Patient Registration & Admissions", headDoctorId: null, floorNumber: 0, roomCount: 4, bedCount: 0, isActive: true },
    { value: "billing", name: "Billing & Insurance", code: "BIL", category: "Administrative", image: "💳", icon: "credit-card", color: "#f97316", description: "Financial Operations & Claims", headDoctorId: null, floorNumber: 0, roomCount: 3, bedCount: 0, isActive: false },
    { value: "medical-records", name: "Medical Records", code: "REC", category: "Administrative", image: "📁", icon: "folder", color: "#6b7280", description: "Patient Records & Documentation", headDoctorId: null, floorNumber: 0, roomCount: 4, bedCount: 0, isActive: false },
    { value: "hr", name: "Human Resources", code: "HR", category: "Administrative", image: "👥", icon: "users", color: "#8b5cf6", description: "Staff Management & Recruitment", headDoctorId: null, floorNumber: 0, roomCount: 3, bedCount: 0, isActive: false },
    { value: "quality", name: "Quality Assurance", code: "QUA", category: "Administrative", image: "✅", icon: "check-circle", color: "#10b981", description: "Quality Control & Accreditation", headDoctorId: null, floorNumber: 0, roomCount: 3, bedCount: 0, isActive: false },
    { value: "infection-control", name: "Infection Control", code: "INF", category: "Administrative", image: "🦠", icon: "shield", color: "#ef4444", description: "Infection Prevention & Control", headDoctorId: null, floorNumber: 0, roomCount: 3, bedCount: 0, isActive: false },
];

const categoryIcons = {
    "Clinical": Stethoscope,
    "Surgical": Scissors,
    "Critical Care": AlertTriangle,
    "Diagnostic": SearchIcon,
    "Support": HeartHandshake,
    "Administrative": ClipboardList,
};

const categoryOrder = ["Clinical", "Surgical", "Critical Care", "Diagnostic", "Support", "Administrative"];

export function DepartmentsSettings() {
    const [departments, setDepartments] = useState(departmentSeed);

    const groupedDepartments = useMemo(() => {
        const groups = {};
        categoryOrder.forEach(cat => {
            groups[cat] = departments.filter(d => d.category === cat);
        });
        return groups;
    }, [departments]);

    const totalEnabled = useMemo(() => departments.filter(d => d.isActive).length, [departments]);
    const totalDepartments = departments.length;

    const toggleDepartment = (value) => {
        setDepartments(prev => prev.map(d =>
            d.value === value ? { ...d, isActive: !d.isActive } : d
        ));
    };

    const toggleCategory = (category, enabled) => {
        setDepartments(prev => prev.map(d =>
            d.category === category ? { ...d, isActive: enabled } : d
        ));
    };

    const enableAll = () => {
        setDepartments(prev => prev.map(d => ({ ...d, isActive: true })));
    };

    const disableAll = () => {
        setDepartments(prev => prev.map(d => ({ ...d, isActive: false })));
    };

    const handleSave = () => {
        toast.success("Department settings saved successfully");
        console.log("Enabled departments:", departments.filter(d => d.isActive).map(d => d.value));
    };

    const getCategoryEnabledCount = (category) => {
        const categoryDepts = groupedDepartments[category] || [];
        return categoryDepts.filter(d => d.isActive).length;
    };

    return (
        <div className="flex flex-col h-full">
            <SectionHeader
                title="Departments"
                description="Enable and configure hospital departments for your facility"
                onSave={handleSave}
            />

            <ScrollArea className="flex-1 h-[60vh] p-4">
                <div className="space-y-6">
                    {/* Summary and Actions */}
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            {totalEnabled} of {totalDepartments} departments enabled
                        </p>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={enableAll}>
                                Enable All
                            </Button>
                            <Button variant="outline" size="sm" onClick={disableAll}>
                                Disable All
                            </Button>
                        </div>
                    </div>

                    {/* Category Groups */}
                    {categoryOrder.map(category => {
                        const categoryDepts = groupedDepartments[category] || [];
                        const enabledCount = getCategoryEnabledCount(category);
                        const allEnabled = enabledCount === categoryDepts.length;
                        const CategoryIcon = categoryIcons[category] || Building2;

                        return (
                            <div key={category} className="space-y-3">
                                {/* Category Header */}
                                <div className="flex items-center justify-between rounded-lg bg-card border border-border p-4">
                                    <div className="flex items-center gap-3">
                                        <CategoryIcon className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <h3 className="font-medium text-foreground">{category}</h3>
                                            <p className="text-xs text-muted-foreground">{enabledCount} of {categoryDepts.length} enabled</p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={allEnabled}
                                        onCheckedChange={(checked) => toggleCategory(category, checked)}
                                    />
                                </div>

                                {/* Department Cards Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {categoryDepts.map(dept => (
                                        <div
                                            key={dept.value}
                                            className={`
                                                    flex items-center justify-between rounded-lg border p-3 transition-all cursor-pointer
                                                    ${dept.isActive
                                                    ? 'bg-card border-l-4 border-border'
                                                    : 'bg-background/50 border-border opacity-60'
                                                }
                                                `}
                                            style={{ borderLeftColor: dept.isActive ? dept.color : undefined }}
                                            onClick={() => toggleDepartment(dept.value)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Checkbox
                                                    checked={dept.isActive}
                                                    onCheckedChange={() => toggleDepartment(dept.value)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="data-[state=checked]:bg-primary"
                                                />
                                                <span className="text-lg">{dept.image}</span>
                                                <span className={`text-sm font-medium ${dept.isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                    {dept.name}
                                                </span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toast.info(`Configure ${dept.name}`, { description: dept.description });
                                                }}
                                            >
                                                <Settings2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </ScrollArea>
        </div>
    );
}
