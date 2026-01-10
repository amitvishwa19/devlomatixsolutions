import { motion } from "framer-motion";
import { Mouse } from "lucide-react";

interface SlideNavigationProps {
  currentSlide: number;
  totalSlides: number;
  onPrev: () => void;
  onNext: () => void;
  onGoToSlide?: (index: number) => void;
}

const SlideNavigation = ({
  currentSlide,
  totalSlides,
  onPrev,
  onNext,
  onGoToSlide,
}: SlideNavigationProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="fixed bottom-8 inset-x-0 flex flex-col items-center gap-3 z-50"
    >
      {/* Swipe hint text */}
      <span className="text-xs text-muted-foreground">
        Swipe or use arrows
      </span>
      
      {/* Mouse icon */}
      <div className="p-2 rounded-full border border-border/50 bg-card/50 backdrop-blur-sm">
        <Mouse className="w-4 h-4 text-muted-foreground" />
      </div>
      
      {/* Dot indicators */}
      <div className="flex items-center gap-2">
        {Array.from({ length: totalSlides }).map((_, index) => (
          <button
            key={index}
            onClick={() => onGoToSlide?.(index)}
            className="group"
            aria-label={`Go to slide ${index + 1}`}
          >
            <motion.div
              initial={false}
              animate={{
                width: currentSlide === index ? 24 : 8,
                backgroundColor: currentSlide === index 
                  ? "hsl(var(--primary))" 
                  : "hsl(var(--muted-foreground) / 0.4)",
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="h-2 rounded-full group-hover:opacity-80 transition-opacity"
            />
          </button>
        ))}
      </div>
    </motion.div>
  );
};

export default SlideNavigation;
