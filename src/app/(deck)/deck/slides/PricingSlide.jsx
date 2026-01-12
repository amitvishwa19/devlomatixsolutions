import { motion } from "framer-motion";
import { Check, Sparkles, Settings } from "lucide-react";

const PricingSlide = () => {
  const plans = [
    { name: "Essential", price: "₹10,000", description: "For small clinics and practices", features: ["Dashboard", "Appointment", "Calendar", "Patients", "Prescriptions", "Services", "Invoices", "Payments", "Mailbox"], highlighted: false, isCustom: false },
    { name: "Professional", price: "₹15,000", description: "For mid-sized hospitals", features: ["All Essential features", "Workflow", "Kanban", "Documents", "Articles", "Taxonomy", "Laboratory", "Rooms & Beds", "Inventory", "Pharmacy", "Communication"], highlighted: true, isCustom: false },
    { name: "Enterprise", price: "₹25,000", description: "For healthcare networks", features: ["All Professional features", "Access Management", "Custom Integrations", "Dedicated Support", "Priority Updates", "Multi-branch Support", "Advanced Analytics", "API Access"], highlighted: false, isCustom: false },
    { name: "Custom", price: "Get Quote", description: "Tailored to your requirements", features: ["Bespoke Development", "Custom Modules", "Unique Workflows", "Third-party Integrations", "On-premise Deployment", "White-label Solution", "Dedicated Dev Team", "Ongoing Maintenance"], highlighted: false, isCustom: true },
  ];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-8">
        <span className="inline-block px-4 py-2 bg-primary/20 text-primary rounded-full text-sm font-medium mb-4">Flexible Pricing</span>
        <h2 className="text-3xl md:text-5xl font-bold font-display">Plans That <span className="text-gradient-primary">Scale</span> With You</h2>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl w-full">
        {plans.map((plan, index) => (
          <motion.div key={plan.name} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }} className={`rounded-2xl p-6 flex flex-col ${plan.highlighted ? "bg-gradient-primary glow-primary" : "glass-effect"}`}>
            {plan.highlighted && <div className="flex items-center gap-1 text-primary-foreground text-sm font-medium mb-2"><Sparkles className="w-4 h-4" />Most Popular</div>}
            {plan.isCustom && <div className="flex items-center gap-1 text-primary text-sm font-medium mb-2"><Settings className="w-4 h-4" />Fully Customized</div>}
            <h3 className={`text-xl font-bold ${plan.highlighted ? "text-primary-foreground" : "text-foreground"}`}>{plan.name}</h3>
            <div className="mt-4 mb-2"><span className={`text-4xl font-bold ${plan.highlighted ? "text-primary-foreground" : "text-gradient-primary"}`}>{plan.price}</span></div>
            <p className={`text-sm mb-6 ${plan.highlighted ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{plan.description}</p>
            <ul className="space-y-3 flex-grow">{plan.features.map((feature) => (<li key={feature} className="flex items-center gap-2"><Check className={`w-4 h-4 ${plan.highlighted ? "text-primary-foreground" : "text-primary"}`} /><span className={`text-sm ${plan.highlighted ? "text-primary-foreground" : "text-foreground"}`}>{feature}</span></li>))}</ul>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PricingSlide;
