import { motion } from "framer-motion";
import { CheckCircle2, Sparkles } from "lucide-react";
import Logo from "../Logo";

const SolutionSlide = () => {
  const features = [
    "Unified patient management platform",
    "Real-time analytics and reporting",
    "Automated billing and claims",
    "AI-powered diagnostics support",
    "Seamless department integration",
    "Mobile-first accessibility",
  ];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <span className="inline-block px-4 py-2 bg-primary/20 text-primary rounded-full text-sm font-medium mb-4">
          <Sparkles className="w-4 h-4 inline mr-2" />
          The Solution
        </span>
        <h2 className="text-3xl md:text-5xl font-bold font-display">
          Introducing <span className="text-gradient-primary">MediCare HMS</span>
        </h2>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-lg">
          A complete, intelligent hospital management system designed for modern healthcare
        </p>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="glass-effect rounded-3xl p-8 md:p-12 max-w-3xl w-full glow-primary"
      >
        <div className="flex justify-center mb-8">
          <Logo />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
              className="flex items-center gap-3"
            >
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="text-foreground">{feature}</span>
            </motion.div>
          ))}
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="mt-8 pt-6 border-t border-border text-center"
        >
          <p className="text-primary font-medium">
            Transforming hospitals into smart, efficient healthcare centers
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SolutionSlide;
