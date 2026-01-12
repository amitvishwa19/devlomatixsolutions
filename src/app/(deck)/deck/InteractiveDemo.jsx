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
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";

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
  appointment: {
    title: "Appointment Booking",
    icon: <Calendar className="w-5 h-5" />,
    steps: [
      { id: 1, title: "Select Doctor", description: "Browse by department or specialty", icon: <User className="w-4 h-4" />, action: "Select" },
      { id: 2, title: "Check Availability", description: "View real-time doctor schedule", icon: <Clock className="w-4 h-4" />, action: "View Slots" },
      { id: 3, title: "Book Slot", description: "Reserve preferred time slot", icon: <Calendar className="w-4 h-4" />, action: "Book" },
      { id: 4, title: "Confirm Booking", description: "Send SMS/Email confirmation", icon: <Check className="w-4 h-4" />, action: "Confirm" },
    ]
  },
  labWorkflow: {
    title: "Laboratory Workflow",
    icon: <TestTube className="w-5 h-5" />,
    steps: [
      { id: 1, title: "Receive Sample", description: "Scan barcode and verify patient", icon: <TestTube className="w-4 h-4" />, action: "Scan" },
      { id: 2, title: "Process Test", description: "Run automated analysis", icon: <Clock className="w-4 h-4" />, action: "Process" },
      { id: 3, title: "Validate Results", description: "Pathologist reviews and approves", icon: <FileText className="w-4 h-4" />, action: "Validate" },
      { id: 4, title: "Publish Report", description: "Auto-sync to patient portal", icon: <Check className="w-4 h-4" />, action: "Publish" },
    ]
  },
  billing: {
    title: "Billing Process",
    icon: <CreditCard className="w-5 h-5" />,
    steps: [
      { id: 1, title: "Generate Bill", description: "Auto-calculate from services", icon: <FileText className="w-4 h-4" />, action: "Generate" },
      { id: 2, title: "Apply Discounts", description: "Insurance or package discounts", icon: <CreditCard className="w-4 h-4" />, action: "Apply" },
      { id: 3, title: "Process Payment", description: "Multiple payment options", icon: <CreditCard className="w-4 h-4" />, action: "Pay" },
      { id: 4, title: "Issue Receipt", description: "Print or email invoice", icon: <Check className="w-4 h-4" />, action: "Complete" },
    ]
  },
  pharmacy: {
    title: "Pharmacy Dispensing",
    icon: <Pill className="w-5 h-5" />,
    steps: [
      { id: 1, title: "Receive Prescription", description: "Electronic prescription from doctor", icon: <FileText className="w-4 h-4" />, action: "View" },
      { id: 2, title: "Check Stock", description: "Verify drug availability", icon: <Pill className="w-4 h-4" />, action: "Check" },
      { id: 3, title: "Dispense Medicine", description: "Print labels and instructions", icon: <Pill className="w-4 h-4" />, action: "Dispense" },
      { id: 4, title: "Complete Sale", description: "Update inventory and bill", icon: <Check className="w-4 h-4" />, action: "Complete" },
    ]
  },
};

const InteractiveDemo = ({ isOpen, onClose }) => {
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);

  const handleWorkflowSelect = (key) => {
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(workflows).map(([key, workflow]) => (
                  <motion.button
                    key={key}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleWorkflowSelect(key)}
                    className="p-4 rounded-xl border border-border bg-card/50 hover:bg-card hover:border-primary/50 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        {workflow.icon}
                      </div>
                      <span className="font-semibold text-foreground">{workflow.title}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {workflow.steps.length} steps • Click to start demo
                    </p>
                    <ChevronRight className="w-4 h-4 text-muted-foreground absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.button>
                ))}
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
