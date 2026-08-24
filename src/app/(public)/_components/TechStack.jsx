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

const TechStack = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-background to-accent/5 dark:from-background dark:via-background dark:to-background pointer-events-none" />

      {/* Decorative orbs */}
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] orb-primary rounded-full blur-[80px] opacity-50 pointer-events-none" />
      <div className="absolute top-10 left-10 w-[300px] h-[300px] orb-tertiary rounded-full blur-[70px] opacity-40 pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Tagline text="Tech Stack" icon={<Sparkles className="w-4 h-4 text-primary" />} />
          <h2 className="font-display text-4xl md:text-5xl font-extrabold mt-4 mb-6 text-foreground">
            Technologies We <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-600 to-indigo-600">Master</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
            We stay ahead of the curve with deep expertise in modern cloud, frontend, backend, and intelligent automation frameworks.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-3"
        >
          {technologies.map((tech, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8, rotate: -2 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{
                duration: 0.4,
                delay: index * 0.04,
                type: "spring",
                stiffness: 200
              }}
              viewport={{ once: true }}
              whileHover={{
                scale: 1.08,
                y: -4,
                boxShadow: "0 12px 24px -6px rgba(14, 165, 233, 0.25)",
              }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-xl bg-card border border-border/80 hover:border-primary/60 hover:bg-card shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer flex items-center"
            >
              <motion.span
                className="font-semibold text-foreground text-sm"
                whileHover={{ color: "hsl(var(--primary))" }}
              >
                {tech.name}
              </motion.span>
              <span className="ml-2 text-xs font-medium text-muted-foreground bg-secondary/80 px-1.5 py-0.5 rounded-md border border-border/50">{tech.category}</span>
            </motion.div>
          ))}
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
