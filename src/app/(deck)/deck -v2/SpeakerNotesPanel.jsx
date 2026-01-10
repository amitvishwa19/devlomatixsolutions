import { motion, AnimatePresence } from "framer-motion";
import { X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const SpeakerNotesPanel = ({ isOpen, onClose, currentSlide, notes }) => {
  const currentNotes = notes[currentSlide] || "No notes for this slide.";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed right-0 top-0 h-full w-96 z-[150] bg-background/95 backdrop-blur-lg border-l border-border shadow-2xl"
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <h3 className="font-heading font-bold text-foreground">
                  Speaker Notes
                </h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="hover:bg-primary/10"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Slide indicator */}
            <div className="px-4 py-2 bg-muted/50">
              <span className="text-sm text-muted-foreground">
                Slide {currentSlide + 1}
              </span>
            </div>

            {/* Notes content */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="prose prose-sm max-w-none text-foreground">
                {currentNotes.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-3 text-muted-foreground leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* Footer hint */}
            <div className="p-4 border-t border-border bg-muted/30">
              <p className="text-xs text-muted-foreground text-center">
                Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">N</kbd> to toggle notes
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SpeakerNotesPanel;
