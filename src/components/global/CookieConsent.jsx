'use client'
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X, Settings, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";


const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [showPreferences, setShowPreferences] = useState(false);
    const [preferences, setPreferences] = useState({
        necessary: true,
        analytics: false,
        marketing: false,
        functional: false,
    });

    useEffect(() => {
        const consent = localStorage.getItem("cookieConsent");
        if (!consent) {
            // Small delay before showing
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAcceptAll = () => {
        const allAccepted = {
            necessary: true,
            analytics: true,
            marketing: true,
            functional: true,
        };
        localStorage.setItem("cookieConsent", JSON.stringify(allAccepted));
        setIsVisible(false);
    };

    const handleAcceptSelected = () => {
        localStorage.setItem("cookieConsent", JSON.stringify(preferences));
        setIsVisible(false);
    };

    const handleRejectAll = () => {
        const onlyNecessary = {
            necessary: true,
            analytics: false,
            marketing: false,
            functional: false,
        };
        localStorage.setItem("cookieConsent", JSON.stringify(onlyNecessary));
        setIsVisible(false);
    };

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

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="fixed bottom-0 left-0 right-0 z-[99] p-4 md:p-6"
                >
                    <div className="max-w-4xl mx-auto bg-background rounded-2xl shadow-2xl border border-border overflow-hidden">
                        {/* Main Banner */}
                        <div className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="hidden sm:flex w-12 h-12 rounded-xl bg-primary/10 items-center justify-center flex-shrink-0">
                                    <Cookie className="w-6 h-6 text-primary" />
                                </div>

                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-foreground mb-2">
                                        We value your privacy 🍪
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        We use cookies to enhance your browsing experience, analyze site traffic, and personalize content.
                                        By clicking "Accept All", you consent to our use of cookies. Read our{" "}
                                        <Link href="/privacy-policy" className="text-primary hover:underline">
                                            Privacy Policy
                                        </Link>{" "}
                                        for more information.
                                    </p>

                                    {/* Preferences Panel */}
                                    <AnimatePresence>
                                        {showPreferences && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="space-y-3 mb-4 pt-4 border-t border-border">
                                                    {cookieTypes.map((cookie) => (
                                                        <div
                                                            key={cookie.key}
                                                            className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                                                        >
                                                            <div className="flex-1 mr-4">
                                                                <p className="text-sm font-medium text-foreground">
                                                                    {cookie.title}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
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

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap items-center gap-3">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowPreferences(!showPreferences)}
                                            className="gap-2"
                                        >
                                            <Settings className="w-4 h-4" />
                                            {showPreferences ? "Hide" : "Customize"}
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleRejectAll}
                                        >
                                            Reject All
                                        </Button>

                                        {showPreferences ? (
                                            <Button
                                                size="sm"
                                                onClick={handleAcceptSelected}
                                                className="gap-2"
                                            >
                                                <Check className="w-4 h-4" />
                                                Save Preferences
                                            </Button>
                                        ) : (
                                            <Button
                                                size="sm"
                                                onClick={handleAcceptAll}
                                                className="gap-2"
                                            >
                                                <Check className="w-4 h-4" />
                                                Accept All
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {/* Close button */}
                                <button
                                    onClick={handleRejectAll}
                                    className="p-1.5 rounded-lg hover:bg-secondary transition-colors flex-shrink-0"
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
    );
};

export default CookieConsent;
