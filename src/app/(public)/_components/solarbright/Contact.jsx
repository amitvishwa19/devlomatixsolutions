'use client';

import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    setupType: "Residential",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      toast.error("Please provide your name and contact phone number.");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Inspection request received! A solar specialist will contact you within 24 hours.");
      setFormData({ name: "", phone: "", setupType: "Residential", message: "" });
    }, 800);
  };

  return (
    <section id="sb-contact" className="py-20 lg:py-28 relative overflow-hidden bg-background">
      <div className="section-divider mx-auto max-w-5xl" />
      <div className="container mx-auto px-4 md:px-8 pt-16">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left info */}
          <div className="space-y-7">
            <div>
              <span className="inline-flex items-center gap-2 text-amber-500 font-semibold text-xs uppercase tracking-[0.2em] mb-3">
                <span className="w-6 h-px bg-amber-500" />
                Get in Touch
                <span className="w-6 h-px bg-amber-500" />
              </span>
              <h2 className="font-heading text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15]">
                Ready to Boost Your{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-200 font-extrabold">
                  Solar Output?
                </span>
              </h2>
              <p className="text-muted-foreground mt-4 text-base leading-relaxed">
                Schedule a complimentary site survey and customized cleaning assessment from certified solar engineers.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4 p-4 rounded-xl border border-border/70 bg-card">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Call Helpline</p>
                  <p className="text-sm font-bold text-foreground">+91 98765 43210</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl border border-border/70 bg-card">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Direct Email</p>
                  <p className="text-sm font-bold text-foreground">solarbright@devlomatix.com</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl border border-border/70 bg-card">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Headquarters</p>
                  <p className="text-sm font-bold text-foreground">Jaipur, Rajasthan, India</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Button
                variant="outline"
                className="w-full sm:w-auto rounded-xl h-12 px-6 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 cursor-pointer"
                asChild
              >
                <a
                  href="https://wa.me/919876543210?text=Hi%20SolarBright%2C%20I%20would%20like%20to%20schedule%20a%20solar%20panel%20cleaning%20inspection."
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Quick WhatsApp Support
                </a>
              </Button>
            </div>
          </div>

          {/* Right Form */}
          <div className="bg-card border border-border/70 p-7 sm:p-8 rounded-3xl shadow-xl">
            <h3 className="font-heading text-xl font-bold text-foreground mb-1">Book Site Inspection</h3>
            <p className="text-xs text-muted-foreground mb-6">Receive a custom price quotation tailored to your roof.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Full Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ramesh Patel"
                  className="h-11 bg-secondary/40 border-border"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Phone Number</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="h-11 bg-secondary/40 border-border"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Installation Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {["Residential", "Commercial", "Industrial"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, setupType: type })}
                      className={`py-2 px-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                        formData.setupType === type
                          ? "border-amber-500 bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold"
                          : "border-border text-muted-foreground hover:bg-muted/60"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Notes / Panel Capacity</label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="e.g. 5kW rooftop, panels installed 2 years ago in Jaipur..."
                  rows={3}
                  className="bg-secondary/40 border-border resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-amber-500/20 cursor-pointer"
              >
                {isSubmitting ? "Submitting..." : "Send Inspection Request"}
                <Send className="w-3.5 h-3.5 ml-2" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contact;
