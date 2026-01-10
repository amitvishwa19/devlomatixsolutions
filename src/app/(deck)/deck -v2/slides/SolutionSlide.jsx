import { motion } from "framer-motion";
import { Building2, Sparkles, Target, Zap } from "lucide-react";

const SolutionSlide = () => {
  return (
    <div className="relative w-full h-screen bg-background overflow-hidden">
      {/* Gradient Mesh Background */}
      <div className="absolute inset-0 gradient-mesh" />

      {/* Central Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/15 blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-accent/20 blur-2xl animate-pulse" />

      {/* Animated Circles */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-primary/10"
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-primary/15"
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-primary/20"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
        {/* Section Label */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <span className="text-primary font-heading font-semibold text-sm tracking-widest uppercase">
            Our Solution
          </span>
        </motion.div>

        {/* Central Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="relative mb-8"
        >
          <div className="p-8 rounded-3xl bg-gradient-primary animate-glow">
            <Building2 className="w-16 h-16 text-primary-foreground" />
          </div>

          {/* Floating icons */}
          <motion.div
            className="absolute -top-4 -right-4 p-3 rounded-xl bg-accent/90"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-5 h-5 text-accent-foreground" />
          </motion.div>
          <motion.div
            className="absolute -bottom-4 -left-4 p-3 rounded-xl bg-card"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            <Target className="w-5 h-5 text-primary" />
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6"
        >
          Complete Hospital
          <span className="block ">Management System</span>
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-xl md:text-2xl text-muted-foreground max-w-3xl leading-relaxed"
        >
          A centralized platform that digitizes your entire hospital operation —
          <span className="text-primary"> from appointments to billing</span>,
          inventory to analytics
        </motion.p>

        {/* Feature Pills */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-wrap justify-center gap-4 mt-10"
        >
          {["16+ Modules", "Real-time Dashboards", "HIPAA Compliant", "Cloud-Based"].map((feature, index) => (
            <motion.div
              key={feature}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              className="flex items-center gap-2 glass px-5 py-2.5 rounded-full"
            >
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-foreground font-medium">{feature}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default SolutionSlide;
