'use client';

import React from 'react';
import { X, Printer, Download, CheckCircle2, Globe, Smartphone, Zap, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function PrintCheatSheetModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#020617]/95 backdrop-blur-2xl p-4 sm:p-8 overflow-y-auto flex items-center justify-center animate-in fade-in duration-200 text-left print:p-0 print:bg-white print:static">
      <div className="max-w-4xl w-full bg-slate-900 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar print:max-h-none print:border-none print:shadow-none print:bg-white print:text-black print:p-4">
        {/* Modal Controls (Hidden in Print) */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6 print:hidden">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Printer className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-lg font-black text-white">1-Page Printable Sales Desk Sheet</h3>
              <p className="text-xs text-slate-400">Keep this reference on your desk during live client discovery calls</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrint}
              size="sm"
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-full px-4 flex items-center gap-1.5"
            >
              <Printer size={14} />
              <span>Print / Save as PDF</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-white"
            >
              <X size={16} />
            </Button>
          </div>
        </div>

        {/* Printable Document Container */}
        <div className="space-y-6 print:space-y-4 print:text-black">
          {/* Header */}
          <div className="border-b border-cyan-500/30 pb-4 print:border-black">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white print:text-black">
                  Devlomatix Solutions — Sales Executive Cheat Sheet
                </h1>
                <p className="text-xs text-cyan-400 print:text-gray-700 font-mono">
                  Master Reference: The 4 Website Types, Mobile Apps & 8 Verbal Pitch Answers
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 print:border-black print:text-black">
                CONFIDENTIAL • SALES TEAM ONLY
              </span>
            </div>
          </div>

          {/* Section 1: The 4 Types of Websites */}
          <div>
            <h2 className="text-sm font-black text-cyan-300 uppercase tracking-wider mb-2 print:text-black print:border-b print:pb-1">
              1. The 4 Website Types at a Glance
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 print:grid-cols-2 text-xs">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 print:border-gray-400 print:bg-gray-50">
                <span className="font-bold text-blue-400 block print:text-blue-800">1. Static Website</span>
                <span className="text-[11px] text-slate-400 block mb-1 print:text-gray-600">Printed Flyer / Visiting Card</span>
                <p className="text-[11px] text-slate-300 print:text-gray-800">No database. Fixed code. Blazing speed (&lt;0.5s). Lowest cost. For doctors, CAs, portfolios.</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 print:border-gray-400 print:bg-gray-50">
                <span className="font-bold text-cyan-300 block print:text-cyan-800">2. Dynamic Website</span>
                <span className="text-[11px] text-slate-400 block mb-1 print:text-gray-600">Living Digital Newspaper</span>
                <p className="text-[11px] text-slate-300 print:text-gray-800">Live database + Admin CMS. Publish articles/listings in 2 mins. Search & filter engines.</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 print:border-gray-400 print:bg-gray-50">
                <span className="font-bold text-emerald-400 block print:text-emerald-800">3. E-Commerce Store</span>
                <span className="text-[11px] text-slate-400 block mb-1 print:text-gray-600">24/7 Digital Supermarket</span>
                <p className="text-[11px] text-slate-300 print:text-gray-800">Product catalog, shopping cart, UPI/Card gateway & courier shipping tracking. Zero Shopify cuts.</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 print:border-gray-400 print:bg-gray-50">
                <span className="font-bold text-purple-400 block print:text-purple-800">4. Custom Web App</span>
                <span className="text-[11px] text-slate-400 block mb-1 print:text-gray-600">Operational Software Engine</span>
                <p className="text-[11px] text-slate-300 print:text-gray-800">Role logins (Staff/Client). Replaces 10 Excel sheets. Auto quotations, CRM pipeline & clinic records.</p>
              </div>
            </div>
          </div>

          {/* Section 2: Website vs Mobile App */}
          <div>
            <h2 className="text-sm font-black text-cyan-300 uppercase tracking-wider mb-2 print:text-black print:border-b print:pb-1">
              2. Website vs. Mobile App: The Golden Rule
            </h2>
            <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 print:border-gray-400 print:bg-gray-50 text-xs">
              <strong className="text-emerald-300 print:text-emerald-900 block mb-1">
                Website = Customer Discovery on Google • Mobile App = Customer Loyalty & Retention
              </strong>
              <p className="text-slate-300 print:text-gray-800 text-[11px] leading-relaxed">
                4 Mobile App Superpowers: 1) Permanent 1-tap home screen icon, 2) Free lockscreen push alerts (90%+ open rate), 3) Hardware access (GPS/Camera/FaceID), 4) Offline functionality. <br/>
                <em>Rule: If customers interact 3+ times a month, recommend a Mobile App. Devlomatix builds cross-platform (React Native/Expo) saving 50% on cost.</em>
              </p>
            </div>
          </div>

          {/* Section 3: The 8 Golden Spoken Questions */}
          <div>
            <h2 className="text-sm font-black text-cyan-300 uppercase tracking-wider mb-2 print:text-black print:border-b print:pb-1">
              3. The 8 Spoken Client Answers (Memorize These)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {[
                { q: "1. Why pay for a website?", a: "Your physical office closes at 6 PM; your website is your 24/7 global showroom on Google that you own 100%." },
                { q: "2. How many types of websites?", a: "Strictly 4: Static (brochure), Dynamic (portal/blogs), E-Commerce (store), Custom Web App (software)." },
                { q: "3. Static vs Dynamic?", a: "Static is fixed like a flyer. Dynamic connects to a live database so you can publish blogs yourself in 2 minutes." },
                { q: "4. Website vs Mobile App?", a: "Website is for finding new customers on Google. App is installed on phone for repeat weekly orders & push alerts." },
                { q: "5. When do I need an App?", a: "If customers interact 3+ times a month (re-orders, doctor appointments, staff tracking), an app is 10x superior." },
                { q: "6. Why Devlomatix cross-platform?", a: "One codebase launches on both Apple and Android at 60fps native speed, saving you 50% in development cost." },
                { q: "7. What does AI actually do?", a: "Answers WhatsApp inquiries at 11 PM in 3 seconds, generates price quotes in 5 seconds, and spots hot buyers." },
                { q: "8. Why not cheap freelancer/Wix?", a: "Wix locks you in rigid templates. Freelancers disappear. Devlomatix provides registered accountability & 100% code ownership." }
              ].map((item, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-white/5 border border-white/5 print:border-gray-300 print:bg-white text-[11px]">
                  <strong className="text-cyan-400 print:text-black block mb-0.5">{item.q}</strong>
                  <span className="text-slate-300 print:text-gray-700 italic">"{item.a}"</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: 5-Minute Discovery Questions */}
          <div className="border-t border-white/10 pt-3 print:border-black text-xs">
            <h2 className="text-xs font-black text-cyan-300 uppercase tracking-wider mb-1.5 print:text-black">
              4. The 4 Diagnostic Discovery Questions
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-slate-300 print:text-gray-800">
              <div className="p-2 rounded bg-white/5 print:border print:border-gray-300">
                <strong>Q1: Time/Money:</strong> "Where is your team losing the most time or money in daily operations?"
              </div>
              <div className="p-2 rounded bg-white/5 print:border print:border-gray-300">
                <strong>Q2: Speed to Lead:</strong> "When a new lead reaches out today, how quickly do they get a reply?"
              </div>
              <div className="p-2 rounded bg-white/5 print:border print:border-gray-300">
                <strong>Q3: Mobile Need:</strong> "Are staff or customers asking to manage things from phones on the go?"
              </div>
              <div className="p-2 rounded bg-white/5 print:border print:border-gray-300">
                <strong>Q4: Success Vision:</strong> "If we solve this in 30 days, what does success look like for you?"
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
