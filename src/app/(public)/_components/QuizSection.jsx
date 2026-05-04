"use client"
import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowLeft, RotateCcw, Heart, ShoppingCart, Star, Mail, Save, Check } from "lucide-react";
import { products } from "../_data/products";
import { useCart } from "../_contexts/CartContext";
import { useWishlist } from "../_contexts/WishlistContext";

const QUIZ_KEY = "crystalaura_quiz_result";

export const quizQuestions = [
  {
    id: "zodiac",
    title: "What's your zodiac sign?",
    subtitle: "Each sign resonates with specific stones",
    options: [
      { label: "Aries", value: "aries", tag: "carnelian" },
      { label: "Taurus", value: "taurus", tag: "rose quartz" },
      { label: "Gemini", value: "gemini", tag: "tiger eye" },
      { label: "Cancer", value: "cancer", tag: "moonstone" },
      { label: "Leo", value: "leo", tag: "citrine" },
      { label: "Virgo", value: "virgo", tag: "amethyst" },
      { label: "Libra", value: "libra", tag: "lapis lazuli" },
      { label: "Scorpio", value: "scorpio", tag: "labradorite" },
      { label: "Sagittarius", value: "sagittarius", tag: "amethyst" },
      { label: "Capricorn", value: "capricorn", tag: "tourmaline" },
      { label: "Aquarius", value: "aquarius", tag: "amethyst" },
      { label: "Pisces", value: "pisces", tag: "aquamarine" },
    ],
  },
  {
    id: "month",
    title: "Which is your birth month?",
    subtitle: "Your birthstone holds powerful guidance",
    options: [
      { label: "January", value: "jan", tag: "garnet" },
      { label: "February", value: "feb", tag: "amethyst" },
      { label: "March", value: "mar", tag: "aquamarine" },
      { label: "April", value: "apr", tag: "quartz" },
      { label: "May", value: "may", tag: "emerald" },
      { label: "June", value: "jun", tag: "moonstone" },
      { label: "July", value: "jul", tag: "carnelian" },
      { label: "August", value: "aug", tag: "citrine" },
      { label: "September", value: "sep", tag: "lapis lazuli" },
      { label: "October", value: "oct", tag: "tourmaline" },
      { label: "November", value: "nov", tag: "citrine" },
      { label: "December", value: "dec", tag: "tourmaline" },
    ],
  },
  {
    id: "intention",
    title: "What are you seeking right now?",
    subtitle: "Your intention guides the crystal",
    options: [
      { label: "Love & Relationships", value: "love", tag: "rose quartz", icon: "💗" },
      { label: "Wealth & Abundance", value: "wealth", tag: "citrine", icon: "💰" },
      { label: "Protection & Grounding", value: "protection", tag: "tourmaline", icon: "🛡️" },
      { label: "Calm & Healing", value: "calm", tag: "amethyst", icon: "🌿" },
      { label: "Confidence & Power", value: "power", tag: "tiger eye", icon: "🔥" },
      { label: "Intuition & Wisdom", value: "wisdom", tag: "lapis lazuli", icon: "🌙" },
    ],
  },
  {
    id: "chakra",
    title: "Which chakra needs healing?",
    subtitle: "Choose what feels blocked or low",
    options: [
      { label: "Root — Stability", value: "root", tag: "tourmaline" },
      { label: "Sacral — Creativity", value: "sacral", tag: "carnelian" },
      { label: "Solar — Confidence", value: "solar", tag: "citrine" },
      { label: "Heart — Love", value: "heart", tag: "rose quartz" },
      { label: "Throat — Truth", value: "throat", tag: "lapis lazuli" },
      { label: "Third Eye — Insight", value: "thirdeye", tag: "amethyst" },
      { label: "Crown — Spirit", value: "crown", tag: "quartz" },
    ],
  },
  {
    id: "form",
    title: "How do you want to carry the energy?",
    subtitle: "Pick the form that calls to you",
    options: [
      { label: "Wear It (Bracelet/Ring)", value: "wear", tag: "bracelet", icon: "💍" },
      { label: "Display at Home", value: "display", tag: "sphere", icon: "🏠" },
      { label: "Meditation & Ritual", value: "meditate", tag: "pyramid", icon: "🧘" },
      { label: "Carry in Pocket", value: "carry", tag: "tumbled", icon: "✨" },
    ],
  },
];

const intentionDescriptions = {
  love: "open your heart and attract loving energy",
  wealth: "magnetize abundance and prosperity",
  protection: "shield your aura and stay grounded",
  calm: "release stress and welcome inner peace",
  power: "reclaim your confidence and strength",
  wisdom: "awaken intuition and inner knowing",
};

const Results = ({ answers, onReset }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const [emailInput, setEmailInput] = useState("");
  const [showEmail, setShowEmail] = useState(false);
  const [saved, setSaved] = useState(false);
  const [emailed, setEmailed] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    try { setSaved(!!localStorage.getItem(QUIZ_KEY)); } catch {}
  }, []);

  const saveResult = () => {
    try {
      const summary = Object.entries(answers).reduce((acc, [k, v]) => ({ ...acc, [k]: v.label }), {});
      localStorage.setItem(QUIZ_KEY, JSON.stringify({ ...summary, savedAt: new Date().toISOString() }));
      setSaved(true);
      setMessage({ type: "success", text: "Saved to your account ✦" });
    } catch {
      setMessage({ type: "error", text: "Could not save. Storage is unavailable." });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const emailResult = (e) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes("@")) {
      setMessage({ type: "error", text: "Invalid email address" });
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    setEmailed(true);
    setShowEmail(false);
    setMessage({ type: "success", text: `Sent ✧ Your crystal match has been emailed to ${emailInput}.` });
    setTimeout(() => setMessage(null), 3000);
  };

  const { recommendedTags, matches } = useMemo(() => {
    const tags = Object.values(answers).map((a) => a.tag.toLowerCase());
    const scored = products.map((p) => {
      const haystack = [p.name, p.description, ...(p.tags || [])].join(" ").toLowerCase();
      let score = 0;
      tags.forEach((t) => { if (haystack.includes(t)) score += t.split(" ").length; });
      return { product: p, score };
    });
    const top = scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score).slice(0, 6).map((s) => s.product);
    const fillers = products.filter((p) => !top.find((t) => t.id === p.id)).sort((a, b) => b.rating - a.rating).slice(0, 6 - top.length);
    return { recommendedTags: tags, matches: [...top, ...fillers] };
  }, [answers]);

  const intention = answers.intention?.value;
  const zodiacName = answers.zodiac?.label;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="text-center mb-10">
        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === "error" ? "bg-red-500/10 border border-red-500/30 text-red-400" : "bg-green-500/10 border border-green-500/30 text-green-400"}`}>
            {message.text}
          </div>
        )}
        <p className="text-gold text-sm mb-2">✦ Your Crystal Match ✦</p>
        <h3 className="font-serif text-3xl md:text-4xl mb-3"><span className="text-gold italic">Aligned</span> with Your Energy</h3>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm">
          {zodiacName && <>As a <span className="text-gold">{zodiacName}</span> seeking </>}
          {intention && <span className="text-gold">{intentionDescriptions[intention]}</span>}, these crystals resonate with your path.
        </p>
        <div className="flex flex-wrap justify-center gap-2 mt-5">
          {recommendedTags.map((t) => (
            <span key={t} className="text-xs uppercase tracking-wider border border-gold/40 bg-gold/10 text-gold px-3 py-1 rounded-full">{t}</span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.map((p, i) => (
          <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="glass-card rounded-2xl overflow-hidden group flex flex-col">
            <div className="relative overflow-hidden">
              <Link href={`/product/${p.id}`}>
                <img src={p.image} alt={p.name} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" />
              </Link>
              <span className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm text-gold text-xs px-3 py-1 rounded-full font-medium border border-gold/40">
                {i === 0 ? "✦ Top Match" : `#${i + 1} Match`}
              </span>
              <button onClick={() => toggleWishlist(p.id)} className="absolute top-3 right-3 w-9 h-9 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background">
                <Heart className={`w-4 h-4 ${isWishlisted(p.id) ? "text-gold fill-current" : "text-muted-foreground"}`} />
              </button>
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <span className="text-[10px] text-gold uppercase tracking-wider">{p.category}</span>
              <Link href={`/product/${p.id}`} className="font-serif font-semibold mt-1 hover:text-gold transition-colors">{p.name}</Link>
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-3 h-3 text-gold fill-current" />
                <span className="text-xs text-muted-foreground">{p.rating} · {p.reviews} reviews</span>
              </div>
              <div className="flex items-baseline gap-2 mt-3">
                <span className="text-gold font-semibold">₹{p.price.toLocaleString()}</span>
                {p.originalPrice && <span className="text-xs text-muted-foreground line-through">₹{p.originalPrice.toLocaleString()}</span>}
              </div>
              <button onClick={() => addToCart(p, 1)} className="mt-4 gold-gradient text-primary-foreground py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                <ShoppingCart className="w-4 h-4" /> Add to Cart
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="text-center mt-10 flex flex-wrap justify-center gap-3">
        <button
          onClick={saveResult}
          disabled={saved}
          className="border border-gold text-gold px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gold/10 transition-colors flex items-center gap-2 disabled:opacity-60"
        >
          {saved ? <><Check className="w-4 h-4" /> Saved to Account</> : <><Save className="w-4 h-4" /> Save Result</>}
        </button>
        <button
          onClick={() => setShowEmail((s) => !s)}
          className="border border-gold text-gold px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gold/10 transition-colors flex items-center gap-2"
        >
          <Mail className="w-4 h-4" /> {emailed ? "Email Sent" : "Email Me"}
        </button>
        <button onClick={onReset} className="border border-border text-muted-foreground px-5 py-2.5 rounded-lg text-sm font-medium hover:text-foreground transition-colors flex items-center gap-2">
          <RotateCcw className="w-4 h-4" /> Retake Quiz
        </button>
        <Link href="/shop" className="gold-gradient text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
          Explore Full Shop →
        </Link>
      </div>

      {showEmail && (
        <motion.form
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={emailResult}
          className="mt-5 max-w-md mx-auto flex gap-2"
        >
          <input
            type="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="you@example.com"
            className="flex-1 bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            required
          />
          <button type="submit" className="gold-gradient text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
            Send
          </button>
        </motion.form>
      )}
    </motion.div>
  );
};

const QuizSection = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [done, setDone] = useState(false);

  const current = quizQuestions[step];
  const progress = ((step + 1) / quizQuestions.length) * 100;

  const select = (option) => {
    const next = { ...answers, [current.id]: option };
    setAnswers(next);
    setTimeout(() => {
      if (step < quizQuestions.length - 1) setStep(step + 1);
      else setDone(true);
    }, 250);
  };

  const reset = () => { setStep(0); setAnswers({}); setDone(false); };

  return (
    <section id="quiz" className="py-20 bg-card scroll-mt-20">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-10">
          <Sparkles className="w-8 h-8 text-gold mx-auto mb-3" />
          <p className="text-gold text-sm mb-2">✦ Crystal Discovery ✦</p>
          <h2 className="font-serif text-3xl md:text-4xl"><span className="text-gold italic">Find Your</span> Crystal</h2>
          <p className="text-muted-foreground mt-3 text-sm max-w-md mx-auto">Answer 5 simple questions and we'll reveal the stones aligned with your energy.</p>
        </div>

        {done ? (
          <Results answers={answers} onReset={reset} />
        ) : (
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>Question {step + 1} of {quizQuestions.length}</span>
                <button onClick={reset} className="flex items-center gap-1 hover:text-foreground transition-colors">
                  <RotateCcw className="w-3 h-3" /> Restart
                </button>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <motion.div className="h-full gold-gradient" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={current.id} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }} className="glass-card rounded-2xl p-6 md:p-10">
                <h3 className="font-serif text-2xl md:text-3xl text-center">{current.title}</h3>
                <p className="text-sm text-muted-foreground text-center mt-2 mb-8">{current.subtitle}</p>
                <div className={`grid gap-3 ${current.options.length > 6 ? "grid-cols-2 md:grid-cols-3" : "grid-cols-1 sm:grid-cols-2"}`}>
                  {current.options.map((opt) => {
                    const isSelected = answers[current.id]?.value === opt.value;
                    return (
                      <button key={opt.value} onClick={() => select(opt)} className={`text-left p-4 rounded-xl border transition-all ${isSelected ? "border-gold bg-gold/10" : "border-border bg-secondary/40 hover:border-gold/50 hover:bg-secondary"}`}>
                        <div className="flex items-center gap-2">
                          {opt.icon && <span className="text-lg">{opt.icon}</span>}
                          <span className="text-sm font-medium">{opt.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between mt-6">
              <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <Link href="/shop" className="text-sm text-muted-foreground hover:text-foreground">Skip quiz →</Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default QuizSection;