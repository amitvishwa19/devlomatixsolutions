import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, 
  X, 
  Users, 
  Calendar, 
  FileText, 
  Pill, 
  TestTube, 
  CreditCard,
  ChevronRight,
  Check,
  Clock,
  User,
  Bed,
  Stethoscope,
  Syringe,
  HeartPulse,
  Ambulance,
  Building2,
  ClipboardList,
  Activity,
  Droplets,
  Scan,
  ShieldCheck,
  Utensils,
  Truck,
  Wrench,
  BarChart3,
  Settings,
  UserCog,
  Package
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface DemoStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: string;
}

const workflows = {
  patientRegistration: {
    title: "Patient Registration",
    icon: <Users className="w-5 h-5" />,
    steps: [
      { id: 1, title: "Enter Patient Details", description: "Fill in name, age, contact, and ID proof", icon: <User className="w-4 h-4" />, action: "Submit" },
      { id: 2, title: "Assign Patient ID", description: "System generates unique UHID automatically", icon: <FileText className="w-4 h-4" />, action: "Generate" },
      { id: 3, title: "Select Department", description: "Choose OPD/IPD and department", icon: <Calendar className="w-4 h-4" />, action: "Select" },
      { id: 4, title: "Complete Registration", description: "Print token and patient card", icon: <Check className="w-4 h-4" />, action: "Complete" },
    ]
  },
  opdManagement: {
    title: "OPD Management",
    icon: <Stethoscope className="w-5 h-5" />,
    steps: [
      { id: 1, title: "Patient Check-in", description: "Scan token or search by UHID", icon: <Scan className="w-4 h-4" />, action: "Check-in" },
      { id: 2, title: "Vitals Recording", description: "Record BP, temp, weight, height", icon: <Activity className="w-4 h-4" />, action: "Record" },
      { id: 3, title: "Doctor Consultation", description: "Add diagnosis and prescription", icon: <Stethoscope className="w-4 h-4" />, action: "Consult" },
      { id: 4, title: "Generate Follow-up", description: "Schedule next appointment if needed", icon: <Calendar className="w-4 h-4" />, action: "Schedule" },
    ]
  },
  ipdManagement: {
    title: "IPD & Bed Management",
    icon: <Bed className="w-5 h-5" />,
    steps: [
      { id: 1, title: "Admit Patient", description: "Select ward, bed type, and room", icon: <Bed className="w-4 h-4" />, action: "Admit" },
      { id: 2, title: "Assign Bed", description: "View availability and allocate bed", icon: <Building2 className="w-4 h-4" />, action: "Assign" },
      { id: 3, title: "Daily Rounds", description: "Record doctor notes and orders", icon: <ClipboardList className="w-4 h-4" />, action: "Update" },
      { id: 4, title: "Discharge Process", description: "Complete summary and final billing", icon: <Check className="w-4 h-4" />, action: "Discharge" },
    ]
  },
  emrManagement: {
    title: "Electronic Medical Records",
    icon: <FileText className="w-5 h-5" />,
    steps: [
      { id: 1, title: "Access Patient History", description: "View complete medical timeline", icon: <FileText className="w-4 h-4" />, action: "View" },
      { id: 2, title: "Add Clinical Notes", description: "Document diagnosis and treatment", icon: <ClipboardList className="w-4 h-4" />, action: "Add" },
      { id: 3, title: "Upload Documents", description: "Attach reports, scans, and images", icon: <Scan className="w-4 h-4" />, action: "Upload" },
      { id: 4, title: "Share Records", description: "Secure sharing with specialists", icon: <ShieldCheck className="w-4 h-4" />, action: "Share" },
    ]
  },
  appointment: {
    title: "Appointment Scheduling",
    icon: <Calendar className="w-5 h-5" />,
    steps: [
      { id: 1, title: "Select Doctor", description: "Browse by department or specialty", icon: <User className="w-4 h-4" />, action: "Select" },
      { id: 2, title: "Check Availability", description: "View real-time doctor schedule", icon: <Clock className="w-4 h-4" />, action: "View Slots" },
      { id: 3, title: "Book Slot", description: "Reserve preferred time slot", icon: <Calendar className="w-4 h-4" />, action: "Book" },
      { id: 4, title: "Confirm Booking", description: "Send SMS/Email confirmation", icon: <Check className="w-4 h-4" />, action: "Confirm" },
    ]
  },
  labWorkflow: {
    title: "Laboratory Management",
    icon: <TestTube className="w-5 h-5" />,
    steps: [
      { id: 1, title: "Receive Sample", description: "Scan barcode and verify patient", icon: <TestTube className="w-4 h-4" />, action: "Scan" },
      { id: 2, title: "Process Test", description: "Run automated analysis", icon: <Clock className="w-4 h-4" />, action: "Process" },
      { id: 3, title: "Validate Results", description: "Pathologist reviews and approves", icon: <FileText className="w-4 h-4" />, action: "Validate" },
      { id: 4, title: "Publish Report", description: "Auto-sync to patient portal", icon: <Check className="w-4 h-4" />, action: "Publish" },
    ]
  },
  radiology: {
    title: "Radiology & Imaging",
    icon: <Scan className="w-5 h-5" />,
    steps: [
      { id: 1, title: "Schedule Scan", description: "Book X-Ray, CT, MRI, or Ultrasound", icon: <Calendar className="w-4 h-4" />, action: "Schedule" },
      { id: 2, title: "Perform Imaging", description: "Capture and store DICOM images", icon: <Scan className="w-4 h-4" />, action: "Capture" },
      { id: 3, title: "Radiologist Review", description: "Analyze and generate report", icon: <FileText className="w-4 h-4" />, action: "Review" },
      { id: 4, title: "Deliver Results", description: "Share images and report with doctor", icon: <Check className="w-4 h-4" />, action: "Deliver" },
    ]
  },
  pharmacy: {
    title: "Pharmacy Management",
    icon: <Pill className="w-5 h-5" />,
    steps: [
      { id: 1, title: "Receive Prescription", description: "Electronic prescription from doctor", icon: <FileText className="w-4 h-4" />, action: "View" },
      { id: 2, title: "Check Stock", description: "Verify drug availability and expiry", icon: <Pill className="w-4 h-4" />, action: "Check" },
      { id: 3, title: "Dispense Medicine", description: "Print labels and instructions", icon: <Pill className="w-4 h-4" />, action: "Dispense" },
      { id: 4, title: "Complete Sale", description: "Update inventory and bill", icon: <Check className="w-4 h-4" />, action: "Complete" },
    ]
  },
  billing: {
    title: "Billing & Insurance",
    icon: <CreditCard className="w-5 h-5" />,
    steps: [
      { id: 1, title: "Generate Bill", description: "Auto-calculate from services", icon: <FileText className="w-4 h-4" />, action: "Generate" },
      { id: 2, title: "Insurance Claim", description: "Submit TPA claims electronically", icon: <ShieldCheck className="w-4 h-4" />, action: "Submit" },
      { id: 3, title: "Process Payment", description: "Multiple payment options", icon: <CreditCard className="w-4 h-4" />, action: "Pay" },
      { id: 4, title: "Issue Receipt", description: "Print or email invoice", icon: <Check className="w-4 h-4" />, action: "Complete" },
    ]
  },
  operationTheatre: {
    title: "Operation Theatre",
    icon: <Syringe className="w-5 h-5" />,
    steps: [
      { id: 1, title: "Schedule Surgery", description: "Book OT slot and assign team", icon: <Calendar className="w-4 h-4" />, action: "Schedule" },
      { id: 2, title: "Pre-Op Checklist", description: "Verify consent, tests, and equipment", icon: <ClipboardList className="w-4 h-4" />, action: "Verify" },
      { id: 3, title: "Perform Surgery", description: "Record procedure and vitals", icon: <Syringe className="w-4 h-4" />, action: "Start" },
      { id: 4, title: "Post-Op Care", description: "Transfer to recovery and monitor", icon: <HeartPulse className="w-4 h-4" />, action: "Complete" },
    ]
  },
  bloodBank: {
    title: "Blood Bank",
    icon: <Droplets className="w-5 h-5" />,
    steps: [
      { id: 1, title: "Donor Registration", description: "Register and screen blood donor", icon: <Users className="w-4 h-4" />, action: "Register" },
      { id: 2, title: "Blood Collection", description: "Collect and label blood units", icon: <Droplets className="w-4 h-4" />, action: "Collect" },
      { id: 3, title: "Testing & Storage", description: "Test and store in blood bank", icon: <TestTube className="w-4 h-4" />, action: "Store" },
      { id: 4, title: "Issue Blood", description: "Cross-match and issue to patient", icon: <Check className="w-4 h-4" />, action: "Issue" },
    ]
  },
  emergency: {
    title: "Emergency & Trauma",
    icon: <Ambulance className="w-5 h-5" />,
    steps: [
      { id: 1, title: "Triage Assessment", description: "Quick severity assessment", icon: <Activity className="w-4 h-4" />, action: "Assess" },
      { id: 2, title: "Emergency Treatment", description: "Immediate care and stabilization", icon: <HeartPulse className="w-4 h-4" />, action: "Treat" },
      { id: 3, title: "Diagnostic Tests", description: "Order urgent labs and scans", icon: <TestTube className="w-4 h-4" />, action: "Order" },
      { id: 4, title: "Admit or Discharge", description: "Transfer to ward or release", icon: <Check className="w-4 h-4" />, action: "Complete" },
    ]
  },
  inventory: {
    title: "Inventory & Supply Chain",
    icon: <Package className="w-5 h-5" />,
    steps: [
      { id: 1, title: "Stock Monitoring", description: "Track inventory levels real-time", icon: <Package className="w-4 h-4" />, action: "Monitor" },
      { id: 2, title: "Purchase Order", description: "Auto-generate PO for low stock", icon: <FileText className="w-4 h-4" />, action: "Create" },
      { id: 3, title: "Receive Goods", description: "Verify and update stock", icon: <Truck className="w-4 h-4" />, action: "Receive" },
      { id: 4, title: "Department Issue", description: "Issue items to departments", icon: <Check className="w-4 h-4" />, action: "Issue" },
    ]
  },
  dietetics: {
    title: "Diet & Nutrition",
    icon: <Utensils className="w-5 h-5" />,
    steps: [
      { id: 1, title: "Nutrition Assessment", description: "Evaluate patient dietary needs", icon: <ClipboardList className="w-4 h-4" />, action: "Assess" },
      { id: 2, title: "Create Diet Plan", description: "Customize meal plan per condition", icon: <Utensils className="w-4 h-4" />, action: "Plan" },
      { id: 3, title: "Kitchen Order", description: "Send orders to hospital kitchen", icon: <FileText className="w-4 h-4" />, action: "Order" },
      { id: 4, title: "Meal Delivery", description: "Track and confirm meal delivery", icon: <Check className="w-4 h-4" />, action: "Deliver" },
    ]
  },
  maintenance: {
    title: "Asset & Maintenance",
    icon: <Wrench className="w-5 h-5" />,
    steps: [
      { id: 1, title: "Asset Registration", description: "Register equipment and devices", icon: <Settings className="w-4 h-4" />, action: "Register" },
      { id: 2, title: "Schedule Maintenance", description: "Preventive maintenance calendar", icon: <Calendar className="w-4 h-4" />, action: "Schedule" },
      { id: 3, title: "Work Order", description: "Create and assign repair tickets", icon: <Wrench className="w-4 h-4" />, action: "Create" },
      { id: 4, title: "Complete Service", description: "Update status and history", icon: <Check className="w-4 h-4" />, action: "Complete" },
    ]
  },
  hrPayroll: {
    title: "HR & Payroll",
    icon: <UserCog className="w-5 h-5" />,
    steps: [
      { id: 1, title: "Staff Onboarding", description: "Add new employee details", icon: <Users className="w-4 h-4" />, action: "Onboard" },
      { id: 2, title: "Attendance Tracking", description: "Record shifts and leaves", icon: <Clock className="w-4 h-4" />, action: "Track" },
      { id: 3, title: "Process Payroll", description: "Calculate salary and deductions", icon: <CreditCard className="w-4 h-4" />, action: "Process" },
      { id: 4, title: "Generate Payslip", description: "Print or email salary slip", icon: <Check className="w-4 h-4" />, action: "Generate" },
    ]
  },
  analytics: {
    title: "Reports & Analytics",
    icon: <BarChart3 className="w-5 h-5" />,
    steps: [
      { id: 1, title: "Select Report Type", description: "Choose from 100+ report templates", icon: <FileText className="w-4 h-4" />, action: "Select" },
      { id: 2, title: "Apply Filters", description: "Set date range and parameters", icon: <Settings className="w-4 h-4" />, action: "Filter" },
      { id: 3, title: "Generate Report", description: "Process and visualize data", icon: <BarChart3 className="w-4 h-4" />, action: "Generate" },
      { id: 4, title: "Export & Share", description: "Download PDF, Excel or share", icon: <Check className="w-4 h-4" />, action: "Export" },
    ]
  },
};

interface InteractiveDemoProps {
  isOpen: boolean;
  onClose: () => void;
}

const InteractiveDemo = ({ isOpen, onClose }: InteractiveDemoProps) => {
  const [selectedWorkflow, setSelectedWorkflow] = useState<keyof typeof workflows | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const handleWorkflowSelect = (key: keyof typeof workflows) => {
    setSelectedWorkflow(key);
    setCurrentStep(0);
    setCompletedSteps([]);
  };

  const handleStepAction = () => {
    if (selectedWorkflow) {
      const workflow = workflows[selectedWorkflow];
      setCompletedSteps([...completedSteps, currentStep]);
      if (currentStep < workflow.steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    setSelectedWorkflow(null);
    setCurrentStep(0);
    setCompletedSteps([]);
  };

  const resetDemo = () => {
    setCurrentStep(0);
    setCompletedSteps([]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="glass-effect rounded-2xl p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Play className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Interactive Demo</h2>
                  <p className="text-sm text-muted-foreground">Experience HMS workflows</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {!selectedWorkflow ? (
              /* Workflow Selection */
              <div>
                <p className="text-sm text-muted-foreground mb-4">Select a module to explore its workflow ({Object.keys(workflows).length} modules available)</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[60vh] overflow-y-auto pr-2">
                  {Object.entries(workflows).map(([key, workflow]) => (
                    <motion.button
                      key={key}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleWorkflowSelect(key as keyof typeof workflows)}
                      className="p-3 rounded-xl border border-border bg-card/50 hover:bg-card hover:border-primary/50 transition-all text-left group relative"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="p-1.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          {workflow.icon}
                        </div>
                        <span className="font-medium text-sm text-foreground">{workflow.title}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {workflow.steps.length} steps
                      </p>
                    </motion.button>
                  ))}
                </div>
              </div>
            ) : (
              /* Workflow Demo */
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <Button variant="ghost" size="sm" onClick={handleBack}>
                    ← Back
                  </Button>
                  <span className="font-semibold text-foreground">{workflows[selectedWorkflow].title}</span>
                </div>

                {/* Progress Bar */}
                <div className="flex items-center gap-2 mb-8">
                  {workflows[selectedWorkflow].steps.map((step, index) => (
                    <div key={step.id} className="flex items-center flex-1">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                          completedSteps.includes(index)
                            ? "bg-green-500 text-white"
                            : index === currentStep
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {completedSteps.includes(index) ? <Check className="w-4 h-4" /> : index + 1}
                      </div>
                      {index < workflows[selectedWorkflow].steps.length - 1 && (
                        <div
                          className={`flex-1 h-1 mx-2 rounded transition-colors ${
                            completedSteps.includes(index) ? "bg-green-500" : "bg-muted"
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* Current Step */}
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-xl border border-border bg-card/50"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary">
                      {workflows[selectedWorkflow].steps[currentStep].icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-1">
                        {workflows[selectedWorkflow].steps[currentStep].title}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {workflows[selectedWorkflow].steps[currentStep].description}
                      </p>
                      <div className="flex gap-3">
                        <Button 
                          onClick={handleStepAction}
                          disabled={completedSteps.includes(currentStep)}
                        >
                          {completedSteps.includes(currentStep) 
                            ? "Completed" 
                            : workflows[selectedWorkflow].steps[currentStep].action}
                        </Button>
                        {completedSteps.length === workflows[selectedWorkflow].steps.length && (
                          <Button variant="outline" onClick={resetDemo}>
                            Restart Demo
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Completion Message */}
                {completedSteps.length === workflows[selectedWorkflow].steps.length && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-center"
                  >
                    <Check className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="font-semibold text-foreground">Workflow Complete!</p>
                    <p className="text-sm text-muted-foreground">
                      You've successfully completed the {workflows[selectedWorkflow].title} workflow.
                    </p>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InteractiveDemo;
