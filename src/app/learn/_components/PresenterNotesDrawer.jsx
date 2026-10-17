'use client';

import React from 'react';
import { X, BookOpen, Brain, CheckCircle, AlertTriangle, ArrowRight, Lightbulb } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function PresenterNotesDrawer({ isOpen, onClose, currentSlide, totalSlides, slide }) {
  if (!isOpen || !slide) return null;

  // Curated consultative talking points per slide category/type
  const getNotes = () => {
    switch (slide.type) {
      case 'cover':
        return {
          psychology: "Client wonders: 'Is this going to be an overwhelming technical lecture or something genuinely helpful for my business?'",
          sayThis: [
            "Set the expectation immediately: 'Today we are skipping developer jargon and focusing 100% on how technology brings you more customers and saves money.'",
            "Give them control: 'Interrupt me anytime with questions about your specific business.'"
          ],
          avoid: "Don't start listing acronyms, software libraries, or coding languages.",
          transition: "'Let's start with how information actually travels across the world to your customers' phones...'"
        };

      case 'mod1-internet':
      case 'mod1-hardware':
      case 'mod1-databases':
      case 'mod1-apis':
      case 'mod1-cloud-infra':
      case 'mod1-security':
        return {
          psychology: "Client worries: 'I'm not a tech person, so I won't understand this, and agencies usually take advantage of my ignorance.'",
          sayThis: [
            "Always anchor every concept to a physical real-world object: Waiters (APIs), Iron Safes (Databases), Bank Envelopes (SSL).",
            "Point out why their current setup (Excel sheets or office laptops) creates business risk.",
            "Emphasize that Devlomatix handles 100% of the maintenance so they never have to touch server code."
          ],
          avoid: "Never say 'it's too technical for you'. Say 'the architecture is simple when you see it this way.'",
          transition: "'Now that you see how the underlying infrastructure works, let's look at what your customers actually see: your website...'"
        };

      case 'what-is-website':
      case 'four-website-types':
      case 'four-types-table':
      case 'static-deep-dive':
      case 'dynamic-deep-dive':
      case 'ecomm-deep-dive':
      case 'custom-portal-deep-dive':
      case 'landing-vs-website':
      case 'mod2-fullstack':
      case 'web-performance-seo':
        return {
          psychology: "Client wonders: 'Do I really need an expensive custom site or can my cousin just build a free WordPress template?'",
          sayThis: [
            "Use the 15-second elevator pitch: 'Your physical shop closes at 6 PM; your website is your 24/7 global showroom.'",
            "Show the 4 website categories matrix so they clearly see where their business fits.",
            "Highlight speed: 'Every 1-second delay loses 20% in customer sales before they even see your prices.'"
          ],
          avoid: "Don't push a heavy Custom Web App if a clean Static or Dynamic site completely solves their problem.",
          transition: "'Now, a website captures people searching on Google. But what about retaining customers so they buy every single week? That's where mobile apps come in...'"
        };

      case 'what-is-app':
      case 'when-need-app':
      case 'types-of-apps':
      case 'mobile-advantage':
      case 'app-publishing':
        return {
          psychology: "Client thinks: 'Everyone says I need a mobile app, but is it going to blow my entire annual budget?'",
          sayThis: [
            "Use the Golden Rule: 'Website is for customer discovery; Mobile App is for customer retention and loyalty.'",
            "Mention the 3x/month frequency threshold: If customers use it 3+ times a month, an app is a revenue multiplier.",
            "Explain Devlomatix's Expo/React Native superpower: 'One codebase launches on both iPhone and Android, saving you 50% on cost and time.'"
          ],
          avoid: "Don't pitch an app to a client who only deals with customers once a year (like a divorce lawyer). Integrity builds trust.",
          transition: "'Now let's look at how modern AI and workflow automation answer your leads before your competitors can even open their inbox...'"
        };

      case 'what-is-ai':
      case 'ai-chatbots-vs-rules':
      case 'what-is-automation':
      case 'ai-agents':
      case 'product-suite':
        return {
          psychology: "Client is skeptical: 'Is AI just a passing Silicon Valley buzzword or will it actually cut my payroll costs?'",
          sayThis: [
            "Frame AI as a tireless 24/7 digital assistant that replies to WhatsApp messages at 11:30 PM in 3 seconds.",
            "Explain the difference between old dumb keyword bots vs modern conversational AI that understands typos and context.",
            "Highlight the 3-second response loop: capturing hot leads while competitors take 4 hours to reply."
          ],
          avoid: "Don't claim AI will magically replace their entire staff. Emphasize that it frees human staff from boring copy-pasting.",
          transition: "'Let's look at the actual business math and return on investment so you can see how this pays for itself...'"
        };

      case 'roi-math':
      case 'mod5-discovery':
      case 'mod5-industry':
      case 'mod5-packages':
      case 'mod5-proposals':
        return {
          psychology: "Client thinks: 'This sounds great, but what is the price tag and how fast do I make my money back?'",
          sayThis: [
            "Walk through the cost of lost inquiries: 'You are already paying for software through lost deals and wasted staff hours.'",
            "Act like a doctor: ask diagnostic questions first, then prescribe the exact package.",
            "Offer a 14-day clickable prototype guarantee to eliminate their risk."
          ],
          avoid: "Never quote a price before diagnosing their specific pain points.",
          transition: "'Let's review real-world proof of how other clients solved this exact challenge...'"
        };

      default:
        return {
          psychology: "Client is evaluating your credibility, team competence, and whether you will be around 6 months from now.",
          sayThis: [
            "Highlight registered company accountability, full code ownership, and dedicated engineer support.",
            "Walk through real client case studies with concrete numbers (e.g., 60% wait time reduction, 42% sales increase).",
            "Ask for the next small step: 'Let's schedule a 20-minute live demonstration tailored to your exact business workflow.'"
          ],
          avoid: "Don't end without a clear next action step or calendar booking.",
          transition: "'Let's open the floor for your questions or review the interactive knowledge check!'"
        };
    }
  };

  const notes = getNotes();

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-slate-950/95 border-l border-cyan-500/30 backdrop-blur-2xl p-6 overflow-y-auto flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-200 text-left">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <BookOpen size={18} />
            </span>
            <div>
              <h4 className="text-sm font-black text-white">Presenter Notes</h4>
              <span className="text-[10px] font-mono text-cyan-400">
                Slide {currentSlide + 1} of {totalSlides} • Key {currentSlide + 1}
              </span>
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

        {/* Slide Title */}
        <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/10">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Active Slide:</span>
          <h5 className="text-xs font-bold text-white line-clamp-1">{slide.title}</h5>
        </div>

        {/* 1. Psychological Cue */}
        <div className="mb-4 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-amber-300 mb-1.5">
            <Brain size={15} />
            <span>Client Psychology Cue:</span>
          </div>
          <p className="text-amber-100/90 leading-relaxed italic">
            "{notes.psychology}"
          </p>
        </div>

        {/* 2. Key Talking Points */}
        <div className="mb-4 p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-cyan-300 mb-2">
            <CheckCircle size={15} />
            <span>What to Emphasize (Say This):</span>
          </div>
          <ul className="space-y-2 text-slate-200">
            {notes.sayThis.map((pt, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-cyan-400 font-bold shrink-0 mt-0.5">•</span>
                <span className="leading-snug">{pt}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 3. Rookie Trap to Avoid */}
        <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-rose-300 mb-1">
            <AlertTriangle size={15} />
            <span>Rookie Mistake to Avoid:</span>
          </div>
          <p className="text-rose-100/90 leading-snug">
            {notes.avoid}
          </p>
        </div>

        {/* 4. Smooth Bridge / Transition */}
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-white/10 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-emerald-400 mb-1">
            <Lightbulb size={15} />
            <span>Next Slide Transition Phrase:</span>
          </div>
          <p className="text-slate-200 italic leading-snug">
            {notes.transition}
          </p>
        </div>
      </div>

      {/* Footer Hotkey Reminder */}
      <div className="pt-4 border-t border-white/10 text-[11px] text-slate-500 flex items-center justify-between">
        <span>Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-mono">P</kbd> to toggle</span>
        <span>Antigravity Deck Mode</span>
      </div>
    </div>
  );
}
