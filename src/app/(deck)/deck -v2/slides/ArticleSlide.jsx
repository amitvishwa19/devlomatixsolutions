import { motion } from "framer-motion";
import { 
  Sparkles, 
  Share2, 
  PenTool, 
  Calendar,
  Facebook,
  Twitter,
  Linkedin,
  Instagram
} from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI Content Generation",
    description: "Generate health articles, tips, and educational content using AI",
    color: "from-violet-500 to-purple-500"
  },
  {
    icon: PenTool,
    title: "Smart Editor",
    description: "Rich text editor with AI suggestions and formatting",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: Calendar,
    title: "Schedule Posts",
    description: "Plan and schedule content for optimal engagement",
    color: "from-emerald-500 to-green-500"
  },
  {
    icon: Share2,
    title: "Multi-Platform",
    description: "Auto-publish to all social media channels",
    color: "from-orange-500 to-amber-500"
  }
];

const socialPlatforms = [
  { icon: Facebook, name: "Facebook", color: "bg-blue-600" },
  { icon: Twitter, name: "Twitter", color: "bg-sky-500" },
  { icon: Linkedin, name: "LinkedIn", color: "bg-blue-700" },
  { icon: Instagram, name: "Instagram", color: "bg-gradient-to-br from-purple-500 to-pink-500" }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const ArticleSlide = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center p-8 md:p-16">
      {/* Background */}
      <div className="absolute inset-0 gradient-mesh opacity-30" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse" />

      <div className="relative z-10 max-w-7xl mx-auto w-full">
        {/* Section Label */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3 mb-6"
        >
          <div className="h-px w-12 bg-gradient-to-r from-primary to-transparent" />
          <span className="text-primary font-medium tracking-wider uppercase text-sm">
            Content Marketing
          </span>
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4"
        >
          AI-Powered Articles
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-muted-foreground text-lg md:text-xl max-w-3xl mb-10"
        >
          Create and publish health content automatically with AI assistance
        </motion.p>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Features Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="md:col-span-2 grid grid-cols-2 gap-4"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.03 }}
                className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-5 hover:border-primary/50 transition-all"
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Social Media Integration */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-xl p-6"
          >
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Share2 className="w-5 h-5 text-primary" />
              Auto-Post To
            </h3>
            <div className="space-y-3">
              {socialPlatforms.map((platform, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-3 p-3 bg-background/50 rounded-lg cursor-pointer hover:bg-background/80 transition-all"
                >
                  <div className={`w-10 h-10 ${platform.color} rounded-lg flex items-center justify-center`}>
                    <platform.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-foreground font-medium">{platform.name}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ArticleSlide;
