import { motion } from "framer-motion";
import { Lightbulb, PenTool, Code, Rocket, Sparkles } from "lucide-react";
import Tagline from "./Tagline";

const steps = [
  {
    icon: Lightbulb,
    title: "Discovery",
    description: "We dive deep into your business to understand your goals, challenges, and vision for the future.",
  },
  {
    icon: PenTool,
    title: "Design",
    description: "Our team crafts intuitive interfaces and robust architectures tailored to your needs.",
  },
  {
    icon: Code,
    title: "Development",
    description: "We build your solution using cutting-edge technologies and agile methodologies.",
  },
  {
    icon: Rocket,
    title: "Launch & Support",
    description: "We deploy your product and provide ongoing support to ensure continued success.",
  },
];

const Process = () => {
  return (
    <section id="process" className="py-32 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-indigo-500/5 dark:from-card/30 dark:via-card/30 dark:to-card/30 pointer-events-none" />

      {/* Decorative elements */}
      <div className="absolute top-0 left-1/2 w-[600px] h-[400px] orb-secondary rounded-full blur-[120px] opacity-40 -translate-x-1/2 pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <Tagline text="Our Process" icon={<Sparkles className="w-4 h-4 text-primary" />} />
          <h2 className="font-display text-4xl md:text-5xl font-extrabold mt-4 mb-6 text-foreground">
            Our Proven <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-600 to-indigo-600">Development Process</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
            A structured, transparent methodology that transforms your ideas into powerful,
            scalable digital solutions.
          </p>
        </motion.div>

        {/* Process Steps */}
        <div className="relative">
          {/* Full-width connecting line through circles with flowing animation */}
          <div className="hidden lg:block absolute top-[40px] left-[12.5%] right-[12.5%] h-[2px] z-0 overflow-hidden">
            <div className="absolute inset-0 bg-primary/20" />
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-primary to-transparent animate-flow-line"
              style={{ backgroundSize: '200% 100%' }}
            />
            {/* Dashed overlay */}
            <div
              className="absolute inset-0 animate-dash-flow"
              style={{
                backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 8px, hsl(var(--primary) / 0.5) 8px, hsl(var(--primary) / 0.5) 16px)',
              }}
            />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="text-center px-4">
                  {/* Circle container */}
                  <div className="relative inline-flex items-center justify-center mb-6">
                    {/* Main circle */}
                    <div className="w-20 h-20 rounded-full bg-card border-2 border-primary/40 flex items-center justify-center relative z-10 transition-all duration-300 hover:border-primary shadow-md hover:shadow-[0_0_25px_hsl(var(--primary)/0.25)]">
                      <step.icon className="w-8 h-8 text-primary" />
                    </div>

                    {/* Step number badge */}
                    <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-r from-primary to-blue-600 flex items-center justify-center font-display font-bold text-xs text-white z-20 shadow-md">
                      {index + 1}
                    </div>
                  </div>

                  <h3 className="font-display text-xl font-bold mb-3 text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
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

export default Process;
