'use client';

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().trim().email("Invalid email address").max(255),
  subject: z.string().trim().min(1, "Subject is required").max(200, "Subject too long"),
  message: z.string().trim().min(1, "Message is required").max(2000, "Message too long"),
});

const contactInfo = [
  { icon: Mail, label: "Email", value: "hello@crystalaura.com" },
  { icon: Phone, label: "Phone", value: "+91 98765 43210" },
  { icon: MapPin, label: "Address", value: "Mumbai, Maharashtra, India" },
  { icon: Clock, label: "Hours", value: "Mon – Sat, 10am – 7pm IST" },
];

export default function CrystalAuraContactPage() {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = contactSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0]] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    toast({ title: "Message sent!", description: "We'll get back to you within 24 hours." });
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-transparent pt-12 pb-24 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <p className="text-primary text-[10px] tracking-[0.3em] uppercase mb-4 font-sans font-black">
            ✦ Get In Touch ✦
          </p>
          <h1 className="font-serif text-5xl md:text-7xl text-foreground mb-6">
            <span className="text-gold-gradient font-semibold">Contact</span> Us
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
            Have questions about crystals, Vastu placement, or your order? Reach out and our spiritual guides will assist you.
          </p>
          <div className="section-divider w-48 mx-auto mt-8" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2 space-y-4"
          >
            {contactInfo.map((item, i) => (
              <div key={item.label} className="flex items-center gap-6 glass-card border-white/5 bg-white/[0.02] rounded-3xl p-6 hover:border-primary/20 transition-all group">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-muted-foreground/40 text-[10px] uppercase font-black tracking-widest mb-1">{item.label}</p>
                  <p className="text-foreground text-sm font-bold uppercase tracking-widest">{item.value}</p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            onSubmit={handleSubmit}
            className="lg:col-span-3 glass-card border-white/5 bg-white/[0.02] rounded-[2.5rem] p-10 md:p-14 space-y-8"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] text-muted-foreground/60 uppercase font-black tracking-widest px-1">Name</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Seer's Name"
                  className="bg-white/[0.03] border-white/5 py-7 rounded-2xl placeholder:text-muted-foreground/20"
                />
                {errors.name && <p className="text-destructive text-[10px] uppercase tracking-widest font-bold mt-2 px-1">{errors.name}</p>}
              </div>
              <div className="space-y-3">
                <label className="text-[10px] text-muted-foreground/60 uppercase font-black tracking-widest px-1">Email</label>
                <Input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="spirit@guide.com"
                  className="bg-white/[0.03] border-white/5 py-7 rounded-2xl placeholder:text-muted-foreground/20"
                />
                {errors.email && <p className="text-destructive text-[10px] uppercase tracking-widest font-bold mt-2 px-1">{errors.email}</p>}
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] text-muted-foreground/60 uppercase font-black tracking-widest px-1">Subject</label>
              <Input
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="Topic of Inquiry"
                className="bg-white/[0.03] border-white/5 py-7 rounded-2xl placeholder:text-muted-foreground/20"
              />
              {errors.subject && <p className="text-destructive text-[10px] uppercase tracking-widest font-bold mt-2 px-1">{errors.subject}</p>}
            </div>
            <div className="space-y-3">
              <label className="text-[10px] text-muted-foreground/60 uppercase font-black tracking-widest px-1">Message</label>
              <Textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Share your thoughts..."
                rows={6}
                className="bg-white/[0.03] border-white/5 rounded-2xl resize-none placeholder:text-muted-foreground/20 p-6"
              />
              {errors.message && <p className="text-destructive text-[10px] uppercase tracking-widest font-bold mt-2 px-1">{errors.message}</p>}
            </div>
            <Button type="submit" className="w-full sm:w-auto bg-gold-gradient text-white font-sans tracking-[0.25em] font-black uppercase text-[10px] px-12 py-8 rounded-2xl hover:opacity-90 shadow-xl shadow-primary/20 transition-all">
              <Send className="w-5 h-5 mr-3" />
              Send Message
            </Button>
          </motion.form>
        </div>
      </div>
    </div>
  );
}
