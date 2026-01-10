import { motion } from "framer-motion";
import { Lock, Shield, Server, Monitor, RefreshCw, Wifi } from "lucide-react";

const securityFeatures = [
  { 
    icon: Lock, 
    title: "End-to-End Encryption", 
    description: "All data encrypted at rest and in transit" 
  },
  { 
    icon: Shield, 
    title: "HIPAA Compliant", 
    description: "Full healthcare regulatory compliance" 
  },
  { 
    icon: Server, 
    title: "Regular Backups", 
    description: "Automated daily backups with 30-day retention" 
  },
  { 
    icon: Monitor, 
    title: "Audit Logs", 
    description: "Complete activity tracking and logging" 
  },
  { 
    icon: RefreshCw, 
    title: "Disaster Recovery", 
    description: "Multi-region failover and recovery" 
  },
  { 
    icon: Wifi, 
    title: "Secure Access", 
    description: "Role-based access with 2FA support" 
  },
];

const SecuritySlide = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="relative w-full h-screen bg-background overflow-hidden">
      {/* Gradient Mesh Background */}
      <div className="absolute inset-0 gradient-mesh" />
      
      {/* Shield Glow Effect */}
      <motion.div
        className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/12 blur-3xl"
        animate={{ opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 5, repeat: Infinity }}
      />
      <div className="absolute bottom-[-10%] left-[10%] w-[400px] h-[400px] rounded-full bg-accent/8 blur-3xl" />
      
      {/* Hexagon Pattern for Security Feel */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--foreground)) 1px, transparent 0)`,
          backgroundSize: '28px 28px'
        }} />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full px-8">
        {/* Section Label */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-2"
        >
          <Shield className="w-5 h-5 text-primary" />
          <span className="text-primary font-heading font-semibold text-sm tracking-widest uppercase">
            Security & Compliance
          </span>
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-foreground text-center mb-6"
        >
          Enterprise-Grade
          <span className="block text-gradient">Security</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-lg text-muted-foreground mb-12 text-center max-w-2xl"
        >
          Your patient data is protected with industry-leading security measures
        </motion.p>

        {/* Security Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl w-full"
        >
          {securityFeatures.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group glass p-6 rounded-2xl hover:bg-primary/5 transition-all duration-300 text-center"
            >
              <div className="h-14 w-14 mx-auto rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default SecuritySlide;
