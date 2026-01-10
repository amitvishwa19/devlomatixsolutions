import { motion } from "framer-motion";
import Logo from "../Logo";
import { ArrowRight, Calendar, Mail, Phone } from "lucide-react";

const CTASlide = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="glass-effect rounded-3xl p-10 md:p-16 max-w-3xl w-full glow-primary"
      >
        <Logo />
        
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-10 text-3xl md:text-5xl font-bold font-display"
        >
          Ready to <span className="text-gradient-primary">Transform</span>
          <br />
          Your Hospital?
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto"
        >
          Join 500+ healthcare facilities that have revolutionized their operations with MediCare HMS
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button className="inline-flex items-center justify-center gap-2 bg-gradient-primary text-primary-foreground px-8 py-4 rounded-xl font-semibold hover:opacity-90 transition-opacity">
            <Calendar className="w-5 h-5" />
            Schedule a Demo
            <ArrowRight className="w-5 h-5" />
          </button>
          <button className="inline-flex items-center justify-center gap-2 glass-effect px-8 py-4 rounded-xl font-semibold text-foreground hover:border-primary/50 transition-colors">
            Download Brochure
          </button>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-10 pt-8 border-t border-border"
        >
          <p className="text-sm text-muted-foreground mb-4">Get in touch</p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <div className="flex items-center gap-2 text-foreground">
              <Mail className="w-4 h-4 text-primary" />
              <span>info@devlomatix.in</span>
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <Phone className="w-4 h-4 text-primary" />
              <span>+91 9712340450</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
        className="mt-8 text-sm text-muted-foreground"
      >
        © 2026 MediCare Hospital Management System. All rights reserved.
      </motion.p>
    </div>
  );
};

export default CTASlide;
