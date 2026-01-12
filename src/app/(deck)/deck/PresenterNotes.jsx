import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StickyNote, X, ChevronUp, ChevronDown, Clock, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

const slideNotes = {
  0: {
    title: "Welcome",
    talkingPoints: [
      "Introduce yourself and the company",
      "Mention years of experience in healthcare IT",
      "Set expectations for the presentation duration (15-20 mins)",
    ],
    duration: "1 min",
    tips: "Make eye contact and establish rapport"
  },
  1: {
    title: "The Challenge",
    talkingPoints: [
      "Highlight pain points hospitals face daily",
      "Mention data silos and manual processes",
      "Reference statistics on healthcare inefficiencies",
    ],
    duration: "2 mins",
    tips: "Ask rhetorical questions to engage audience"
  },
  2: {
    title: "Our Solution",
    talkingPoints: [
      "Present HMS as a unified platform",
      "Emphasize integration and automation",
      "Highlight cloud-based accessibility",
    ],
    duration: "2 mins"
  },
  3: {
    title: "Modules Overview",
    talkingPoints: [
      "Give a high-level overview of all modules",
      "Mention customization options",
      "Highlight interoperability between modules",
    ],
    duration: "2 mins"
  },
  4: {
    title: "Key Features",
    talkingPoints: [
      "Discuss standout features",
      "Mention AI-powered capabilities",
      "Highlight mobile accessibility",
    ],
    duration: "2 mins"
  },
  5: {
    title: "OPD Management",
    talkingPoints: [
      "Walk through patient flow from registration to consultation",
      "Highlight queue management and token system",
      "Mention real-time doctor availability",
    ],
    duration: "2 mins",
    tips: "Offer to show live demo"
  },
  6: {
    title: "IPD Management",
    talkingPoints: [
      "Explain bed management and occupancy tracking",
      "Discuss nursing workflows and medication rounds",
      "Mention discharge planning features",
    ],
    duration: "2 mins"
  },
  7: {
    title: "Electronic Medical Records",
    talkingPoints: [
      "Emphasize unified patient history",
      "Mention templates for faster documentation",
      "Highlight voice-to-text capabilities",
    ],
    duration: "2 mins"
  },
  8: {
    title: "Laboratory Module",
    talkingPoints: [
      "Discuss sample tracking and barcode integration",
      "Mention machine interfacing capabilities",
      "Highlight result validation workflow",
    ],
    duration: "1.5 mins"
  },
  9: {
    title: "Pharmacy Module",
    talkingPoints: [
      "Explain inventory management and reorder levels",
      "Discuss drug interaction alerts",
      "Mention integration with e-prescriptions",
    ],
    duration: "1.5 mins"
  },
  10: {
    title: "Billing & Revenue",
    talkingPoints: [
      "Walk through billing workflow",
      "Mention multiple payment gateway support",
      "Discuss insurance and TPA integration",
    ],
    duration: "1.5 mins"
  },
  11: {
    title: "Reports & Analytics",
    talkingPoints: [
      "Show sample dashboard visualizations",
      "Mention customizable report builder",
      "Highlight predictive analytics capabilities",
    ],
    duration: "1.5 mins"
  },
  12: {
    title: "AI Features",
    talkingPoints: [
      "Discuss AI-powered diagnosis assistance",
      "Mention predictive bed occupancy",
      "Highlight automated coding and billing",
    ],
    duration: "1.5 mins"
  },
  13: {
    title: "Benefits",
    talkingPoints: [
      "Summarize ROI and efficiency gains",
      "Mention patient satisfaction improvements",
      "Reference case study results",
    ],
    duration: "1.5 mins"
  },
  14: {
    title: "Technology Stack",
    talkingPoints: [
      "Briefly mention modern tech stack",
      "Highlight security and compliance",
      "Discuss scalability for multi-hospital setups",
    ],
    duration: "1 min"
  },
  15: {
    title: "Integrations",
    talkingPoints: [
      "List key third-party integrations",
      "Mention open APIs for custom integrations",
      "Discuss HL7/FHIR compliance",
    ],
    duration: "1 min"
  },
  16: {
    title: "Testimonials",
    talkingPoints: [
      "Share success stories from existing clients",
      "Mention hospital names and metrics if possible",
      "Build credibility with specific examples",
    ],
    duration: "1 min"
  },
  17: {
    title: "Pricing",
    talkingPoints: [
      "Explain pricing tiers and what's included",
      "Mention custom enterprise options",
      "Discuss implementation costs",
    ],
    duration: "1.5 mins",
    tips: "Be prepared for pricing questions"
  },
  18: {
    title: "Implementation",
    talkingPoints: [
      "Walk through implementation timeline",
      "Mention training and support included",
      "Discuss data migration process",
    ],
    duration: "1 min"
  },
  19: {
    title: "Call to Action",
    talkingPoints: [
      "Summarize key value propositions",
      "Create urgency with limited-time offers if applicable",
      "Clearly state next steps",
    ],
    duration: "1 min"
  },
  20: {
    title: "Contact",
    talkingPoints: [
      "Provide contact information",
      "Offer to schedule a detailed demo",
      "Thank the audience and open for Q&A",
    ],
    duration: "1 min",
    tips: "Have business cards ready"
  },
};

const PresenterNotes = ({ currentSlide, isOpen, onToggle }) => {
  const note = slideNotes[currentSlide] || {
    title: "No notes available",
    talkingPoints: ["No talking points for this slide"],
    duration: "N/A"
  };

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onToggle}
        className="fixed bottom-24 left-4 z-40 p-3 rounded-full glass-effect hover:bg-card transition-colors"
        title="Presenter Notes"
      >
        <StickyNote className="w-5 h-5 text-foreground" />
      </motion.button>

      {/* Notes Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 glass-effect border-t border-border max-h-[40vh] overflow-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-card/95 backdrop-blur-sm p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <StickyNote className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="font-semibold text-foreground">{note.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {note.duration}
                    </span>
                    <span>Slide {currentSlide + 1}</span>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onToggle}>
                <ChevronDown className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Talking Points */}
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Talking Points
                </h4>
                <ul className="space-y-2">
                  {note.talkingPoints.map((point, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-2 text-foreground"
                    >
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      {point}
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Tips */}
              {note.tips && (
                <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                  <p className="text-sm text-foreground">
                    <span className="font-semibold">💡 Tip:</span> {note.tips}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PresenterNotes;
