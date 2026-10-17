'use client';

import React, { useState } from 'react';
import { Calculator, TrendingUp, AlertCircle, DollarSign, Zap, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function RoiCalculatorWidget({ onOpenContact }) {
  const [leadsPerMonth, setLeadsPerMonth] = useState(120);
  const [dealValue, setDealValue] = useState(300);
  const [responseTime, setResponseTime] = useState('slow'); // 'fast', 'moderate', 'slow'

  // Calculations based on speed-to-lead benchmarks (Harvard Business Review)
  const lossRate = responseTime === 'fast' ? 0.10 : responseTime === 'moderate' ? 0.30 : 0.55;
  const lostLeads = Math.round(leadsPerMonth * lossRate);
  const monthlyRevenueLeak = lostLeads * dealValue;
  const recapturedMonthly = Math.round(monthlyRevenueLeak * 0.70); // 70% recaptured with 3s automation
  const annualRecaptured = recapturedMonthly * 12;

  return (
    <div className="w-full bg-slate-900/90 border border-cyan-500/30 rounded-3xl p-5 sm:p-7 backdrop-blur-2xl shadow-2xl text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-white/10 gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Calculator className="h-5 w-5" />
            </span>
            <h3 className="text-lg sm:text-xl font-black text-white">
              Live Business ROI & Revenue Leak Calculator
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Adjust the sliders with your client on calls to calculate their exact monthly financial leaks
          </p>
        </div>
        <span className="text-[11px] font-mono font-bold text-cyan-400 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/20 w-fit">
          Speed-to-Lead Model
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-7 items-center">
        {/* Sliders Input Column */}
        <div className="space-y-5">
          {/* Slider 1: Monthly Leads */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between text-xs mb-2 font-medium">
              <span className="text-slate-300">Monthly Inquiries / Website Leads:</span>
              <span className="font-mono font-black text-cyan-400 text-sm">{leadsPerMonth} Leads</span>
            </div>
            <input
              type="range"
              min="20"
              max="1000"
              step="10"
              value={leadsPerMonth}
              onChange={(e) => setLeadsPerMonth(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>20 leads</span>
              <span>500 leads</span>
              <span>1,000 leads</span>
            </div>
          </div>

          {/* Slider 2: Average Deal Value */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between text-xs mb-2 font-medium">
              <span className="text-slate-300">Average Value per Customer / Deal:</span>
              <span className="font-mono font-black text-emerald-400 text-sm">${dealValue}</span>
            </div>
            <input
              type="range"
              min="50"
              max="3000"
              step="25"
              value={dealValue}
              onChange={(e) => setDealValue(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>$50</span>
              <span>$1,500</span>
              <span>$3,000+</span>
            </div>
          </div>

          {/* Picker 3: Current Response Time */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-xs text-slate-300 block mb-2 font-medium">
              How quickly does their team reply to new leads today?
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'fast', label: 'Under 15 Mins', sub: '~10% lost' },
                { id: 'moderate', label: '1–2 Hours', sub: '~30% lost' },
                { id: 'slow', label: '4+ Hours / Next Day', sub: '~55% lost' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setResponseTime(opt.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    responseTime === opt.id
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-200'
                      : 'bg-slate-950/60 border-white/5 hover:border-white/20 text-slate-400'
                  }`}
                >
                  <span className="text-xs font-bold block leading-tight">{opt.label}</span>
                  <span className="text-[10px] opacity-75">{opt.sub}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Output Column */}
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/40 border border-cyan-500/30 flex flex-col justify-between shadow-xl">
          <div className="space-y-4 mb-5">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-rose-400 flex items-center gap-1.5 mb-1">
                <AlertCircle className="h-3.5 w-3.5" /> What They Are Losing Every Month:
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-rose-400 font-mono">
                  ${monthlyRevenueLeak.toLocaleString()}
                </span>
                <span className="text-xs text-slate-400">/ month in lost sales</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Based on <strong className="text-rose-300">{lostLeads} customers/month</strong> who give up waiting and buy from faster competitors.
              </p>
            </div>

            <div className="pt-4 border-t border-white/10">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-1">
                <TrendingUp className="h-3.5 w-3.5" /> Revenue Captured with Devlomatix 3s Bot:
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono">
                  +${annualRecaptured.toLocaleString()}
                </span>
                <span className="text-xs text-slate-400">/ year in extra profit</span>
              </div>
              <p className="text-[11px] text-slate-300 mt-1">
                Recovering <strong className="text-emerald-300">+${recapturedMonthly.toLocaleString()}/mo</strong> by answering every lead within 3 seconds 24/7.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-200 mb-4">
            <strong className="block text-white mb-0.5">The Closing Script:</strong>
            "You are already losing ${monthlyRevenueLeak.toLocaleString()} every month without automation. Devlomatix pays for itself in less than 10 days by capturing those lost leads immediately."
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              onClick={() => {
                const text = `*Devlomatix Solutions — Revenue Leak & ROI Summary*\n\n` +
                  `📊 *Client Inquiries:* ${leadsPerMonth} leads/month\n` +
                  `💵 *Average Deal Value:* $${dealValue}\n` +
                  `⏱️ *Current Response:* ${responseTime === 'fast' ? '< 15 mins' : responseTime === 'moderate' ? '1–2 hours' : '4+ hours'}\n\n` +
                  `⚠️ *Current Monthly Revenue Leak:* ~$${monthlyRevenueLeak.toLocaleString()}/month (${lostLeads} lost customers)\n` +
                  `🚀 *Revenue Captured with Devlomatix 3s WhatsApp Bot:* +$${recapturedMonthly.toLocaleString()}/month (+${annualRecaptured.toLocaleString()}/year)\n\n` +
                  `*Recommended Solution:* Devlomatix 3-Second Lead Capture Automation\n` +
                  `🔗 https://devlomatix.com/info#slide-28`;
                const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
                window.open(url, '_blank');
              }}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-4 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md"
            >
              <span>Share via WhatsApp</span>
            </Button>

            {onOpenContact && (
              <Button
                onClick={onOpenContact}
                className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs py-4 rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-98 flex items-center justify-center gap-2"
              >
                <span>Book Consultation</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
