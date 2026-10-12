'use client';

import React, { createContext, useContext, useState } from "react";

export const languageNames = {
  en: "English",
  hi: "हिन्दी",
  gu: "ગુજરાતી",
};

const translations = {
  // Navbar
  "nav.home": { en: "Home", hi: "होम", gu: "હોમ" },
  "nav.features": { en: "Features", hi: "सुविधाएँ", gu: "સુવિધાઓ" },
  "nav.pricing": { en: "Pricing", hi: "मूल्य", gu: "કિંમત" },
  "nav.industries": { en: "Industries", hi: "उद्योग", gu: "ઉદ્યોગો" },
  "nav.testimonials": { en: "Reviews", hi: "समीक्षाएं", gu: "સમીક્ષાઓ" },
  "nav.faq": { en: "FAQ", hi: "सामान्य प्रश्न", gu: "પ્રશ્નો" },
  "nav.login": { en: "Login", hi: "लॉगिन", gu: "લોગિન" },
  "nav.trial": { en: "Start Free Trial", hi: "निःशुल्क परीक्षण शुरू करें", gu: "મફત ટ્રાયલ શરૂ કરો" },

  // Hero
  "hero.badge": { en: "Official WhatsApp Business API Partner", hi: "आधिकारिक WhatsApp Business API पार्टनर", gu: "સત્તાવાર WhatsApp Business API પાર્ટનર" },
  "hero.title1": { en: "Grow Your Business on", hi: "अपने व्यापार को बढ़ाएँ", gu: "તમારો વ્યવસાય વધારો" },
  "hero.title2": { en: "WhatsApp Business API", hi: "WhatsApp Business API पर", gu: "WhatsApp Business API પર" },
  "hero.subtitle": {
    en: "Send bulk campaigns, automate conversations with no-code chatbots, and convert leads — all through the official WhatsApp Business API.",
    hi: "बल्क अभियान भेजें, नो-कोड चैटबॉट्स से बातचीत स्वचालित करें, और लीड्स को रूपांतरित करें — सब आधिकारिक WhatsApp Business API के माध्यम से।",
    gu: "બલ્ક કેમ્પેઇન મોકલો, નો-કોડ ચેટબોટ્સ સાથે વાતચીત ઓટોમેટ કરો, અને લીડ્સ રૂપાંતરિત કરો — બધું સત્તાવાર WhatsApp Business API દ્વારા.",
  },
  "hero.cta1": { en: "Start Free Trial", hi: "निःशुल्क परीक्षण शुरू करें", gu: "મફત ટ્રાયલ શરૂ કરો" },
  "hero.cta2": { en: "Book a Demo", hi: "डेमो बुक करें", gu: "ડેમો બુક કરો" },

  // Features
  "features.badge": { en: "Features", hi: "सुविधाएँ", gu: "સુવિધાઓ" },
  "features.title": { en: "Everything You Need to", hi: "सब कुछ जो आपको चाहिए", gu: "તમારે જોઈતું બધું" },
  "features.title2": { en: "Win on WhatsApp", hi: "WhatsApp पर जीतने के लिए", gu: "WhatsApp પર જીતવા માટે" },

  // Stats
  "stats.messages": { en: "Messages Sent", hi: "संदेश भेजे गए", gu: "સંદેશાઓ મોકલ્યા" },
  "stats.businesses": { en: "Active Businesses", hi: "सक्रिय व्यवसाय", gu: "સક્રિય વ્યવસાયો" },
  "stats.uptime": { en: "Uptime SLA", hi: "अपटाइम SLA", gu: "અપટાઇમ SLA" },
  "stats.support": { en: "Support Response", hi: "सहायता प्रतिक्रिया", gu: "સહાય પ્રતિસાદ" },

  // CTA
  "cta.title": { en: "Ready to Transform Your WhatsApp Strategy?", hi: "अपनी WhatsApp रणनीति बदलने के लिए तैयार?", gu: "તમારી WhatsApp રણનીતિ બદલવા તૈયાર?" },
  "cta.subtitle": {
    en: "Join thousands of businesses already growing with KonnectX. Start your 7-day free trial today.",
    hi: "हजारों व्यवसायों से जुड़ें जो पहले से KonnectX के साथ बढ़ रहे हैं। आज ही अपना 7-दिन का निःशुल्क परीक्षण शुरू करें।",
    gu: "હજારો વ્યવસાયો સાથે જોડાઓ જે પહેલેથી KonnectX સાથે વધી રહ્યા છે. આજે જ તમારો 7-દિવસનો મફત ટ્રાયલ શરૂ કરો.",
  },

  // Chatbot widget
  "chat.title": { en: "KonnectX Assistant", hi: "KonnectX सहायक", gu: "KonnectX સહાયક" },
  "chat.subtitle": { en: "Live WhatsApp Bot Demo", hi: "लाइव WhatsApp बॉट डेमो", gu: "લાઇવ WhatsApp બોટ ડેમો" },
  "chat.placeholder": { en: "Type a message...", hi: "संदेश टाइप करें...", gu: "સંદેશ ટાઈપ કરો..." },
  "chat.welcome": {
    en: "👋 Hi! I'm KonnectX Bot. Ask me about our features, pricing, or how WhatsApp API works!",
    hi: "👋 नमस्ते! मैं KonnectX बॉट हूँ। हमारी सुविधाओं, मूल्य, या WhatsApp API कैसे काम करता है, के बारे में पूछें!",
    gu: "👋 નમસ્તે! હું KonnectX બોટ છું. અમારી સુવિધાઓ, કિંમત, અથવા WhatsApp API કેવી રીતે કામ કરે છે તે વિશે પૂછો!",
  },

  // Footer
  "footer.product": { en: "Product", hi: "उत्पाद", gu: "ઉત્પાદન" },
  "footer.company": { en: "Company", hi: "कंपनी", gu: "કંપની" },
  "footer.resources": { en: "Resources", hi: "संसाधन", gu: "સંસાધનો" },
  "footer.legal": { en: "Legal", hi: "कानूनी", gu: "કાયદાકીય" },
  "footer.rights": { en: "All rights reserved.", hi: "सर्वाधिकार सुरक्षित।", gu: "સર્વાધિકાર સુરક્ષિત." },
};

const LanguageContext = createContext({
  language: "en",
  setLanguage: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("konnectx_language");
        if (stored && (stored === "en" || stored === "hi" || stored === "gu")) {
          return stored;
        }
      } catch {
        // Ignore localStorage restrictions
      }
    }
    return "en";
  });

  const changeLanguage = (lang) => {
    setLanguage(lang);
    try {
      localStorage.setItem("konnectx_language", lang);
    } catch {
      // Ignore
    }
  };

  const t = (key) => {
    return translations[key]?.[language] ?? translations[key]?.en ?? key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
