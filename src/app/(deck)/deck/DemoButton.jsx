import { motion } from "framer-motion";
import { Play } from "lucide-react";

const DemoButton = ({ onClick }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="fixed bottom-24 right-4 z-40 px-4 py-2 rounded-full glass-effect hover:bg-card transition-colors flex items-center gap-2 text-sm font-medium text-foreground"
      title="Interactive Demo"
    >
      <Play className="w-4 h-4 text-primary" />
      <span className="hidden sm:inline">Demo</span>
    </motion.button>
  );
};

export default DemoButton;
