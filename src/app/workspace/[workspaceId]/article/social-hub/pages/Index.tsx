import { ContentGenerator } from "@/social-hub/components/ContentGenerator";
import { Sparkles, Zap, Target, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  { icon: Zap, title: "Instant Generation", desc: "Create content in seconds" },
  { icon: Target, title: "Platform Optimized", desc: "Tailored for each network" },
  { icon: TrendingUp, title: "Engagement Ready", desc: "Crafted to go viral" },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "1s" }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 lg:py-12">
        <motion.header
          className="text-center mb-12 lg:mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/50 mb-6"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Powered by Gemini AI</span>
          </motion.div>
          
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            <span className="gradient-text">Social Media</span>
            <br />
            <span className="text-foreground">Content Generator</span>
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Create scroll-stopping content for any platform. Just describe your idea and let AI craft the perfect post.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/60 border border-border/30 hover:border-primary/40 transition-colors"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <f.icon className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">{f.title}</span>
                <span className="text-xs text-muted-foreground hidden sm:inline">· {f.desc}</span>
              </motion.div>
            ))}
          </div>
        </motion.header>

        <ContentGenerator />

        <footer className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">
            Generate unlimited content with AI. No signup required.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
