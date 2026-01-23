import { motion } from "framer-motion";
import { TrendingUp, Users, Clock, Shield } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "500+",
    label: "Healthcare Facilities",
    description: "Trust our platform"
  },
  {
    icon: TrendingUp,
    value: "98.5%",
    label: "Efficiency Increase",
    description: "In operations"
  },
  {
    icon: Clock,
    value: "45%",
    label: "Time Saved",
    description: "On administrative tasks"
  },
  {
    icon: Shield,
    value: "99.9%",
    label: "Uptime Guarantee",
    description: "Enterprise reliability"
  }
];

const StatsSection = () => {
  return (
    <section className="py-20 bg-background relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 hero-gradient opacity-95" />
      
      {/* Pattern Overlay */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Trusted by Healthcare Leaders Worldwide
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Join hundreds of hospitals and clinics that have transformed their operations with our system.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center p-6 md:p-8 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all"
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-white/20 flex items-center justify-center">
                <stat.icon className="w-7 h-7 text-white" />
              </div>
              <p className="text-4xl md:text-5xl font-bold text-white mb-2">
                {stat.value}
              </p>
              <p className="text-lg font-semibold text-white mb-1">
                {stat.label}
              </p>
              <p className="text-sm text-white/70">
                {stat.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
