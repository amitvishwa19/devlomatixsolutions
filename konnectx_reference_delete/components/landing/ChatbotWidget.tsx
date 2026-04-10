import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, User } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import botAvatar from "@/assets/chatbot-avatar.png";

type Message = { role: "bot" | "user"; text: string };

const botResponses: Record<string, { en: string; hi: string; gu: string }> = {
  pricing: {
    en: "💰 We have 3 plans:\n• **Lite** — ₹7,194/6mo (1,000 conversations)\n• **Professional** — ₹11,994/6mo (5,000 conversations)\n• **Premium** — ₹17,994/6mo (unlimited)\n\nAll plans include a 7-day free trial!",
    hi: "💰 हमारे 3 प्लान हैं:\n• **Lite** — ₹7,194/6 माह (1,000 वार्तालाप)\n• **Professional** — ₹11,994/6 माह (5,000 वार्तालाप)\n• **Premium** — ₹17,994/6 माह (असीमित)\n\nसभी प्लान में 7-दिन का निःशुल्क परीक्षण शामिल है!",
    gu: "💰 અમારી પાસે 3 પ્લાન છે:\n• **Lite** — ₹7,194/6 મહિના (1,000 વાતચીત)\n• **Professional** — ₹11,994/6 મહિના (5,000 વાતચીત)\n• **Premium** — ₹17,994/6 મહિના (અમર્યાદિત)\n\nબધા પ્લાનમાં 7-દિવસનો મફત ટ્રાયલ સામેલ છે!",
  },
  features: {
    en: "🚀 KonnectX offers:\n• No-code chatbot builder\n• Bulk campaign messaging\n• Shared team inbox\n• E-commerce catalog on WhatsApp\n• CRM & API integrations\n• Real-time analytics dashboard",
    hi: "🚀 KonnectX प्रदान करता है:\n• नो-कोड चैटबॉट बिल्डर\n• बल्क कैंपेन मैसेजिंग\n• शेयर्ड टीम इनबॉक्स\n• WhatsApp पर ई-कॉमर्स कैटलॉग\n• CRM और API इंटीग्रेशन\n• रीयल-टाइम एनालिटिक्स डैशबोर्ड",
    gu: "🚀 KonnectX ઓફર કરે છે:\n• નો-કોડ ચેટબોટ બિલ્ડર\n• બલ્ક કેમ્પેઇન મેસેજિંગ\n• શેર્ડ ટીમ ઇનબોક્સ\n• WhatsApp પર ઈ-કોમર્સ કેટલોગ\n• CRM અને API ઇન્ટીગ્રેશન\n• રિયલ-ટાઇમ એનાલિટિક્સ ડેશબોર્ડ",
  },
  api: {
    en: "🔗 WhatsApp Business API lets you:\n• Send messages at scale (no 256 contact limit)\n• Automate with chatbots\n• Use verified business profile (green tick)\n• Integrate with your CRM/ERP\n\nWe handle the setup — you just start messaging!",
    hi: "🔗 WhatsApp Business API आपको देता है:\n• बड़े पैमाने पर संदेश भेजना (256 संपर्क सीमा नहीं)\n• चैटबॉट्स से स्वचालित करना\n• सत्यापित व्यापार प्रोफाइल (ग्रीन टिक)\n• अपने CRM/ERP के साथ इंटीग्रेट करना\n\nहम सेटअप संभालते हैं — आप बस मैसेजिंग शुरू करें!",
    gu: "🔗 WhatsApp Business API તમને આપે છે:\n• મોટા પાયે સંદેશા મોકલવા (256 સંપર્ક મર્યાદા નહીં)\n• ચેટબોટ્સ સાથે ઓટોમેટ કરવું\n• ચકાસાયેલ વ્યવસાય પ્રોફાઇલ (ગ્રીન ટિક)\n• તમારા CRM/ERP સાથે ઇન્ટીગ્રેટ કરવું\n\nઅમે સેટઅપ સંભાળીએ છીએ — તમે ફક્ત મેસેજિંગ શરૂ કરો!",
  },
  default: {
    en: "I can help you with:\n• **Pricing** — Our plans and costs\n• **Features** — What KonnectX offers\n• **API** — How WhatsApp Business API works\n\nJust type one of these topics! 😊",
    hi: "मैं इनमें आपकी मदद कर सकता हूँ:\n• **Pricing** — हमारे प्लान और लागत\n• **Features** — KonnectX क्या प्रदान करता है\n• **API** — WhatsApp Business API कैसे काम करता है\n\nबस इनमें से कोई विषय टाइप करें! 😊",
    gu: "હું તમને આમાં મદદ કરી શકું:\n• **Pricing** — અમારા પ્લાન અને ખર્ચ\n• **Features** — KonnectX શું ઓફર કરે છે\n• **API** — WhatsApp Business API કેવી રીતે કામ કરે છે\n\nફક્ત આમાંથી કોઈ વિષય ટાઈપ કરો! 😊",
  },
};

function getBotReply(input: string, lang: "en" | "hi" | "gu"): string {
  const lower = input.toLowerCase();
  if (lower.includes("price") || lower.includes("pricing") || lower.includes("cost") || lower.includes("plan") || lower.includes("मूल्य") || lower.includes("કિંમત")) {
    return botResponses.pricing[lang];
  }
  if (lower.includes("feature") || lower.includes("सुविध") || lower.includes("સુવિધ")) {
    return botResponses.features[lang];
  }
  if (lower.includes("api") || lower.includes("whatsapp") || lower.includes("integrate")) {
    return botResponses.api[lang];
  }
  return botResponses.default[lang];
}

export function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { language, t } = useLanguage();

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: "bot", text: t("chat.welcome") }]);
    }
  }, [open]);

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
    }, 800 + Math.random() * 600);
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full text-primary-foreground shadow-lg"
        style={{ background: "var(--gradient-sun)", boxShadow: "var(--shadow-glow-lg)" }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Chat"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <X className="h-6 w-6" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <img src={botAvatar} alt="Chat" className="h-8 w-8 rounded-full" width={32} height={32} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Pulse ring */}
      {!open && (
        <span className="pointer-events-none fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full animate-ping" style={{ background: "hsl(190 90% 50% / 0.3)" }} />
      )}

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-24 right-6 z-50 flex w-[360px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-border shadow-2xl"
            style={{ background: "var(--card)", boxShadow: "var(--shadow-elevated)", height: "480px" }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-border px-4 py-3" style={{ background: "var(--gradient-sun)" }}>
              <img src={botAvatar} alt="KonnectX Bot" className="h-9 w-9 rounded-full" width={36} height={36} />
              <div className="flex-1">
                <p className="text-sm font-bold text-primary-foreground">{t("chat.title")}</p>
                <p className="text-xs text-primary-foreground/70">{t("chat.subtitle")}</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-primary-foreground/70 hover:text-primary-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4" style={{ scrollbarWidth: "thin" }}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "bot" && (
                    <img src={botAvatar} alt="Bot" className="h-7 w-7 shrink-0 rounded-full" width={28} height={28} />
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                      msg.role === "user"
                        ? "rounded-br-md text-primary-foreground"
                        : "rounded-bl-md bg-muted text-foreground"
                    }`}
                    style={msg.role === "user" ? { background: "var(--gradient-sun)" } : undefined}
                  >
                    {msg.text.split(/\*\*(.*?)\*\*/g).map((part, j) =>
                      j % 2 === 1 ? <strong key={j}>{part}</strong> : <span key={j}>{part}</span>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </motion.div>
              ))}
              {typing && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                  <img src={botAvatar} alt="Bot" className="h-7 w-7 shrink-0 rounded-full" width={28} height={28} />
                  <div className="flex gap-1 rounded-2xl bg-muted px-4 py-3">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "300ms" }} />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-border p-3">
              <form
                onSubmit={(e) => { e.preventDefault(); send(); }}
                className="flex items-center gap-2"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t("chat.placeholder")}
                  className="flex-1 rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-primary-foreground disabled:opacity-40"
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
