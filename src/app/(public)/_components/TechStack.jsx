import { motion } from "framer-motion";
import Tagline from "./Tagline";
import { Sparkles } from "lucide-react";

const technologies = [
  { name: "React", category: "Frontend" },
  { name: "Next.js", category: "Frontend" },
  { name: "Vue.js", category: "Frontend" },
  { name: "TypeScript", category: "Languages" },
  { name: "Node.js", category: "Backend" },
  { name: "Python", category: "Languages" },
  { name: "Go", category: "Languages" },
  { name: "PostgreSQL", category: "Database" },
  { name: "MongoDB", category: "Database" },
  { name: "Redis", category: "Database" },
  { name: "AWS", category: "Cloud" },
  { name: "GCP", category: "Cloud" },
  { name: "Azure", category: "Cloud" },
  { name: "Docker", category: "DevOps" },
  { name: "Kubernetes", category: "DevOps" },
  { name: "TensorFlow", category: "AI/ML" },
];

const categoryStyles = {
  Frontend: {
    badge: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/25",
    dot: "bg-sky-500",
    hoverBorder: "hover:border-sky-500/60 hover:shadow-sky-500/15",
  },
  Languages: {
    badge: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/25",
    dot: "bg-indigo-500",
    hoverBorder: "hover:border-indigo-500/60 hover:shadow-indigo-500/15",
  },
  Backend: {
    badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
    dot: "bg-emerald-500",
    hoverBorder: "hover:border-emerald-500/60 hover:shadow-emerald-500/15",
  },
  Database: {
    badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25",
    dot: "bg-amber-500",
    hoverBorder: "hover:border-amber-500/60 hover:shadow-amber-500/15",
  },
  Cloud: {
    badge: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25",
    dot: "bg-purple-500",
    hoverBorder: "hover:border-purple-500/60 hover:shadow-purple-500/15",
  },
  DevOps: {
    badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25",
    dot: "bg-rose-500",
    hoverBorder: "hover:border-rose-500/60 hover:shadow-rose-500/15",
  },
  "AI/ML": {
    badge: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/25",
    dot: "bg-pink-500",
    hoverBorder: "hover:border-pink-500/60 hover:shadow-pink-500/15",
  },
};

const TechStack = () => {
  return (
    <section className="py-28 relative overflow-hidden">
      {/* Multi-color ambient background */}
      <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/5 via-background to-indigo-500/5 dark:from-background dark:via-background dark:to-background pointer-events-none" />

      {/* Decorative orbs */}
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] orb-primary rounded-full blur-[90px] opacity-60 pointer-events-none" />
      <div className="absolute top-10 left-10 w-[350px] h-[350px] orb-tertiary rounded-full blur-[80px] opacity-50 pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-red-500/10 via-orange-500/10 to-amber-500/10 border border-orange-500/30 shadow-xs mb-4">
            <Sparkles className="w-4 h-4 text-orange-500 dark:text-orange-400" />
            <span className="text-xs font-bold uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500 dark:from-red-400 dark:to-orange-400">
              Modern Tech Infrastructure
            </span>
          </div>

          <h2 className="font-display text-4xl md:text-5xl font-extrabold mt-2 mb-6 text-foreground">
            Under the Hood. Technologies We{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-amber-400 dark:from-red-400 dark:via-orange-400 dark:to-amber-300">
              Master & Deploy.
            </span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed font-normal">
            We build on standard Linux and modern cloud primitives. Standard open-source tooling, microservices, and battle-tested distributed backends.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-3.5 max-w-4xl mx-auto"
        >
          {technologies.map((tech, index) => {
            const style = categoryStyles[tech.category] || categoryStyles.Frontend;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.03,
                  type: "spring",
                  stiffness: 220
                }}
                viewport={{ once: true }}
                whileHover={{
                  scale: 1.06,
                  y: -3,
                }}
                whileTap={{ scale: 0.96 }}
                className={`px-4.5 py-2.5 rounded-2xl glass-card border border-border/80 ${style.hoverBorder} shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer flex items-center gap-2.5 group`}
              >
                <span className={`w-2 h-2 rounded-full ${style.dot} group-hover:scale-125 transition-transform`} />
                <span className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">
                  {tech.name}
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${style.badge}`}>
                  {tech.category}
                </span>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-primary/30"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + (i % 3) * 20}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 3 + i,
                repeat: Infinity,
                delay: i * 0.5,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechStack;
