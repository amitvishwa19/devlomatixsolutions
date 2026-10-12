'use client';

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, User, MessageCircle } from "lucide-react";
import { useLanguage } from "./use-language";

const botResponses = {
  pricing: {
    en: "Our plans start at ₹7,194 for 6 months (Lite) with 0% conversation markup.\n• **Lite**: 3 users, shared inbox, unlimited campaigns\n• **Professional**: 5 users, chatbot builder, CRM integrations\n• **Premium**: 10 users, custom bots, dedicated account manager.",
    hi: "हमारी योजनाएं ₹7,194 से शुरू होती हैं (लाइट, 6 महीने) बिना किसी अतिरिक्त कन्वर्सेशन चार्ज के।\n• **Lite**: 3 यूज़र्स, शेयर्ड इनबॉक्स, अनलिमिटेड कैम्पेन्स\n• **Professional**: 5 यूज़र्स, चैटबॉट बिल्डर, सीआरएम इंटीग्रेशन\n• **Premium**: 10 यूज़र्स, कस्टम बॉट्स, डेडिकेटेड मैनेजर।",
    gu: "અમારા પ્લાન ₹7,194 થી શરૂ થાય છે (Lite, 6 મહિના) કોઈ વધારાના ચાર્જ વિના.\n• **Lite**: 3 યુઝર્સ, શૅર્ડ ઇનબૉક્સ\n• **Professional**: 5 યુઝર્સ, ચેટબોટ બિલ્ડર\n• **Premium**: 10 યુઝર્સ, ડેડિકેટેડ એકાઉન્ટ મેનેજર.",
  },
  features: {
    en: "KonnectX features include:\n• **Bulk WhatsApp Broadcasts** with media templates\n• **Drag-and-drop Visual Chatbot**\n• **Shared Team Inbox** with auto-assignment\n• **Green Tick Verification** assistance\n• **REST API & Webhooks** for 50+ integrations",
    hi: "KonnectX की मुख्य सुविधाएं:\n• **बल्क WhatsApp अभियान** समृद्ध मीडिया के साथ\n• **ड्रैग-एंड-ड्रॉप विजुअल चैटबॉट**\n• **साझा टीम इनबॉक्स** ऑटो-असाइनमेंट के साथ\n• **ग्रीन टिक सत्यापन** सहायता\n• **REST API और वेबहुक्स**",
    gu: "KonnectX ની મુખ્ય સુવિધાઓ:\n• **બલ્ક WhatsApp બ્રોડકાસ્ટ**\n• **વિઝ્યુઅલ ચેટબોટ બિલ્ડર**\n• **શૅર્ડ ટીમ ઇનબૉક્સ**\n• **ગ્રીન ટિક વેરિફિકેશન** સહાય\n• **REST API અને વેબહૂક્સ**",
  },
  api: {
    en: "We use the official **Meta WhatsApp Cloud API**. Benefits:\n• 99.9% uptime and zero account bans\n• Ultra-high sending speed (up to 250 msgs/sec)\n• End-to-end encryption\n• Verified business profile with Green Tick.",
    hi: "हम आधिकारिक **Meta WhatsApp Cloud API** का उपयोग करते हैं। लाभ:\n• 99.9% अपटाइम और शून्य अकाउंट बैन\n• सुपर-फास्ट भेजने की गति (250 संदेश/सेकंड तक)\n• एंड-टू-एंड एन्क्रिप्शन\n• ग्रीन टिक सत्यापित प्रोफाइल।",
    gu: "અમે સત્તાવાર **Meta WhatsApp Cloud API** નો ઉપયોગ કરીએ છીએ:\n• 99.9% અપટાઇમ\n• સુપર-ફાસ્ટ સ્પીડ (250 સંદેશા/સેકંડ સુધી)\n• એન્ડ-ટુ-એન્ડ એન્ક્રિપ્શન\n• વેરિફાઇડ પ્રોફાઇલ.",
  },
  default: {
    en: "I can help you explore:\n• **Pricing** — Plans and cost breakdown\n• **Features** — Broadcasts, bot builder & team inbox\n• **API** — How Meta WhatsApp API operates\n\nType any of these keywords to know more! 😊",
    hi: "मैं आपको इनमें मदद कर सकता हूँ:\n• **Pricing** — योजनाएं और लागत\n• **Features** — प्रसारण, चैटबॉट और टीम इनबॉक्स\n• **API** — WhatsApp Business API कैसे काम करता है\n\nअधिक जानने के लिए इनमें से कोई भी शब्द टाइप करें! 😊",
    gu: "હું તમને આમાં મદદ કરી શકું છું:\n• **Pricing** — પ્લાન અને કિંમત\n• **Features** — KonnectX શું ઓફર કરે છે\n• **API** — WhatsApp Business API કેવી રીતે કામ કરે છે\n\nકોઈપણ વિષય ટાઈપ કરો! 😊",
  },
};

function getBotReply(input, lang) {
  const lower = input.toLowerCase();
  if (lower.includes("price") || lower.includes("pricing") || lower.includes("cost") || lower.includes("plan") || lower.includes("मूल्य") || lower.includes("કિંમત")) {
    return botResponses.pricing[lang] || botResponses.pricing.en;
  }
  if (lower.includes("feature") || lower.includes("bot") || lower.includes("chat") || lower.includes("सुविध") || lower.includes("સુવિધ")) {
    return botResponses.features[lang] || botResponses.features.en;
  }
  if (lower.includes("api") || lower.includes("whatsapp") || lower.includes("integrate") || lower.includes("meta")) {
    return botResponses.api[lang] || botResponses.api.en;
  }
  return botResponses.default[lang] || botResponses.default.en;
}

export function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const { language, t } = useLanguage();
  const [messages, setMessages] = useState(() => [
    { role: "bot", text: "👋 Hi! I'm KonnectX Bot. Ask me about our features, pricing, or how WhatsApp API works!" }
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const send = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setTyping(true);
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "bot", text: getBotReply(userMsg, language) }]);
      setTyping(false);
    }, 700 + Math.random() * 400);
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-2xl cursor-pointer"
        style={{ background: "var(--gradient-sun)", boxShadow: "var(--shadow-glow-lg)" }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Chatbot demo"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <X className="h-6 w-6" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }} className="flex items-center justify-center">
              <MessageCircle className="h-6 w-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {!open && (
        <span 
          className="pointer-events-none fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full animate-ping opacity-60" 
          style={{ background: "hsl(190 90% 50% / 0.4)" }} 
        />
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.22 }}
            className="fixed bottom-24 right-6 z-50 flex w-[360px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl border border-border/80 shadow-2xl bg-card"
            style={{ height: "480px", boxShadow: "var(--shadow-elevated)" }}
          >
            {/* Header */}
            <div 
              className="flex items-center gap-3 border-b border-white/10 px-4 py-3.5 text-white" 
              style={{ background: "var(--gradient-sun)" }}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold leading-tight">{t("chat.title")}</p>
                <p className="text-[11px] text-white/80 leading-tight">{t("chat.subtitle")}</p>
              </div>
              <button 
                onClick={() => setOpen(false)} 
                className="p-1 rounded-lg hover:bg-white/20 text-white/90 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Message Feed */}
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4" style={{ scrollbarWidth: "thin" }}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                  className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "bot" && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <MessageCircle className="h-4 w-4" />
                    </div>
                  )}
                  <div
                    className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-xs ${
                      msg.role === "user"
                        ? "rounded-br-sm text-white"
                        : "rounded-bl-sm bg-muted text-foreground border border-border/40"
                    }`}
                    style={msg.role === "user" ? { background: "var(--gradient-sun)" } : undefined}
                  >
                    {msg.text.split(/\*\*(.*?)\*\*/g).map((part, j) =>
                      j % 2 === 1 ? <strong key={j}>{part}</strong> : <span key={j}>{part}</span>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                      <User className="h-3.5 w-3.5" />
                    </div>
                  )}
                </motion.div>
              ))}

              {typing && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <MessageCircle className="h-4 w-4" />
                  </div>
                  <div className="flex gap-1.5 rounded-2xl bg-muted px-4 py-3 border border-border/40">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60" style={{ animationDelay: "300ms" }} />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Quick Suggestions */}
            <div className="px-3 py-1.5 flex gap-1.5 overflow-x-auto border-t border-border/30 bg-muted/20">
              {["Pricing", "Features", "API Info"].map((chip) => (
                <button
                  key={chip}
                  onClick={() => {
                    setInput(chip);
                    setTimeout(() => {
                      setMessages((prev) => [...prev, { role: "user", text: chip }]);
                      setTyping(true);
                      setTimeout(() => {
                        setMessages((prev) => [...prev, { role: "bot", text: getBotReply(chip, language) }]);
                        setTyping(false);
                      }, 700);
                    }, 50);
                  }}
                  className="shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-secondary/50 hover:bg-primary/20 text-foreground transition-colors cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="border-t border-border/50 p-3 bg-card">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send();
                }}
                className="flex items-center gap-2"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t("chat.placeholder")}
                  className="flex-1 rounded-xl border border-input bg-background px-3.5 py-2 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white disabled:opacity-40 cursor-pointer shadow-md"
                  style={{ background: "var(--gradient-sun)" }}
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
