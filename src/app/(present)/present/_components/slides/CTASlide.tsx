import { motion } from "framer-motion";
import { Building2, ArrowRight, Mail, Phone, Globe } from "lucide-react";

const CTASlide = () => {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-primary" />
      
      {/* Overlay Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Animated Shapes */}
      <motion.div
        className="absolute top-20 right-20 w-40 h-40 rounded-full bg-primary-foreground/10"
        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-32 left-32 w-24 h-24 rounded-2xl bg-primary-foreground/10"
        animate={{ scale: [1.2, 1, 1.2], rotate: [0, -90, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="mb-8"
        >
          <div className="p-6 rounded-3xl bg-primary-foreground/20 backdrop-blur-sm">
            <Building2 className="w-12 h-12 text-primary-foreground" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6"
        >
          Ready to Transform
          <span className="block">Your Hospital?</span>
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-xl text-primary-foreground/80 max-w-2xl mb-10"
        >
          Join 500+ hospitals that have already digitized their operations with our comprehensive management system
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 mb-12"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center gap-2 bg-primary-foreground text-primary px-8 py-4 rounded-xl font-heading font-semibold text-lg shadow-lg"
          >
            Get Started Now
            <ArrowRight className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center gap-2 bg-primary-foreground/20 text-primary-foreground px-8 py-4 rounded-xl font-heading font-semibold text-lg backdrop-blur-sm border border-primary-foreground/30"
          >
            Schedule Demo
          </motion.button>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center gap-6 text-primary-foreground/70"
        >
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            <span>contact@devlomatix.in</span>
          </div>
          <div className="hidden sm:block w-1 h-1 rounded-full bg-primary-foreground/50" />
          <div className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            <span>+91 (XXX) XXX-XXXX</span>
          </div>
          <div className="hidden sm:block w-1 h-1 rounded-full bg-primary-foreground/50" />
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            <span>devlomatix.in</span>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 text-primary-foreground/50 text-sm"
        >
          © 2026 Devlomatix. All rights reserved.
        </motion.div>
      </div>
    </div>
  );
};

export default CTASlide;
