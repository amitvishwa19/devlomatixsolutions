import { motion, AnimatePresence } from "framer-motion";
import { X, Grid3X3 } from "lucide-react";
import { useState, ComponentType } from "react";

interface SlideInfo {
  id: number;
  component: ComponentType;
  name: string;
}

interface SlideThumbnailsProps {
  currentSlide: number;
  totalSlides: number;
  onGoToSlide: (index: number) => void;
  slides: SlideInfo[];
}

const SlideThumbnails = ({
  currentSlide,
  totalSlides,
  onGoToSlide,
  slides,
}: SlideThumbnailsProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.6 }}
        onClick={() => setIsOpen(true)}
        className="fixed top-6 right-6 p-3 glass-effect rounded-full hover:bg-muted/50 transition-colors z-50"
        aria-label="Open slide navigator"
      >
        <Grid3X3 className="w-5 h-5 text-foreground" />
      </motion.button>

      {/* Thumbnails Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/95 backdrop-blur-lg z-[100] flex items-center justify-center p-8"
          >
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 p-3 hover:bg-muted rounded-full transition-colors"
              aria-label="Close navigator"
            >
              <X className="w-6 h-6 text-foreground" />
            </motion.button>

            <div className="w-full max-w-6xl">
              <motion.h2
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold text-center mb-8 font-display"
              >
                Slide Navigator
              </motion.h2>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[70vh] overflow-y-auto p-2">
                {slides.map((slide, index) => {
                  const SlideComponent = slide.component;
                  return (
                    <motion.button
                      key={slide.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => {
                        onGoToSlide(index);
                        setIsOpen(false);
                      }}
                      className={`aspect-video rounded-lg border-2 transition-all duration-200 overflow-hidden relative group ${
                        currentSlide === index
                          ? "border-primary ring-2 ring-primary/30"
                          : "border-muted hover:border-primary/50"
                      }`}
                    >
                      {/* Mini slide preview */}
                      <div className="absolute inset-0 scale-[0.25] origin-top-left w-[400%] h-[400%] pointer-events-none bg-background">
                        <div className="w-full h-full flex items-center justify-center p-8">
                          <SlideComponent />
                        </div>
                      </div>
                      
                      {/* Overlay with slide info */}
                      <div className={`absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-2 ${
                        currentSlide === index ? "opacity-100" : ""
                      }`}>
                        <span className="text-xs font-medium text-foreground bg-background/80 px-2 py-1 rounded">
                          {index + 1}. {slide.name}
                        </span>
                      </div>

                      {/* Current slide indicator */}
                      {currentSlide === index && (
                        <div className="absolute top-2 right-2 w-3 h-3 bg-primary rounded-full" />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SlideThumbnails;
