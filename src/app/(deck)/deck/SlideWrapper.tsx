import { motion } from "framer-motion";
import { ReactNode } from "react";

interface SlideWrapperProps {
  children: ReactNode;
  className?: string;
}

const SlideWrapper = ({ children, className = "" }: SlideWrapperProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`w-full h-screen overflow-hidden relative deck-bg-pattern grid-overlay ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-dark hidden dark:block dark:opacity-90" />
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-8 md:px-16 lg:px-24">
        {children}
      </div>
    </motion.div>
  );
};

export default SlideWrapper;
