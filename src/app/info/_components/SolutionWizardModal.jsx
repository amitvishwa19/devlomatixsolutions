'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, ArrowRight, Sparkles, RefreshCw, Layers, ShieldCheck, Laptop, Smartphone, ShoppingCart, Boxes } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function SolutionWizardModal({ isOpen, onClose, onOpenContact }) {
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState('credibility'); // 'credibility', 'content', 'ecommerce', 'operations'
  const [frequency, setFrequency] = useState('yearly'); // 'yearly', 'weekly', 'daily', 'realtime'
  const [mobileNeed, setMobileNeed] = useState('web-only'); // 'web-only', 'repeat-buyer', 'field-staff'

  if (!isOpen) return null;

  // Recommendation engine logic
  const getRecommendation = () => {
    let pkg = "Starter Growth Package";
    let arch = "Static High-Speed Showcase Website";
    let timeline = "7–10 Days";
    let deliverables = [
      "Sub-second loading landing page / website",
      "Direct Click-to-WhatsApp lead capture",
      "Google local search SEO setup",
      "Mobile responsive for all screen sizes"
    ];
    let script = "Based on your needs, a clean, high-speed Showcase Website is the most cost-effective choice. It gives you 100% online credibility without paying for unnecessary database complexity.";

    if (goal === 'ecommerce' || frequency === 'daily') {
      pkg = "CrystalAura E-Commerce Engine";
      arch = "Full E-Commerce Store + Payment Gateway (UPI/Cards)";
      timeline = "14–21 Days";
      deliverables = [
        "Product catalog with categories & search",
        "Shopping cart with abandoned cart alerts",
        "Razorpay / Stripe automated checkout",
        "Shiprocket courier integration & tracking"
      ];
      script = "You need an E-Commerce engine that turns website visitors into paying buyers 24/7. With CrystalAura, you own the entire store without paying monthly Shopify commission cuts.";
    } else if (goal === 'operations' || frequency === 'realtime') {
      pkg = "Business Scale / Enterprise Custom Portal";
      arch = "Custom Web Application + DevX CRM + Multi-Role Logins";
      timeline = "3–5 Weeks";
      deliverables = [
        "Role-based password logins (Staff, Manager, Client)",
        "Automated calculations & 1-click PDF quotations",
        "Centralized lead pipeline replacing Excel",
        "Instant WhatsApp automated notifications"
      ];
      script = "Your biggest bottleneck is operational chaos and messy Excel sheets. A Custom Web Application with DevX CRM will automate staff paperwork and save your team 15+ hours every week.";
    } else if (goal === 'content' || frequency === 'weekly') {
      pkg = "Dynamic Business Portal";
      arch = "Dynamic Next.js Website + Easy Admin CMS";
      timeline = "10–14 Days";
      deliverables = [
        "Self-service Admin CMS for 2-minute blog posting",
        "Instant search & category filter engines",
        "Automated Google sitemap SEO indexing",
        "Customer inquiry forms connected to WhatsApp"
      ];
      script = "You need a Dynamic Website with an Admin CMS. You will be able to publish new articles, projects, and listings in 2 minutes without paying a developer every time.";
    }

    // Add mobile app if needed
    if (mobileNeed === 'repeat-buyer' || mobileNeed === 'field-staff') {
      pkg += " + Cross-Platform Mobile App";
      timeline += " (+ 10 Days)";
      deliverables.push("React Native & Expo mobile app for iOS & Android (1 unified codebase)");
      deliverables.push("Free push notifications with 90%+ open rates & camera/GPS access");
    }

    return { pkg, arch, timeline, deliverables, script };
  };

  const rec = getRecommendation();

  const handleReset = () => {
    setStep(1);
    setGoal('credibility');
    setFrequency('yearly');
    setMobileNeed('web-only');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#020617]/95 backdrop-blur-2xl p-4 sm:p-8 overflow-y-auto flex items-center justify-center animate-in fade-in duration-200 text-left">
      <div className="max-w-3xl w-full bg-slate-900 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                Client Solution Matchmaker Wizard
              </h3>
              <p className="text-xs text-slate-400">
                Answer 3 quick questions to discover the ideal package, timeline & pitch script
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-white"
          >
            <X size={16} />
          </Button>
        </div>

        {/* Wizard Steps */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                Question 1 of 3: Primary Goal
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Step 1/3</span>
            </div>
            <h4 className="text-base sm:text-lg font-bold text-white">
              What is the client's single biggest priority?
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[
                { id: 'credibility', icon: Laptop, title: 'Brand Credibility & Inquiries', desc: 'Online visiting card, doctor/lawyer portfolio, local services' },
                { id: 'content', icon: Layers, title: 'Publishing Blogs & Listings', desc: 'Frequent articles, real estate listings, corporate news updates' },
                { id: 'ecommerce', icon: ShoppingCart, title: 'Selling Products Online', desc: 'Retail store, shopping cart, payments & courier shipping' },
                { id: 'operations', icon: Boxes, title: 'Automating Staff & Excel', desc: 'Replacing spreadsheets, staff logins, invoices & CRM pipeline' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setGoal(item.id);
                    setStep(2);
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                    goal === item.id
                      ? 'bg-cyan-500/20 border-cyan-500 text-white shadow-lg'
                      : 'bg-white/5 border-white/10 hover:border-cyan-500/30 text-slate-300'
                  }`}
                >
                  <item.icon className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-sm font-bold text-white mb-0.5">{item.title}</h5>
                    <p className="text-xs text-slate-400 leading-tight">{item.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                Question 2 of 3: Content Frequency
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Step 2/3</span>
            </div>
            <h4 className="text-base sm:text-lg font-bold text-white">
              How often will their prices, text, or products change?
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[
                { id: 'yearly', title: 'Rarely (1–2 times a year)', desc: 'Address, phone, fixed services stay constant → Static Website' },
                { id: 'weekly', title: 'Periodically (Weekly/Monthly)', desc: 'Owner wants to post new blogs or case studies → Dynamic CMS' },
                { id: 'daily', title: 'Daily (Products & Discounts)', desc: 'Managing inventory, prices, orders → E-Commerce Platform' },
                { id: 'realtime', title: 'Real-Time (Hourly Operations)', desc: 'Staff updating leads, appointments, invoices → Web Application' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setFrequency(item.id);
                    setStep(3);
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    frequency === item.id
                      ? 'bg-cyan-500/20 border-cyan-500 text-white shadow-lg'
                      : 'bg-white/5 border-white/10 hover:border-cyan-500/30 text-slate-300'
                  }`}
                >
                  <h5 className="text-sm font-bold text-white mb-1">{item.title}</h5>
                  <p className="text-xs text-slate-400 leading-tight">{item.desc}</p>
                </button>
              ))}
            </div>
            <div className="flex justify-between pt-2">
              <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="text-xs text-slate-400">
                ← Back to Step 1
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                Question 3 of 3: Mobile & Offline
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Step 3/3</span>
            </div>
            <h4 className="text-base sm:text-lg font-bold text-white">
              Do their users or staff need a dedicated smartphone App?
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {[
                { id: 'web-only', title: 'Website in Browser is Enough', desc: 'Customers visit occasionally; no need for an app download friction.' },
                { id: 'repeat-buyer', title: 'Yes, Repeat Customers', desc: 'Customers order weekly, need 1-tap thumb access & lock-screen push alerts.' },
                { id: 'field-staff', title: 'Yes, Field Staff Operations', desc: 'Staff need GPS tracking, camera barcode scanning & offline mode.' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setMobileNeed(item.id);
                    setStep(4);
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    mobileNeed === item.id
                      ? 'bg-cyan-500/20 border-cyan-500 text-white shadow-lg'
                      : 'bg-white/5 border-white/10 hover:border-cyan-500/30 text-slate-300'
                  }`}
                >
                  <Smartphone className="h-5 w-5 text-cyan-400 mb-2" />
                  <h5 className="text-sm font-bold text-white mb-1">{item.title}</h5>
                  <p className="text-xs text-slate-400 leading-tight">{item.desc}</p>
                </button>
              ))}
            </div>
            <div className="flex justify-between pt-2">
              <Button variant="ghost" size="sm" onClick={() => setStep(2)} className="text-xs text-slate-400">
                ← Back to Step 2
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: The Result Card */}
        {step === 4 && (
          <div className="space-y-5 animate-in zoom-in-95 duration-200">
            <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-blue-950/60 border border-cyan-500/40">
              <span className="text-[10px] font-mono font-black text-cyan-400 uppercase tracking-widest block mb-1">
                Matched Solution:
              </span>
              <h4 className="text-xl sm:text-2xl font-black text-white mb-1">
                {rec.pkg}
              </h4>
              <p className="text-xs text-cyan-300 font-mono">
                Architecture: {rec.arch} • Estimated Delivery: {rec.timeline}
              </p>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-300 block mb-2 uppercase tracking-wider">
                What We Build For Them:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {rec.deliverables.map((d, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2 text-xs text-slate-200">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{d}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 text-xs text-slate-200">
              <strong className="text-cyan-400 block mb-1">Exact Script to Tell the Client:</strong>
              <p className="italic">"{rec.script}"</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <Button variant="ghost" size="sm" onClick={handleReset} className="text-xs text-slate-400 flex items-center gap-1.5">
                <RefreshCw size={14} /> Start Over
              </Button>
              <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                <Button
                  type="button"
                  onClick={() => {
                    const text = `*Devlomatix Solutions — Tailored Solution Recommendation*\n\n` +
                      `📦 *Recommended Package:* ${rec.pkg}\n` +
                      `⚙️ *Architecture:* ${rec.arch}\n` +
                      `⏱️ *Estimated Delivery:* ${rec.timeline}\n\n` +
                      `*Key Inclusions:*\n` +
                      rec.deliverables.map(d => `• ${d}`).join('\n') + `\n\n` +
                      `💡 *Strategy:* "${rec.script}"\n\n` +
                      `🔗 Learn more at: https://devlomatix.com/info`;
                    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
                    window.open(url, '_blank');
                  }}
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-5 rounded-xl shadow-md flex items-center justify-center gap-2"
                >
                  <span>Share Proposal on WhatsApp</span>
                </Button>
                <Button
                  onClick={() => {
                    onClose();
                    if (onOpenContact) onOpenContact();
                  }}
                  className="w-full sm:w-auto bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs px-6 py-5 rounded-xl shadow-lg flex items-center justify-center gap-2"
                >
                  <span>Book Consultation</span>
                  <ArrowRight size={14} />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
