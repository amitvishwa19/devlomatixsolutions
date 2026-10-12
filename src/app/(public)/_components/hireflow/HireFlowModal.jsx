'use client';

import React, { useEffect } from "react";
import HireFlowLanding from "./HireFlowLanding";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export function HireFlowModal({ isOpen, onClose }) {
  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="hireflow-modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 h-screen w-screen overflow-hidden bg-background/95 backdrop-blur-xl flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label="HireFlow Intelligent ATS Platform Preview"
      >
        {/* Top Floating Quick Return Bar */}
        <div className="shrink-0 z-50 flex items-center justify-between px-4 py-2 border-b border-border/40 text-xs text-muted-foreground bg-background/90 backdrop-blur-md">
          <button
            onClick={onClose}
            className="flex items-center gap-2 font-semibold text-foreground hover:text-indigo-400 transition-colors cursor-pointer py-1 px-2.5 rounded-lg hover:bg-muted/60"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Devlomatix Ventures</span>
          </button>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block text-[11px] text-muted-foreground/80">
              Press <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted text-[10px] font-mono">Esc</kbd> to exit
            </span>
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/60 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all cursor-pointer"
              title="Close modal"
              aria-label="Close"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Shadcn UI ScrollArea for smooth custom scrolling */}
        <ScrollArea className="flex-1 min-h-screen w-full">
          <HireFlowLanding onClose={onClose} />
        </ScrollArea>
      </motion.div>
    </AnimatePresence>
  );
}

export default HireFlowModal;
