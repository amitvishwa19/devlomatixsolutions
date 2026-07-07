"use client"
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Copy, Check } from "lucide-react";

const STORAGE_KEY = "crystalaura_newsletter_seen";
const CODE = "AURA10";

const NewsletterPopup = () => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(STORAGE_KEY)) return;
    const t = setTimeout(() => setOpen(true), 12000);
    return () => clearTimeout(t);
  }, []);

  const close = () => {
    setOpen(false);
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, "1");
  };

  const subscribe = (e) => {
    e.preventDefault();
    if (!email.includes("@")) return;
    setSubscribed(true);
    setMessage("Welcome to the Aura family ✦");
    setTimeout(() => setMessage(null), 3000);
  };

  const copy = () => {
    navigator.clipboard?.writeText(CODE);
    setCopied(true);
    setMessage("Code copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={close}
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", damping: 22 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md glass-card rounded-2xl overflow-hidden border-gold/30"
          >
            <button onClick={close} aria-label="Close" className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-background/60 hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>

            {/* Decorative gradient header */}
            <div className="relative h-32 gold-gradient flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 30% 20%, white 1px, transparent 1px), radial-gradient(circle at 70% 60%, white 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
              <Sparkles className="w-10 h-10 text-primary-foreground relative" />
            </div>

            <div className="p-7 text-center">
              {!subscribed ? (
                <>
                  <p className="text-gold text-xs tracking-widest mb-2">✦ JOIN THE AURA CIRCLE ✦</p>
                  <h3 className="font-serif text-2xl md:text-3xl mb-2">Unlock <span className="text-gold italic">10% Off</span></h3>
                  <p className="text-sm text-muted-foreground mb-5">
                    Subscribe for crystal wisdom, new arrivals, and your welcome discount.
                  </p>
                  <form onSubmit={subscribe} className="space-y-3">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full bg-secondary/60 border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold/50"
                    />
                    <button type="submit" className="w-full gold-gradient text-primary-foreground py-3 rounded-lg font-medium hover:opacity-90 transition-opacity">
                      Reveal My Code
                    </button>
                  </form>
                  <button onClick={close} className="text-xs text-muted-foreground hover:text-foreground mt-4">No thanks, I'll pay full price</button>
                </>
              ) : (
                <>
                  <p className="text-gold text-xs tracking-widest mb-2">✦ WELCOME, SEEKER ✦</p>
                  <h3 className="font-serif text-2xl md:text-3xl mb-3">Your Code is Ready</h3>
                  <p className="text-sm text-muted-foreground mb-5">Use it at checkout for <span className="text-gold">10% off</span> your first order.</p>
                  <button onClick={copy} className="w-full border-2 border-dashed border-gold/50 bg-gold/10 rounded-lg py-4 flex items-center justify-center gap-3 hover:bg-gold/20 transition-colors">
                    <span className="font-serif text-2xl tracking-[0.3em] text-gold">{CODE}</span>
                    {copied ? <Check className="w-5 h-5 text-gold" /> : <Copy className="w-5 h-5 text-gold" />}
                  </button>
                  <button onClick={close} className="mt-5 text-sm gold-gradient text-primary-foreground px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity">
                    Start Shopping →
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NewsletterPopup;