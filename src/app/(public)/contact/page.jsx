'use client';

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Inline SVG Icons for Contact Page
const MailIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
);

const PhoneIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
);

const MessageIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
);

const MapPinIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
);

const ClockIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);

const TOPICS = ["General Inquiry", "Order & Shipping", "Crystal Guidance", "Vastu Consultation", "Wholesale"];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", topic: TOPICS[0], message: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Simple Validation
    const tempErrors = {};
    if (!form.name.trim()) tempErrors.name = "Name is required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) tempErrors.email = "Valid email is required";
    if (!form.message.trim() || form.message.length < 10) tempErrors.message = "Message must be at least 10 characters";

    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);
    setSubmitted(true);
    setForm({ name: "", email: "", subject: "", topic: TOPICS[0], message: "" });
  };

  const contactCards = [
    { icon: MailIcon, label: "EMAIL", value: "hello@crystalaura.com", href: "mailto:hello@crystalaura.com" },
    { icon: PhoneIcon, label: "PHONE", value: "+91 98765 43210", href: "tel:+919876543210" },
    { icon: MessageIcon, label: "WHATSAPP", value: "Chat with us instantly", href: "https://wa.me/919876543210" },
    { icon: MapPinIcon, label: "ADDRESS", value: "Bandra West, Mumbai 400050, India" },
    { icon: ClockIcon, label: "HOURS", value: "Mon – Sat · 10AM – 7PM IST" },
  ];

  return (
    <div className="min-h-screen bg-[#06040a] pt-32 pb-24 text-foreground font-sans">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Contact Header */}
        <div className="text-center mb-16">
          <span className="text-[10px] font-sans tracking-[0.35em] text-primary uppercase font-bold block mb-3">
            ✦ Get In Touch ✦
          </span>
          <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight mb-4">
            Contact <span className="shimmer-text italic font-normal">Us</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm leading-relaxed">
            Have questions about Vastu stone placements, product parameters, or custom curations? Our spiritual caregivers are ready to guide you.
          </p>
          <div className="w-16 h-[1px] bg-primary/30 mx-auto mt-6" />
        </div>

        {/* Contact Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* Left Cards Column */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            {contactCards.map((item, i) => {
              const Wrapper = item.href ? "a" : "div";
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <Wrapper
                    {...(item.href ? { href: item.href, target: item.href.startsWith("http") ? "_blank" : undefined, rel: "noopener noreferrer" } : {})}
                    className="glass-card rounded-2xl p-5 flex items-center gap-4 border border-white/5 hover:border-primary/20 transition-all duration-300 block"
                  >
                    <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] tracking-widest text-primary font-bold uppercase mb-1">{item.label}</p>
                      <p className="font-serif text-sm font-bold text-foreground truncate">{item.value}</p>
                    </div>
                  </Wrapper>
                </motion.div>
              );
            })}
          </div>

          {/* Right Form Column */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-3xl p-6 md:p-8 lg:col-span-3 border border-white/5 relative overflow-hidden"
          >
            <h2 className="font-serif text-2xl font-bold text-foreground mb-6">Send Message</h2>

            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="text-center py-12"
                >
                  <span className="text-3xl block mb-4">🔮</span>
                  <h3 className="font-serif text-lg font-bold mb-2">Message Sent</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                    Thank you. Your inquiry has been routed to our caregivers. We will align with you within 24 business hours.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-6 px-6 py-2 rounded-xl border border-primary/20 bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-all active:scale-95"
                  >
                    Send Another
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="text-[10px] tracking-widest text-muted-foreground uppercase font-bold mb-1.5 block">Name *</label>
                      <input
                        type="text"
                        placeholder="Your name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-xs tracking-wider text-foreground placeholder-muted-foreground/40 focus:outline-none transition-all ${
                          errors.name ? "border-red-500/50" : "border-white/10 focus:border-primary/50"
                        }`}
                      />
                      {errors.name && <p className="text-[9px] text-red-400 mt-1 font-bold">{errors.name}</p>}
                    </div>

                    <div>
                      <label className="text-[10px] tracking-widest text-muted-foreground uppercase font-bold mb-1.5 block">Email *</label>
                      <input
                        type="email"
                        placeholder="Your email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-xs tracking-wider text-foreground placeholder-muted-foreground/40 focus:outline-none transition-all ${
                          errors.email ? "border-red-500/50" : "border-white/10 focus:border-primary/50"
                        }`}
                      />
                      {errors.email && <p className="text-[9px] text-red-400 mt-1 font-bold">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="text-[10px] tracking-widest text-muted-foreground uppercase font-bold mb-1.5 block">Subject</label>
                      <input
                        type="text"
                        placeholder="Subject line"
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 focus:border-primary/50 rounded-xl px-4 py-3 text-xs tracking-wider text-foreground placeholder-muted-foreground/40 focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] tracking-widest text-muted-foreground uppercase font-bold mb-1.5 block">Topic</label>
                      <select
                        value={form.topic}
                        onChange={(e) => setForm({ ...form, topic: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 focus:border-primary/50 rounded-xl px-4 py-3 text-xs tracking-wider text-muted-foreground focus:outline-none transition-all cursor-pointer"
                      >
                        {TOPICS.map((t) => (
                          <option key={t} value={t} className="bg-[#0e0b17]">{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] tracking-widest text-muted-foreground uppercase font-bold mb-1.5 block">Message *</label>
                    <textarea
                      rows={5}
                      placeholder="Write your message..."
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-xs tracking-wider text-foreground placeholder-muted-foreground/40 focus:outline-none transition-all ${
                        errors.message ? "border-red-500/50" : "border-white/10 focus:border-primary/50"
                      }`}
                    />
                    {errors.message && <p className="text-[9px] text-red-400 mt-1 font-bold">{errors.message}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl py-4 text-xs font-bold tracking-widest uppercase transition-all duration-300 disabled:opacity-50 active:scale-95 shadow-lg shadow-primary/5 mt-2"
                  >
                    {submitting ? "Aligning..." : "Send Message"}
                  </button>
                </form>
              )}
            </AnimatePresence>
          </motion.div>

        </div>

      </div>
    </div>
  );
}