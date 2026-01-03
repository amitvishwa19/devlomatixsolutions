import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Users, 
  Stethoscope, 
  Package, 
  TrendingUp, 
  BarChart3,
  CheckCircle2
} from "lucide-react";

const functionalAreas = [
  {
    title: "Operations Management",
    icon: LayoutDashboard,
    color: "from-blue-500 to-cyan-500",
    features: [
      "Today's appointments overview",
      "Task list with priority & urgency",
      "Emergency handling alerts",
      "Shift management & scheduling",
    ],
  },
  {
    title: "Patient Management",
    icon: Users,
    color: "from-emerald-500 to-teal-500",
    features: [
      "Patient appointment listing",
      "Consultation tracking",
      "Medical history records",
      "Patient communication portal",
    ],
  },
  {
    title: "Doctor Management",
    icon: Stethoscope,
    color: "from-violet-500 to-purple-500",
    features: [
      "Active doctors count",
      "Doctor availability overview",
      "Performance analytics",
      "Schedule optimization",
    ],
  },
  {
    title: "Inventory Management",
    icon: Package,
    color: "from-amber-500 to-orange-500",
    features: [
      "Medical consumables tracking",
      "Automated reorder alerts",
      "Expiry date tracking",
      "Vendor management",
    ],
  },
  {
    title: "Revenue & Finance",
    icon: TrendingUp,
    color: "from-rose-500 to-pink-500",
    features: [
      "Today's revenue overview",
      "Invoice & payment modules",
      "Insurance claims processing",
      "Financial reporting",
    ],
  },
  {
    title: "Reports & Analytics",
    icon: BarChart3,
    color: "from-indigo-500 to-blue-500",
    features: [
      "Custom report builder",
      "Real-time dashboards",
      "Export to PDF/Excel",
      "Scheduled reports",
    ],
  },
];

const FunctionalAreasSlide = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="relative w-full h-screen bg-gradient-dark overflow-hidden">
      {/* Background glow */}
      <motion.div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-primary/10 blur-3xl"
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      <div className="relative z-10 flex flex-col justify-center h-full px-8 md:px-12 lg:px-16 max-w-7xl mx-auto">
        {/* Section Label */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <span className="text-accent font-heading font-semibold text-sm tracking-widest uppercase">
            Core Functional Areas
          </span>
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-heading text-4xl md:text-5xl font-bold text-primary-foreground mb-10"
        >
          Comprehensive
          <span className="block text-gradient-light">Management Modules</span>
        </motion.h2>

        {/* Functional Areas Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {functionalAreas.map((area, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group glass-dark p-5 rounded-2xl hover:bg-primary/5 transition-all duration-300"
            >
              <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${area.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <area.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-heading font-semibold text-lg text-primary-foreground mb-3">
                {area.title}
              </h3>
              <ul className="space-y-2">
                {area.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default FunctionalAreasSlide;
