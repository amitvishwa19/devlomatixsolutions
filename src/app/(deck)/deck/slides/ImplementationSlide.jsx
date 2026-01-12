import { motion } from "framer-motion";
import { FileCheck, Headphones, Rocket, Settings } from "lucide-react";

const ImplementationSlide = () => {
  const steps = [
    { icon: <FileCheck className="w-8 h-8" />, step: "01", title: "Assessment", description: "We analyze your current workflows and identify optimization opportunities", duration: "1-2 Weeks" },
    { icon: <Settings className="w-8 h-8" />, step: "02", title: "Configuration", description: "Custom setup of modules, integrations, and data migration", duration: "4-6 Weeks" },
    { icon: <Rocket className="w-8 h-8" />, step: "03", title: "Go-Live", description: "Phased rollout with comprehensive training for all staff", duration: "2-4 Weeks" },
    { icon: <Headphones className="w-8 h-8" />, step: "04", title: "Support", description: "Ongoing optimization, updates, and dedicated customer success", duration: "Continuous" },
  ];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-12">
        <span className="inline-block px-4 py-2 bg-healthcare-green/20 text-healthcare-green rounded-full text-sm font-medium mb-4">Smooth Transition</span>
        <h2 className="text-3xl md:text-5xl font-bold font-display">Implementation <span className="text-gradient-primary">Roadmap</span></h2>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">Go live in as little as 8 weeks with our proven methodology</p>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-5xl w-full">
        {steps.map((item, index) => (
          <motion.div key={item.step} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 + index * 0.15 }} className="glass-effect rounded-2xl p-6 relative">
            <div className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-sm font-bold text-primary-foreground">{item.step}</div>
            <div className="text-primary mb-4">{item.icon}</div>
            <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
            <div className="text-xs font-medium text-primary">{item.duration}</div>
          </motion.div>
        ))}
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 1 }} className="mt-10 glass-effect rounded-full px-6 py-3">
        <span className="text-muted-foreground">Average time to ROI: </span><span className="text-primary font-bold">6 months</span>
      </motion.div>
    </div>
  );
};

export default ImplementationSlide;
