import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Check,
    X,
    Plus,
    Building2,
    MapPin,
    Phone,
    Mail,
    Globe,
    Stethoscope,
    Users,
    Siren,
    Heart,
    Brain,
    Baby,
    Activity,
    Zap,
    Sun,
    Droplets,
    Eye,
    Ear,
    Headphones,
    Scissors,
    HeartPulse,
    BrainCircuit,
    Wand2,
    Monitor,
    Flame,
    Camera,
    Microscope,
    TestTube,
    Radio,
    Pill,
    Dumbbell,
    Target,
    Volume2,
    Apple,
    Syringe,
    ClipboardList,
    CreditCard,
    Folder,
    CheckCircle,
    CheckCircle2,
    Shield,
    ShieldCheck,
    ShieldAlert,
    Search,
    DoorOpen,
    Bed,
    Trash2,
    Edit,
    Lock,
    KeyRound,
    FileText,
    BarChart3,
    UserCog,
    Crown,
    User,
    Settings,
    ImagePlus,
    Upload,
} from "lucide-react";

// =============================================================================
// STEPPER COMPONENT
// =============================================================================
const SetupStepper = ({ steps, currentStep }) => {
    return (
        <div className="w-full py-4 overflow-x-auto">
            <div className="flex items-center justify-between min-w-max">
                {steps.map((step, index) => (
                    <div key={step.id} className="flex items-center flex-1 min-w-0">
                        <div className="flex flex-col items-center min-w-[60px]">
                            <div
                                className={cn(
                                    "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold transition-all duration-300 shrink-0",
                                    currentStep > step.id
                                        ? "bg-primary text-primary-foreground"
                                        : currentStep === step.id
                                            ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                                            : "bg-muted text-muted-foreground"
                                )}
                            >
                                {currentStep > step.id ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : step.id}
                            </div>
                            <div className="mt-2 text-center">
                                <p
                                    className={cn(
                                        "text-xs sm:text-sm font-medium whitespace-nowrap",
                                        currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                                    )}
                                >
                                    {step.title}
                                </p>
                                {step.description && (
                                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 hidden sm:block">{step.description}</p>
                                )}
                            </div>
                        </div>
                        {index < steps.length - 1 && (
                            <div
                                className={cn(
                                    "flex-1 h-0.5 mx-2 sm:mx-4 transition-all duration-300 min-w-[20px]",
                                    currentStep > step.id ? "bg-primary" : "bg-muted"
                                )}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// =============================================================================
// HOSPITAL STEP
// =============================================================================
const HospitalStep = ({ data, onChange }) => {
    const handleChange = (field, value) => {
        onChange({ ...data, [field]: value });
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Logo must be less than 5MB");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                handleChange("logo", reader.result);
                handleChange("logoName", file.name);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeLogo = () => {
        handleChange("logo", null);
        handleChange("logoName", null);
    };

    return (
        <div className="space-y-6">
            {/* Logo Upload Section */}
            <div className="space-y-2">
                <Label className="flex items-center gap-2">
                    <ImagePlus className="w-4 h-4 text-primary" />
                    Hospital Logo
                </Label>
                <div className="flex items-start gap-4">
                    <div className="relative">
                        {data.logo ? (
                            <div className="relative group">
                                <img
                                    src={data.logo}
                                    alt="Hospital logo"
                                    className="w-24 h-24 object-contain rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 p-2"
                                />
                                <button
                                    type="button"
                                    onClick={removeLogo}
                                    className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ) : (
                            <label
                                htmlFor="logo-upload"
                                className="w-24 h-24 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-muted transition-colors"
                            >
                                <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                                <span className="text-xs text-muted-foreground">Upload</span>
                            </label>
                        )}
                        <input
                            id="logo-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                        />
                    </div>
                    <div className="flex-1 text-sm text-muted-foreground">
                        <p>Upload your hospital logo.</p>
                        <p className="text-xs mt-1">Recommended: 200x200px, PNG or JPG, max 5MB</p>
                        {data.logoName && (
                            <p className="text-xs mt-2 text-foreground font-medium">{data.logoName}</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="hospital-name" className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-primary" />
                        Hospital Name *
                    </Label>
                    <Input
                        id="hospital-name"
                        placeholder="Enter hospital name"
                        value={data.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="hospital-type">Hospital Type *</Label>
                    <Select value={data.type} onValueChange={(v) => handleChange("type", v)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="multispecialty">Multi-Specialty</SelectItem>
                            <SelectItem value="general">General Hospital</SelectItem>
                            <SelectItem value="specialty">Specialty Hospital</SelectItem>
                            <SelectItem value="teaching">Teaching Hospital</SelectItem>
                            <SelectItem value="research">Research Hospital</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    Address *
                </Label>
                <Input
                    id="address"
                    placeholder="Street address"
                    value={data.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                        id="city"
                        placeholder="City"
                        value={data.city}
                        onChange={(e) => handleChange("city", e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                        id="state"
                        placeholder="State"
                        value={data.state}
                        onChange={(e) => handleChange("state", e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code *</Label>
                    <Input
                        id="zipCode"
                        placeholder="ZIP Code"
                        value={data.zipCode}
                        onChange={(e) => handleChange("zipCode", e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-primary" />
                        Phone *
                    </Label>
                    <Input
                        id="phone"
                        placeholder="+1 (555) 000-0000"
                        value={data.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-primary" />
                        Email *
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="contact@hospital.com"
                        value={data.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="website" className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-primary" />
                    Website
                </Label>
                <Input
                    id="website"
                    placeholder="https://www.hospital.com"
                    value={data.website}
                    onChange={(e) => handleChange("website", e.target.value)}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    placeholder="Brief description of the hospital..."
                    value={data.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    rows={3}
                />
            </div>
        </div>
    );
};

// =============================================================================
// DEPARTMENTS STEP
// =============================================================================
const departmentIconMap = {
    sirens: Siren,
    heart: Heart,
    brain: Brain,
    baby: Baby,
    activity: Activity,
    zap: Zap,
    sun: Sun,
    droplets: Droplets,
    eye: Eye,
    ear: Ear,
    headphones: Headphones,
    user: Users,
    "baby-carriage": Baby,
    scissors: Scissors,
    "heart-pulse": HeartPulse,
    "brain-circuit": BrainCircuit,
    "wand-2": Wand2,
    monitor: Monitor,
    users: Users,
    flame: Flame,
    camera: Camera,
    microscope: Microscope,
    "test-tube": TestTube,
    radio: Radio,
    pill: Pill,
    dumbbell: Dumbbell,
    target: Target,
    volume: Volume2,
    apple: Apple,
    syringe: Syringe,
    "clipboard-list": ClipboardList,
    "credit-card": CreditCard,
    folder: Folder,
    "check-circle": CheckCircle,
    shield: Shield,
    stomach: Activity,
    beaker: TestTube,
    lungs: Activity,
    microwave: Monitor,
};

const departmentTemplates = [
    { value: "emergency", name: "Emergency (ER)", code: "ER", category: "Clinical", image: "🚨", icon: "sirens", color: "#ef4444", description: "24/7 Emergency & Trauma Care", floorNumber: 1, roomCount: 12, bedCount: 25 },
    { value: "cardiology", name: "Cardiology", code: "CAR", category: "Clinical", image: "❤️", icon: "heart", color: "#dc2626", description: "Heart & Vascular Conditions", floorNumber: 3, roomCount: 8, bedCount: 20 },
    { value: "neurology", name: "Neurology", code: "NEU", category: "Clinical", image: "🧠", icon: "brain", color: "#8b5cf6", description: "Brain, Spine & Nervous System", floorNumber: 4, roomCount: 10, bedCount: 18 },
    { value: "pediatrics", name: "Pediatrics", code: "PED", category: "Clinical", image: "👶", icon: "baby", color: "#06b6d4", description: "Child & Adolescent Care", floorNumber: 2, roomCount: 15, bedCount: 30 },
    { value: "orthopedics", name: "Orthopedics", code: "ORT", category: "Clinical", image: "🦴", icon: "activity", color: "#10b981", description: "Bone, Joint & Musculoskeletal", floorNumber: 3, roomCount: 12, bedCount: 22 },
    { value: "oncology", name: "Oncology", code: "ONC", category: "Clinical", image: "🎗️", icon: "zap", color: "#7c3aed", description: "Cancer Treatment & Chemotherapy", floorNumber: 4, roomCount: 10, bedCount: 15 },
    { value: "dermatology", name: "Dermatology", code: "DER", category: "Clinical", image: "🩹", icon: "sun", color: "#ec4899", description: "Skin, Hair & Nail Conditions", floorNumber: 3, roomCount: 8, bedCount: 12 },
    { value: "gastroenterology", name: "Gastroenterology", code: "GAS", category: "Clinical", image: "🫁", icon: "stomach", color: "#f97316", description: "Digestive System Disorders", floorNumber: 3, roomCount: 8, bedCount: 16 },
    { value: "nephrology", name: "Nephrology", code: "NEP", category: "Clinical", image: "🫘", icon: "droplets", color: "#3b82f6", description: "Kidney Disease & Dialysis", floorNumber: 4, roomCount: 8, bedCount: 14 },
    { value: "pulmonology", name: "Pulmonology", code: "PUL", category: "Clinical", image: "🌬️", icon: "lungs", color: "#14b8a6", description: "Lung & Respiratory Care", floorNumber: 4, roomCount: 10, bedCount: 18 },
    { value: "endocrinology", name: "Endocrinology", code: "END", category: "Clinical", image: "⚗️", icon: "beaker", color: "#f59e0b", description: "Hormone & Endocrine Disorders", floorNumber: 4, roomCount: 6, bedCount: 12 },
    { value: "rheumatology", name: "Rheumatology", code: "RHE", category: "Clinical", image: "💪", icon: "zap", color: "#84cc16", description: "Autoimmune & Joint Diseases", floorNumber: 4, roomCount: 6, bedCount: 10 },
    { value: "urology", name: "Urology", code: "URO", category: "Clinical", image: "🔬", icon: "microwave", color: "#a855f7", description: "Kidney, Bladder & Prostate", floorNumber: 4, roomCount: 8, bedCount: 14 },
    { value: "ophthalmology", name: "Ophthalmology", code: "OFT", category: "Clinical", image: "👁️", icon: "eye", color: "#ef4444", description: "Eye Care & Vision Services", floorNumber: 3, roomCount: 6, bedCount: 10 },
    { value: "ent", name: "ENT (Otolaryngology)", code: "ENT", category: "Clinical", image: "👂", icon: "ear", color: "#06b6d4", description: "Ear, Nose & Throat", floorNumber: 3, roomCount: 8, bedCount: 14 },
    { value: "psychiatry", name: "Psychiatry", code: "PSY", category: "Clinical", image: "🧘", icon: "headphones", color: "#8b5cf6", description: "Mental Health & Counseling", floorNumber: 2, roomCount: 6, bedCount: 12 },
    { value: "obstetrics", name: "Obstetrics & Gynecology", code: "OBS", category: "Clinical", image: "🤰", icon: "baby-carriage", color: "#ec4899", description: "Women's Health & Maternity", floorNumber: 2, roomCount: 10, bedCount: 20 },
    { value: "geriatrics", name: "Geriatrics", code: "GER", category: "Clinical", image: "👴", icon: "user", color: "#6b7280", description: "Elderly Care & Management", floorNumber: 2, roomCount: 10, bedCount: 20 },
    { value: "general-surgery", name: "General Surgery", code: "GEN", category: "Surgical", image: "🔪", icon: "scissors", color: "#10b981", description: "General Surgical Procedures", floorNumber: 5, roomCount: 6, bedCount: 12 },
    { value: "cardiac-surgery", name: "Cardiac Surgery", code: "CAR", category: "Surgical", image: "💓", icon: "heart-pulse", color: "#dc2626", description: "Heart Surgery & Procedures", floorNumber: 5, roomCount: 4, bedCount: 8 },
    { value: "neuro-surgery", name: "Neurosurgery", code: "NEU", category: "Surgical", image: "🧬", icon: "brain-circuit", color: "#8b5cf6", description: "Brain & Spine Surgery", floorNumber: 5, roomCount: 4, bedCount: 8 },
    { value: "plastic-surgery", name: "Plastic Surgery", code: "PLA", category: "Surgical", image: "✨", icon: "wand-2", color: "#f59e0b", description: "Reconstructive & Cosmetic Surgery", floorNumber: 5, roomCount: 4, bedCount: 8 },
    { value: "vascular-surgery", name: "Vascular Surgery", code: "VAS", category: "Surgical", image: "🩸", icon: "droplets", color: "#ef4444", description: "Vascular & Circulatory Surgery", floorNumber: 5, roomCount: 4, bedCount: 8 },
    { value: "transplant", name: "Transplant Surgery", code: "TRA", category: "Surgical", image: "🫀", icon: "heart", color: "#7c3aed", description: "Organ Transplant Procedures", floorNumber: 5, roomCount: 4, bedCount: 8 },
    { value: "icu", name: "ICU (Intensive Care)", code: "ICU", category: "Critical Care", image: "🏥", icon: "monitor", color: "#dc2626", description: "Intensive Care Unit for Critical Patients", floorNumber: 1, roomCount: 6, bedCount: 12 },
    { value: "nicu", name: "NICU (Neonatal ICU)", code: "NICU", category: "Critical Care", image: "👼", icon: "baby", color: "#06b6d4", description: "Neonatal Intensive Care Unit", floorNumber: 2, roomCount: 4, bedCount: 8 },
    { value: "picu", name: "PICU (Pediatric ICU)", code: "PICU", category: "Critical Care", image: "🧒", icon: "users", color: "#f97316", description: "Pediatric Intensive Care Unit", floorNumber: 2, roomCount: 4, bedCount: 8 },
    { value: "ccu", name: "CCU (Coronary Care)", code: "CCU", category: "Critical Care", image: "💗", icon: "heart", color: "#ec4899", description: "Coronary Care Unit", floorNumber: 1, roomCount: 4, bedCount: 8 },
    { value: "burn-unit", name: "Burn Unit", code: "BUR", category: "Critical Care", image: "🔥", icon: "flame", color: "#f59e0b", description: "Burn Treatment & Care", floorNumber: 1, roomCount: 4, bedCount: 8 },
    { value: "radiology", name: "Radiology", code: "RAD", category: "Diagnostic", image: "📷", icon: "camera", color: "#3b82f6", description: "X-ray, CT, MRI & Imaging Services", floorNumber: 0, roomCount: 8, bedCount: 0 },
    { value: "pathology", name: "Pathology", code: "PAT", category: "Diagnostic", image: "🔬", icon: "microscope", color: "#14b8a6", description: "Laboratory & Tissue Analysis", floorNumber: 0, roomCount: 6, bedCount: 0 },
    { value: "laboratory", name: "Laboratory", code: "LAB", category: "Diagnostic", image: "🧪", icon: "test-tube", color: "#10b981", description: "Pathology & Diagnostic Testing", floorNumber: 0, roomCount: 5, bedCount: 0 },
    { value: "nuclear-medicine", name: "Nuclear Medicine", code: "NUC", category: "Diagnostic", image: "☢️", icon: "radio", color: "#f97316", description: "Nuclear Imaging & Therapy", floorNumber: 0, roomCount: 4, bedCount: 0 },
    { value: "pharmacy", name: "Pharmacy", code: "PHM", category: "Support", image: "💊", icon: "pill", color: "#8b5cf6", description: "Medication Dispensing & Management", floorNumber: 0, roomCount: 3, bedCount: 0 },
    { value: "physical-therapy", name: "Physical Therapy", code: "PHY", category: "Support", image: "🏃", icon: "dumbbell", color: "#10b981", description: "Physical Rehabilitation & Therapy", floorNumber: 0, roomCount: 6, bedCount: 0 },
    { value: "occupational-therapy", name: "Occupational Therapy", code: "OCC", category: "Support", image: "🎯", icon: "target", color: "#f59e0b", description: "Occupational Rehabilitation", floorNumber: 0, roomCount: 4, bedCount: 0 },
    { value: "speech-therapy", name: "Speech Therapy", code: "SPE", category: "Support", image: "🗣️", icon: "volume", color: "#ec4899", description: "Speech & Language Therapy", floorNumber: 0, roomCount: 4, bedCount: 0 },
    { value: "nutrition", name: "Nutrition & Dietetics", code: "NUT", category: "Support", image: "🥗", icon: "apple", color: "#84cc16", description: "Nutrition & Diet Planning", floorNumber: 0, roomCount: 4, bedCount: 0 },
    { value: "social-work", name: "Social Work", code: "SOC", category: "Support", image: "🤝", icon: "users", color: "#6b7280", description: "Patient Advocacy & Counseling", floorNumber: 0, roomCount: 4, bedCount: 0 },
    { value: "blood-bank", name: "Blood Bank", code: "BLD", category: "Support", image: "🩸", icon: "droplets", color: "#ef4444", description: "Blood Storage & Transfusion", floorNumber: 0, roomCount: 4, bedCount: 0 },
    { value: "dialysis", name: "Dialysis Center", code: "DIA", category: "Support", image: "💉", icon: "syringe", color: "#3b82f6", description: "Dialysis Treatment Services", floorNumber: 0, roomCount: 4, bedCount: 0 },
    { value: "admissions", name: "Admissions", code: "ADM", category: "Administrative", image: "📝", icon: "clipboard-list", color: "#06b6d4", description: "Patient Registration & Admissions", floorNumber: 0, roomCount: 4, bedCount: 0 },
    { value: "billing", name: "Billing & Insurance", code: "BIL", category: "Administrative", image: "💳", icon: "credit-card", color: "#f97316", description: "Financial Operations & Claims", floorNumber: 0, roomCount: 3, bedCount: 0 },
    { value: "medical-records", name: "Medical Records", code: "REC", category: "Administrative", image: "📁", icon: "folder", color: "#6b7280", description: "Patient Records & Documentation", floorNumber: 0, roomCount: 4, bedCount: 0 },
    { value: "hr", name: "Human Resources", code: "HR", category: "Administrative", image: "👥", icon: "users", color: "#8b5cf6", description: "Staff Management & Recruitment", floorNumber: 0, roomCount: 3, bedCount: 0 },
    { value: "quality", name: "Quality Assurance", code: "QUA", category: "Administrative", image: "✅", icon: "check-circle", color: "#10b981", description: "Quality Control & Accreditation", floorNumber: 0, roomCount: 3, bedCount: 0 },
    { value: "infection-control", name: "Infection Control", code: "INF", category: "Administrative", image: "🦠", icon: "shield", color: "#ef4444", description: "Infection Prevention & Control", floorNumber: 0, roomCount: 3, bedCount: 0 },
];

const departmentCategories = ["All", "Clinical", "Surgical", "Critical Care", "Diagnostic", "Support", "Administrative"];

const DepartmentsStep = ({ departments, onChange }) => {
    const [newDept, setNewDept] = useState({ name: "", head: "", specialization: "" });
    const [searchTerm, setSearchTerm] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");

    const addDepartment = () => {
        if (!newDept.name) return;
        const dept = {
            id: Date.now().toString(),
            name: newDept.name,
            head: newDept.head,
            specializations: newDept.specialization ? [newDept.specialization] : [],
        };
        onChange([...departments, dept]);
        setNewDept({ name: "", head: "", specialization: "" });
    };

    const removeDepartment = (id) => {
        onChange(departments.filter((d) => d.id !== id));
    };

    const addTemplateDepartment = (template) => {
        if (departments.some((d) => d.name === template.name)) return;
        const dept = {
            id: Date.now().toString() + template.value,
            name: template.name,
            head: "",
            specializations: [],
            code: template.code,
            category: template.category,
            icon: template.icon,
            color: template.color,
            description: template.description,
            floorNumber: template.floorNumber,
            roomCount: template.roomCount,
            bedCount: template.bedCount,
        };
        onChange([...departments, dept]);
    };

    const getIcon = (iconName) => {
        if (!iconName) return Stethoscope;
        return departmentIconMap[iconName] || Stethoscope;
    };

    const filteredTemplates = departmentTemplates.filter((template) => {
        const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            template.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === "All" || template.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const addedDepartmentNames = new Set(departments.map((d) => d.name));

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search departments..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Tabs value={activeCategory} onValueChange={setActiveCategory}>
                    <TabsList className="w-full flex-wrap h-auto gap-1 bg-muted/50 p-1">
                        {departmentCategories.map((category) => (
                            <TabsTrigger key={category} value={category} className="text-xs px-3 py-1.5">
                                {category}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            </div>

            <ScrollArea className="h-[280px] rounded-lg border p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredTemplates.map((template) => {
                        const isAdded = addedDepartmentNames.has(template.name);
                        const IconComponent = getIcon(template.icon);
                        return (
                            <Card
                                key={template.value}
                                className={`cursor-pointer transition-all hover:shadow-md ${isAdded ? "bg-primary/10 border-primary" : "hover:border-primary/50"
                                    }`}
                                onClick={() => !isAdded && addTemplateDepartment(template)}
                            >
                                <CardContent className="p-3">
                                    <div className="flex items-start gap-3">
                                        <div
                                            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                                            style={{ backgroundColor: `${template.color}20` }}
                                        >
                                            <IconComponent className="w-5 h-5" style={{ color: template.color }} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg">{template.image}</span>
                                                <p className="font-medium text-sm truncate">{template.name}</p>
                                            </div>
                                            <p className="text-xs text-muted-foreground truncate">{template.description}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                                    {template.code}
                                                </Badge>
                                                <span className="text-[10px] text-muted-foreground">
                                                    Floor {template.floorNumber} • {template.roomCount} rooms
                                                </span>
                                            </div>
                                        </div>
                                        {isAdded && <Badge className="shrink-0 text-[10px]">Added</Badge>}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </ScrollArea>

            <div className="border-t pt-4">
                <Label className="text-sm font-medium mb-3 block">Add Custom Department</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Input
                        placeholder="Department name"
                        value={newDept.name}
                        onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                    />
                    <Input
                        placeholder="Department head"
                        value={newDept.head}
                        onChange={(e) => setNewDept({ ...newDept, head: e.target.value })}
                    />
                    <Button onClick={addDepartment} className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Custom
                    </Button>
                </div>
            </div>

            {departments.length > 0 && (
                <div className="space-y-3">
                    <Label className="text-sm font-medium">Selected Departments ({departments.length})</Label>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-muted/30 rounded-lg">
                        {departments.map((dept) => {
                            const IconComponent = getIcon(dept.icon);
                            return (
                                <Badge
                                    key={dept.id}
                                    variant="secondary"
                                    className="pl-2 pr-1 py-1.5 gap-2 group"
                                    style={dept.color ? { borderColor: dept.color, borderWidth: 1 } : undefined}
                                >
                                    <IconComponent className="w-3.5 h-3.5" style={dept.color ? { color: dept.color } : undefined} />
                                    <span>{dept.name}</span>
                                    <button
                                        onClick={() => removeDepartment(dept.id)}
                                        className="ml-1 p-0.5 rounded hover:bg-destructive/20 transition-colors"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </Badge>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

// =============================================================================
// ADMIN SETUP STEP
// =============================================================================
const permissionCategories = [
    {
        id: "dashboard",
        name: "Dashboard",
        icon: BarChart3,
        permissions: [
            { id: "dashboard.view", name: "View Dashboard", description: "Access to view dashboard analytics" },
            { id: "dashboard.export", name: "Export Reports", description: "Export dashboard reports" },
        ],
    },
    {
        id: "hospitals",
        name: "Hospitals",
        icon: Building2,
        permissions: [
            { id: "hospitals.view", name: "View Hospitals", description: "View hospital information" },
            { id: "hospitals.create", name: "Create Hospitals", description: "Add new hospitals" },
            { id: "hospitals.edit", name: "Edit Hospitals", description: "Modify hospital details" },
            { id: "hospitals.delete", name: "Delete Hospitals", description: "Remove hospitals" },
        ],
    },
    {
        id: "departments",
        name: "Departments",
        icon: Stethoscope,
        permissions: [
            { id: "departments.view", name: "View Departments", description: "View department information" },
            { id: "departments.create", name: "Create Departments", description: "Add new departments" },
            { id: "departments.edit", name: "Edit Departments", description: "Modify department details" },
            { id: "departments.delete", name: "Delete Departments", description: "Remove departments" },
        ],
    },
    {
        id: "beds",
        name: "Beds & Rooms",
        icon: Bed,
        permissions: [
            { id: "beds.view", name: "View Beds", description: "View bed information" },
            { id: "beds.manage", name: "Manage Beds", description: "Assign, update bed status" },
            { id: "beds.create", name: "Create Beds/Rooms", description: "Add new beds and rooms" },
            { id: "beds.delete", name: "Delete Beds/Rooms", description: "Remove beds and rooms" },
        ],
    },
    {
        id: "staff",
        name: "Staff Management",
        icon: Users,
        permissions: [
            { id: "staff.view", name: "View Staff", description: "View staff information" },
            { id: "staff.create", name: "Add Staff", description: "Add new staff members" },
            { id: "staff.edit", name: "Edit Staff", description: "Modify staff details" },
            { id: "staff.delete", name: "Remove Staff", description: "Remove staff members" },
        ],
    },
    {
        id: "patients",
        name: "Patients",
        icon: FileText,
        permissions: [
            { id: "patients.view", name: "View Patients", description: "View patient records" },
            { id: "patients.create", name: "Register Patients", description: "Register new patients" },
            { id: "patients.edit", name: "Edit Patients", description: "Modify patient records" },
            { id: "patients.delete", name: "Delete Patients", description: "Remove patient records" },
        ],
    },
    {
        id: "admin",
        name: "Administration",
        icon: Settings,
        permissions: [
            { id: "admin.users", name: "Manage Users", description: "Manage admin users" },
            { id: "admin.roles", name: "Manage Roles", description: "Create and edit roles" },
            { id: "admin.settings", name: "System Settings", description: "Access system settings" },
            { id: "admin.audit", name: "View Audit Logs", description: "Access audit logs" },
        ],
    },
];

const roleTemplates = [
    {
        id: "super-admin",
        name: "Super Admin",
        description: "Full system access with all permissions",
        permissions: permissionCategories.flatMap((cat) => cat.permissions.map((p) => p.id)),
        color: "#dc2626",
        icon: "crown",
        isSystem: true,
    },
    {
        id: "hospital-admin",
        name: "Hospital Admin",
        description: "Manage hospital operations and staff",
        permissions: ["dashboard.view", "dashboard.export", "hospitals.view", "hospitals.edit", "departments.view", "departments.create", "departments.edit", "beds.view", "beds.manage", "beds.create", "staff.view", "staff.create", "staff.edit", "patients.view", "patients.create", "patients.edit"],
        color: "#7c3aed",
        icon: "shield-check",
    },
    {
        id: "department-head",
        name: "Department Head",
        description: "Manage department operations",
        permissions: ["dashboard.view", "departments.view", "beds.view", "beds.manage", "staff.view", "patients.view", "patients.create", "patients.edit"],
        color: "#2563eb",
        icon: "user-cog",
    },
    {
        id: "receptionist",
        name: "Receptionist",
        description: "Patient registration and bed allocation",
        permissions: ["dashboard.view", "beds.view", "beds.manage", "patients.view", "patients.create", "patients.edit"],
        color: "#059669",
        icon: "user",
    },
    {
        id: "viewer",
        name: "Viewer",
        description: "Read-only access to all data",
        permissions: ["dashboard.view", "hospitals.view", "departments.view", "beds.view", "staff.view", "patients.view"],
        color: "#6b7280",
        icon: "eye",
    },
];

const roleIconMap = {
    crown: Crown,
    "shield-check": ShieldCheck,
    "shield-alert": ShieldAlert,
    shield: Shield,
    "user-cog": UserCog,
    user: User,
    eye: Eye,
    settings: Settings,
    lock: Lock,
};

const AdminSetupStep = ({ roles, adminUsers, onRolesChange, onAdminUsersChange }) => {
    const [activeTab, setActiveTab] = useState("roles");
    const [editingRole, setEditingRole] = useState(null);
    const [newUser, setNewUser] = useState({ name: "", email: "", roleId: "" });

    const addRoleTemplate = (template) => {
        if (roles.some((r) => r.id === template.id)) return;
        onRolesChange([...roles, { ...template }]);
    };

    const createCustomRole = () => {
        const newRole = {
            id: `custom-${Date.now()}`,
            name: "Custom Role",
            description: "Custom role with selected permissions",
            permissions: [],
            color: "#6b7280",
            icon: "shield",
        };
        setEditingRole(newRole);
    };

    const saveRole = (role) => {
        const existingIndex = roles.findIndex((r) => r.id === role.id);
        if (existingIndex >= 0) {
            const updated = [...roles];
            updated[existingIndex] = role;
            onRolesChange(updated);
        } else {
            onRolesChange([...roles, role]);
        }
        setEditingRole(null);
    };

    const removeRole = (roleId) => {
        onRolesChange(roles.filter((r) => r.id !== roleId));
        onAdminUsersChange(adminUsers.filter((u) => u.roleId !== roleId));
    };

    const addAdminUser = () => {
        if (!newUser.name || !newUser.email || !newUser.roleId) return;
        const user = {
            id: `user-${Date.now()}`,
            name: newUser.name,
            email: newUser.email,
            roleId: newUser.roleId,
            status: "pending",
        };
        onAdminUsersChange([...adminUsers, user]);
        setNewUser({ name: "", email: "", roleId: "" });
    };

    const removeAdminUser = (userId) => {
        onAdminUsersChange(adminUsers.filter((u) => u.id !== userId));
    };

    const togglePermission = (permissionId) => {
        if (!editingRole) return;
        const hasPermission = editingRole.permissions.includes(permissionId);
        setEditingRole({
            ...editingRole,
            permissions: hasPermission
                ? editingRole.permissions.filter((p) => p !== permissionId)
                : [...editingRole.permissions, permissionId],
        });
    };

    const toggleCategory = (categoryId) => {
        if (!editingRole) return;
        const category = permissionCategories.find((c) => c.id === categoryId);
        if (!category) return;
        const categoryPermIds = category.permissions.map((p) => p.id);
        const allSelected = categoryPermIds.every((id) => editingRole.permissions.includes(id));
        setEditingRole({
            ...editingRole,
            permissions: allSelected
                ? editingRole.permissions.filter((p) => !categoryPermIds.includes(p))
                : [...new Set([...editingRole.permissions, ...categoryPermIds])],
        });
    };

    const getRoleIcon = (iconName) => {
        return roleIconMap[iconName] || Shield;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 pb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                    <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h3 className="font-semibold">Admin Setup</h3>
                    <p className="text-sm text-muted-foreground">Configure roles, permissions, and admin users</p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="roles" className="gap-2">
                        <KeyRound className="w-4 h-4" />
                        Roles & Permissions
                    </TabsTrigger>
                    <TabsTrigger value="users" className="gap-2">
                        <Users className="w-4 h-4" />
                        Admin Users
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="roles" className="space-y-4 mt-4">
                    {editingRole ? (
                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base">
                                        {roles.some((r) => r.id === editingRole.id) ? "Edit Role" : "Create Role"}
                                    </CardTitle>
                                    <Button variant="ghost" size="sm" onClick={() => setEditingRole(null)}>
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Role Name</Label>
                                        <Input
                                            value={editingRole.name}
                                            onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                                            placeholder="Enter role name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Icon</Label>
                                        <Select
                                            value={editingRole.icon}
                                            onValueChange={(value) => setEditingRole({ ...editingRole, icon: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(roleIconMap).map(([key, Icon]) => (
                                                    <SelectItem key={key} value={key}>
                                                        <div className="flex items-center gap-2">
                                                            <Icon className="w-4 h-4" />
                                                            {key}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Input
                                        value={editingRole.description}
                                        onChange={(e) => setEditingRole({ ...editingRole, description: e.target.value })}
                                        placeholder="Role description"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Color</Label>
                                    <div className="flex gap-2">
                                        {["#dc2626", "#7c3aed", "#2563eb", "#059669", "#f59e0b", "#6b7280"].map((color) => (
                                            <button
                                                key={color}
                                                className={`w-8 h-8 rounded-full border-2 ${editingRole.color === color ? "border-foreground" : "border-transparent"}`}
                                                style={{ backgroundColor: color }}
                                                onClick={() => setEditingRole({ ...editingRole, color })}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label>Permissions</Label>
                                    <ScrollArea className="h-[200px] border rounded-lg p-3">
                                        <div className="space-y-4">
                                            {permissionCategories.map((category) => {
                                                const Icon = category.icon;
                                                const categoryPermIds = category.permissions.map((p) => p.id);
                                                const selectedCount = categoryPermIds.filter((id) => editingRole.permissions.includes(id)).length;
                                                const allSelected = selectedCount === categoryPermIds.length;
                                                return (
                                                    <div key={category.id} className="space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <Checkbox checked={allSelected} onCheckedChange={() => toggleCategory(category.id)} />
                                                            <Icon className="w-4 h-4 text-muted-foreground" />
                                                            <span className="font-medium text-sm">{category.name}</span>
                                                            <Badge variant="secondary" className="text-xs">{selectedCount}/{categoryPermIds.length}</Badge>
                                                        </div>
                                                        <div className="ml-6 grid grid-cols-2 gap-2">
                                                            {category.permissions.map((perm) => (
                                                                <div key={perm.id} className="flex items-center gap-2">
                                                                    <Checkbox checked={editingRole.permissions.includes(perm.id)} onCheckedChange={() => togglePermission(perm.id)} />
                                                                    <span className="text-sm text-muted-foreground">{perm.name}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </ScrollArea>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => setEditingRole(null)}>Cancel</Button>
                                    <Button onClick={() => saveRole(editingRole)}>Save Role</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label>Role Templates</Label>
                                    <Button size="sm" variant="outline" onClick={createCustomRole}>
                                        <Plus className="w-4 h-4 mr-1" />
                                        Custom Role
                                    </Button>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {roleTemplates.map((template) => {
                                        const Icon = getRoleIcon(template.icon);
                                        const isAdded = roles.some((r) => r.id === template.id);
                                        return (
                                            <Card
                                                key={template.id}
                                                className={`cursor-pointer transition-all hover:shadow-md ${isAdded ? "ring-2 ring-primary bg-primary/5" : ""}`}
                                                onClick={() => !isAdded && addRoleTemplate(template)}
                                            >
                                                <CardContent className="p-3">
                                                    <div className="flex items-start gap-3">
                                                        <div className="p-2 rounded-lg" style={{ backgroundColor: `${template.color}20` }}>
                                                            <Icon className="w-4 h-4" style={{ color: template.color }} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <p className="font-medium text-sm truncate">{template.name}</p>
                                                                {template.isSystem && <Badge variant="secondary" className="text-xs">System</Badge>}
                                                            </div>
                                                            <p className="text-xs text-muted-foreground line-clamp-2">{template.description}</p>
                                                            <p className="text-xs text-muted-foreground mt-1">{template.permissions.length} permissions</p>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </div>
                            {roles.length > 0 && (
                                <div className="space-y-3">
                                    <Label>Added Roles ({roles.length})</Label>
                                    <div className="grid gap-2">
                                        {roles.map((role) => {
                                            const Icon = getRoleIcon(role.icon);
                                            return (
                                                <Card key={role.id}>
                                                    <CardContent className="p-3 flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 rounded-lg" style={{ backgroundColor: `${role.color}20` }}>
                                                                <Icon className="w-4 h-4" style={{ color: role.color }} />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-sm">{role.name}</p>
                                                                <p className="text-xs text-muted-foreground">{role.permissions.length} permissions</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Button variant="ghost" size="sm" onClick={() => setEditingRole(role)}>
                                                                <Edit className="w-4 h-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => removeRole(role.id)}>
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </TabsContent>

                <TabsContent value="users" className="space-y-4 mt-4">
                    {roles.length === 0 ? (
                        <Card className="border-dashed">
                            <CardContent className="p-6 text-center">
                                <ShieldAlert className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                                <p className="text-sm text-muted-foreground">Add roles first before adding admin users</p>
                                <Button variant="link" size="sm" className="mt-2" onClick={() => setActiveTab("roles")}>Go to Roles</Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">Add Admin User</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label>Full Name</Label>
                                            <Input value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} placeholder="John Doe" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Email</Label>
                                            <Input type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} placeholder="john@hospital.com" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Role</Label>
                                            <Select value={newUser.roleId} onValueChange={(value) => setNewUser({ ...newUser, roleId: value })}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select role" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {roles.map((role) => {
                                                        const Icon = getRoleIcon(role.icon);
                                                        return (
                                                            <SelectItem key={role.id} value={role.id}>
                                                                <div className="flex items-center gap-2">
                                                                    <Icon className="w-4 h-4" style={{ color: role.color }} />
                                                                    {role.name}
                                                                </div>
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <Button onClick={addAdminUser} disabled={!newUser.name || !newUser.email || !newUser.roleId}>
                                        <Plus className="w-4 h-4 mr-1" />
                                        Add User
                                    </Button>
                                </CardContent>
                            </Card>
                            {adminUsers.length > 0 && (
                                <div className="space-y-3">
                                    <Label>Admin Users ({adminUsers.length})</Label>
                                    <div className="grid gap-2">
                                        {adminUsers.map((user) => {
                                            const role = roles.find((r) => r.id === user.roleId);
                                            const Icon = role ? getRoleIcon(role.icon) : User;
                                            return (
                                                <Card key={user.id}>
                                                    <CardContent className="p-3 flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 rounded-full bg-muted">
                                                                <User className="w-4 h-4" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-sm">{user.name}</p>
                                                                <p className="text-xs text-muted-foreground">{user.email}</p>
                                                            </div>
                                                            {role && (
                                                                <Badge variant="secondary" className="flex items-center gap-1" style={{ backgroundColor: `${role.color}20`, color: role.color }}>
                                                                    <Icon className="w-3 h-3" />
                                                                    {role.name}
                                                                </Badge>
                                                            )}
                                                            <Badge variant={user.status === "active" ? "default" : "secondary"} className="capitalize">{user.status}</Badge>
                                                        </div>
                                                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => removeAdminUser(user.id)}>
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </TabsContent>
            </Tabs>

            <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg text-sm">
                <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{roles.length}</span>
                    <span className="text-muted-foreground">Roles</span>
                </div>
                <div className="w-px h-4 bg-border" />
                <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{adminUsers.length}</span>
                    <span className="text-muted-foreground">Admin Users</span>
                </div>
            </div>
        </div>
    );
};

// =============================================================================
// ROOMS & BEDS STEP
// =============================================================================
const roomTypes = [
    { value: "icu", label: "ICU", icon: "🏥", color: "#ef4444", defaultBeds: 2 },
    { value: "private", label: "Private Room", icon: "🛏️", color: "#8b5cf6", defaultBeds: 1 },
    { value: "semi-private", label: "Semi-Private", icon: "🛌", color: "#06b6d4", defaultBeds: 2 },
    { value: "general", label: "General Ward", icon: "🏨", color: "#10b981", defaultBeds: 4 },
    { value: "operation", label: "Operation Theater", icon: "🔬", color: "#f97316", defaultBeds: 1 },
    { value: "emergency", label: "Emergency", icon: "🚨", color: "#dc2626", defaultBeds: 3 },
    { value: "isolation", label: "Isolation Room", icon: "🔒", color: "#6b7280", defaultBeds: 1 },
    { value: "nicu", label: "NICU", icon: "👶", color: "#ec4899", defaultBeds: 4 },
    { value: "labor", label: "Labor & Delivery", icon: "🤰", color: "#f472b6", defaultBeds: 1 },
    { value: "recovery", label: "Recovery Room", icon: "💊", color: "#14b8a6", defaultBeds: 3 },
];

const bedTypes = [
    { value: "standard", label: "Standard Bed", icon: "🛏️" },
    { value: "electric", label: "Electric Bed", icon: "⚡" },
    { value: "icu", label: "ICU Bed", icon: "🏥" },
    { value: "pediatric", label: "Pediatric Bed", icon: "👶" },
    { value: "bariatric", label: "Bariatric Bed", icon: "🛋️" },
    { value: "low", label: "Low Bed", icon: "📉" },
    { value: "stretcher", label: "Stretcher", icon: "🚑" },
    { value: "bassinet", label: "Bassinet", icon: "🍼" },
];

const RoomsBedsStep = ({ rooms, beds, departments, onRoomsChange, onBedsChange }) => {
    const [newRoom, setNewRoom] = useState({ number: "", type: "", floor: "1", capacity: 1, departmentId: "" });
    const [expandedRooms, setExpandedRooms] = useState(new Set());

    const addRoom = () => {
        if (!newRoom.number || !newRoom.type) return;
        const roomType = roomTypes.find((t) => t.value === newRoom.type);
        const capacity = roomType?.defaultBeds || newRoom.capacity;
        const room = { id: Date.now().toString(), ...newRoom, capacity };
        onRoomsChange([...rooms, room]);
        const newBeds = [];
        const bedType = newRoom.type === "icu" ? "icu" : newRoom.type === "nicu" ? "pediatric" : "standard";
        for (let i = 1; i <= capacity; i++) {
            newBeds.push({ id: `${room.id}-bed-${i}`, number: `${newRoom.number}-B${i}`, type: bedType, roomId: room.id });
        }
        onBedsChange([...beds, ...newBeds]);
        setNewRoom({ number: "", type: "", floor: "1", capacity: 1, departmentId: "" });
        setExpandedRooms((prev) => new Set([...prev, room.id]));
    };

    const removeRoom = (roomId) => {
        onRoomsChange(rooms.filter((r) => r.id !== roomId));
        onBedsChange(beds.filter((b) => b.roomId !== roomId));
    };

    const addBedToRoom = (roomId) => {
        const room = rooms.find((r) => r.id === roomId);
        if (!room) return;
        const roomBeds = beds.filter((b) => b.roomId === roomId);
        const newBedNumber = roomBeds.length + 1;
        const newBed = { id: `${roomId}-bed-${Date.now()}`, number: `${room.number}-B${newBedNumber}`, type: room.type === "icu" ? "icu" : "standard", roomId };
        onBedsChange([...beds, newBed]);
        onRoomsChange(rooms.map((r) => r.id === roomId ? { ...r, capacity: r.capacity + 1 } : r));
    };

    const removeBed = (bedId) => {
        const bed = beds.find((b) => b.id === bedId);
        if (!bed) return;
        onBedsChange(beds.filter((b) => b.id !== bedId));
        onRoomsChange(rooms.map((r) => r.id === bed.roomId ? { ...r, capacity: Math.max(0, r.capacity - 1) } : r));
    };

    const updateBedType = (bedId, newType) => {
        onBedsChange(beds.map((b) => (b.id === bedId ? { ...b, type: newType } : b)));
    };

    const toggleRoomExpanded = (roomId) => {
        setExpandedRooms((prev) => {
            const next = new Set(prev);
            if (next.has(roomId)) next.delete(roomId);
            else next.add(roomId);
            return next;
        });
    };

    const addBulkRooms = () => {
        const bulkRooms = [];
        const bulkBeds = [];
        const floors = ["1", "2", "3"];
        const types = ["general", "private", "icu", "semi-private"];
        floors.forEach((floor) => {
            types.forEach((type, index) => {
                const roomId = `bulk-${Date.now()}-${floor}-${index}`;
                const roomNumber = `${floor}0${index + 1}`;
                const roomType = roomTypes.find((t) => t.value === type);
                const capacity = roomType?.defaultBeds || 2;
                bulkRooms.push({ id: roomId, number: roomNumber, type, floor, capacity, departmentId: departments[0]?.id || "" });
                const bedType = type === "icu" ? "icu" : "standard";
                for (let i = 1; i <= capacity; i++) {
                    bulkBeds.push({ id: `${roomId}-bed-${i}`, number: `${roomNumber}-B${i}`, type: bedType, roomId });
                }
            });
        });
        onRoomsChange([...rooms, ...bulkRooms]);
        onBedsChange([...beds, ...bulkBeds]);
    };

    const getRoomTypeInfo = (type) => roomTypes.find((t) => t.value === type) || { label: type, icon: "🏠", color: "#6b7280" };
    const getBedTypeInfo = (type) => bedTypes.find((t) => t.value === type) || { label: type, icon: "🛏️" };
    const getBedsForRoom = (roomId) => beds.filter((b) => b.roomId === roomId);
    const totalBeds = beds.length;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                    <DoorOpen className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">{rooms.length} Rooms</span>
                </div>
                <div className="w-px h-4 bg-border" />
                <div className="flex items-center gap-2">
                    <Bed className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">{totalBeds} Beds</span>
                </div>
                <div className="flex-1" />
                <Button variant="outline" onClick={addBulkRooms} size="sm">
                    <Zap className="w-4 h-4 mr-2" />
                    Quick Add Sample
                </Button>
            </div>

            <Card>
                <CardHeader className="py-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Add New Room
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-xs">Room Number</Label>
                            <Input placeholder="e.g., 101" value={newRoom.number} onChange={(e) => setNewRoom({ ...newRoom, number: e.target.value })} />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Room Type</Label>
                            <Select value={newRoom.type} onValueChange={(v) => setNewRoom({ ...newRoom, type: v })}>
                                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                                <SelectContent>
                                    {roomTypes.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            <span className="flex items-center gap-2"><span>{type.icon}</span><span>{type.label}</span></span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Floor</Label>
                            <Select value={newRoom.floor} onValueChange={(v) => setNewRoom({ ...newRoom, floor: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {[...Array(10)].map((_, i) => (
                                        <SelectItem key={i} value={String(i)}>{i === 0 ? "Ground Floor" : `Floor ${i}`}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Department</Label>
                            <Select value={newRoom.departmentId} onValueChange={(v) => setNewRoom({ ...newRoom, departmentId: v })}>
                                <SelectTrigger><SelectValue placeholder="Select dept" /></SelectTrigger>
                                <SelectContent>
                                    {departments.map((dept) => (<SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">&nbsp;</Label>
                            <Button onClick={addRoom} className="w-full"><Plus className="w-4 h-4 mr-1" />Add Room</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {rooms.length > 0 ? (
                <ScrollArea className="h-[300px] rounded-lg border">
                    <div className="p-3 space-y-2">
                        {rooms.map((room) => {
                            const roomType = getRoomTypeInfo(room.type);
                            const roomBeds = getBedsForRoom(room.id);
                            const isExpanded = expandedRooms.has(room.id);
                            return (
                                <Collapsible key={room.id} open={isExpanded} onOpenChange={() => toggleRoomExpanded(room.id)}>
                                    <Card className="overflow-hidden">
                                        <CollapsibleTrigger asChild>
                                            <div className="p-3 flex items-center gap-3 cursor-pointer hover:bg-muted/50 transition-colors" style={{ borderLeft: `4px solid ${roomType.color}` }}>
                                                {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
                                                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0" style={{ backgroundColor: `${roomType.color}15` }}>{roomType.icon}</div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-medium text-sm">Room {room.number}</p>
                                                        <Badge variant="outline" className="text-[10px]">{roomType.label}</Badge>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">Floor {room.floor} • {roomBeds.length} beds</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); addBedToRoom(room.id); }} className="h-7 px-2"><Plus className="w-3 h-3 mr-1" />Bed</Button>
                                                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); removeRoom(room.id); }} className="h-7 w-7 text-destructive hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button>
                                                </div>
                                            </div>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <div className="px-3 pb-3 pt-1 border-t bg-muted/30">
                                                {roomBeds.length > 0 ? (
                                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 mt-2">
                                                        {roomBeds.map((bed) => {
                                                            const bedType = getBedTypeInfo(bed.type);
                                                            return (
                                                                <div key={bed.id} className="flex items-center gap-2 p-2 bg-background rounded-md border group">
                                                                    <span className="text-sm">{bedType.icon}</span>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-xs font-medium truncate">{bed.number}</p>
                                                                        <Select value={bed.type} onValueChange={(v) => updateBedType(bed.id, v)}>
                                                                            <SelectTrigger className="h-5 text-[10px] border-0 p-0 bg-transparent"><SelectValue /></SelectTrigger>
                                                                            <SelectContent>
                                                                                {bedTypes.map((type) => (
                                                                                    <SelectItem key={type.value} value={type.value}>
                                                                                        <span className="flex items-center gap-1 text-xs"><span>{type.icon}</span><span>{type.label}</span></span>
                                                                                    </SelectItem>
                                                                                ))}
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </div>
                                                                    <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeBed(bed.id)}><X className="w-3 h-3" /></Button>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-muted-foreground text-center py-2">No beds added to this room</p>
                                                )}
                                            </div>
                                        </CollapsibleContent>
                                    </Card>
                                </Collapsible>
                            );
                        })}
                    </div>
                </ScrollArea>
            ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border rounded-lg">
                    <Building2 className="w-12 h-12 mb-3 opacity-50" />
                    <p className="text-sm">No rooms added yet</p>
                    <p className="text-xs">Add rooms above or use Quick Add Sample</p>
                </div>
            )}
        </div>
    );
};

// =============================================================================
// REVIEW STEP
// =============================================================================
const ReviewStep = ({ hospital, departments, rooms, beds }) => {
    const stats = [
        { icon: Building2, label: "Hospital", value: hospital.name || "Not set", color: "text-blue-500" },
        { icon: Stethoscope, label: "Departments", value: departments.length, color: "text-purple-500" },
        { icon: DoorOpen, label: "Rooms", value: rooms.length, color: "text-amber-500" },
        { icon: Bed, label: "Beds", value: beds.length, color: "text-emerald-500" },
    ];

    return (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Review Your Setup</h3>
                <p className="text-sm text-muted-foreground">Please review the information before completing the setup</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <Card key={stat.label}>
                        <CardContent className="p-4 text-center">
                            <stat.icon className={`w-8 h-8 mx-auto mb-2 ${stat.color}`} />
                            <p className="text-2xl font-bold">{stat.value}</p>
                            <p className="text-xs text-muted-foreground">{stat.label}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2"><Building2 className="w-4 h-4" />Hospital Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between text-sm"><span className="text-muted-foreground">Name:</span><span className="font-medium">{hospital.name || "-"}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-muted-foreground">Type:</span><span className="font-medium capitalize">{hospital.type || "-"}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-muted-foreground">Location:</span><span className="font-medium">{hospital.city && hospital.state ? `${hospital.city}, ${hospital.state}` : "-"}</span></div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2"><Stethoscope className="w-4 h-4" />Departments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {departments.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                                {departments.slice(0, 8).map((dept) => (<Badge key={dept.id} variant="secondary" className="text-xs">{dept.name}</Badge>))}
                                {departments.length > 8 && (<Badge variant="outline" className="text-xs">+{departments.length - 8} more</Badge>)}
                            </div>
                        ) : (<p className="text-sm text-muted-foreground">No departments added</p>)}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2"><DoorOpen className="w-4 h-4" />Room Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {rooms.length > 0 ? (
                            <div className="space-y-1">
                                {Object.entries(rooms.reduce((acc, room) => { acc[room.type] = (acc[room.type] || 0) + 1; return acc; }, {})).map(([type, count]) => (
                                    <div key={type} className="flex justify-between text-sm"><span className="text-muted-foreground capitalize">{type}:</span><span className="font-medium">{count}</span></div>
                                ))}
                            </div>
                        ) : (<p className="text-sm text-muted-foreground">No rooms added</p>)}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2"><Bed className="w-4 h-4" />Bed Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {beds.length > 0 ? (
                            <div className="space-y-1">
                                {Object.entries(beds.reduce((acc, bed) => { acc[bed.type] = (acc[bed.type] || 0) + 1; return acc; }, {})).map(([type, count]) => (
                                    <div key={type} className="flex justify-between text-sm"><span className="text-muted-foreground capitalize">{type}:</span><span className="font-medium">{count}</span></div>
                                ))}
                            </div>
                        ) : (<p className="text-sm text-muted-foreground">No beds added</p>)}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

// =============================================================================
// MAIN APP SETUP COMPONENT
// =============================================================================
const steps = [
    { id: 1, title: "Hospital", description: "Basic info" },
    { id: 2, title: "Departments", description: "Add departments" },
    { id: 3, title: "Admin Setup", description: "Roles & permissions" },
    { id: 4, title: "Rooms & Beds", description: "Configure spaces" },
    { id: 5, title: "Review", description: "Confirm setup" },
];

export const AppSetup = ({ onOpenChange }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [hospitalData, setHospitalData] = useState({
        name: "", type: "", address: "", city: "", state: "", zipCode: "", phone: "", email: "", website: "", description: "",
    });
    const [departments, setDepartments] = useState([]);
    const [roles, setRoles] = useState([]);
    const [adminUsers, setAdminUsers] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [beds, setBeds] = useState([]);
    const [open, setopen] = useState(false)


    const handleNext = () => {
        // Console log the current section data
        switch (currentStep) {
            case 1:
                console.log("Hospital Data:", hospitalData);
                break;
            case 2:
                console.log("Departments Data:", departments);
                break;
            case 3:
                console.log("Admin Setup Data:", { roles, adminUsers });
                break;
            case 4:
                console.log("Rooms & Beds Data:", { rooms, beds });
                break;
            default:
                break;
        }
        if (currentStep < steps.length) setCurrentStep(currentStep + 1);
    };

    const handlePrevious = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const handleComplete = () => {
        // Console log the full setup data
        const fullSetupData = {
            hospital: hospitalData,
            departments: departments,
            adminSetup: {
                roles: roles,
                adminUsers: adminUsers,
            },
            roomsAndBeds: {
                rooms: rooms,
                beds: beds,
            },
        };
        console.log("Complete Setup Data:", fullSetupData);

        toast.success("Hospital setup completed successfully!");
        onOpenChange(false);
        setCurrentStep(1);
        setHospitalData({ name: "", type: "", address: "", city: "", state: "", zipCode: "", phone: "", email: "", website: "", description: "" });
        setDepartments([]);
        setRoles([]);
        setAdminUsers([]);
        setRooms([]);
        setBeds([]);
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1: return <HospitalStep data={hospitalData} onChange={setHospitalData} />;
            case 2: return <DepartmentsStep departments={departments} onChange={setDepartments} />;
            case 3: return <AdminSetupStep roles={roles} adminUsers={adminUsers} onRolesChange={setRoles} onAdminUsersChange={setAdminUsers} />;
            case 4: return <RoomsBedsStep rooms={rooms} beds={beds} departments={departments} onRoomsChange={setRooms} onBedsChange={setBeds} />;
            case 5: return <ReviewStep hospital={hospitalData} departments={departments} rooms={rooms} beds={beds} />;
            default: return null;
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl  overflow-hidden flex flex-col min-w-[80%] min-h-[80%] max-h-[80%] hide-dialog-close ">
                <DialogHeader className="pb-0 hidden">
                    <DialogTitle className="text-xl">App Setup</DialogTitle>
                </DialogHeader>
                <div className="px-2">
                    <SetupStepper steps={steps} currentStep={currentStep} />
                </div>
                <div className="flex-1 overflow-y-auto py-4 px-2 min-h-[400px]">
                    {renderStep()}
                </div>
                <div className="flex items-center justify-between pt-4 border-t">


                    <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1} className="gap-2">
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                    </Button>
                    {currentStep < steps.length ? (
                        <Button onClick={handleNext} className="gap-2">
                            Next
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    ) : (
                        <Button onClick={handleComplete} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                            <Check className="w-4 h-4" />
                            Complete Setup
                        </Button>
                    )}

                </div>
            </DialogContent>
        </Dialog>
    );
};
