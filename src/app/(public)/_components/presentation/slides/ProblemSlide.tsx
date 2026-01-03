import { motion } from "framer-motion";
import { AlertCircle, Clock, FileX, TrendingDown } from "lucide-react";

const problems = [
  {
    icon: AlertCircle,
    stat: "67%",
    label: "of hospitals struggle with manual coordination overhead",
    color: "text-accent",
  },
  {
    icon: TrendingDown,
    stat: "40%",
    label: "revenue leakage due to poor billing management",
    color: "text-accent",
  },
  {
    icon: Clock,
    stat: "3+ hrs",
    label: "wasted daily on manual data entry & tracking",
    color: "text-accent",
  },
  {
    icon: FileX,
    stat: "25%",
    label: "of inventory wasted due to stock management issues",
    color: "text-accent",
  },
];

const ProblemSlide = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="relative w-full h-screen bg-gradient-dark overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--primary)) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Decorative Accent */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-accent/5 to-transparent" />

      <div className="relative z-10 flex flex-col justify-center h-full px-8 md:px-16 lg:px-24 max-w-7xl mx-auto">
        {/* Section Label */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <span className="text-accent font-heading font-semibold text-sm tracking-widest uppercase">
            The Challenge
          </span>
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-12"
        >
          Hospital Management<br />
          <span className="text-muted-foreground">Challenges Today</span>
        </motion.h2>

        {/* Problem Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8"
        >
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group glass-dark p-6 rounded-2xl hover:bg-primary/5 transition-all duration-300"
            >
              <div className="flex items-start gap-5">
                <div className="p-3 rounded-xl bg-accent/10 group-hover:bg-accent/20 transition-colors">
                  <problem.icon className={`w-6 h-6 ${problem.color}`} />
                </div>
                <div>
                  <div className="font-heading text-4xl font-bold text-primary-foreground mb-2">
                    {problem.stat}
                  </div>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    {problem.label}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom callout */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center"
        >
          <p className="text-xl text-primary-foreground/70 font-body">
            Hospitals need a <span className="text-primary font-semibold">centralized, digital</span> solution
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ProblemSlide;
