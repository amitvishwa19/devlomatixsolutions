import { motion } from "framer-motion";
import { 
  FlaskConical, 
  Pill, 
  Stethoscope, 
  TestTube,
  Package,
  ClipboardList,
  FileBarChart,
  AlertCircle
} from "lucide-react";

const modules = [
  {
    title: "Laboratory",
    icon: FlaskConical,
    color: "from-cyan-500 to-blue-500",
    features: [
      "Test ordering & tracking",
      "Sample collection management",
      "Result entry & validation",
      "Auto-send results to EMR",
      "Equipment integration"
    ]
  },
  {
    title: "Pharmacy",
    icon: Pill,
    color: "from-emerald-500 to-green-500",
    features: [
      "Prescription fulfillment",
      "Stock management",
      "Expiry tracking",
      "Dispensing records",
      "Drug interaction alerts"
    ]
  },
  {
    title: "Services",
    icon: Stethoscope,
    color: "from-violet-500 to-purple-500",
    features: [
      "Service catalog",
      "Pricing management",
      "Package creation",
      "Insurance mapping",
      "Usage analytics"
    ]
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

const ClinicalSlide = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center p-8 md:p-16">
      {/* Background */}
      <div className="absolute inset-0 gradient-mesh opacity-30" />
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />

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
            Clinical Operations
          </span>
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4"
        >
          Lab, Pharmacy & Services
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-muted-foreground text-lg md:text-xl max-w-3xl mb-10"
        >
          Integrated clinical modules for seamless healthcare delivery
        </motion.p>

        {/* Modules Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-3 gap-6"
        >
          {modules.map((module, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -5 }}
              className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:border-primary/50 transition-all duration-300"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center mb-5`}>
                <module.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-xl text-foreground mb-4">{module.title}</h3>
              <ul className="space-y-2">
                {module.features.map((feature, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {feature}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default ClinicalSlide;
