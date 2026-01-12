import { motion } from "framer-motion";
import { Brain, Cpu, Lightbulb, MessageSquare, Scan, ShieldCheck } from "lucide-react";

const AISlide = () => {
  const aiFeatures = [
    { icon: <Brain className="w-10 h-10" />, title: "Predictive Analytics", description: "Forecast patient admissions, resource needs, and potential health risks" },
    { icon: <Scan className="w-10 h-10" />, title: "Medical Imaging AI", description: "AI-assisted radiology for faster, more accurate diagnoses" },
    { icon: <MessageSquare className="w-10 h-10" />, title: "Virtual Health Assistant", description: "24/7 patient engagement with intelligent chatbot support" },
    { icon: <ShieldCheck className="w-10 h-10" />, title: "Clinical Decision Support", description: "Evidence-based recommendations at the point of care" },
  ];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-12">
        <span className="inline-block px-4 py-2 bg-healthcare-purple/20 text-healthcare-purple rounded-full text-sm font-medium mb-4"><Cpu className="w-4 h-4 inline mr-2" />Powered by AI</span>
        <h2 className="text-3xl md:text-5xl font-bold font-display"><span className="text-gradient-secondary">Intelligent</span> Healthcare Delivery</h2>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">Leverage cutting-edge AI to enhance clinical outcomes and operational efficiency</p>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
        {aiFeatures.map((feature, index) => (
          <motion.div key={feature.title} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 + index * 0.15 }} className="glass-effect rounded-2xl p-8 hover:border-healthcare-purple/50 transition-all group">
            <div className="flex items-start gap-5">
              <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity, delay: index * 0.5 }} className="w-16 h-16 bg-gradient-secondary rounded-xl flex items-center justify-center flex-shrink-0 glow-secondary">
                <div className="text-secondary-foreground">{feature.icon}</div>
              </motion.div>
              <div><h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-gradient-secondary">{feature.title}</h3><p className="text-muted-foreground">{feature.description}</p></div>
            </div>
          </motion.div>
        ))}
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 1 }} className="mt-10 flex items-center gap-3 text-muted-foreground">
        <Lightbulb className="w-5 h-5 text-healthcare-purple" /><span>AI models trained on millions of medical records with 99.2% accuracy</span>
      </motion.div>
    </div>
  );
};

export default AISlide;
