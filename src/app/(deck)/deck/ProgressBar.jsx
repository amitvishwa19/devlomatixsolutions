import { motion } from "framer-motion";

const ProgressBar = ({ currentSlide, totalSlides }) => {
  const progress = ((currentSlide + 1) / totalSlides) * 100;

  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-muted/30 z-50">
      <motion.div
        className="h-full bg-gradient-primary"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />
    </div>
  );
};

export default ProgressBar;
