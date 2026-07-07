'use client'
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X, Settings, Check, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";

const CONSENT_VERSION = "1.0";
const CONSENT_KEY = "cookieConsent";
const CONSENT_SHOW_KEY = "showConsentBanner";

const cookieTypes = [
    {
        key: "necessary",
        title: "Essential Cookies",
        description: "Required for the website to function. Cannot be disabled.",
        required: true,
    },
    {
        key: "analytics",
        title: "Analytics Cookies",
        description: "Help us understand how visitors interact with our website.",
        required: false,
    },
    {
        key: "marketing",
        title: "Marketing Cookies",
        description: "Used to deliver relevant advertisements and track campaigns.",
        required: false,
    },
    {
        key: "functional",
        title: "Functional Cookies",
        description: "Enable enhanced functionality and personalization.",
        required: false,
    },
];

const defaultConsent = {
    version: CONSENT_VERSION,
    timestamp: null,
    necessary: true,
    analytics: false,
    marketing: false,
    functional: false,
};

export function getCookieConsent() {
    if (typeof window === "undefined") return null;
    try {
        const stored = localStorage.getItem(CONSENT_KEY);
        if (!stored) return null;
        const parsed = JSON.parse(stored);
        if (parsed.version !== CONSENT_VERSION) return null;
        return parsed;
    } catch {
        return null;
    }
}

export function hasConsent(category) {
    const consent = getCookieConsent();
    return consent ? !!consent[category] : false;
}

const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [showPreferences, setShowPreferences] = useState(false);
    const [preferences, setPreferences] = useState(defaultConsent);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem(CONSENT_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (parsed.version === CONSENT_VERSION) {
                    setPreferences(parsed);
                    setIsInitialized(true);
                    return;
                }
            } catch {
                localStorage.removeItem(CONSENT_KEY);
            }
        }
        
        setIsInitialized(true);
        const timer = setTimeout(() => setIsVisible(true), 2000);
        return () => clearTimeout(timer);
    }, []);

    const handleAcceptAll = useCallback(() => {
        const consentData = {
            ...defaultConsent,
            timestamp: new Date().toISOString(),
            analytics: true,
            marketing: true,
            functional: true,
        };
        localStorage.setItem(CONSENT_KEY, JSON.stringify(consentData));
        localStorage.setItem(CONSENT_SHOW_KEY, "hidden");
        
        if (window.gtag) {
            window.gtag("consent", "update", {
                analytics_storage: "granted",
                ad_storage: "granted",
                ad_user_data: "granted",
                ad_personalization: "granted",
            });
        }
        
        setPreferences(consentData);
        setIsVisible(false);
        setShowPreferences(false);
    }, []);

    const handleAcceptSelected = useCallback(() => {
        const consentData = {
            ...defaultConsent,
            ...preferences,
            timestamp: new Date().toISOString(),
        };
        localStorage.setItem(CONSENT_KEY, JSON.stringify(consentData));
        localStorage.setItem(CONSENT_SHOW_KEY, "hidden");
        
        if (window.gtag) {
            window.gtag("consent", "update", {
                analytics_storage: consentData.analytics ? "granted" : "denied",
                ad_storage: consentData.marketing ? "granted" : "denied",
                ad_user_data: consentData.marketing ? "granted" : "denied",
                ad_personalization: consentData.marketing ? "granted" : "denied",
            });
        }
        
        setIsVisible(false);
        setShowPreferences(false);
    }, [preferences]);

    const handleRejectAll = useCallback(() => {
        const consentData = {
            ...defaultConsent,
            timestamp: new Date().toISOString(),
        };
        localStorage.setItem(CONSENT_KEY, JSON.stringify(consentData));
        localStorage.setItem(CONSENT_SHOW_KEY, "hidden");
        
        if (window.gtag) {
            window.gtag("consent", "update", {
                analytics_storage: "denied",
                ad_storage: "denied",
                ad_user_data: "denied",
                ad_personalization: "denied",
            });
        }
        
        setPreferences(consentData);
        setIsVisible(false);
    }, []);

    const handleOpenPreferences = useCallback(() => {
        const stored = localStorage.getItem(CONSENT_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setPreferences(parsed);
            } catch {
                setPreferences(defaultConsent);
            }
        } else {
            setPreferences(defaultConsent);
        }
        setShowPreferences(true);
    }, []);

    if (!isInitialized) return null;

    return (
        <>
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed bottom-0 left-0 right-0 z-[99] p-4 md:p-6"
                    >
                        <div className="max-w-4xl mx-auto rounded-2xl shadow-2xl border border-white/5 bg-white/[0.02] overflow-hidden backdrop-blur-xl">
                            <div className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className="hidden sm:flex w-12 h-12 rounded-xl bg-white/[0.03] items-center justify-center flex-shrink-0 border border-white/5">
                                        <Cookie className="w-6 h-6 text-primary" />
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="text-lg font-serif text-foreground mb-2">
                                            <span className="text-gold-gradient font-semibold">We value your privacy</span> 🍪
                                        </h3>
                                        <p className="text-sm text-muted-foreground/70 mb-4 font-light leading-relaxed">
                                            We use cookies to enhance your browsing experience, analyze site traffic, and personalize content.
                                            By clicking "Accept All", you consent to our use of cookies. Read our{" "}
                                            <Link href="/crystalaura/privacy-policy" className="text-primary hover:underline">
                                                Privacy Policy
                                            </Link>{" "}
                                            for more information.
                                        </p>

                                        <AnimatePresence>
                                            {showPreferences && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="space-y-3 mb-4 pt-4 border-t border-white/5">
                                                        {cookieTypes.map((cookie) => (
                                                            <div
                                                                key={cookie.key}
                                                                className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5"
                                                            >
                                                                <div className="flex-1 mr-4">
                                                                    <p className="text-sm font-medium text-foreground">
                                                                        {cookie.title}
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground/50">
                                                                        {cookie.description}
                                                                    </p>
                                                                </div>
                                                                <Switch
                                                                    checked={preferences[cookie.key]}
                                                                    onCheckedChange={(checked) =>
                                                                        !cookie.required &&
                                                                        setPreferences((prev) => ({
                                                                            ...prev,
                                                                            [cookie.key]: checked,
                                                                        }))
                                                                    }
                                                                    disabled={cookie.required}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <div className="flex flex-wrap items-center gap-3">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setShowPreferences(!showPreferences)}
                                                className="border-white/10 text-foreground gap-2"
                                            >
                                                <Settings className="w-4 h-4" />
                                                {showPreferences ? "Hide" : "Customize"}
                                            </Button>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleRejectAll}
                                                className="border-white/10 text-muted-foreground hover:text-foreground"
                                            >
                                                Reject All
                                            </Button>

                                            {showPreferences ? (
                                                <Button
                                                    size="sm"
                                                    onClick={handleAcceptSelected}
                                                    className="gap-2 bg-gold-gradient text-white hover:opacity-90"
                                                >
                                                    <Check className="w-4 h-4" />
                                                    Save Preferences
                                                </Button>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    onClick={handleAcceptAll}
                                                    className="gap-2 bg-gold-gradient text-white hover:opacity-90"
                                                >
                                                    <Check className="w-4 h-4" />
                                                    Accept All
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleRejectAll}
                                        className="p-1.5 rounded-lg hover:bg-white/[0.05] transition-colors flex-shrink-0"
                                        aria-label="Close cookie consent"
                                    >
                                        <X className="w-5 h-5 text-muted-foreground" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {!isVisible && isInitialized && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        onClick={handleOpenPreferences}
                        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-white/[0.02] border border-white/10 backdrop-blur-xl flex items-center justify-center hover:bg-white/[0.05] transition-all shadow-lg"
                        aria-label="Manage cookie preferences"
                    >
                        <RotateCcw className="w-5 h-5 text-primary" />
                    </motion.button>
                )}
            </AnimatePresence>
        </>
    );
};

export default CookieConsent;