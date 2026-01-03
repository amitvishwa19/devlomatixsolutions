import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SlideNavigation from "./SlideNavigation";
import TitleSlide from "./slides/TitleSlide";
import ProblemSlide from "./slides/ProblemSlide";
import SolutionSlide from "./slides/SolutionSlide";
import FeaturesSlide from "./slides/FeaturesSlide";
import FunctionalAreasSlide from "./slides/AICoachSlide";
import TargetUsersSlide from "./slides/TargetUsersSlide";
import SecuritySlide from "./slides/SecuritySlide";
import MetricsSlide from "./slides/MetricsSlide";
import PricingSlide from "./slides/PricingSlide";
import CTASlide from "./slides/CTASlide";

const slides = [
  { id: 1, component: TitleSlide },
  { id: 2, component: ProblemSlide },
  { id: 3, component: SolutionSlide },
  { id: 4, component: FeaturesSlide },
  { id: 5, component: FunctionalAreasSlide },
  { id: 6, component: TargetUsersSlide },
  { id: 7, component: SecuritySlide },
  { id: 8, component: MetricsSlide },
  { id: 9, component: PricingSlide },
  { id: 10, component: CTASlide },
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
  }),
};

const PresentationView = () => {
  const [[currentSlide, direction], setSlide] = useState([0, 0]);
  const [isAnimating, setIsAnimating] = useState(false);

  const paginate = useCallback(
    (newDirection: number) => {
      if (isAnimating) return;

      const nextSlide = currentSlide + newDirection;
      if (nextSlide >= 0 && nextSlide < slides.length) {
        setSlide([nextSlide, newDirection]);
      }
    },
    [currentSlide, isAnimating]
  );

  const goToSlide = useCallback(
    (index: number) => {
      if (isAnimating || index === currentSlide) return;
      const newDirection = index > currentSlide ? 1 : -1;
      setSlide([index, newDirection]);
    },
    [currentSlide, isAnimating]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        paginate(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        paginate(-1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [paginate]);

  // Touch/swipe navigation
  useEffect(() => {
    let touchStartX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchStartX - touchEndX;

      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          paginate(1);
        } else {
          paginate(-1);
        }
      }
    };

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [paginate]);

  const CurrentSlideComponent = slides[currentSlide].component;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slide-dark">
      <AnimatePresence
        initial={false}
        custom={direction}
        mode="wait"
        onExitComplete={() => setIsAnimating(false)}
      >
        <motion.div
          key={currentSlide}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          onAnimationStart={() => setIsAnimating(true)}
          onAnimationComplete={() => setIsAnimating(false)}
          className="absolute inset-0"
        >
          <CurrentSlideComponent />
        </motion.div>
      </AnimatePresence>

      <SlideNavigation
        currentSlide={currentSlide}
        totalSlides={slides.length}
        onPrev={() => paginate(-1)}
        onNext={() => paginate(1)}
        onDotClick={goToSlide}
      />
    </div>
  );
};

export default PresentationView;
