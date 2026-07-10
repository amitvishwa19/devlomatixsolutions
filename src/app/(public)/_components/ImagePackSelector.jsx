'use client';

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useImagePack } from "../_context/CrystalAuraProviders";

const PaletteIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 14.7255 3.09032 17.1962 4.85857 19C5.03345 19.1749 5.0999 19.4294 5.02422 19.6715L4.72225 20.6378C4.54228 21.2137 4.97077 21.8085 5.56825 21.7587L7.33235 21.6117C7.57534 21.6013 7.80783 21.7228 7.93514 21.9298C9.17646 22 10.5137 22 12 22Z" />
    <circle cx="7.5" cy="10.5" r="1.5" fill="currentColor" />
    <circle cx="11.5" cy="7.5" r="1.5" fill="currentColor" />
    <circle cx="16.5" cy="9.5" r="1.5" fill="currentColor" />
    <circle cx="15.5" cy="14.5" r="1.5" fill="currentColor" />
  </svg>
);

const CheckIcon = ({ className = "w-3 h-3" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const packs = [
  { id: "pack-default", name: "Default Pack" },
  { id: "pack-5", name: "Design Pack 5" },
  { id: "pack-6", name: "Design Pack 6" },
  { id: "pack-7", name: "Design Pack 7" },
  { id: "pack-chatgpt", name: "ChatGPT Pack" }
];

export default function ImagePackSelector() {
  const { imagePack, changeImagePack } = useImagePack();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            transition={{ duration: 0.25 }}
            className="glass rounded-2xl border border-white/10 p-3 shadow-2xl w-52 flex flex-col gap-1.5"
            style={{ boxShadow: "0 10px 30px -5px rgba(220,160,40,0.2)" }}
          >
            <div className="px-2 py-1 border-b border-white/5 mb-1">
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-primary-foreground text-gold-gradient">
                Select Image Pack
              </p>
            </div>
            {packs.map((pack) => (
              <button
                key={pack.id}
                onClick={() => {
                  changeImagePack(pack.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[10px] tracking-wider font-bold transition-all duration-300 ${
                  imagePack === pack.id
                    ? "bg-primary/20 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <span>{pack.name}</span>
                {imagePack === pack.id && <CheckIcon className="text-primary" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full bg-gold-gradient text-white flex items-center justify-center shadow-xl border border-primary/25 hover:shadow-primary/20 hover:shadow-2xl transition-all duration-300"
        aria-label="Change Image Pack"
      >
        <PaletteIcon className="w-5 h-5 text-white" />
      </motion.button>
    </div>
  );
}
