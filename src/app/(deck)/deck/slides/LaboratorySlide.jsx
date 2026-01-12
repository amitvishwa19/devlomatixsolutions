import { motion } from "framer-motion";
import { 
  FlaskConical, 
  Microscope, 
  FileBarChart, 
  CheckCircle2,
  Clock,
  Send
} from "lucide-react";

const LaboratorySlide = () => {
  const workflow = [
    { step: "1", title: "Order Received", desc: "Lab orders from OPD/IPD" },
    { step: "2", title: "Sample Collection", desc: "Barcode-based tracking" },
    { step: "3", title: "Processing", desc: "Automated instruments" },
    { step: "4", title: "Results", desc: "Auto-validated reports" },
  ];

  const features = [
    { icon: <FlaskConical className="w-5 h-5" />, text: "500+ Test Catalog" },
    { icon: <Microscope className="w-5 h-5" />, text: "Equipment Integration" },
    { icon: <FileBarChart className="w-5 h-5" />, text: "Auto Reporting" },
    { icon: <CheckCircle2 className="w-5 h-5" />, text: "Quality Control" },
    { icon: <Clock className="w-5 h-5" />, text: "TAT Tracking" },
    { icon: <Send className="w-5 h-5" />, text: "Result Alerts" },
  ];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <span className="inline-block px-4 py-2 bg-primary/20 text-primary rounded-full text-sm font-medium mb-4">
          Laboratory Module
        </span>
        <h2 className="text-3xl md:text-5xl font-bold font-display">
          Advanced <span className="text-gradient-primary">Lab Management</span>
        </h2>
      </motion.div>
      
      {/* Workflow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="flex flex-wrap justify-center gap-4 mb-10 max-w-4xl"
      >
        {workflow.map((item, index) => (
          <motion.div
            key={item.step}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
            className="flex items-center"
          >
            <div className="glass-effect rounded-lg p-4 text-center min-w-[120px]">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center mx-auto mb-2">
                {item.step}
              </div>
              <h4 className="font-semibold text-foreground text-sm">{item.title}</h4>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            {index < workflow.length - 1 && (
              <div className="w-8 h-0.5 bg-primary/30 hidden md:block" />
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Features Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl w-full"
      >
        {features.map((feature, index) => (
          <motion.div
            key={feature.text}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.9 + index * 0.05 }}
            className="glass-effect rounded-xl p-4 flex items-center gap-3 hover:scale-105 transition-transform"
          >
            <div className="text-primary">{feature.icon}</div>
            <span className="text-sm text-foreground font-medium">{feature.text}</span>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="mt-8 text-center"
      >
        <p className="text-muted-foreground text-sm">
          Integrates with <span className="text-primary">HL7/FHIR</span> standards for seamless data exchange
        </p>
      </motion.div>
    </div>
  );
};

export default LaboratorySlide;
