'use client';

import { CalendarCheck, ClipboardCheck, Sparkles, ThumbsUp } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  { icon: CalendarCheck, step: "01", title: "Book via Call or WhatsApp", description: "Call us or WhatsApp. We confirm a visit within your preferred time slot." },
  { icon: ClipboardCheck, step: "02", title: "Free Site Inspection", description: "Our technician visits, checks panel condition, dust levels & damage." },
  { icon: Sparkles, step: "03", title: "Professional Cleaning", description: "Using DM water, soft brushes & eco-friendly methods — safe for all brands." },
  { icon: ThumbsUp, step: "04", title: "More Units, More Savings", description: "Immediate boost in generation. Save ₹1000s on your electricity bill." },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-28 relative overflow-hidden bg-background/50">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-primary/3 blur-[180px]" />

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
            How It Works
            <span className="w-8 h-px bg-primary" />
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            4 Simple Steps
          </h2>
          <p className="text-muted-foreground mt-4 text-lg font-light">
            From booking to sparkling clean panels — done in a few hours.
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="group relative"
              >
                <div className="rounded-2xl border border-border bg-card p-6 h-full hover:border-primary/30 hover:shadow-glow transition-all duration-500">
                  <span className="font-heading text-5xl font-bold text-primary/5 absolute top-4 right-4 pointer-events-none">
                    {item.step}
                  </span>

                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/15 transition-all duration-500">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>

                  <h3 className="font-heading text-sm font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed font-light">{item.description}</p>
                </div>

                {i < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-px bg-gradient-to-r from-primary/20 to-transparent" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
