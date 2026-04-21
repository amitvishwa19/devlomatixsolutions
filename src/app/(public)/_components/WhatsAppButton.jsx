'use client';

import React from "react";
import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

const WhatsAppButton = () => {
    const phoneNumber = "919712340450";
    const message = encodeURIComponent("Hi! I'm interested in Devlomatix Solutions. Can you help me?");
    const url = `https://wa.me/${phoneNumber}?text=${message}`;

    return (
        <motion.a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1, type: "spring", stiffness: 200 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-shadow hover:shadow-xl group"
            style={{ background: "#25D366" }}
            aria-label="Chat on WhatsApp"
        >
            <MessageCircle className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-ping opacity-75" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full" />
            <div className="absolute inset-x-0 -top-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="bg-zinc-900 border border-white/10 text-white text-[10px] px-3 py-1.5 rounded-full whitespace-nowrap shadow-xl">
                    Chat with Us
                </div>
            </div>
        </motion.a>
    );
};

export default WhatsAppButton;
