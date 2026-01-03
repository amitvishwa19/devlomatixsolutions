import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  FileText, 
  Package, 
  CreditCard,
  Stethoscope,
  Bed,
  BarChart3
} from "lucide-react";

const coreModules = [
  {
    icon: LayoutDashboard,
    title: "Dashboard",
    description: "Centralized command-and-control with real-time monitoring",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Calendar,
    title: "Appointments",
    description: "Schedule, track and manage all patient appointments",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: Users,
    title: "Patients",
    description: "Complete patient management and workflow tracking",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: FileText,
    title: "Prescriptions",
    description: "Digital prescription management system",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: Package,
    title: "Inventory",
    description: "Medical consumables and equipment tracking",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: CreditCard,
    title: "Payments",
    description: "Secure payment processing and tracking",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: Stethoscope,
    title: "Doctors",
    description: "Doctor availability and consultation management",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Bed,
    title: "Bed Management",
    description: "Real-time bed occupancy and allocation",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: BarChart3,
    title: "Reports",
    description: "Custom analytics and report generation",
    color: "bg-primary/10 text-primary",
  },
];

const FeaturesSlide = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="relative w-full h-screen bg-gradient-dark overflow-hidden">
      {/* Background accent */}
      <div className="absolute bottom-0 left-0 w-2/3 h-1/2 bg-gradient-to-tr from-primary/5 to-transparent" />

      <div className="relative z-10 flex flex-col justify-center h-full px-8 md:px-12 lg:px-16 max-w-7xl mx-auto">
        {/* Section Label */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <span className="text-primary font-heading font-semibold text-sm tracking-widest uppercase">
            Product Modules
          </span>
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-heading text-4xl md:text-5xl font-bold text-primary-foreground mb-4"
        >
          Complete Suite of<br />
          <span className="text-muted-foreground">Healthcare Tools</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-lg text-muted-foreground mb-10 max-w-2xl"
        >
          16+ integrated modules to digitize your entire hospital operation
        </motion.p>

        {/* Modules Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {coreModules.map((module, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group glass-dark p-5 rounded-xl hover:bg-primary/5 transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className={`inline-flex p-3 rounded-xl ${module.color} group-hover:scale-110 transition-transform`}>
                  <module.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-primary-foreground">
                    {module.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {module.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default FeaturesSlide;
