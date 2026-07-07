'use client';

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// Inline SVG Icon components to completely bypass Next.js Turbopack lucide-react caching bugs
const SparklesIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.938A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.938l6.135 1.581a.5.5 0 0 1 0 .962L15.5 14.063A2 2 0 0 0 14.063 15.5L12.481 21.64a.5.5 0 0 1-.962 0z"/><path d="M20 3h.01"/><path d="M4 20h.01"/><path d="M18.5 18h.01"/><path d="M5.5 6h.01"/></svg>
);

const RotateCcwIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
);

const ArrowLeftIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
);

const CheckCircle2Icon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
);

const questions = [
  {
    id: 1,
    title: "What's your zodiac sign?",
    subtitle: "Each sign resonates with specific mineral frequencies",
    type: "grid",
    options: [
      { value: "aries", label: "Aries", symbol: "♈" },
      { value: "taurus", label: "Taurus", symbol: "♉" },
      { value: "gemini", label: "Gemini", symbol: "♊" },
      { value: "cancer", label: "Cancer", symbol: "♋" },
      { value: "leo", label: "Leo", symbol: "♌" },
      { value: "virgo", label: "Virgo", symbol: "♍" },
      { value: "libra", label: "Libra", symbol: "♎" },
      { value: "scorpio", label: "Scorpio", symbol: "♏" },
      { value: "sagittarius", label: "Sagittarius", symbol: "♐" },
      { value: "capricorn", label: "Capricorn", symbol: "♑" },
      { value: "aquarius", label: "Aquarius", symbol: "♒" },
      { value: "pisces", label: "Pisces", symbol: "♓" },
    ]
  },
  {
    id: 2,
    title: "What is your main intention?",
    subtitle: "Crystals hold unique metaphysical vibrations to support goals",
    type: "list",
    options: [
      { value: "abundance", label: "💰 Abundance, Success & Luck" },
      { value: "love", label: "💖 Romantic & Unconditional Love" },
      { value: "protection", label: "🛡️ Grounding, Protection & Ward Negativity" },
      { value: "calm", label: "🧘 Stress Relief, Calm & Peaceful Sleep" },
      { value: "spiritual", label: "✨ Spiritual Growth & Intuition" },
    ]
  },
  {
    id: 3,
    title: "Which color resonates with you most?",
    subtitle: "Color vibrations play a vital role in chakra alignment",
    type: "list",
    options: [
      { value: "purple", label: "💜 Royal Purple — Sahasrara (Crown)" },
      { value: "pink", label: "💗 Gentle Rose — Anahata (Heart)" },
      { value: "green", label: "💚 Emerald Green — Heart & Growth" },
      { value: "yellow", label: "💛 Citrine Yellow — Solar Plexus & Power" },
      { value: "blue", label: "💙 Indigo Blue — Throat & Third Eye" },
    ]
  },
  {
    id: 4,
    title: "How is your energy level today?",
    subtitle: "Select the energy state you want to balance",
    type: "list",
    options: [
      { value: "tired", label: "⚡ Tired / Low Physical Vitality" },
      { value: "anxious", label: "🌀 Anxious / Overstimulated Mind" },
      { value: "peaceful", label: "🍃 Balanced / Calm & Grounded" },
      { value: "inspired", label: "🎨 Creative / Ready to Manifest" },
    ]
  },
  {
    id: 5,
    title: "Where will you place your crystal?",
    subtitle: "Environment determines energy amplification",
    type: "list",
    options: [
      { value: "bedroom", label: "🌙 Bedroom / Promoting restful sleep" },
      { value: "office", label: "💼 Workspace / Boosting productivity & focus" },
      { value: "meditation", label: "🧘 Altar / Enhancing sacred meditation" },
      { value: "pocket", label: "👜 Body / Carrying inside pocket or as jewelry" },
    ]
  }
];

const SiteCrystalQuiz = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [completed, setCompleted] = useState(false);

  const handleSelect = (questionId, value) => {
    const updated = { ...answers, [questionId]: value };
    setAnswers(updated);
    
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setCompleted(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleRestart = () => {
    setAnswers({});
    setCurrentStep(0);
    setCompleted(false);
  };

  // Logic to calculate crystal recommendations based on answers
  const getRecommendations = () => {
    const zodiac = answers[1];
    const intention = answers[2];

    if (intention === "abundance") {
      return {
        title: "Citrine & Pyrite",
        desc: "Citrine brings warm solar energy of manifestation, while Pyrite acts as a shield and financial magnet.",
        crystals: ["Citrine Cluster", "Pyrite Money Magnet Bracelet"]
      };
    }
    if (intention === "love" || zodiac === "cancer" || zodiac === "taurus") {
      return {
        title: "Rose Quartz & Moonstone",
        desc: "Rose Quartz opens the heart chakra, attracting love, while Moonstone connects you to your feminine energy and emotional tides.",
        crystals: ["Rose Quartz Heart", "Moonstone Adjustable Ring"]
      };
    }
    if (intention === "protection" || zodiac === "scorpio" || zodiac === "aries") {
      return {
        title: "Black Tourmaline & Tiger's Eye",
        desc: "Tourmaline cleanses negative environments, while Tiger's Eye inspires courage, protection, and mental clarity.",
        crystals: ["Black Tourmaline Raw", "Tiger's Eye Bracelet"]
      };
    }
    if (intention === "calm" || zodiac === "pisces" || zodiac === "libra") {
      return {
        title: "Amethyst & Selenite",
        desc: "Amethyst quietens the mind for deep stress relief, while Selenite cleanses other crystals and brings high-frequency light.",
        crystals: ["Amethyst Geode", "Selenite Tower"]
      };
    }
    
    return {
      title: "Amethyst & Clear Quartz",
      desc: "Amethyst brings quietude, connection, and peace, while Clear Quartz amplifies all intentions and purifies energy.",
      crystals: ["Amethyst Cluster", "Clear Quartz Crystal Point"]
    };
  };

  const progressPercent = ((currentStep) / questions.length) * 100;
  const currentQuestion = questions[currentStep];

  return (
    <section id="quiz" className="py-28 px-6 relative bg-gradient-to-b from-[#0d091a] to-[#06040a] scroll-mt-20">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="w-12 h-12 rounded-full bg-primary/5 border border-primary/20 flex items-center justify-center mx-auto mb-4">
            <SparklesIcon className="w-5 h-5 text-primary animate-pulse" />
          </div>
          <p className="text-primary text-[10px] tracking-[0.35em] font-sans font-black uppercase mb-3">
            ✦ Crystal Match ✦
          </p>
          <h2 className="font-serif text-4xl md:text-5xl text-foreground">
            Align <span className="text-gold-gradient italic font-normal">Your</span> Energy
          </h2>
          <p className="text-muted-foreground/80 mt-4 text-sm max-w-md mx-auto font-light leading-relaxed">
            Answer 5 simple questions to reveal the sacred crystals and minerals dynamically tuned to your spiritual vibration.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {!completed ? (
            <div>
              {/* Progress & Controls */}
              <div className="mb-6 flex items-center justify-between text-[10px] tracking-widest font-sans font-bold uppercase text-muted-foreground/50">
                <span>Step {currentStep + 1} of {questions.length}</span>
                <button 
                  onClick={handleRestart}
                  className="flex items-center gap-1.5 hover:text-foreground transition-colors py-1.5 px-3 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/5"
                >
                  <RotateCcwIcon className="w-3.5 h-3.5" /> Restart
                </button>
              </div>

              {/* Progress Bar */}
              <div className="h-1 bg-white/5 rounded-full overflow-hidden mb-10">
                <div 
                  className="h-full bg-gold-gradient transition-all duration-500 ease-out" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Question Card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="glass-card rounded-3xl p-6 md:p-12 border-white/5 relative bg-[#0e0c15]/10 backdrop-blur-md hover:border-primary/10 transition-colors duration-500"
                  style={{ boxShadow: '0 15px 35px -10px rgba(0,0,0,0.3)' }}
                >
                  <h3 className="font-serif text-2xl md:text-3xl text-center text-foreground mb-2">
                    {currentQuestion.title}
                  </h3>
                  <p className="text-xs text-muted-foreground/60 text-center font-light mb-10">
                    {currentQuestion.subtitle}
                  </p>

                  {/* Options Render */}
                  {currentQuestion.type === "grid" ? (
                    <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                      {currentQuestion.options.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => handleSelect(currentQuestion.id, opt.value)}
                          className="text-center p-5 rounded-2xl border transition-all border-white/5 bg-[#120f1e]/40 hover:border-primary/45 hover:bg-primary/5 hover:shadow-2xl hover:shadow-primary/5 active:scale-95 flex flex-col items-center gap-2 group"
                        >
                          <span className="text-2xl group-hover:scale-110 transition-transform duration-300">{opt.symbol}</span>
                          <span className="text-xs tracking-wider text-muted-foreground group-hover:text-foreground font-sans font-bold uppercase">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3.5 max-w-lg mx-auto">
                      {currentQuestion.options.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => handleSelect(currentQuestion.id, opt.value)}
                          className="text-left py-4 px-6 rounded-2xl border transition-all border-white/5 bg-[#120f1e]/40 hover:border-primary/45 hover:bg-primary/5 text-muted-foreground hover:text-foreground text-xs font-sans tracking-wide font-bold uppercase active:scale-98 flex justify-between items-center group"
                        >
                          <span>{opt.label}</span>
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-primary">✦</span>
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Navigation Back & Skip */}
              <div className="flex items-center justify-between mt-8 text-[10px] tracking-widest font-sans font-bold uppercase">
                <button
                  disabled={currentStep === 0}
                  onClick={handleBack}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5 py-2 px-4.5 rounded-full border border-white/5 hover:border-white/10 hover:bg-white/5 transition-all"
                >
                  <ArrowLeftIcon className="w-3.5 h-3.5" /> Back
                </button>
                <button
                  onClick={() => setCompleted(true)}
                  className="text-muted-foreground hover:text-foreground py-2 px-4.5 rounded-full border border-transparent hover:border-white/10 hover:bg-white/5 transition-all"
                >
                  Skip quiz →
                </button>
              </div>
            </div>
          ) : (
            /* Results Screen */
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card rounded-3xl p-8 md:p-14 border-white/10 bg-[#0e0b17]/50 backdrop-blur-md shadow-2xl text-center hover:border-primary/20 transition-all duration-750"
              style={{ boxShadow: '0 25px 60px -20px rgba(220,160,40,0.15)' }}
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2Icon className="w-8 h-8 text-primary animate-bounce" />
              </div>
              <p className="text-primary text-[10px] tracking-[0.35em] font-sans font-black uppercase mb-3">
                Alignment Complete
              </p>
              <h3 className="font-serif text-3xl md:text-4xl text-foreground mb-4">
                Your Aligned Treasures
              </h3>
              
              <div className="my-10 p-8 rounded-2xl bg-[#120f1e]/40 border border-white/5 max-w-xl mx-auto text-left hover:border-primary/10 transition-colors">
                <h4 className="font-serif text-2xl text-primary font-semibold mb-3">
                  {getRecommendations().title}
                </h4>
                <p className="text-muted-foreground/80 text-sm font-light leading-relaxed mb-6">
                  {getRecommendations().desc}
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {getRecommendations().crystals.map(c => (
                    <span 
                      key={c}
                      className="px-4 py-2 rounded-full border border-primary/25 bg-primary/5 text-[9px] font-sans font-black tracking-widest text-primary uppercase"
                    >
                      ✦ {c}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={handleRestart}
                  className="border border-white/10 text-foreground text-[10px] font-black tracking-widest uppercase font-sans px-8 py-4.5 rounded-full hover:bg-white/5 hover:border-white/20 transition-all active:scale-95"
                >
                  Retake Quiz
                </button>
                <Link href="/shop">
                  <button className="bg-gold-gradient text-white text-[10px] font-black tracking-widest uppercase font-sans px-8 py-4.5 rounded-full hover:opacity-90 shadow-lg shadow-primary/20 transition-all border border-primary/15 active:scale-95">
                    Shop Your Picks
                  </button>
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SiteCrystalQuiz;
