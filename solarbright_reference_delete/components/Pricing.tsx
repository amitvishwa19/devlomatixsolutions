import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const plans = [
  {
    name: "Basic Clean",
    price: "₹18",
    period: "per panel",
    description: "Perfect for one-time cleaning needs",
    features: ["Professional dry & wet cleaning", "Visual inspection report", "Same-day service", "Any number of panels"],
    popular: false,
  },
  {
    name: "Standard Clean",
    price: "₹16",
    period: "per panel",
    description: "Ideal for regular maintenance",
    features: ["All Basic Clean features included", "Soft cleaning chemical", "Performance check & report", "Before/after photo proof", "Priority scheduling"],
    popular: true,
  },
  {
    name: "AMC Plan",
    price: "₹14",
    period: "per panel",
    description: "Best value with annual contract",
    features: ["All Standard Clean features included", "Lowest per-panel rate", "Scheduled cleanings throughout the year", "Free emergency visits", "Weekly dashboard of unit output", "Custom app for monitoring", "Detailed performance reports", "Dedicated account manager", "10% off additional services"],
    popular: false,
  },
];

const Pricing = () => {
  return (
    <section id="pricing" className="py-28 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/3 blur-[200px]" />

      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-20"
        >
          <span className="inline-flex items-center gap-2 text-primary font-semibold text-sm uppercase tracking-[0.2em] mb-4">
            <span className="w-8 h-px bg-primary" />
            Pricing
            <span className="w-8 h-px bg-primary" />
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            Simple, Transparent Pricing
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            No hidden charges. Choose a plan that fits your solar setup.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative rounded-2xl p-8 flex flex-col transition-all duration-500 border ${
                plan.popular
                  ? "border-primary/40 bg-card shadow-glow lg:scale-105"
                  : "border-border bg-card hover:border-primary/20"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-primary text-primary-foreground px-5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-glow">
                  <Sparkles className="h-3 w-3" />
                  Most Popular
                </div>
              )}

              <h3 className="font-heading text-xl font-bold text-foreground">{plan.name}</h3>
              <p className="text-sm mt-1 text-muted-foreground">{plan.description}</p>

              <div className="mt-6 mb-8">
                <span className="font-heading text-5xl font-bold tracking-tight text-primary">{plan.price}</span>
                <span className="text-sm ml-2 text-muted-foreground">{plan.period}</span>
              </div>

              <ul className="space-y-3 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                className={`mt-8 w-full rounded-full h-12 text-base font-semibold transition-all duration-300 ${
                  plan.popular
                    ? "bg-primary text-primary-foreground shadow-glow hover:shadow-glow-lg hover:brightness-110"
                    : "bg-muted text-foreground border border-border hover:bg-muted/80 hover:border-primary/30"
                }`}
                size="lg"
                asChild
              >
                <a href="#contact">Get Started</a>
              </Button>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-muted-foreground text-sm mt-12"
        >
          Need a custom plan for your commercial setup?{" "}
          <a href="#contact" className="text-primary font-semibold hover:underline underline-offset-4">
            Contact us
          </a>
        </motion.p>
      </div>
    </section>
  );
};

export default Pricing;
