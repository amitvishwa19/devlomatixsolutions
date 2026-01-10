'use client'
import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import TitleSlide from "./slides/TitleSlide";
import ProblemSlide from "./slides/ProblemSlide";
import SolutionSlide from "./slides/SolutionSlide";
import DashboardSlide from "./slides/DashboardSlide";
import WorkflowSlide from "./slides/WorkflowSlide";
import PatientSlide from "./slides/PatientSlide";
import AppointmentCalendarSlide from "./slides/AppointmentCalendarSlide";
import PrescriptionSlide from "./slides/PrescriptionSlide";
import ClinicalSlide from "./slides/ClinicalSlide";
import InfrastructureSlide from "./slides/InfrastructureSlide";
import BillingSlide from "./slides/BillingSlide";
import DocumentSlide from "./slides/DocumentSlide";
import ArticleSlide from "./slides/ArticleSlide";
import CommunicationSlide from "./slides/CommunicationSlide";
import RoleManagementSlide from "./slides/RoleManagementSlide";
import FeaturesSlide from "./slides/FeaturesSlide";
import FunctionalAreasSlide from "./slides/AICoachSlide";
import TargetUsersSlide from "./slides/TargetUsersSlide";
import SecuritySlide from "./slides/SecuritySlide";
import MetricsSlide from "./slides/MetricsSlide";
import PricingSlide from "./slides/PricingSlide";
import CTASlide from "./slides/CTASlide";
import PresentationControls from "./PresentationControls";
import SlideNavigation from "./SlideNavigation";
import SpeakerNotesPanel from "./SpeakerNotesPanel";
import ThemeSwitcher from "@/components/global/ThemeSwitch";
//import ThemeToggle from "@/components/ThemeToggle";




const slides = [
  { id: 1, component: TitleSlide, title: "Intro" },
  { id: 2, component: ProblemSlide, title: "Problem" },
  { id: 3, component: SolutionSlide, title: "Solution" },
  { id: 4, component: DashboardSlide, title: "Dashboard" },
  { id: 5, component: WorkflowSlide, title: "Workflow" },
  { id: 6, component: PatientSlide, title: "Patients" },
  { id: 7, component: AppointmentCalendarSlide, title: "Calendar" },
  { id: 8, component: PrescriptionSlide, title: "Rx" },
  { id: 9, component: ClinicalSlide, title: "Clinical" },
  { id: 10, component: InfrastructureSlide, title: "Infra" },
  { id: 11, component: BillingSlide, title: "Billing" },
  { id: 12, component: DocumentSlide, title: "Docs" },
  { id: 13, component: ArticleSlide, title: "Articles" },
  { id: 14, component: CommunicationSlide, title: "Comms" },
  { id: 15, component: RoleManagementSlide, title: "Roles" },
  { id: 16, component: FeaturesSlide, title: "Features" },
  { id: 17, component: FunctionalAreasSlide, title: "Areas" },
  { id: 18, component: TargetUsersSlide, title: "Users" },
  { id: 19, component: SecuritySlide, title: "Security" },
  { id: 20, component: MetricsSlide, title: "Metrics" },
  { id: 21, component: PricingSlide, title: "Pricing" },
  { id: 23, component: CTASlide, title: "CTA" },
];

// Speaker notes for each slide
const speakerNotes = [
  "Welcome to the Hospital Management System presentation.\nIntroduce the company and set the stage for what's to come.\nMention key statistics to grab attention.",
  "Highlight the current challenges hospitals face.\nEmphasize pain points: manual processes, revenue leakage, time waste.\nLet the audience connect with these problems.",
  "Present our comprehensive solution.\nEmphasize the all-in-one nature of the platform.\nHighlight key differentiators.",
  "Walk through the dashboard interface.\nShow real-time analytics and KPIs.\nDemonstrate ease of use.",
  "Explain IPD and OPD workflows.\nShow how the system streamlines patient journeys.\nHighlight automation benefits.",
  "Demonstrate patient management features.\nShow patient records, history, and tracking.\nEmphasize data accessibility.",
  "Present the appointment scheduling system.\nHighlight calendar integration.\nShow booking and reminder features.",
  "Cover prescription management.\nShow digital prescriptions and medication tracking.\nEmphasize accuracy and safety.",
  "Present clinical workflow features.\nShow lab integration and test management.\nHighlight diagnostic tools.",
  "Cover infrastructure management.\nShow asset tracking and maintenance.\nEmphasize operational efficiency.",
  "Present billing and financial features.\nShow invoice generation and payment tracking.\nHighlight revenue optimization.",
  "Demonstrate document management.\nShow role-based access and organization.\nEmphasize compliance and security.",
  "Present AI-powered article features.\nShow content generation and knowledge base.\nHighlight time savings.",
  "Cover communication features.\nShow messaging and notification systems.\nEmphasize team collaboration.",
  "Present role management features.\nShow granular permissions.\nEmphasize security and access control.",
  "Summarize key features.\nHighlight the breadth of functionality.\nReinforce value proposition.",
  "Cover functional areas in detail.\nShow department-specific features.\nEmphasize customization options.",
  "Identify target users.\nShow benefits for each role.\nHelp audience identify with use cases.",
  "Present security features.\nEmphasize HIPAA compliance.\nHighlight data protection measures.",
  "Show key metrics and results.\nPresent case study data.\nDemonstrate ROI potential.",
  "Present pricing options.\nHighlight value at each tier.\nAddress common pricing questions.",
  "Call to action.\nProvide next steps.\nOffer demo scheduling and contact info.",
];

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
  }),
};

const PresentationView = () => {
  const [[currentSlide, direction], setSlide] = useState([0, 0]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [numberBuffer, setNumberBuffer] = useState("");
  const numberTimeoutRef = useRef(null);
  const autoPlayRef = useRef(null);

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayRef.current = setInterval(() => {
        setSlide(([current, _]) => {
          const next = current + 1;
          if (next >= slides.length) {
            setIsAutoPlaying(false);
            return [current, 0];
          }
          return [next, 1];
        });
      }, 5000);
    } else if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying]);

  const paginate = useCallback(
    (newDirection) => {
      if (isAnimating) return;

      const nextSlide = currentSlide + newDirection;
      if (nextSlide >= 0 && nextSlide < slides.length) {
        setSlide([nextSlide, newDirection]);
      }
    },
    [currentSlide, isAnimating]
  );

  const goToSlide = useCallback(
    (index) => {
      if (isAnimating || index === currentSlide) return;
      const newDirection = index > currentSlide ? 1 : -1;
      setSlide([index, newDirection]);
    },
    [currentSlide, isAnimating]
  );

  // Keyboard navigation with number jump and notes toggle
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Toggle notes with N key
      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        setShowNotes(prev => !prev);
        return;
      }

      // Arrow/space navigation
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        paginate(1);
        return;
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        paginate(-1);
        return;
      }

      // Number key jump (0-9)
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();

        // Clear previous timeout
        if (numberTimeoutRef.current) {
          clearTimeout(numberTimeoutRef.current);
        }

        // Append digit to buffer
        const newBuffer = numberBuffer + e.key;
        setNumberBuffer(newBuffer);

        // After 800ms, jump to the slide
        numberTimeoutRef.current = setTimeout(() => {
          const slideNum = parseInt(newBuffer, 10);
          if (slideNum >= 1 && slideNum <= slides.length) {
            goToSlide(slideNum - 1);
          }
          setNumberBuffer("");
        }, 800);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (numberTimeoutRef.current) {
        clearTimeout(numberTimeoutRef.current);
      }
    };
  }, [paginate, goToSlide, numberBuffer]);

  // Touch/swipe navigation
  useEffect(() => {
    let touchStartX = 0;

    const handleTouchStart = (e) => {
      touchStartX = e.touches[0].clientX;
    };

    const handleTouchEnd = (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchStartX - touchEndX;

      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          paginate(1);
        } else {
          paginate(-1);
        }
      }
    };

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [paginate]);

  const CurrentSlideComponent = slides[currentSlide].component;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background">
      {/* Background decoration */}
      <div className="absolute inset-0 gradient-mesh opacity-50" />
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      {/* Theme Toggle */}
      <ThemeSwitcher />


      {/* Presentation Controls */}
      <PresentationControls
        currentSlide={currentSlide}
        totalSlides={slides.length}
        onGoToSlide={goToSlide}
        isAutoPlaying={isAutoPlaying}
        onToggleAutoPlay={() => setIsAutoPlaying(!isAutoPlaying)}
        slideComponents={slides}
      />

      <AnimatePresence
        initial={false}
        custom={direction}
        mode="wait"
        onExitComplete={() => setIsAnimating(false)}
      >
        <motion.div
          key={currentSlide}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          onAnimationStart={() => setIsAnimating(true)}
          onAnimationComplete={() => setIsAnimating(false)}
          className="absolute inset-0 slide-content"
        >
          <CurrentSlideComponent />
        </motion.div>
      </AnimatePresence>

      <SlideNavigation
        currentSlide={currentSlide}
        totalSlides={slides.length}
        slideTitles={slides.map(s => s.title)}
        onPrev={() => paginate(-1)}
        onNext={() => paginate(1)}
        onDotClick={goToSlide}
      />

      {/* Speaker Notes Panel */}
      <SpeakerNotesPanel
        isOpen={showNotes}
        onClose={() => setShowNotes(false)}
        currentSlide={currentSlide}
        notes={speakerNotes}
      />

      {/* Number input indicator */}
      <AnimatePresence>
        {numberBuffer && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[200] glass px-8 py-4 rounded-2xl"
          >
            <span className="text-4xl font-heading font-bold text-primary">
              {numberBuffer}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PresentationView;
