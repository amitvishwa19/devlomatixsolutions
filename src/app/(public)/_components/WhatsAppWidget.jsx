'use client'
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

const WhatsAppWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const phoneNumber = "919876543210"; // Replace with actual WhatsApp business number
    const defaultMessage = encodeURIComponent("Hi! I'm interested in CareWell HMS. Please share more details.");

    const handleWhatsAppClick = () => {
        window.open(`https://wa.me/${phoneNumber}?text=${defaultMessage}`, "_blank");
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-20 right-0 w-80 bg-background rounded-2xl shadow-2xl border border-border/50 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-[#25D366] p-4 text-white">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                                    <MessageCircle className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="font-semibold">CareWell Support</p>
                                    <p className="text-sm text-white/80">Typically replies within minutes</p>
                                </div>
                            </div>
                        </div>

                        {/* Chat preview */}
                        <div className="p-4 bg-secondary/30 min-h-[120px]">
                            <div className="bg-background rounded-lg p-3 shadow-sm max-w-[80%]">
                                <p className="text-sm text-foreground">
                                    👋 Hi there! How can we help you today?
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">Just now</p>
                            </div>
                        </div>

                        {/* Action */}
                        <div className="p-4 border-t border-border/50">
                            <Button
                                onClick={handleWhatsAppClick}
                                className="w-full bg-[#25D366] hover:bg-[#20BD5A] text-white"
                            >
                                <Send className="h-4 w-4 mr-2" />
                                Start Conversation
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-colors ${isOpen ? "bg-foreground" : "bg-[#25D366]"
                    }`}
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                        >
                            <X className="h-6 w-6 text-background" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="whatsapp"
                            initial={{ rotate: 90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -90, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                        >
                            <svg className="h-7 w-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>

            {/* Pulse animation when closed */}
            {!isOpen && (
                <span className="absolute -inset-1 rounded-full bg-[#25D366]/30 animate-ping" />
            )}
        </div>
    );
};

export default WhatsAppWidget;
