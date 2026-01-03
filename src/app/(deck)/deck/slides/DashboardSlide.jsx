import { motion } from "framer-motion";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar, 
  Activity,
  DollarSign,
  Bed,
  ClipboardList
} from "lucide-react";

const dashboardFeatures = [
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description: "Live hospital performance metrics and KPIs",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: TrendingUp,
    title: "Revenue Insights",
    description: "Financial tracking and revenue forecasting",
    color: "from-emerald-500 to-green-500"
  },
  {
    icon: Users,
    title: "Patient Statistics",
    description: "Daily admissions, discharges, and census",
    color: "from-violet-500 to-purple-500"
  },
  {
    icon: Activity,
    title: "Department Load",
    description: "Real-time department occupancy and workload",
    color: "from-orange-500 to-amber-500"
  },
  {
    icon: Bed,
    title: "Bed Availability",
    description: "Live bed status across all wards",
    color: "from-pink-500 to-rose-500"
  },
  {
    icon: Calendar,
    title: "Today's Schedule",
    description: "Appointments, surgeries, and procedures",
    color: "from-teal-500 to-cyan-500"
  },
  {
    icon: DollarSign,
    title: "Billing Overview",
    description: "Pending invoices and payment status",
    color: "from-yellow-500 to-orange-500"
  },
  {
    icon: ClipboardList,
    title: "Task Manager",
    description: "Pending tasks and action items",
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
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const DashboardSlide = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center p-8 md:p-16">
      {/* Background Elements */}
      <div className="absolute inset-0 gradient-mesh opacity-30" />
      <div className="absolute top-20 right-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse" />

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
            Central Command
          </span>
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4"
        >
          Comprehensive Dashboard
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-muted-foreground text-lg md:text-xl max-w-3xl mb-12"
        >
          All critical hospital metrics at your fingertips with real-time updates and actionable insights
        </motion.p>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {dashboardFeatures.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.03, y: -5 }}
              className="group relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-5 hover:border-primary/50 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
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

export default DashboardSlide;
