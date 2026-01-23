import { motion } from "framer-motion";
import { ClipboardCheck, Settings, Rocket, HeadphonesIcon } from "lucide-react";

const steps = [
  {
    icon: ClipboardCheck,
    step: "01",
    title: "Requirement Analysis",
    description: "Our team conducts a thorough analysis of your hospital's workflows, existing systems, and specific requirements to create a tailored implementation plan."
  },
  {
    icon: Settings,
    step: "02",
    title: "System Configuration",
    description: "We configure the HMS to match your hospital's structure, departments, user roles, and integrate with your existing medical equipment and software."
  },
  {
    icon: Rocket,
    step: "03",
    title: "Training & Go-Live",
    description: "Comprehensive training for all staff members followed by a phased rollout to ensure smooth transition with minimal disruption to operations."
  },
  {
    icon: HeadphonesIcon,
    step: "04",
    title: "Ongoing Support",
    description: "24/7 dedicated support team, regular system updates, and continuous optimization based on your feedback and evolving needs."
  }
];

const HowItWorksSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="module-badge mb-4">Implementation Process</span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-4 mb-6">
            How We{" "}
            <span className="hero-gradient-text">Get You Started</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            A streamlined 4-step process to transform your hospital operations with our HMS solution.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20 -translate-y-1/2" />
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="relative"
              >
                <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 text-center relative z-10 h-full">
                  {/* Step Number */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center">
                    {step.step}
                  </div>
                  
                  <div className="w-16 h-16 mx-auto mt-4 mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <step.icon className="w-8 h-8 text-primary" />
                  </div>
                  
                  <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                    {step.title}
                  </h3>
                  
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
