import { motion } from "framer-motion";
import { Lightbulb, PenTool, Code, Rocket, Sparkles } from "lucide-react";

const steps = [
  {
    icon: Lightbulb,
    title: "1. Discovery",
    gradient: "from-sky-500 to-blue-600",
    shadow: "shadow-sky-500/25",
    border: "border-sky-500/40",
    description: "We dive deep into your domain, pinpoint critical bottlenecks, and architect a razor-sharp technical blueprint.",
  },
  {
    icon: PenTool,
    title: "2. Design",
    gradient: "from-violet-500 to-purple-600",
    shadow: "shadow-violet-500/25",
    border: "border-violet-500/40",
    description: "Our UI/UX engineers craft high-fidelity prototypes and fluid design systems built for effortless adoption.",
  },
  {
    icon: Code,
    title: "3. Development",
    gradient: "from-amber-500 to-orange-600",
    shadow: "shadow-amber-500/25",
    border: "border-amber-500/40",
    description: "Agile 2-week development sprints delivering clean, tested code backed by automated CI/CD pipelines.",
  },
  {
    icon: Rocket,
    title: "4. Launch & Scale",
    gradient: "from-emerald-500 to-teal-600",
    shadow: "shadow-emerald-500/25",
    border: "border-emerald-500/40",
    description: "Flawless zero-downtime production deployment with 24/7 observability and continuous optimization.",
  },
];

const Process = () => {
  return (
    <section id="process" className="py-32 relative overflow-hidden">
      {/* Multi-color ambient mesh background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/6 via-violet-500/4 to-emerald-500/6 dark:from-card/30 dark:via-card/30 dark:to-card/30 pointer-events-none" />

      {/* Decorative elements */}
      <div className="absolute top-0 left-1/2 w-[650px] h-[450px] orb-secondary rounded-full blur-[120px] opacity-50 -translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] orb-rose rounded-full blur-[100px] opacity-40 pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border border-violet-500/25 shadow-xs mb-4">
            <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            <span className="text-xs font-bold uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400">
              Execution Methodology
            </span>
          </div>

          <h2 className="font-display text-4xl md:text-5xl font-extrabold mt-2 mb-6 text-foreground">
            Our Proven <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600">Development Process</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed font-normal">
            A structured, high-velocity methodology that transforms raw ideas into powerful,
            scalable digital products.
          </p>
        </motion.div>

        {/* Process Steps */}
        <div className="relative">
          {/* Full-width connecting line through circles with flowing animation */}
          <div className="hidden lg:block absolute top-[44px] left-[12.5%] right-[12.5%] h-[3px] z-0 overflow-hidden rounded-full">
            <div className="absolute inset-0 bg-gradient-to-r from-sky-500/30 via-violet-500/30 via-amber-500/30 to-emerald-500/30" />
            <div
              className="absolute inset-0 bg-gradient-to-r from-sky-500 via-violet-500 via-amber-500 to-emerald-500 animate-flow-line"
              style={{ backgroundSize: '200% 100%' }}
            />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.12 }}
                viewport={{ once: true }}
                className="relative group"
              >
                <div className="text-center px-4">
                  {/* Circle container */}
                  <div className="relative inline-flex items-center justify-center mb-6">
                    {/* Main circle */}
                    <div className={`w-22 h-22 rounded-3xl bg-card border-2 ${step.border} flex items-center justify-center relative z-10 transition-all duration-300 group-hover:scale-110 shadow-lg ${step.shadow}`}>
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.gradient} text-white flex items-center justify-center shadow-md`}>
                        <step.icon className="w-7 h-7 text-white" />
                      </div>
                    </div>

                    {/* Step number badge */}
                    <div className={`absolute -top-1.5 -right-1.5 w-7.5 h-7.5 rounded-full bg-gradient-to-r ${step.gradient} flex items-center justify-center font-display font-extrabold text-xs text-white z-20 shadow-md`}>
                      {index + 1}
                    </div>
                  </div>

                  <h3 className="font-display text-xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-sm font-normal">
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
