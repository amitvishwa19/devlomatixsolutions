'use client';

import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const Contact = () => {
  return (
    <section id="contact" className="py-28 relative overflow-hidden bg-background">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-primary/3 blur-[200px] pointer-events-none" />

      <div className="container mx-auto px-4 relative">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <div>
              <span className="inline-flex items-center gap-2 text-primary font-semibold text-sm uppercase tracking-[0.2em] mb-4">
                <span className="w-8 h-px bg-primary" />
                Contact Us
                <span className="w-8 h-px bg-primary" />
              </span>
              <h2 className="font-heading text-4xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
                Ready to Boost Your <span className="text-gradient-sun">Solar Output?</span>
              </h2>
              <p className="text-muted-foreground mt-6 text-lg max-w-md font-light leading-relaxed">
                Contact our experts for a free site inspection and customized cleaning quote within 24 hours.
              </p>
            </div>

            <div className="space-y-6 pt-4">
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Call Us</p>
                  <p className="text-foreground font-bold">+91 98765 43210</p>
                </div>
              </div>

              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Email</p>
                  <p className="text-foreground font-bold">info@solarbright.in</p>
                </div>
              </div>

              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Location</p>
                  <p className="text-foreground font-bold">Jaipur, Rajasthan, India</p>
                </div>
              </div>
            </div>

            <div className="pt-4">
                <Button variant="outline" className="rounded-full h-14 px-8 border-primary/30 text-primary hover:bg-primary/10 group shadow-glow shadow-primary/5" asChild>
                    <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer">
                        <MessageSquare className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                        Quick WhatsApp Quote
                    </a>
                </Button>
            </div>
          </motion.div>

          {/* Right: Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-card border border-border p-8 lg:p-10 rounded-3xl shadow-elevated relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[60px] pointer-events-none" />
            
            <form className="space-y-6 relative" onSubmit={(e) => e.preventDefault()}>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Name</label>
                  <Input placeholder="Your Name" className="h-12 bg-secondary/50 border-border focus:border-primary/50 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Phone</label>
                  <Input placeholder="Your Phone Number" className="h-12 bg-secondary/50 border-border focus:border-primary/50 rounded-xl" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Setup Type</label>
                <div className="grid grid-cols-3 gap-3">
                    {['Residential', 'Commercial', 'Industrial'].map(type => (
                        <button key={type} type="button" className="py-2.5 px-2 text-[10px] uppercase font-bold tracking-widest border border-border rounded-lg hover:border-primary/30 hover:bg-primary/5 transition-all text-muted-foreground hover:text-primary">
                            {type}
                        </button>
                    ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Message</label>
                <Textarea placeholder="Tell us about your panel setup and location..." className="min-h-[120px] bg-secondary/50 border-border focus:border-primary/50 rounded-xl resize-none" />
              </div>

              <Button className="w-full h-14 rounded-xl bg-primary text-primary-foreground text-base shadow-glow hover:shadow-glow-lg transition-all duration-500 uppercase tracking-widest font-bold">
                Send Request <Send className="w-4 h-4 ml-2" />
              </Button>

              <p className="text-center text-[10px] text-muted-foreground uppercase tracking-widest opacity-60">
                We respect your privacy. No spam, ever.
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
