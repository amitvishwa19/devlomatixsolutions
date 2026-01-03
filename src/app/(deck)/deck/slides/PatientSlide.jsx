import { motion } from "framer-motion";
import { 
  User, 
  FileText, 
  History, 
  Heart,
  Pill,
  AlertCircle,
  Activity,
  Camera
} from "lucide-react";

const patientFeatures = [
  {
    icon: User,
    title: "Complete Profile",
    description: "Demographics, contact info, insurance details",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: History,
    title: "Medical History",
    description: "Past conditions, surgeries, family history",
    color: "from-emerald-500 to-green-500"
  },
  {
    icon: Heart,
    title: "Vitals Tracking",
    description: "Blood pressure, heart rate, temperature logs",
    color: "from-rose-500 to-pink-500"
  },
  {
    icon: Pill,
    title: "Medication List",
    description: "Current medications and allergies",
    color: "from-violet-500 to-purple-500"
  },
  {
    icon: FileText,
    title: "Visit Records",
    description: "Complete consultation history",
    color: "from-orange-500 to-amber-500"
  },
  {
    icon: Activity,
    title: "Lab Results",
    description: "All test results with trends",
    color: "from-teal-500 to-cyan-500"
  },
  {
    icon: AlertCircle,
    title: "Alerts & Notes",
    description: "Important clinical alerts",
    color: "from-red-500 to-rose-500"
  },
  {
    icon: Camera,
    title: "Document Upload",
    description: "External reports and images",
    color: "from-indigo-500 to-blue-500"
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 }
};

const PatientSlide = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center p-8 md:p-16">
      {/* Background */}
      <div className="absolute inset-0 gradient-mesh opacity-30" />
      <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl" />

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
            Patient Management
          </span>
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4"
        >
          Complete Patient Records
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-muted-foreground text-lg md:text-xl max-w-3xl mb-10"
        >
          360° view of every patient with comprehensive EMR capabilities
        </motion.p>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {patientFeatures.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -5 }}
              className="group bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-5 hover:border-primary/50 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default PatientSlide;
