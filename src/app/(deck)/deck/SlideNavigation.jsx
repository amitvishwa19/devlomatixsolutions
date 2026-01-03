import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const SlideNavigation = ({
  currentSlide,
  totalSlides,
  onPrev,
  onNext,
  onDotClick,
}) => {
  return (
    <>
      {/* Navigation Dots */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3">
        {Array.from({ length: totalSlides }).map((_, index) => (
          <motion.button
            key={index}
            onClick={() => onDotClick(index)}
            className={`relative h-3 rounded-full transition-all duration-300 ${
              currentSlide === index
                ? "w-8 bg-primary"
                : "w-3 bg-primary/30 hover:bg-primary/50"
            }`}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Arrow Navigation */}
      <motion.button
        onClick={onPrev}
        className={`fixed left-6 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full glass transition-all ${
          currentSlide === 0 ? "opacity-30 cursor-not-allowed" : "hover:bg-primary/20"
        }`}
        disabled={currentSlide === 0}
        whileHover={currentSlide !== 0 ? { scale: 1.1 } : {}}
        whileTap={currentSlide !== 0 ? { scale: 0.95 } : {}}
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6 text-foreground" />
      </motion.button>

      <motion.button
        onClick={onNext}
        className={`fixed right-6 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full glass transition-all ${
          currentSlide === totalSlides - 1
            ? "opacity-30 cursor-not-allowed"
            : "hover:bg-primary/20"
        }`}
        disabled={currentSlide === totalSlides - 1}
        whileHover={currentSlide !== totalSlides - 1 ? { scale: 1.1 } : {}}
        whileTap={currentSlide !== totalSlides - 1 ? { scale: 0.95 } : {}}
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6 text-foreground" />
      </motion.button>

      {/* Slide Counter */}
      <div className="fixed top-6 right-6 z-50 glass px-4 py-2 rounded-full">
        <span className="font-heading text-sm text-foreground">
          {currentSlide + 1} / {totalSlides}
        </span>
      </div>
    </>
  );
};

export default SlideNavigation;
