import { Home, Building2, Factory, Droplets, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

const services = [
  {
    icon: Home,
    title: "Residential Cleaning",
    description: "Perfect for rooftop solar panels on homes. We handle 1kW to 10kW setups across all Indian cities.",
    tag: "Most Popular",
  },
  {
    icon: Building2,
    title: "Commercial Cleaning",
    description: "Offices, malls & hospitals — we clean large commercial installations with minimal disruption.",
    tag: "Enterprise",
  },
  {
    icon: Factory,
    title: "Solar Farm Cleaning",
    description: "Specialized robotic & manual cleaning for MW-scale solar farms across Rajasthan, Gujarat & beyond.",
    tag: "Industrial",
  },
  {
    icon: Droplets,
    title: "AMC & Maintenance",
    description: "Annual Maintenance Contracts from ₹2,999/year. Scheduled cleaning after monsoon, dust & heat.",
    tag: "Best Value",
  },
];

const Services = () => {
  return (
    <section id="services" className="py-28 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
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
            What We Do
            <span className="w-8 h-px bg-primary" />
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
            Complete Solar Panel Care
          </h2>
          <p className="text-muted-foreground mt-4 text-lg max-w-lg mx-auto">
            From rooftop homes to large solar farms — India's weather demands regular cleaning for maximum returns.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-5 max-w-5xl mx-auto">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative rounded-2xl border border-border bg-card p-8 hover:border-primary/30 hover:shadow-glow transition-all duration-500 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />

              <div className="relative">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 group-hover:scale-105 transition-all duration-500">
                    <service.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-primary/80 bg-primary/10 px-3 py-1 rounded-full">{service.tag}</span>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all duration-300" />
                  </div>
                </div>
                <h3 className="font-heading text-lg font-bold text-foreground mb-2">{service.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{service.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
