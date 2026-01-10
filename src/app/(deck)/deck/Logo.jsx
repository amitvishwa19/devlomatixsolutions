import { motion } from "framer-motion";
import logo from "@/assets/images/logo/logo.png";
import Image from "next/image";

const Logo = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="flex items-center justify-center w-full"
    >
      <Image
        src={logo}
        alt="HealthyFine Logo"
        className="h-8 md:h-10 lg:h-12 w-auto"
      />
    </motion.div>
  );
};

export default Logo;
