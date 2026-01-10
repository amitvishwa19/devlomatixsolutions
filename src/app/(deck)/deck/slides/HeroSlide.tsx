import { motion } from "framer-motion";
import StatCard from "../StatCard";
import { Building2, Users, Clock, TrendingUp } from "lucide-react";
import Logo from "../Logo";

const HeroSlide = () => {
  const stats = [
    { value: "500+", label: "Healthcare Partners", icon: <Building2 className="w-6 h-6" /> },
    { value: "2M+", label: "Patients Served", icon: <Users className="w-6 h-6" /> },
    { value: "99.9%", label: "Uptime Guarantee", icon: <Clock className="w-6 h-6" /> },
    { value: "45%", label: "Efficiency Increase", icon: <TrendingUp className="w-6 h-6" /> },
  ];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-center">
      <Logo />

      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="mt-12 text-4xl md:text-6xl lg:text-7xl font-bold font-display leading-tight"
      >
        Transform Your
        <br />
        <span className="text-gradient-primary">Healthcare Operations</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl"
      >
        Complete hospital management, AI-powered diagnostics, and seamless
        integrations for efficient healthcare delivery
      </motion.p>

      <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full max-w-4xl">
        {stats.map((stat, index) => (
          <StatCard
            key={stat.label}
            value={stat.value}
            label={stat.label}
            icon={stat.icon}
            delay={0.8 + index * 0.1}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.4 }}
        className="mt-12 flex items-center gap-2 text-primary"
      >
        <span className="text-sm">Your Complete Hospital Management Solution</span>
        <motion.span
          animate={{ x: [0, 5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          →
        </motion.span>
      </motion.div>
    </div>
  );
};

export default HeroSlide;
