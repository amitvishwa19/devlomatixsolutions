import { motion } from "framer-motion";
import { 
  UserPlus, 
  ClipboardCheck, 
  Stethoscope, 
  Bed,
  FileText,
  CreditCard,
  UserCheck,
  ArrowRight
} from "lucide-react";

const opdSteps = [
  { icon: UserPlus, label: "Registration", color: "from-blue-500 to-cyan-500" },
  { icon: ClipboardCheck, label: "Triage", color: "from-teal-500 to-emerald-500" },
  { icon: Stethoscope, label: "Consultation", color: "from-violet-500 to-purple-500" },
  { icon: FileText, label: "Prescription", color: "from-orange-500 to-amber-500" },
  { icon: CreditCard, label: "Billing", color: "from-pink-500 to-rose-500" },
  { icon: UserCheck, label: "Discharge", color: "from-green-500 to-emerald-500" }
];

const ipdSteps = [
  { icon: UserPlus, label: "Admission", color: "from-blue-500 to-cyan-500" },
  { icon: Bed, label: "Bed Allotment", color: "from-teal-500 to-emerald-500" },
  { icon: Stethoscope, label: "Treatment", color: "from-violet-500 to-purple-500" },
  { icon: FileText, label: "Daily Rounds", color: "from-orange-500 to-amber-500" },
  { icon: CreditCard, label: "Final Billing", color: "from-pink-500 to-rose-500" },
  { icon: UserCheck, label: "Discharge", color: "from-green-500 to-emerald-500" }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 }
};

const WorkflowSlide = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center p-8 md:p-16">
      {/* Background */}
      <div className="absolute inset-0 gradient-mesh opacity-30" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto w-full">
        {/* Section Label */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3 mb-6"
        >
          <div className="h-px w-12 bg-gradient-to-r from-primary to-transparent" />
          <span className="text-primary font-medium tracking-wider uppercase text-sm">
            Patient Journey
          </span>
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-12"
        >
          Seamless Patient Workflow
        </motion.h2>

        {/* OPD Workflow */}
        <div className="mb-12">
          <motion.h3
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3"
          >
            <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">OPD</span>
            Outpatient Flow
          </motion.h3>
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap items-center gap-2 md:gap-4"
          >
            {opdSteps.map((step, index) => (
              <motion.div key={index} variants={itemVariants} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-14 h-14 md:w-16 md:h-16 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
                    <step.icon className="w-7 h-7 md:w-8 md:h-8 text-white" />
                  </div>
                  <span className="text-xs md:text-sm text-foreground mt-2 font-medium">{step.label}</span>
                </div>
                {index < opdSteps.length - 1 && (
                  <ArrowRight className="w-5 h-5 text-muted-foreground mx-1 md:mx-2" />
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* IPD Workflow */}
        <div>
          <motion.h3
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3"
          >
            <span className="px-3 py-1 bg-secondary/20 text-secondary-foreground rounded-full text-sm">IPD</span>
            Inpatient Flow
          </motion.h3>
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap items-center gap-2 md:gap-4"
          >
            {ipdSteps.map((step, index) => (
              <motion.div key={index} variants={itemVariants} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-14 h-14 md:w-16 md:h-16 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
                    <step.icon className="w-7 h-7 md:w-8 md:h-8 text-white" />
                  </div>
                  <span className="text-xs md:text-sm text-foreground mt-2 font-medium">{step.label}</span>
                </div>
                {index < ipdSteps.length - 1 && (
                  <ArrowRight className="w-5 h-5 text-muted-foreground mx-1 md:mx-2" />
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowSlide;
