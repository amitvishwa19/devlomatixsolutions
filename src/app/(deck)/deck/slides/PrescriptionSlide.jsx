import { motion } from "framer-motion";
import { 
  Pill, 
  FileText, 
  AlertTriangle, 
  Printer,
  QrCode,
  Clock,
  CheckCircle2,
  Repeat
} from "lucide-react";

const prescriptionFeatures = [
  {
    icon: Pill,
    title: "Drug Database",
    description: "Comprehensive medication library with dosages",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: AlertTriangle,
    title: "Interaction Alerts",
    description: "Drug-drug and allergy interaction warnings",
    color: "from-red-500 to-rose-500"
  },
  {
    icon: FileText,
    title: "E-Prescription",
    description: "Digital prescriptions with doctor signature",
    color: "from-emerald-500 to-green-500"
  },
  {
    icon: QrCode,
    title: "QR Code",
    description: "Scannable prescriptions for pharmacy",
    color: "from-violet-500 to-purple-500"
  },
  {
    icon: Printer,
    title: "Print Ready",
    description: "Professional prescription print layouts",
    color: "from-orange-500 to-amber-500"
  },
  {
    icon: Repeat,
    title: "Refill Management",
    description: "Track and manage medication refills",
    color: "from-teal-500 to-cyan-500"
  }
];

const samplePrescription = [
  { drug: "Amoxicillin 500mg", dosage: "1 tablet", frequency: "3x daily", duration: "7 days" },
  { drug: "Paracetamol 650mg", dosage: "1 tablet", frequency: "As needed", duration: "5 days" },
  { drug: "Omeprazole 20mg", dosage: "1 capsule", frequency: "Before breakfast", duration: "14 days" }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const PrescriptionSlide = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center p-8 md:p-16">
      {/* Background */}
      <div className="absolute inset-0 gradient-mesh opacity-30" />
      <div className="absolute top-20 right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />

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
            Clinical Tools
          </span>
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-10"
        >
          Smart Prescription System
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Features */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="md:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4"
          >
            {prescriptionFeatures.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.03 }}
                className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 hover:border-primary/50 transition-all"
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3`}>
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-1">{feature.title}</h3>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Sample Prescription */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-xl p-5"
          >
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Sample Prescription
            </h3>
            <div className="space-y-3">
              {samplePrescription.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="p-3 bg-background/50 rounded-lg"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-medium text-foreground">{item.drug}</span>
                  </div>
                  <div className="text-xs text-muted-foreground pl-6">
                    {item.dosage} • {item.frequency} • {item.duration}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionSlide;
