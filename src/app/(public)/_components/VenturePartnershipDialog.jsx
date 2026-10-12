'use client';

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, Rocket, ArrowRight, ShieldCheck, Sparkles, Building2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

const sectors = [
  "Artificial Intelligence & Agents",
  "Healthcare & Telemedicine",
  "Clean Energy & Sustainability",
  "Recruiting & HR Tech",
  "E-Commerce & Holistic Wellness",
  "FinTech & Embedded Finance",
  "Other Disruptive Frontier",
];

const stages = [
  "Idea / Concept Stage",
  "Prototype / MVP Built",
  "Early Revenue ($1k - $20k MRR)",
  "Scaling Growth ($20k+ MRR)",
];

export function VenturePartnershipDialog({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    founderName: "",
    email: "",
    ventureName: "",
    sector: sectors[0],
    stage: stages[1],
    pitch: "",
    supportNeeded: "Full-Stack Engineering & Scaling Infrastructure",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1000);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-border/40 mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
                <Rocket className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  Devlomatix Venture Launchpad
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Co-build, incubate, and scale your technology with our global engineering foundation.
                </p>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {isSubmitted ? (
            <div className="py-12 text-center space-y-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h4 className="text-2xl font-bold text-foreground">
                Partnership Application Received!
              </h4>
              <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                Thank you, <span className="text-foreground font-semibold">{formData.founderName}</span>. The Devlomatix Venture Investment Committee will review <span className="text-primary font-semibold">{formData.ventureName || "your concept"}</span> and connect within 48 business hours.
              </p>
              <div className="pt-4">
                <Button onClick={handleReset} className="rounded-xl px-8 font-semibold">
                  Return to Ventures Showcase
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">
                    Founder / Lead Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.founderName}
                    onChange={(e) => setFormData({ ...formData, founderName: e.target.value })}
                    placeholder="e.g. Maya Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">
                    Work Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="maya@venture.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">
                    Venture / Project Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.ventureName}
                    onChange={(e) => setFormData({ ...formData, ventureName: e.target.value })}
                    placeholder="e.g. NextGen BioTech"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">
                    Industry Sector *
                  </label>
                  <select
                    value={formData.sector}
                    onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    {sectors.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Current Maturity Stage
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {stages.map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setFormData({ ...formData, stage: st })}
                      className={`px-3 py-2 rounded-xl text-xs font-medium text-left border transition-all ${
                        formData.stage === st
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-background border-border text-muted-foreground hover:border-border/80"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Executive Pitch / Problem & Solution *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.pitch}
                  onChange={(e) => setFormData({ ...formData, pitch: e.target.value })}
                  placeholder="Briefly describe what market pain point you are solving and your unique technological moat..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  100% Confidential &amp; Protected by Mutual Non-Disclosure
                </span>
                <span className="hidden sm:inline font-mono text-[11px]">Devlomatix Launchpad</span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleReset}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl px-6 gap-2 font-bold shadow-md shadow-primary/20"
                >
                  {isSubmitting ? (
                    <span>Submitting Application...</span>
                  ) : (
                    <>
                      <span>Submit Incubation Proposal</span>
                      <Send className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default VenturePartnershipDialog;
