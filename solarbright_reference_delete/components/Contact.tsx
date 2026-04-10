import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, MessageCircle, ArrowRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const contactInfo = [
  { icon: Phone, title: "Call Us", detail: "+91 98765 43210", href: "tel:+919876543210" },
  { icon: MessageCircle, title: "WhatsApp Us", detail: "+91 98765 43210", href: "https://wa.me/919876543210" },
  { icon: Mail, title: "Email Us", detail: "info@solarshine.in", href: "mailto:info@solarshine.in" },
  { icon: MapPin, title: "Head Office", detail: "Jaipur, Rajasthan, India", sub: "Serving 50+ cities pan-India" },
];

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Thank you! We'll get back to you shortly.");
    setForm({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <section id="contact" className="py-28 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-primary/3 blur-[150px]" />

      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-20"
        >
          <span className="inline-flex items-center gap-2 text-primary font-semibold text-sm uppercase tracking-[0.2em] mb-4">
            <span className="w-8 h-px bg-primary" />
            Contact Us
            <span className="w-8 h-px bg-primary" />
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            Get Your Free Quote Today
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            Fill out the form or WhatsApp us. Our team responds within 2 hours.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-10 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="rounded-2xl border border-border bg-card p-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  placeholder="Your Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground h-12 rounded-xl focus:border-primary/50 focus:ring-primary/20 transition-colors"
                />
                <Input
                  type="email"
                  placeholder="Email Address"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground h-12 rounded-xl focus:border-primary/50 focus:ring-primary/20 transition-colors"
                />
                <Input
                  type="tel"
                  placeholder="WhatsApp / Phone Number"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                  className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground h-12 rounded-xl focus:border-primary/50 focus:ring-primary/20 transition-colors"
                />
                <Textarea
                  placeholder="Tell us about your setup (e.g. 3kW rooftop, Tata panels...)"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={4}
                  className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground rounded-xl resize-none focus:border-primary/50 focus:ring-primary/20 transition-colors"
                />
                <Button type="submit" size="lg" className="w-full rounded-full h-12 text-base font-semibold bg-primary text-primary-foreground shadow-glow hover:shadow-glow-lg hover:brightness-110 transition-all duration-300">
                  Request Free Quote <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-4"
          >
            {contactInfo.map((item) => (
              <div
                key={item.title}
                className="group flex items-start gap-4 p-5 rounded-2xl border border-border bg-card hover:border-primary/30 transition-all duration-500"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-all duration-300">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-sm text-foreground">{item.title}</h4>
                  {item.href ? (
                    <a href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="text-muted-foreground text-sm hover:text-primary transition-colors">
                      {item.detail}
                    </a>
                  ) : (
                    <p className="text-muted-foreground text-sm">{item.detail}</p>
                  )}
                  {item.sub && <p className="text-muted-foreground/60 text-xs mt-0.5">{item.sub}</p>}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
