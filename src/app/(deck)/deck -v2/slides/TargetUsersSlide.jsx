import { motion } from "framer-motion";
import { 
  Building2, 
  Target, 
  Stethoscope, 
  Users, 
  Package, 
  Receipt,
  Syringe,
  Pill,
  HeartPulse,
  Clipboard,
  Phone,
  BarChart3
} from "lucide-react";

const targetUsers = [
  { icon: Building2, title: "Hospital Owner / Admin", description: "Complete visibility and control" },
  { icon: Target, title: "Operations Manager", description: "Day-to-day efficiency" },
  { icon: Stethoscope, title: "Doctors", description: "Patient management" },
  { icon: Users, title: "Front Desk Staff", description: "Appointment handling" },
  { icon: Package, title: "Inventory Manager", description: "Stock management" },
  { icon: Receipt, title: "Billing Team", description: "Financial operations" },
  { icon: Syringe, title: "Lab Technicians", description: "Test management" },
  { icon: Pill, title: "Pharmacists", description: "Medicine tracking" },
  { icon: HeartPulse, title: "Nurses", description: "Patient care" },
  { icon: Clipboard, title: "Medical Records", description: "EMR/EHR management" },
  { icon: Phone, title: "IT Administrator", description: "System support" },
  { icon: BarChart3, title: "Data Analysts", description: "Reports & insights" },
];

const TargetUsersSlide = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  };

  return (
    <div className="relative w-full h-screen bg-background overflow-hidden">
      {/* Gradient Mesh Background */}
      <div className="absolute inset-0 gradient-mesh" />
      
      {/* Decorative Blobs */}
      <div className="absolute top-[-5%] left-[20%] w-[350px] h-[350px] rounded-full bg-primary/10 blur-3xl animate-pulse" />
      <div className="absolute bottom-[10%] right-[-5%] w-[450px] h-[450px] rounded-full bg-accent/8 blur-3xl" />
      
      {/* Dot Pattern */}
      <div className="absolute inset-0 opacity-[0.025]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--foreground)) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full px-8">
        {/* Section Label */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-2"
        >
          <Users className="w-5 h-5 text-primary" />
          <span className="text-primary font-heading font-semibold text-sm tracking-widest uppercase">
            Who It's For
          </span>
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-heading text-4xl md:text-5xl font-bold text-foreground text-center mb-4"
        >
          Built for Every
          <span className="block text-gradient">Team Member</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-lg text-muted-foreground mb-10 text-center"
        >
          Role-based access and features designed for each user type
        </motion.p>

        {/* Target Users Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-w-5xl w-full"
        >
          {targetUsers.map((user, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group glass p-4 rounded-xl hover:bg-primary/5 transition-all duration-300 text-center"
            >
              <div className="h-12 w-12 mx-auto rounded-xl gradient-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <user.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-heading font-semibold text-foreground text-sm mb-1">
                {user.title}
              </h3>
              <p className="text-xs text-muted-foreground">
                {user.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default TargetUsersSlide;
