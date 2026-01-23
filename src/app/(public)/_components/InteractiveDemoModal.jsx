import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Play,
    Users,
    Calendar,
    FlaskConical,
    CreditCard,
    Pill,
    ChevronRight,
    ChevronLeft,
    CheckCircle2,
    Stethoscope,
    BedDouble,
    ClipboardList,
    Scan,
    Syringe,
    HeartPulse,
    Ambulance,
    Droplets,
    UtensilsCrossed,
    Warehouse,
    FileText,
    Shield,
    UserCog,
    Clock,
    Baby,
    Scissors,
    Building2,
    Thermometer,
    Activity,
    Phone,
    Truck,
    Sparkles,
    Layers,
    BarChart3,
    MessageSquare,
    Receipt,
    FolderOpen,
    Grid3X3
} from "lucide-react";

const demoCategories = [
    { id: "patient-care", name: "Patient Care", color: "text-blue-400" },
    { id: "clinical", name: "Clinical Services", color: "text-emerald-400" },
    { id: "support", name: "Support Services", color: "text-amber-400" },
    { id: "admin", name: "Administration", color: "text-purple-400" },
];

const demoWorkflows = [
    // Patient Care
    {
        id: "patient-registration",
        category: "patient-care",
        title: "Patient Registration",
        icon: Users,
        color: "text-blue-400",
        bgColor: "bg-blue-500/10",
        steps: [
            { title: "Enter Patient Details", description: "Name, contact, demographics, and photo capture" },
            { title: "Generate Unique UHID", description: "Auto-generated unique hospital ID for lifetime tracking" },
            { title: "Add Emergency Contact", description: "Store emergency contact and relationship details" },
            { title: "Capture Documents", description: "Upload ID proof, insurance cards, and referrals" },
            { title: "Complete Registration", description: "Patient is now in the system with digital card" }
        ]
    },
    {
        id: "appointment-booking",
        category: "patient-care",
        title: "Appointment Booking",
        icon: Calendar,
        color: "text-cyan-400",
        bgColor: "bg-cyan-500/10",
        steps: [
            { title: "Search Patient", description: "Find existing patient or quick registration" },
            { title: "Select Department & Doctor", description: "Choose specialty and available doctors" },
            { title: "Pick Date & Time", description: "View available slots with real-time calendar" },
            { title: "Set Appointment Type", description: "New consultation, follow-up, or procedure" },
            { title: "Send Confirmation", description: "Patient receives SMS/email with appointment details" }
        ]
    },
    {
        id: "opd-consultation",
        category: "patient-care",
        title: "OPD Consultation",
        icon: Stethoscope,
        color: "text-teal-400",
        bgColor: "bg-teal-500/10",
        steps: [
            { title: "Patient Check-in", description: "Verify appointment and vitals recording" },
            { title: "Doctor Queue", description: "Patient appears in doctor's digital queue" },
            { title: "Clinical Examination", description: "Record symptoms, history, and examination" },
            { title: "Diagnosis & Treatment", description: "Enter diagnosis codes and treatment plan" },
            { title: "Prescription & Orders", description: "Generate e-prescription and lab/radiology orders" },
            { title: "Follow-up Scheduling", description: "Book next appointment if required" }
        ]
    },
    {
        id: "ipd-admission",
        category: "patient-care",
        title: "IPD Admission",
        icon: BedDouble,
        color: "text-indigo-400",
        bgColor: "bg-indigo-500/10",
        steps: [
            { title: "Admission Request", description: "Doctor initiates admission with diagnosis" },
            { title: "Bed Allocation", description: "View bed availability and assign room/ward" },
            { title: "Deposit Collection", description: "Collect advance payment or verify insurance" },
            { title: "Admission Documentation", description: "Consent forms and admission sheet" },
            { title: "Nursing Handover", description: "Transfer patient details to nursing station" },
            { title: "Treatment Plan Setup", description: "Configure medication schedule and diet" }
        ]
    },
    {
        id: "discharge-process",
        category: "patient-care",
        title: "Discharge Process",
        icon: ClipboardList,
        color: "text-green-400",
        bgColor: "bg-green-500/10",
        steps: [
            { title: "Discharge Initiation", description: "Doctor approves discharge with summary" },
            { title: "Final Billing", description: "Consolidate all charges and generate bill" },
            { title: "TPA/Insurance Processing", description: "Submit claim or process corporate tie-up" },
            { title: "Payment Settlement", description: "Collect balance or process refund" },
            { title: "Discharge Summary", description: "Generate comprehensive discharge report" },
            { title: "Medication & Follow-up", description: "Dispense medicines and schedule follow-up" }
        ]
    },
    {
        id: "emergency-casualty",
        category: "patient-care",
        title: "Emergency/Casualty",
        icon: Ambulance,
        color: "text-red-400",
        bgColor: "bg-red-500/10",
        steps: [
            { title: "Triage Assessment", description: "Quick priority classification (Red/Yellow/Green)" },
            { title: "Quick Registration", description: "Minimal details for immediate care" },
            { title: "Emergency Treatment", description: "Record procedures and medications given" },
            { title: "Stabilization", description: "Monitor vitals and document condition" },
            { title: "Disposition Decision", description: "Admit, transfer, or discharge" },
            { title: "MLC Documentation", description: "Legal documentation if applicable" }
        ]
    },
    {
        id: "nursing-station",
        category: "patient-care",
        title: "Nursing Station",
        icon: HeartPulse,
        color: "text-pink-400",
        bgColor: "bg-pink-500/10",
        steps: [
            { title: "Shift Handover", description: "Review pending tasks and patient status" },
            { title: "Vitals Monitoring", description: "Record temperature, BP, pulse, SpO2" },
            { title: "Medication Administration", description: "Administer drugs as per schedule" },
            { title: "Nursing Notes", description: "Document observations and care given" },
            { title: "Doctor Rounds", description: "Accompany doctor and note instructions" },
            { title: "Intake/Output Chart", description: "Track fluids and nutrition" }
        ]
    },
    {
        id: "icu-management",
        category: "patient-care",
        title: "ICU/CCU Management",
        icon: Activity,
        color: "text-rose-400",
        bgColor: "bg-rose-500/10",
        steps: [
            { title: "ICU Admission", description: "Transfer patient with critical care protocols" },
            { title: "Continuous Monitoring", description: "Real-time vitals with alerts" },
            { title: "Ventilator Settings", description: "Document and track ventilator parameters" },
            { title: "Hourly Charting", description: "Detailed hourly documentation" },
            { title: "Critical Procedures", description: "Record lines, tubes, and interventions" },
            { title: "Family Updates", description: "Scheduled communication with relatives" }
        ]
    },

    // Clinical Services
    {
        id: "laboratory-workflow",
        category: "clinical",
        title: "Pathology Lab",
        icon: FlaskConical,
        color: "text-amber-400",
        bgColor: "bg-amber-500/10",
        steps: [
            { title: "Test Order Receipt", description: "View pending orders from OPD/IPD" },
            { title: "Sample Collection", description: "Collect and label samples with barcode" },
            { title: "Sample Processing", description: "Track sample through analyzers" },
            { title: "Result Entry", description: "Enter values with auto-range validation" },
            { title: "Auto Calculations", description: "System computes derived parameters" },
            { title: "Report Authorization", description: "Pathologist reviews and approves" },
            { title: "Report Delivery", description: "Print, SMS, email, or app notification" }
        ]
    },
    {
        id: "radiology-workflow",
        category: "clinical",
        title: "Radiology/Imaging",
        icon: Scan,
        color: "text-violet-400",
        bgColor: "bg-violet-500/10",
        steps: [
            { title: "Imaging Request", description: "Receive X-ray, CT, MRI, USG orders" },
            { title: "Patient Scheduling", description: "Slot allocation based on modality" },
            { title: "Patient Preparation", description: "Instructions and consent" },
            { title: "Image Acquisition", description: "Perform scan and capture images" },
            { title: "PACS Integration", description: "Store images in digital archive" },
            { title: "Report Generation", description: "Radiologist interpretation with templates" },
            { title: "Report Distribution", description: "Digital delivery with image links" }
        ]
    },
    {
        id: "pharmacy-dispensing",
        category: "clinical",
        title: "Pharmacy Management",
        icon: Pill,
        color: "text-purple-400",
        bgColor: "bg-purple-500/10",
        steps: [
            { title: "E-Prescription Receipt", description: "View orders from doctors digitally" },
            { title: "Drug Availability Check", description: "Real-time stock verification" },
            { title: "Drug Interaction Alert", description: "System warns of interactions" },
            { title: "Batch Selection", description: "FIFO/FEFO based dispensing" },
            { title: "Patient Counseling", description: "Record medication instructions" },
            { title: "Billing & Handover", description: "Generate bill and dispense" },
            { title: "Inventory Update", description: "Auto stock deduction" }
        ]
    },
    {
        id: "operation-theatre",
        category: "clinical",
        title: "Operation Theatre",
        icon: Scissors,
        color: "text-orange-400",
        bgColor: "bg-orange-500/10",
        steps: [
            { title: "Surgery Scheduling", description: "Book OT slot with equipment needs" },
            { title: "Pre-op Assessment", description: "Anesthesia evaluation and fitness" },
            { title: "OT Preparation", description: "Sterilization and equipment check" },
            { title: "Surgery Documentation", description: "Record procedure details in real-time" },
            { title: "Anesthesia Notes", description: "Document anesthesia parameters" },
            { title: "Post-op Handover", description: "Transfer to recovery/ward with notes" },
            { title: "Implant Tracking", description: "Record implants with serial numbers" }
        ]
    },
    {
        id: "blood-bank",
        category: "clinical",
        title: "Blood Bank",
        icon: Droplets,
        color: "text-red-500",
        bgColor: "bg-red-500/10",
        steps: [
            { title: "Donor Registration", description: "Capture donor details and history" },
            { title: "Donor Screening", description: "Medical questionnaire and hemoglobin check" },
            { title: "Blood Collection", description: "Collect and label blood bag" },
            { title: "Testing & Grouping", description: "Blood group and screening tests" },
            { title: "Component Separation", description: "Prepare RBC, plasma, platelets" },
            { title: "Cross-match Request", description: "Process requisition from wards" },
            { title: "Issue Blood Unit", description: "Dispense with compatibility verification" }
        ]
    },
    {
        id: "vaccination",
        category: "clinical",
        title: "Vaccination/Immunization",
        icon: Syringe,
        color: "text-lime-400",
        bgColor: "bg-lime-500/10",
        steps: [
            { title: "Schedule Check", description: "View due vaccines based on age/condition" },
            { title: "Vaccine Selection", description: "Choose vaccine with batch details" },
            { title: "Pre-vaccination Check", description: "Verify contraindications" },
            { title: "Administer Vaccine", description: "Record site, dose, and administrator" },
            { title: "Update Card", description: "Print/update vaccination record" },
            { title: "Schedule Next Dose", description: "Set reminder for follow-up doses" }
        ]
    },

    // Support Services
    {
        id: "billing-process",
        category: "admin",
        title: "Billing & Revenue",
        icon: CreditCard,
        color: "text-emerald-400",
        bgColor: "bg-emerald-500/10",
        steps: [
            { title: "Service Selection", description: "Add consultations, procedures, room charges" },
            { title: "Package Application", description: "Apply treatment packages if applicable" },
            { title: "Discount Processing", description: "Corporate, senior citizen, staff discounts" },
            { title: "Tax Calculation", description: "Auto GST computation on services" },
            { title: "Payment Collection", description: "Cash, card, UPI, cheque, or multiple modes" },
            { title: "Receipt Generation", description: "Print GST-compliant receipt" },
            { title: "Revenue Posting", description: "Auto accounting entry creation" }
        ]
    },
    {
        id: "tpa-insurance",
        category: "admin",
        title: "TPA/Insurance Claims",
        icon: Shield,
        color: "text-sky-400",
        bgColor: "bg-sky-500/10",
        steps: [
            { title: "Policy Verification", description: "Check patient insurance coverage" },
            { title: "Pre-authorization", description: "Submit pre-auth request to TPA" },
            { title: "Treatment Documentation", description: "Capture required clinical details" },
            { title: "Claim Preparation", description: "Compile bills and reports" },
            { title: "Claim Submission", description: "Submit to TPA portal/email" },
            { title: "Query Response", description: "Handle TPA queries with documents" },
            { title: "Settlement Tracking", description: "Monitor payment status" }
        ]
    },
    {
        id: "inventory-store",
        category: "support",
        title: "Inventory/Store",
        icon: Warehouse,
        color: "text-yellow-400",
        bgColor: "bg-yellow-500/10",
        steps: [
            { title: "Purchase Requisition", description: "Department raises indent" },
            { title: "Vendor Selection", description: "Compare quotes and select supplier" },
            { title: "Purchase Order", description: "Generate and send PO" },
            { title: "GRN Processing", description: "Receive goods and quality check" },
            { title: "Stock Update", description: "Add to inventory with batch/expiry" },
            { title: "Issue to Departments", description: "Process department requisitions" },
            { title: "Expiry Management", description: "Track and manage near-expiry items" }
        ]
    },
    {
        id: "diet-kitchen",
        category: "support",
        title: "Diet & Kitchen",
        icon: UtensilsCrossed,
        color: "text-orange-300",
        bgColor: "bg-orange-500/10",
        steps: [
            { title: "Diet Order Entry", description: "Doctor/nurse specifies diet type" },
            { title: "Menu Planning", description: "Create meals based on diet requirements" },
            { title: "Kitchen Requisition", description: "Generate ingredient requirements" },
            { title: "Meal Preparation", description: "Track preparation status" },
            { title: "Distribution", description: "Deliver to wards with verification" },
            { title: "Wastage Recording", description: "Track unconsumed meals" }
        ]
    },
    {
        id: "housekeeping",
        category: "support",
        title: "Housekeeping",
        icon: Sparkles,
        color: "text-cyan-300",
        bgColor: "bg-cyan-500/10",
        steps: [
            { title: "Task Assignment", description: "Allocate cleaning tasks to staff" },
            { title: "Room Status Update", description: "Mark rooms clean/dirty/occupied" },
            { title: "Deep Cleaning Schedule", description: "Plan periodic deep cleaning" },
            { title: "Linen Management", description: "Track linen distribution and collection" },
            { title: "Quality Inspection", description: "Supervisor verification" },
            { title: "Complaint Handling", description: "Address hygiene complaints" }
        ]
    },
    {
        id: "cssd",
        category: "support",
        title: "CSSD Sterilization",
        icon: Thermometer,
        color: "text-slate-400",
        bgColor: "bg-slate-500/10",
        steps: [
            { title: "Dirty Instrument Receipt", description: "Receive used instruments from OT/wards" },
            { title: "Cleaning & Washing", description: "Decontamination process" },
            { title: "Inspection & Packing", description: "Check instruments and pack" },
            { title: "Sterilization Cycle", description: "Run autoclave with parameters" },
            { title: "Sterility Verification", description: "Check biological indicators" },
            { title: "Storage & Issue", description: "Store sterile packs and distribute" }
        ]
    },
    {
        id: "laundry",
        category: "support",
        title: "Laundry Management",
        icon: Layers,
        color: "text-blue-300",
        bgColor: "bg-blue-500/10",
        steps: [
            { title: "Dirty Linen Collection", description: "Collect from wards with count" },
            { title: "Sorting & Weighing", description: "Categorize by type and soil level" },
            { title: "Washing Process", description: "Machine wash with tracking" },
            { title: "Drying & Ironing", description: "Complete processing" },
            { title: "Quality Check", description: "Inspect for stains and damage" },
            { title: "Distribution", description: "Deliver fresh linen to wards" }
        ]
    },
    {
        id: "ambulance",
        category: "support",
        title: "Ambulance Services",
        icon: Truck,
        color: "text-red-300",
        bgColor: "bg-red-500/10",
        steps: [
            { title: "Request Receipt", description: "Log emergency/non-emergency request" },
            { title: "Vehicle Dispatch", description: "Assign nearest available ambulance" },
            { title: "GPS Tracking", description: "Monitor vehicle location" },
            { title: "Patient Pickup", description: "Record patient condition at pickup" },
            { title: "En-route Care", description: "Document care provided during transport" },
            { title: "Hospital Handover", description: "Transfer patient with documentation" },
            { title: "Trip Billing", description: "Generate ambulance charges" }
        ]
    },

    // Administration
    {
        id: "hr-payroll",
        category: "admin",
        title: "HR & Payroll",
        icon: UserCog,
        color: "text-fuchsia-400",
        bgColor: "bg-fuchsia-500/10",
        steps: [
            { title: "Employee Onboarding", description: "Create profile with documents" },
            { title: "Attendance Tracking", description: "Biometric/manual attendance" },
            { title: "Leave Management", description: "Apply and approve leaves" },
            { title: "Shift Scheduling", description: "Create duty rosters" },
            { title: "Salary Processing", description: "Calculate with allowances/deductions" },
            { title: "Payslip Generation", description: "Generate and distribute payslips" },
            { title: "Compliance Reports", description: "PF, ESI, PT statutory reports" }
        ]
    },
    {
        id: "duty-roster",
        category: "admin",
        title: "Duty Roster",
        icon: Clock,
        color: "text-indigo-300",
        bgColor: "bg-indigo-500/10",
        steps: [
            { title: "Staff Availability", description: "Check leaves and preferences" },
            { title: "Shift Planning", description: "Create weekly/monthly roster" },
            { title: "Auto Scheduling", description: "System suggests optimal roster" },
            { title: "Conflict Resolution", description: "Handle overlaps and gaps" },
            { title: "Publish Roster", description: "Notify staff of their shifts" },
            { title: "Swap Requests", description: "Process shift swap requests" }
        ]
    },
    {
        id: "mrd-records",
        category: "admin",
        title: "Medical Records (MRD)",
        icon: FolderOpen,
        color: "text-stone-400",
        bgColor: "bg-stone-500/10",
        steps: [
            { title: "File Creation", description: "Create physical/digital file" },
            { title: "Document Scanning", description: "Digitize paper records" },
            { title: "ICD Coding", description: "Assign diagnosis and procedure codes" },
            { title: "File Tracking", description: "Track file movement across departments" },
            { title: "Record Retrieval", description: "Quick search and retrieval" },
            { title: "Archival", description: "Systematic long-term storage" }
        ]
    },
    {
        id: "certificate-generation",
        category: "admin",
        title: "Certificate Generation",
        icon: FileText,
        color: "text-emerald-300",
        bgColor: "bg-emerald-500/10",
        steps: [
            { title: "Request Receipt", description: "Patient/staff requests certificate" },
            { title: "Data Verification", description: "Verify details from records" },
            { title: "Certificate Preparation", description: "Generate from templates" },
            { title: "Doctor Signature", description: "Get authorized signature" },
            { title: "QR Code Addition", description: "Add verification QR code" },
            { title: "Issue & Log", description: "Print and maintain register" }
        ]
    },
    {
        id: "birth-death",
        category: "admin",
        title: "Birth & Death Registry",
        icon: Baby,
        color: "text-pink-300",
        bgColor: "bg-pink-500/10",
        steps: [
            { title: "Event Recording", description: "Record birth/death with details" },
            { title: "Document Collection", description: "Gather required proofs" },
            { title: "Certificate Generation", description: "Create official certificate" },
            { title: "Municipal Submission", description: "Submit to local authority" },
            { title: "Registration Number", description: "Receive official registration" },
            { title: "Certificate Handover", description: "Issue to family" }
        ]
    },
    {
        id: "queue-management",
        category: "admin",
        title: "Queue Management",
        icon: Grid3X3,
        color: "text-teal-300",
        bgColor: "bg-teal-500/10",
        steps: [
            { title: "Token Generation", description: "Issue queue token at reception" },
            { title: "Department Routing", description: "Direct to correct counter/room" },
            { title: "Display Board Update", description: "Show current token on screens" },
            { title: "SMS Alerts", description: "Notify when turn approaches" },
            { title: "Service Completion", description: "Mark token as served" },
            { title: "Wait Time Analytics", description: "Track and optimize wait times" }
        ]
    },
    {
        id: "reports-analytics",
        category: "admin",
        title: "Reports & Analytics",
        icon: BarChart3,
        color: "text-blue-400",
        bgColor: "bg-blue-500/10",
        steps: [
            { title: "Report Selection", description: "Choose from 200+ report templates" },
            { title: "Parameter Setting", description: "Set date range and filters" },
            { title: "Data Processing", description: "System compiles data" },
            { title: "Visualization", description: "Charts, graphs, and tables" },
            { title: "Export Options", description: "PDF, Excel, or email delivery" },
            { title: "Scheduled Reports", description: "Auto-generate daily/weekly/monthly" }
        ]
    },
    {
        id: "communication",
        category: "admin",
        title: "Communication Hub",
        icon: MessageSquare,
        color: "text-violet-300",
        bgColor: "bg-violet-500/10",
        steps: [
            { title: "Template Selection", description: "Choose SMS/email/WhatsApp template" },
            { title: "Recipient Selection", description: "Select patients/staff groups" },
            { title: "Message Customization", description: "Personalize with patient data" },
            { title: "Schedule/Send", description: "Send now or schedule delivery" },
            { title: "Delivery Tracking", description: "Monitor delivery status" },
            { title: "Response Management", description: "Handle replies and feedback" }
        ]
    },
    {
        id: "asset-management",
        category: "support",
        title: "Asset Management",
        icon: Building2,
        color: "text-gray-400",
        bgColor: "bg-gray-500/10",
        steps: [
            { title: "Asset Registration", description: "Add asset with specifications" },
            { title: "QR/Barcode Tagging", description: "Generate and affix tags" },
            { title: "Location Tracking", description: "Track asset movement" },
            { title: "Maintenance Schedule", description: "Plan preventive maintenance" },
            { title: "Service Recording", description: "Log repairs and services" },
            { title: "Depreciation Tracking", description: "Calculate asset value over time" }
        ]
    }
];

const InteractiveDemoModal = ({ children }) => {
    const [open, setOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedWorkflow, setSelectedWorkflow] = useState(null);
    const [currentStep, setCurrentStep] = useState(0);

    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
    };

    const handleWorkflowSelect = (workflow) => {
        setSelectedWorkflow(workflow);
        setCurrentStep(0);
    };

    const handleBackToCategories = () => {
        setSelectedCategory(null);
        setSelectedWorkflow(null);
        setCurrentStep(0);
    };

    const handleBackToWorkflows = () => {
        setSelectedWorkflow(null);
        setCurrentStep(0);
    };

    const nextStep = () => {
        if (selectedWorkflow && currentStep < selectedWorkflow.steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleOpenChange = (newOpen) => {
        setOpen(newOpen);
        if (!newOpen) {
            setSelectedCategory(null);
            setSelectedWorkflow(null);
            setCurrentStep(0);
        }
    };

    const filteredWorkflows = selectedCategory
        ? demoWorkflows.filter(w => w.category === selectedCategory.id)
        : [];

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto bg-card border-border p-0">
                <DialogHeader className="p-6 pb-4 border-b border-border">
                    <DialogTitle className="flex items-center gap-3 text-xl">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Play className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <span className="text-foreground">Interactive Demo</span>
                            <p className="text-sm font-normal text-muted-foreground mt-1">
                                {demoWorkflows.length} HMS workflows across {demoCategories.length} categories
                            </p>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div className="p-6">
                    <AnimatePresence mode="wait">
                        {/* Category Selection */}
                        {!selectedCategory && !selectedWorkflow && (
                            <motion.div
                                key="category-list"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <p className="text-sm text-muted-foreground mb-4">Select a category to explore</p>
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    {demoCategories.map((category) => {
                                        const categoryWorkflows = demoWorkflows.filter(w => w.category === category.id);
                                        return (
                                            <motion.button
                                                key={category.id}
                                                onClick={() => handleCategorySelect(category)}
                                                className="p-5 bg-muted/50 hover:bg-muted border border-border rounded-xl text-left transition-all hover:border-primary/30 group"
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <h3 className={`font-semibold ${category.color} mb-1 group-hover:text-primary transition-colors`}>
                                                    {category.name}
                                                </h3>
                                                <p className="text-xs text-muted-foreground">
                                                    {categoryWorkflows.length} workflows
                                                </p>
                                            </motion.button>
                                        );
                                    })}
                                </div>

                                {/* Quick Access - Popular Workflows */}
                                <div className="border-t border-border pt-4">
                                    <p className="text-sm text-muted-foreground mb-3">Quick access</p>
                                    <div className="flex flex-wrap gap-2">
                                        {demoWorkflows.slice(0, 6).map((workflow) => (
                                            <button
                                                key={workflow.id}
                                                onClick={() => {
                                                    setSelectedCategory(demoCategories.find(c => c.id === workflow.category));
                                                    handleWorkflowSelect(workflow);
                                                }}
                                                className="flex items-center gap-2 px-3 py-1.5 bg-muted/30 hover:bg-muted border border-border rounded-full text-xs transition-colors"
                                            >
                                                <workflow.icon className={`w-3 h-3 ${workflow.color}`} />
                                                <span className="text-foreground">{workflow.title}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Workflow List */}
                        {selectedCategory && !selectedWorkflow && (
                            <motion.div
                                key="workflow-list"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                            >
                                <button
                                    onClick={handleBackToCategories}
                                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    <span className="text-sm">Back to categories</span>
                                </button>

                                <h3 className={`text-lg font-semibold ${selectedCategory.color} mb-4`}>
                                    {selectedCategory.name}
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {filteredWorkflows.map((workflow) => (
                                        <motion.button
                                            key={workflow.id}
                                            onClick={() => handleWorkflowSelect(workflow)}
                                            className="p-4 bg-muted/50 hover:bg-muted border border-border rounded-xl text-left transition-all hover:border-primary/30 group"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <div className={`p-2 ${workflow.bgColor} rounded-lg w-fit mb-2`}>
                                                <workflow.icon className={`w-4 h-4 ${workflow.color}`} />
                                            </div>
                                            <h4 className="font-medium text-foreground text-sm mb-1 group-hover:text-primary transition-colors">
                                                {workflow.title}
                                            </h4>
                                            <p className="text-xs text-muted-foreground">
                                                {workflow.steps.length} steps
                                            </p>
                                        </motion.button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Workflow Demo */}
                        {selectedWorkflow && (
                            <motion.div
                                key="workflow-demo"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                            >
                                {/* Workflow Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <button
                                        onClick={handleBackToWorkflows}
                                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        <span className="text-sm">Back to {selectedCategory?.name}</span>
                                    </button>
                                    <div className="flex items-center gap-2">
                                        <div className={`p-1.5 ${selectedWorkflow.bgColor} rounded-lg`}>
                                            <selectedWorkflow.icon className={`w-4 h-4 ${selectedWorkflow.color}`} />
                                        </div>
                                        <span className="font-medium text-foreground">{selectedWorkflow.title}</span>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="flex gap-1 mb-6">
                                    {selectedWorkflow.steps.map((_, index) => (
                                        <div
                                            key={index}
                                            className={`h-1.5 flex-1 rounded-full transition-colors ${index <= currentStep ? "bg-primary" : "bg-muted"
                                                }`}
                                        />
                                    ))}
                                </div>

                                {/* Current Step */}
                                <div className="bg-muted/50 border border-border rounded-2xl p-6 mb-6">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-primary/10 rounded-xl">
                                            <span className="text-lg font-bold text-primary">{currentStep + 1}</span>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-foreground mb-2">
                                                {selectedWorkflow.steps[currentStep].title}
                                            </h3>
                                            <p className="text-muted-foreground text-sm">
                                                {selectedWorkflow.steps[currentStep].description}
                                            </p>
                                        </div>
                                        {currentStep === selectedWorkflow.steps.length - 1 && (
                                            <div className="p-2 bg-green-500/10 rounded-full">
                                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Step Navigation */}
                                <div className="flex items-center justify-between mb-6">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={prevStep}
                                        disabled={currentStep === 0}
                                        className="gap-2"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        Previous
                                    </Button>

                                    <span className="text-xs text-muted-foreground">
                                        Step {currentStep + 1} of {selectedWorkflow.steps.length}
                                    </span>

                                    {currentStep < selectedWorkflow.steps.length - 1 ? (
                                        <Button size="sm" onClick={nextStep} className="gap-2">
                                            Next
                                            <ChevronRight className="w-4 h-4" />
                                        </Button>
                                    ) : (
                                        <Button size="sm" onClick={handleBackToWorkflows} variant="outline" className="gap-2">
                                            <CheckCircle2 className="w-4 h-4" />
                                            Complete
                                        </Button>
                                    )}
                                </div>

                                {/* All Steps Overview */}
                                <div className="pt-4 border-t border-border">
                                    <p className="text-xs text-muted-foreground mb-3">All steps</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {selectedWorkflow.steps.map((step, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setCurrentStep(index)}
                                                className={`flex items-center gap-2 p-2 rounded-lg text-left transition-colors ${index === currentStep
                                                    ? "bg-primary/10 border border-primary/30"
                                                    : index < currentStep
                                                        ? "bg-muted/50 border border-border"
                                                        : "bg-muted/30 border border-border/50"
                                                    }`}
                                            >
                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium ${index <= currentStep ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                                    }`}>
                                                    {index < currentStep ? "✓" : index + 1}
                                                </div>
                                                <span className={`text-xs truncate ${index === currentStep ? "text-foreground font-medium" : "text-muted-foreground"
                                                    }`}>
                                                    {step.title}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default InteractiveDemoModal;
