'use client';
import { motion } from "framer-motion";
import { Navbar } from "../_components/Navbar";
import { Footer } from "../_components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";

const contactInfo = [
  { icon: Mail, title: "Email", value: "konnectx@devlomatix.com", href: "mailto:konnectx@devlomatix.com" },
  { icon: Phone, title: "Phone", value: "+91-9712340115", href: "tel:+919712340115" },
  { icon: MessageCircle, title: "WhatsApp", value: "Chat with us", href: "https://wa.me/919712340115" },
  { icon: MapPin, title: "Office", value: "Vadodara, Gujarat", href: "#" },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative overflow-hidden py-24 sm:py-32 mesh-bg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-2xl text-center"
          >
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              Contact Us
            </p>
            <h1 className="mt-3 text-4xl font-extrabold sm:text-5xl lg:text-6xl">
              Let's <span className="text-gradient-sun">Talk</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Have a question or ready to get started? Reach out and we'll get back to you within 24 hours.
            </p>
          </motion.div>

          <div className="mt-16 grid gap-12 lg:grid-cols-2">
            {/* Contact form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="glass-card rounded-2xl p-8"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <h2 className="text-xl font-bold text-foreground">Send a Message</h2>
              <p className="mt-1 text-sm text-muted-foreground">Fill out the form and we'll be in touch.</p>
              <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-foreground">Name</label>
                    <Input id="name" placeholder="Your name" />
                  </div>
                  <div>
                    <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
                    <Input id="email" type="email" placeholder="you@company.com" />
                  </div>
                </div>
                <div>
                  <label htmlFor="company" className="mb-1.5 block text-sm font-medium text-foreground">Company</label>
                  <Input id="company" placeholder="Company name" />
                </div>
                <div>
                  <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-foreground">Message</label>
                  <Textarea id="message" rows={5} placeholder="Tell us how we can help..." />
                </div>
                <Button className="w-full font-semibold" size="lg" style={{ background: "var(--gradient-sun)" }}>
                  Send Message
                </Button>
              </form>
            </motion.div>

            {/* Contact info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="flex flex-col gap-6"
            >
              {contactInfo.map((c, i) => (
                <motion.a
                  key={c.title}
                  href={c.href}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="flex items-center gap-4 glass-card rounded-xl p-5 transition-all duration-300 hover:border-primary/20"
                  style={{ boxShadow: "var(--shadow-card)" }}
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <c.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{c.title}</p>
                    <p className="text-sm text-muted-foreground">{c.value}</p>
                  </div>
                </motion.a>
              ))}

              <div className="mt-4 glass-card rounded-2xl p-8" style={{ boxShadow: "var(--shadow-card)" }}>
                <h3 className="text-lg font-bold text-foreground">Office Hours</h3>
                <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <p>Monday – Friday: 9:00 AM – 6:00 PM IST</p>
                  <p>Saturday: 10:00 AM – 2:00 PM IST</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
