import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "₹10,000",
    period: "/month",
    description: "Perfect for small clinics and practices",
    features: [
      "Up to 50 patients/day",
      "Patient Management",
      "Appointment Scheduling",
      "Basic Reports",
      "Email Support",
      "1 Admin User",
    ],
    highlighted: false,
  },
  {
    name: "Professional",
    price: "₹15,000",
    period: "/month",
    description: "Ideal for growing hospitals",
    features: [
      "Up to 200 patients/day",
      "Everything in Starter",
      "Inventory Management",
      "Multi-location Support",
      "Lab & Pharmacy Module",
      "5 Admin Users",
    ],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "₹25,000",
    period: "/month",
    description: "For large healthcare facilities",
    features: [
      "Unlimited patients",
      "Everything in Professional",
      "Custom Integrations",
      "White-labeling",
      "SLA Guarantee",
      "Unlimited Users",
    ],
    highlighted: false,
  },
];

const PricingSlide = () => {
  return (
    <div className="relative w-full h-screen bg-background overflow-hidden">
      {/* Gradient Mesh Background */}
      <div className="absolute inset-0 gradient-mesh" />
      
      {/* Professional Glows */}
      <div className="absolute top-[15%] left-[10%] w-[400px] h-[400px] rounded-full bg-primary/12 blur-3xl" />
      <div className="absolute bottom-[10%] right-[15%] w-[450px] h-[450px] rounded-full bg-accent/10 blur-3xl animate-pulse" />
      <div className="absolute top-[40%] left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full bg-primary/8 blur-2xl" />
      
      {/* Subtle Grid */}
      <div className="absolute inset-0 opacity-[0.015]">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full px-8">
        {/* Section Label */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <span className="text-primary font-heading font-semibold text-sm tracking-widest uppercase">
            Pricing
          </span>
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-heading text-4xl md:text-5xl font-bold text-foreground text-center mb-4"
        >
          Simple, Transparent
          <span className="block text-muted-foreground">Pricing</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-lg text-muted-foreground mb-12 text-center"
        >
          Choose the plan that fits your hospital's needs
        </motion.p>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className={`relative p-6 rounded-2xl ${
                plan.highlighted
                  ? "gradient-primary border-2 border-primary/50 scale-105"
                  : "glass"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-accent px-3 py-1 rounded-full">
                  <Sparkles className="w-3 h-3 text-accent-foreground" />
                  <span className="text-xs font-semibold text-accent-foreground">Most Popular</span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className={`font-heading text-xl font-semibold mb-2 ${plan.highlighted ? "text-white" : "text-foreground"}`}>
                  {plan.name}
                </h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className={`font-heading text-4xl font-bold ${plan.highlighted ? "text-white" : "text-foreground"}`}>
                    {plan.price}
                  </span>
                  <span className={`text-sm ${plan.highlighted ? "text-white/70" : "text-muted-foreground"}`}>{plan.period}</span>
                </div>
                <p className={`text-sm mt-2 ${plan.highlighted ? "text-white/70" : "text-muted-foreground"}`}>{plan.description}</p>
              </div>

              <ul className="space-y-3">
                {plan.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-center gap-3">
                    <Check className={`w-4 h-4 flex-shrink-0 ${
                      plan.highlighted ? "text-white" : "text-primary"
                    }`} />
                    <span className={`text-sm ${
                      plan.highlighted ? "text-white/90" : "text-muted-foreground"
                    }`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingSlide;
