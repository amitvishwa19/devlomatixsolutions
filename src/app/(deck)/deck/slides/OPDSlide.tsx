import { motion } from "framer-motion";
import { 
  UserPlus, 
  ClipboardCheck, 
  Stethoscope, 
  FileText, 
  Receipt,
  ArrowRight
} from "lucide-react";

const OPDSlide = () => {
  const workflow = [
    { 
      icon: <UserPlus className="w-6 h-6" />, 
      title: "Registration", 
      description: "Quick patient registration with ID verification",
      color: "from-blue-500/20 to-blue-600/20"
    },
    { 
      icon: <ClipboardCheck className="w-6 h-6" />, 
      title: "Token & Queue", 
      description: "Smart queue management with estimated wait times",
      color: "from-green-500/20 to-green-600/20"
    },
    { 
      icon: <Stethoscope className="w-6 h-6" />, 
      title: "Consultation", 
      description: "Digital prescriptions and clinical notes",
      color: "from-purple-500/20 to-purple-600/20"
    },
    { 
      icon: <FileText className="w-6 h-6" />, 
      title: "Diagnostics", 
      description: "Lab orders and imaging requests",
      color: "from-orange-500/20 to-orange-600/20"
    },
    { 
      icon: <Receipt className="w-6 h-6" />, 
      title: "Billing", 
      description: "Automated billing with insurance support",
      color: "from-pink-500/20 to-pink-600/20"
    },
  ];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10"
      >
        <span className="inline-block px-4 py-2 bg-primary/20 text-primary rounded-full text-sm font-medium mb-4">
          Outpatient Department
        </span>
        <h2 className="text-3xl md:text-5xl font-bold font-display">
          Streamlined <span className="text-gradient-primary">OPD Workflow</span>
        </h2>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
          From registration to discharge in a seamless digital journey
        </p>
      </motion.div>
      
      <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 max-w-6xl w-full">
        {workflow.map((step, index) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
            className="flex items-center"
          >
            <div className={`glass-effect rounded-xl p-4 md:p-6 bg-gradient-to-br ${step.color} w-full md:w-40 lg:w-48`}>
              <div className="text-primary mb-3">{step.icon}</div>
              <h3 className="font-semibold text-foreground text-sm md:text-base">{step.title}</h3>
              <p className="text-xs text-muted-foreground mt-1 hidden lg:block">{step.description}</p>
            </div>
            {index < workflow.length - 1 && (
              <ArrowRight className="w-5 h-5 text-primary mx-2 hidden md:block" />
            )}
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
        className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center"
      >
        <div className="glass-effect rounded-lg p-4">
          <span className="text-2xl font-bold text-primary">50%</span>
          <p className="text-xs text-muted-foreground mt-1">Reduced Wait Time</p>
        </div>
        <div className="glass-effect rounded-lg p-4">
          <span className="text-2xl font-bold text-primary">100%</span>
          <p className="text-xs text-muted-foreground mt-1">Digital Records</p>
        </div>
        <div className="glass-effect rounded-lg p-4">
          <span className="text-2xl font-bold text-primary">Zero</span>
          <p className="text-xs text-muted-foreground mt-1">Paper Prescriptions</p>
        </div>
        <div className="glass-effect rounded-lg p-4">
          <span className="text-2xl font-bold text-primary">24/7</span>
          <p className="text-xs text-muted-foreground mt-1">Online Booking</p>
        </div>
      </motion.div>
    </div>
  );
};

export default OPDSlide;
