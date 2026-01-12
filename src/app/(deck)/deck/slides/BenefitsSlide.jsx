import { motion } from "framer-motion";
import { Clock, TrendingUp, Users, DollarSign, Heart, Shield } from "lucide-react";

const BenefitsSlide = () => {
  const benefits = [
    { icon: <Clock className="w-8 h-8" />, value: "40%", label: "Reduction in Wait Times", color: "text-primary" },
    { icon: <TrendingUp className="w-8 h-8" />, value: "60%", label: "Increase in Productivity", color: "text-healthcare-green" },
    { icon: <DollarSign className="w-8 h-8" />, value: "35%", label: "Cost Savings", color: "text-healthcare-cyan" },
    { icon: <Users className="w-8 h-8" />, value: "95%", label: "Patient Satisfaction", color: "text-secondary" },
    { icon: <Heart className="w-8 h-8" />, value: "25%", label: "Better Health Outcomes", color: "text-healthcare-pink" },
    { icon: <Shield className="w-8 h-8" />, value: "100%", label: "Compliance Rate", color: "text-healthcare-purple" },
  ];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-12">
        <span className="inline-block px-4 py-2 bg-healthcare-green/20 text-healthcare-green rounded-full text-sm font-medium mb-4">Measurable Results</span>
        <h2 className="text-3xl md:text-5xl font-bold font-display">Proven <span className="text-gradient-primary">Impact</span> Across Hospitals</h2>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">Real results from hospitals that transformed with MediCare HMS</p>
      </motion.div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl w-full">
        {benefits.map((benefit, index) => (
          <motion.div key={benefit.label} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }} className="glass-effect rounded-2xl p-6 text-center hover:scale-105 transition-transform">
            <div className={`${benefit.color} mb-4 flex justify-center`}>{benefit.icon}</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }} className={`text-4xl md:text-5xl font-bold ${benefit.color} mb-2`}>{benefit.value}</motion.div>
            <p className="text-sm text-muted-foreground">{benefit.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default BenefitsSlide;
