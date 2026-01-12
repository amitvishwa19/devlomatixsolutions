import { motion } from "framer-motion";
import { Cloud, Globe, Lock, Server, Smartphone, Zap } from "lucide-react";

const TechnologySlide = () => {
  const techFeatures = [
    { icon: <Cloud className="w-6 h-6" />, label: "Cloud-Native" },
    { icon: <Lock className="w-6 h-6" />, label: "HIPAA Compliant" },
    { icon: <Server className="w-6 h-6" />, label: "HL7/FHIR Ready" },
    { icon: <Smartphone className="w-6 h-6" />, label: "Mobile First" },
    { icon: <Globe className="w-6 h-6" />, label: "Multi-Facility" },
    { icon: <Zap className="w-6 h-6" />, label: "Real-time Sync" },
  ];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-12">
        <span className="inline-block px-4 py-2 bg-healthcare-blue/20 text-healthcare-blue rounded-full text-sm font-medium mb-4">Enterprise-Grade Technology</span>
        <h2 className="text-3xl md:text-5xl font-bold font-display">Built for <span className="text-gradient-primary">Scale & Security</span></h2>
      </motion.div>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4 max-w-4xl w-full mb-12">
        {techFeatures.map((tech, index) => (
          <motion.div key={tech.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 + index * 0.08 }} className="glass-effect rounded-xl p-4 text-center hover:border-primary/50 transition-colors">
            <div className="text-primary mb-2 flex justify-center">{tech.icon}</div>
            <span className="text-xs text-muted-foreground">{tech.label}</span>
          </motion.div>
        ))}
      </div>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.5 }} className="glass-effect rounded-3xl p-8 max-w-3xl w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div><div className="text-3xl font-bold text-gradient-primary mb-2">99.99%</div><p className="text-muted-foreground text-sm">Uptime SLA</p></div>
          <div><div className="text-3xl font-bold text-gradient-secondary mb-2">&lt; 100ms</div><p className="text-muted-foreground text-sm">Response Time</p></div>
          <div><div className="text-3xl font-bold text-primary mb-2">256-bit</div><p className="text-muted-foreground text-sm">AES Encryption</p></div>
        </div>
      </motion.div>
    </div>
  );
};

export default TechnologySlide;
