import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ContactFormModal from "../ContactFormModal";


const benefits = ["Free 14-day trial with full access", "No credit card required", "Dedicated onboarding support", "HIPAA compliant & secure"];

const CTASection = () => {
  return (
    <section id="contact" className="section-padding bg-secondary/30 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="container mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-4xl mx-auto text-center">
          <span className="module-badge mb-4">Get Started Today</span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-4 mb-6">Ready to Transform Your <span className="hero-gradient-text">Healthcare Operations?</span></h2>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <ContactFormModal title="Start Your Free Trial">
              <Button size="lg" className="hero-gradient text-primary-foreground px-10 py-7 text-lg rounded-xl shadow-glow">Start Free Trial <ArrowRight className="ml-2 h-5 w-5" /></Button>
            </ContactFormModal>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
