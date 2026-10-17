'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Sparkles,
  Layers,
  Globe,
  Smartphone,
  Cpu,
  Zap,
  Boxes,
  GraduationCap,
  Play,
  Pause,
  Grid,
  CheckCircle2,
  ArrowRight,
  ArrowDown,
  Laptop,
  Server,
  Database,
  Code2,
  Share2,
  BookOpen,
  HelpCircle,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  Terminal,
  Activity,
  Workflow,
  Bot,
  Lightbulb,
  Building2,
  Check,
  Copy,
  TrendingUp,
  AlertCircle,
  Wallet,
  Users,
  Clock,
  HeartPulse,
  Send,
  X,
  Target,
  DollarSign,
  PhoneCall,
  Briefcase,
  Cloud,
  Lock,
  Compass,
  FileSpreadsheet,
  Award,
  PlayCircle,
  Phone,
  Smile,
  Shield,
  FileCheck,
  Flame,
  BadgeAlert,
  ThumbsUp,
  HelpCircle as QuestionIcon,
  Calculator,
  UserCheck,
  ShoppingCart,
  Layout,
  FileCode,
  Radio,
  Wifi,
  Search,
  Gauge,
  Eye,
  RefreshCw,
  Key,
  Rocket,
  Printer,
  Sliders,
  CheckCheck
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import ContactDialog from "@/app/(public)/_components/ContactDialog";
import Link from 'next/link';
import { AppLogo } from "@/components/global/AppLogo";
import { slides } from "./slidesData";

// Interactive Helper Components
import RoiCalculatorWidget from './_components/RoiCalculatorWidget';
import SolutionWizardModal from './_components/SolutionWizardModal';
import PresenterNotesDrawer from './_components/PresenterNotesDrawer';
import PrintCheatSheetModal from './_components/PrintCheatSheetModal';
import { CopyScriptButton, AudioSpeechButton } from './_components/PitchActionButtons';

// Helper: Section Title Component matching Curexa Presentation Deck
const SectionTitle = ({ title, subtitle, centered = true, tag }) => (
  <div className={cn("mb-5 md:mb-7", centered ? "text-center" : "text-left")}>
    {tag && (
      <div className={cn("mb-2 flex", centered ? "justify-center" : "justify-start")}>
        <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-black tracking-widest uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          {tag}
        </span>
      </div>
    )}
    <h2 className="text-xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
      {title}
    </h2>
    {subtitle && (
      <p className="text-xs sm:text-sm md:text-base text-slate-400 mt-1 max-w-2xl mx-auto font-medium">
        {subtitle}
      </p>
    )}
  </div>
);

// Frame Layout with Ambient Radial Glows, Floating Header, Module Quick-Jump & Bottom Nav
const PresentationLayout = ({
  children,
  currentSlide,
  totalSlides,
  slideMeta,
  onNext,
  onPrev,
  onSelect,
  onToggleGrid,
  onToggleFullscreen,
  isFullscreen,
  isAutoPlaying,
  onToggleAutoPlay,
  onOpenContact,
  onToggleNotes,
  isNotesOpen,
  onOpenWizard,
  onOpenRoi,
  onOpenPrint,
  isExpressMode,
  onToggleExpressMode
}) => {
  const modules = [
    { label: "Mod 1: Tech", slideIdx: 1, range: "02–07" },
    { label: "Mod 2: Web Dev", slideIdx: 7, range: "08–17" },
    { label: "Mod 3: Mobile", slideIdx: 17, range: "18–22" },
    { label: "Mod 4: AI & Auto", slideIdx: 22, range: "23–26" },
    { label: "Mod 5: Solutions", slideIdx: 26, range: "27–32" },
    { label: "Mod 6: Drills & Quiz", slideIdx: 32, range: "33–39" }
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col justify-between relative overflow-hidden select-none font-sans">
      {/* Ambient background glows */}
      <div className="absolute top-[-15%] left-[-10%] w-[55%] h-[55%] rounded-full bg-cyan-600/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[55%] h-[55%] rounded-full bg-blue-600/10 blur-[130px] pointer-events-none" />
      <div className="absolute top-[40%] right-[25%] w-[35%] h-[35%] rounded-full bg-indigo-600/5 blur-[100px] pointer-events-none" />

      {/* Primary Floating Header */}
      <header className="relative z-30 flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3 border-b border-white/5 backdrop-blur-md bg-[#020617]/70">
        <div className="flex items-center gap-2.5">
          <AppLogo link="/" size={180} />
          <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />
          
          {/* Mode Switcher Pill */}
          <button
            onClick={onToggleExpressMode}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black transition-all border shrink-0",
              isExpressMode
                ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                : "bg-cyan-950/40 border-cyan-500/30 text-cyan-400 hover:border-cyan-400"
            )}
            title="Toggle between 5-Minute Executive Mode and 39-Slide Masterclass"
          >
            <Zap size={12} className={isExpressMode ? "text-amber-400 fill-amber-400" : "text-cyan-400"} />
            <span>{isExpressMode ? "5-Min Express (5)" : "Full Class (39)"}</span>
          </button>
        </div>

        {/* Central Tools Shortcuts */}
        <div className="hidden md:flex items-center gap-1.5 bg-white/5 p-1 rounded-full border border-white/10">
          <button
            onClick={onOpenRoi}
            className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-all"
            title="Open Live ROI Calculator"
          >
            <Calculator size={13} className="text-cyan-400" />
            <span>ROI Calc</span>
          </button>
          <button
            onClick={onOpenWizard}
            className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-all"
            title="Open Solution Matchmaker Wizard"
          >
            <Sparkles size={13} className="text-purple-400" />
            <span>Matchmaker</span>
          </button>
          <button
            onClick={onOpenPrint}
            className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-all"
            title="Print 1-Page Sales Desk Sheet"
          >
            <Printer size={13} className="text-emerald-400" />
            <span>Desk Sheet</span>
          </button>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Presenter Notes Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleNotes}
            className={cn(
              "h-8 w-8 sm:h-9 sm:w-9 rounded-full border transition-all",
              isNotesOpen
                ? "bg-amber-500/20 text-amber-300 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                : "bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10"
            )}
            title="Presenter Notes Drawer (P)"
          >
            <BookOpen className="h-4 w-4" />
          </Button>

          {/* Grid Overview Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleGrid}
            className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all"
            title="Slide Grid Index (G)"
          >
            <Grid className="h-4 w-4" />
          </Button>

          {/* Auto-Play Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleAutoPlay}
            className={cn(
              "h-8 w-8 sm:h-9 sm:w-9 rounded-full border transition-all",
              isAutoPlaying
                ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                : "bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10"
            )}
            title={isAutoPlaying ? "Pause Auto-play" : "Start Auto-play"}
          >
            {isAutoPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>

          {/* Fullscreen Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleFullscreen}
            className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all hidden sm:inline-flex"
            title={isFullscreen ? "Exit Fullscreen (F)" : "Enter Fullscreen (F)"}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>

          {/* Action CTA Button */}
          <Button
            size="sm"
            onClick={onOpenContact}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-full px-3 sm:px-4 h-8 sm:h-9 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:scale-105 active:scale-95 ml-1"
          >
            <span>Book Consultation</span>
          </Button>
        </div>
      </header>

      {/* Subheader: Module Navigation or Express Mode Indicator */}
      <div className="relative z-20 px-3 sm:px-6 py-1.5 bg-[#020617]/60 border-b border-white/5 flex items-center justify-between overflow-x-auto custom-scrollbar gap-2 text-xs">
        {isExpressMode ? (
          <div className="flex items-center justify-between w-full">
            <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
              <Zap size={13} className="text-amber-400" />
              <span>5-Minute Executive Mode Active (Showing 5 Critical Closing Slides)</span>
            </span>
            <button
              onClick={onToggleExpressMode}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 font-bold underline"
            >
              Switch to Full Masterclass (39 Slides)
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest hidden sm:inline">
                Modules:
              </span>
              {modules.map((m, idx) => {
                const nextIdx = idx < modules.length - 1 ? modules[idx + 1].slideIdx : totalSlides;
                const isModuleActive = currentSlide >= m.slideIdx && currentSlide < nextIdx;

                return (
                  <button
                    key={idx}
                    onClick={() => onSelect(m.slideIdx)}
                    className={cn(
                      "px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all shrink-0 border",
                      isModuleActive
                        ? "bg-cyan-500/20 border-cyan-500/60 text-cyan-300 font-bold shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                        : "bg-white/[0.03] border-white/5 hover:border-white/20 text-slate-400 hover:text-slate-200"
                    )}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>

            {/* Mobile Quick Tool Triggers */}
            <div className="flex items-center gap-1 md:hidden shrink-0">
              <button onClick={onOpenRoi} className="p-1 rounded bg-white/5 text-cyan-400 text-[10px] flex items-center gap-1">
                <Calculator size={11} /> ROI
              </button>
              <button onClick={onOpenWizard} className="p-1 rounded bg-white/5 text-purple-400 text-[10px] flex items-center gap-1">
                <Sparkles size={11} /> Match
              </button>
              <button onClick={onOpenPrint} className="p-1 rounded bg-white/5 text-emerald-400 text-[10px] flex items-center gap-1">
                <Printer size={11} /> Sheet
              </button>
            </div>
          </>
        )}
      </div>

      {/* Main Content Viewport */}
      <main className="flex-1 flex items-center justify-center p-3 sm:p-6 md:p-8 z-10 overflow-y-auto max-h-[calc(100vh-170px)] custom-scrollbar">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="w-full flex flex-col items-center justify-center"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Bottom Navigation Pill */}
      <div className="relative z-30 pb-4 sm:pb-6 flex items-center justify-center gap-3 px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onPrev}
          disabled={currentSlide === 0}
          className="rounded-full bg-white/5 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 disabled:opacity-20 transition-all h-10 w-10 sm:h-11 sm:w-11 shadow-lg"
          title="Previous Slide (←)"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        {/* Dynamic Dot Indicators */}
        <div className="flex items-center gap-1.5 sm:gap-2 max-w-[240px] sm:max-w-none overflow-x-auto py-1 custom-scrollbar">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <button
              key={i}
              onClick={() => onSelect(i)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === currentSlide
                  ? "w-6 sm:w-8 bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.6)]"
                  : "w-1.5 bg-white/20 hover:bg-white/40"
              )}
              title={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onNext}
          disabled={currentSlide === totalSlides - 1}
          className="rounded-full bg-white/5 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 disabled:opacity-20 transition-all h-10 w-10 sm:h-11 sm:w-11 shadow-lg"
          title="Next Slide (→ / Space)"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Slide Counter (Bottom Right) */}
      <div className="absolute bottom-6 right-8 text-xs sm:text-sm text-slate-500 font-mono font-bold hidden sm:block z-20">
        <span className="text-cyan-400">{String(currentSlide + 1).padStart(2, '0')}</span> / {String(totalSlides).padStart(2, '0')}
      </div>

      {/* Auto-play progress line */}
      {isAutoPlaying && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-slate-900 z-40">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 7, ease: 'linear' }}
            key={currentSlide}
          />
        </div>
      )}
    </div>
  );
};

export default function InfoTrainingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [showGridModal, setShowGridModal] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState({});

  // Feature 1: Express Mode State
  const [isExpressMode, setIsExpressMode] = useState(false);

  // Feature 2: Verbal Readiness Scorecard State (persisted in localStorage)
  const [masteryStatus, setMasteryStatus] = useState({});

  // Interactive Tools State
  const [showNotesDrawer, setShowNotesDrawer] = useState(false);
  const [showWizardModal, setShowWizardModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showRoiModal, setShowRoiModal] = useState(false);
  const [gridSearchQuery, setGridSearchQuery] = useState('');
  const [gridModuleFilter, setGridModuleFilter] = useState('ALL');

  const autoPlayTimerRef = useRef(null);

  // Load Verbal Mastery from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('devlomatix_verbal_mastery');
        if (saved) setMasteryStatus(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const handleToggleMastery = (qNum, status) => {
    setMasteryStatus((prev) => {
      const next = { ...prev, [qNum]: prev[qNum] === status ? null : status };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('devlomatix_verbal_mastery', JSON.stringify(next));
        } catch (e) {}
      }
      return next;
    });
  };

  // Express mode slide filters
  const expressSlideIds = [1, 10, 18, 28, 39];
  const activeSlides = isExpressMode
    ? slides.filter((s) => expressSlideIds.includes(s.id))
    : slides;

  const toggleExpressMode = () => {
    setIsExpressMode((prev) => {
      const nextMode = !prev;
      if (nextMode) {
        const currentId = activeSlides[currentSlide]?.id || 1;
        const targetIdx = expressSlideIds.findIndex((id) => id >= currentId);
        setCurrentSlide(targetIdx !== -1 ? targetIdx : 0);
      } else {
        const currentId = activeSlides[currentSlide]?.id || 1;
        const targetIdx = slides.findIndex((s) => s.id === currentId);
        setCurrentSlide(targetIdx !== -1 ? targetIdx : 0);
      }
      return nextMode;
    });
  };

  // Feature 3: URL Deep Linking (#slide-1 to #slide-39)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      const match = hash.match(/#slide-(\d+)/i) || hash.match(/#(\d+)/);
      if (match) {
        const slideNum = parseInt(match[1], 10);
        const targetIdx = activeSlides.findIndex((s) => s.id === slideNum);
        if (targetIdx !== -1) {
          setCurrentSlide(targetIdx);
        }
      }
    }
  }, [isExpressMode]);

  useEffect(() => {
    if (typeof window !== 'undefined' && activeSlides[currentSlide]) {
      const slideId = activeSlides[currentSlide].id;
      window.history.replaceState(null, '', `#slide-${slideId}`);
    }
  }, [currentSlide, activeSlides]);

  useEffect(() => {
    const handleHashChange = () => {
      const match = window.location.hash.match(/#slide-(\d+)/i) || window.location.hash.match(/#(\d+)/);
      if (match) {
        const slideNum = parseInt(match[1], 10);
        const targetIdx = activeSlides.findIndex((s) => s.id === slideNum);
        if (targetIdx !== -1) {
          setCurrentSlide(targetIdx);
        }
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [activeSlides]);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => Math.min(prev + 1, activeSlides.length - 1));
  }, [activeSlides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        nextSlide();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevSlide();
      } else if (e.key === "f" || e.key === "F") {
        toggleFullscreen();
      } else if (e.key === "g" || e.key === "G") {
        setShowGridModal((prev) => !prev);
      } else if (e.key === "p" || e.key === "P") {
        setShowNotesDrawer((prev) => !prev);
      } else if (e.key === "Escape") {
        setShowGridModal(false);
        setShowNotesDrawer(false);
        setShowWizardModal(false);
        setShowPrintModal(false);
        setShowRoiModal(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide]);

  // Fullscreen toggle handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  // Auto-play timer effect (7s per slide)
  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayTimerRef.current = setTimeout(() => {
        setCurrentSlide((prev) => (prev < activeSlides.length - 1 ? prev + 1 : 0));
      }, 7000);
    }
    return () => {
      if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
    };
  }, [isAutoPlaying, currentSlide, activeSlides.length]);

  const slide = activeSlides[currentSlide] || slides[0];

  // Filtered slides for Grid Modal
  const filteredSlides = slides.filter((s) => {
    const matchesSearch =
      gridSearchQuery === '' ||
      s.title.toLowerCase().includes(gridSearchQuery.toLowerCase()) ||
      (s.subtitle && s.subtitle.toLowerCase().includes(gridSearchQuery.toLowerCase())) ||
      (s.meta?.module && s.meta.module.toLowerCase().includes(gridSearchQuery.toLowerCase())) ||
      (s.meta?.category && s.meta.category.toLowerCase().includes(gridSearchQuery.toLowerCase()));

    if (gridModuleFilter === 'ALL') return matchesSearch;
    return matchesSearch && s.meta?.category && s.meta.category.includes(gridModuleFilter);
  });

  // Calculate Verbal Mastery Score on Slide 37
  const masteredCount = Object.values(masteryStatus).filter((v) => v === 'mastered').length;
  const masteredPct = Math.round((masteredCount / 8) * 100);

  return (
    <PresentationLayout
      currentSlide={currentSlide}
      totalSlides={activeSlides.length}
      slideMeta={slide.meta}
      onNext={nextSlide}
      onPrev={prevSlide}
      onSelect={(idx) => {
        setCurrentSlide(idx);
        setShowGridModal(false);
      }}
      onToggleGrid={() => setShowGridModal(true)}
      onToggleFullscreen={toggleFullscreen}
      isFullscreen={isFullscreen}
      isAutoPlaying={isAutoPlaying}
      onToggleAutoPlay={() => setIsAutoPlaying((prev) => !prev)}
      onOpenContact={() => setIsContactOpen(true)}
      onToggleNotes={() => setShowNotesDrawer((prev) => !prev)}
      isNotesOpen={showNotesDrawer}
      onOpenWizard={() => setShowWizardModal(true)}
      onOpenRoi={() => setShowRoiModal(true)}
      onOpenPrint={() => setShowPrintModal(true)}
      isExpressMode={isExpressMode}
      onToggleExpressMode={toggleExpressMode}
    >
      {/* 1. COVER SLIDE */}
      {slide.type === "cover" && (
        <div className="flex flex-col items-center text-center py-2 md:py-6 max-w-5xl mx-auto">
          <motion.div
            className="bg-cyan-500/10 p-4 md:p-6 rounded-[1.8rem] mb-4 border border-cyan-500/20 backdrop-blur-xl shadow-[0_0_50px_rgba(6,182,212,0.15)]"
            initial={{ scale: 0.8, rotate: -4 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5 }}
          >
            <GraduationCap className="h-10 w-10 md:h-16 md:w-16 text-cyan-400" />
          </motion.div>

          <h1 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tighter text-white mb-2 leading-none">
            <span className="bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              {slide.title}
            </span>
          </h1>

          <p className="text-base sm:text-xl md:text-2xl font-semibold text-slate-300 mb-6 px-4 max-w-3xl">
            {slide.subtitle}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-4xl text-left mb-6">
            {slide.modulesOverview.map((mod, i) => (
              <div
                key={i}
                className="bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-md hover:border-cyan-500/30 transition-all cursor-pointer"
                onClick={() => {
                  const targetIdx = [1, 7, 17, 22, 26, 32][i];
                  if (!isExpressMode) setCurrentSlide(targetIdx);
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono font-black text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-500/10">
                    MOD {mod.num}
                  </span>
                  <span className="text-xs font-bold text-white truncate">{mod.name}</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-tight">{mod.topic}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="px-5 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
              <p className="text-[11px] sm:text-xs font-black text-cyan-400 tracking-[0.2em] uppercase">
                {slide.tagline}
              </p>
            </div>
            <Button
              onClick={() => setShowWizardModal(true)}
              size="sm"
              className="bg-purple-600 hover:bg-purple-500 text-white rounded-full text-xs font-bold px-4 flex items-center gap-1.5"
            >
              <Sparkles size={13} /> Try Solution Matchmaker
            </Button>
          </div>
        </div>
      )}

      {/* 2. HOW THE INTERNET WORKS */}
      {slide.type === "mod1-internet" && (
        <div className="max-w-5xl w-full mx-auto text-left">
          <SectionTitle
            tag="Module 1 • Internet Architecture"
            title={slide.title}
            subtitle={slide.subtitle}
          />
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-cyan-950/40 border border-cyan-500/30 mb-5 shadow-xl">
            <span className="text-xs font-bold text-cyan-400 block mb-1">
              {slide.inOneSentence.headline}
            </span>
            <p className="text-sm sm:text-base text-slate-200 font-medium leading-relaxed italic">
              "{slide.inOneSentence.definition}"
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
            {slide.fourPillars.map((p, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-all flex flex-col justify-between">
                <div>
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 w-fit mb-2.5">
                    <p.icon size={20} />
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-white mb-1">{p.title}</h4>
                  <span className="text-xs font-semibold text-cyan-300 block mb-2">{p.analogy}</span>
                  <p className="text-xs text-slate-300 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-slate-900 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-slate-200 italic">
              "{slide.salesTakeaway}"
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <AudioSpeechButton text={slide.salesTakeaway} />
              <CopyScriptButton text={slide.salesTakeaway} />
            </div>
          </div>
        </div>
      )}

      {/* 3. HARDWARE, SOFTWARE & SERVERS */}
      {slide.type === "mod1-hardware" && (
        <div className="max-w-5xl w-full mx-auto text-left">
          <SectionTitle
            tag="Module 1 • Tech Foundations"
            title={slide.title}
            subtitle={slide.subtitle}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            {slide.concepts.map((c, i) => (
              <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-all flex flex-col justify-between">
                <div>
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 w-fit mb-3">
                    <c.icon size={20} />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white mb-1">{c.title}</h3>
                  <span className="text-xs font-bold text-cyan-300 block mb-2">Think of it like: {c.analogy}</span>
                  <p className="text-xs text-slate-300 leading-relaxed mb-3">{c.whatItIs}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-white/5 text-[11px]">
                  <strong className="text-emerald-400 block mb-0.5">Why the Client Cares:</strong>
                  <span className="text-slate-300">{c.whyClientCares}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-slate-900 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-slate-200 italic">
              "{slide.salesScript}"
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <AudioSpeechButton text={slide.salesScript} />
              <CopyScriptButton text={slide.salesScript} />
            </div>
          </div>
        </div>
      )}

      {/* 4. DATABASES: THE DIGITAL BANK VAULT */}
      {slide.type === "mod1-databases" && (
        <div className="max-w-5xl w-full mx-auto text-left">
          <SectionTitle
            tag="Module 1 • Data Architecture"
            title={slide.title}
            subtitle={slide.subtitle}
          />
          <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 mb-5 text-xs sm:text-sm text-cyan-200 font-medium">
            {slide.definition}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            {slide.excelVsDb.map((row, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs">
                <span className="text-cyan-400 font-bold block mb-2 text-sm">{row.aspect}</span>
                <p className="text-rose-300/90 mb-1.5"><strong className="text-rose-400">Excel Spreadsheets: </strong>{row.excel}</p>
                <p className="text-emerald-300 font-medium"><strong className="text-emerald-400">Database: </strong>{row.database}</p>
              </div>
            ))}
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-300 mb-5">
            <strong className="text-cyan-300 block mb-0.5">SQL vs NoSQL Simplified:</strong>
            {slide.typesSummary}
          </div>
          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-slate-200 italic">
              "{slide.salesPitch}"
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <AudioSpeechButton text={slide.salesPitch} />
              <CopyScriptButton text={slide.salesPitch} />
            </div>
          </div>
        </div>
      )}

      {/* 5. APIS & WEBHOOKS */}
      {slide.type === "mod1-apis" && (
        <div className="max-w-5xl w-full mx-auto text-left">
          <SectionTitle
            tag="Module 1 • Integrations"
            title={slide.title}
            subtitle={slide.subtitle}
          />
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-cyan-950/40 border border-cyan-500/30 mb-5 shadow-xl">
            <span className="text-xs font-bold text-cyan-400 block mb-1">{slide.apiAnalogy.headline}</span>
            <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed italic">"{slide.apiAnalogy.text}"</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            {slide.realExamples.map((ex, i) => (
              <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-all flex flex-col justify-between">
                <div>
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 w-fit mb-3">
                    <ex.icon size={20} />
                  </div>
                  <h4 className="text-base font-bold text-white mb-2">{ex.service}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed mb-3">{ex.howApiWorks}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-200">
                  <strong>Business Benefit: </strong>{ex.benefit}
                </div>
              </div>
            ))}
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-cyan-300">
            {slide.webhookNote}
          </div>
        </div>
      )}

      {/* 6. CLOUD COMPUTING */}
      {slide.type === "mod1-cloud-infra" && (
        <div className="max-w-5xl w-full mx-auto text-left">
          <SectionTitle
            tag="Module 1 • Cloud Infrastructure"
            title={slide.title}
            subtitle={slide.subtitle}
          />
          <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 mb-5 text-xs sm:text-sm text-cyan-200 font-medium">
            {slide.inSimpleTerms}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            {slide.benefits.map((b, i) => (
              <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2 text-cyan-400">
                    <b.icon size={18} />
                    <h4 className="text-base font-bold text-white">{b.title}</h4>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-slate-900 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-slate-200 italic">
              {slide.salesPitch}
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <AudioSpeechButton text={slide.salesPitch} />
              <CopyScriptButton text={slide.salesPitch} />
            </div>
          </div>
        </div>
      )}

      {/* 7. CYBERSECURITY & DATA PRIVACY */}
      {slide.type === "mod1-security" && (
        <div className="max-w-5xl w-full mx-auto text-left">
          <SectionTitle
            tag="Module 1 • Cybersecurity"
            title={slide.title}
            subtitle={slide.subtitle}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            {slide.pillars.map((p, i) => (
              <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1.5 text-emerald-400">
                    <p.icon size={20} />
                    <h4 className="text-base font-bold text-white">{p.title}</h4>
                  </div>
                  <span className="text-xs font-semibold text-cyan-300 block mb-2">{p.analogy}</span>
                  <p className="text-xs text-slate-300 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-slate-200 italic">
              {slide.salesScript}
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <AudioSpeechButton text={slide.salesScript} />
              <CopyScriptButton text={slide.salesScript} />
            </div>
          </div>
        </div>
      )}

      {/* 8. WHAT IS A WEBSITE? (THE CORE DEFINITION) */}
      {slide.type === "what-is-website" && (
        <div className="max-w-5xl w-full mx-auto text-left">
          <SectionTitle
            tag="Core Definition"
            title={slide.title}
            subtitle={slide.subtitle}
          />

          {/* Definition Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-cyan-950/40 border border-cyan-500/30 mb-5 shadow-xl">
            <span className="text-xs font-bold text-cyan-400 block mb-1">
              {slide.inOneSentence.headline}
            </span>
            <p className="text-sm sm:text-base text-slate-200 font-medium leading-relaxed italic">
              "{slide.inOneSentence.definition}"
            </p>
          </div>

          {/* The 15-Second Pitch Box with Audio & Copy */}
          {slide.pitch15Sec && (
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 mb-5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-emerald-400 block">
                  {slide.pitch15Sec.label}
                </span>
                <div className="flex items-center gap-2">
                  <AudioSpeechButton text={slide.pitch15Sec.script} />
                  <CopyScriptButton text={slide.pitch15Sec.script} />
                </div>
              </div>
              <p className="text-xs sm:text-sm text-emerald-200 leading-relaxed font-medium italic">
                "{slide.pitch15Sec.script}"
              </p>
            </div>
          )}

          {/* Physical Office vs Website Comparison */}
          {slide.physicalVsWeb && (
            <div className="mb-5">
              <span className="text-xs font-bold text-slate-400 block mb-2 uppercase tracking-wider">
                Physical Office vs. Digital Website Comparison:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {slide.physicalVsWeb.map((p, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
                    <span className="text-cyan-400 font-bold block mb-1">{p.aspect}</span>
                    <p className="text-slate-400 mb-1"><strong className="text-slate-500">Physical: </strong>{p.physical}</p>
                    <p className="text-emerald-300 font-medium"><strong className="text-emerald-400">Website: </strong>{p.website}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* The 3 Essential Building Blocks */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            {slide.threeParts.map((item, i) => (
              <div key={i} className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-all flex flex-col justify-between">
                <div>
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 w-fit mb-3">
                    <item.icon size={20} />
                  </div>
                  <h4 className="text-base font-bold text-white mb-1">{item.part}</h4>
                  <span className="text-xs font-semibold text-cyan-300 block mb-2">{item.analogy}</span>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 text-xs sm:text-sm text-slate-300 leading-relaxed flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <strong className="text-emerald-400 block mb-1">Why Every Business Needs a Website:</strong>
              {slide.whyCare}
            </div>
            <div className="shrink-0">
              <CopyScriptButton text={slide.whyCare} label="Copy Value Prop" />
            </div>
          </div>
        </div>
      )}

      {/* 9. HOW MANY TYPES OF WEBSITES ARE THERE? */}
      {slide.type === "four-website-types" && (
        <div className="max-w-6xl w-full mx-auto text-left">
          <SectionTitle
            tag="Website Classification"
            title={slide.title}
            subtitle={slide.subtitle}
          />

          {slide.goldenRule && (
            <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 mb-5 text-xs sm:text-sm text-cyan-200 font-semibold text-center">
              {slide.goldenRule}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {slide.fourTypes.map((item, i) => (
              <div
                key={i}
                className={cn(
                  "p-5 rounded-2xl bg-white/5 border backdrop-blur-xl transition-all flex flex-col justify-between",
                  item.accent
                )}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-black px-2 py-0.5 rounded bg-white/10 text-white">
                        {item.num}
                      </span>
                      <h4 className="text-lg font-bold text-white">{item.type}</h4>
                    </div>
                    <item.icon size={20} />
                  </div>
                  <span className="text-xs font-semibold block mb-2 text-cyan-300">Analogy: {item.analogy}</span>
                  <p className="text-xs text-slate-200 leading-relaxed mb-4">{item.whatItIs}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/5 text-[11px]">
                  <strong className="text-slate-400 block mb-0.5">Ideal For:</strong>
                  <span className="text-slate-300">{item.bestFor}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 10. THE 4 WEBSITE TYPES MASTER COMPARISON TABLE */}
      {slide.type === "four-types-table" && (
        <div className="max-w-6xl w-full mx-auto text-left">
          <SectionTitle
            tag="Master Comparison Matrix"
            title={slide.title}
            subtitle={slide.subtitle}
          />

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl mb-5 shadow-2xl">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-slate-950/80 text-white font-bold">
                    <th className="p-3.5 text-cyan-400 font-mono text-[11px] uppercase tracking-wider w-[18%]">Dimension</th>
                    <th className="p-3.5 text-blue-400 w-[20%]">1. Static Website</th>
                    <th className="p-3.5 text-cyan-300 w-[20%]">2. Dynamic Website</th>
                    <th className="p-3.5 text-emerald-400 w-[21%]">3. E-Commerce Website</th>
                    <th className="p-3.5 text-purple-400 w-[21%]">4. Custom Web App</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {slide.tableData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.03] transition-colors">
                      <td className="p-3.5 font-bold text-white bg-slate-950/40 text-[11px]">
                        {row.feature}
                      </td>
                      <td className="p-3.5 text-slate-200">{row.staticSite}</td>
                      <td className="p-3.5 text-slate-200">{row.dynamicSite}</td>
                      <td className="p-3.5 text-slate-200">{row.ecommSite}</td>
                      <td className="p-3.5 text-slate-200">{row.customApp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile / Tablet Cards View */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 lg:hidden mb-5">
            {[
              {
                title: "1. Static Website",
                analogy: "Printed Flyer / Visiting Card",
                color: "border-blue-500/30 text-blue-400",
                goal: "Show fixed company info & phone number",
                db: "❌ No database needed",
                who: "Developer edits code",
                cost: "Lowest ($) • 3–5 days",
                ex: "Doctor profile, lawyer portfolio",
                when: "Client just needs an online visiting card"
              },
              {
                title: "2. Dynamic Website",
                analogy: "Living Newspaper / Magazine",
                color: "border-cyan-500/30 text-cyan-300",
                goal: "Publish blogs, news & search feeds",
                db: "✅ Yes (stores articles & blogs)",
                who: "Owner via simple Admin CMS",
                cost: "Moderate ($$) • 1–2 weeks",
                ex: "BBC, TechCrunch, Real Estate portal",
                when: "Client wants to post regular blogs/news"
              },
              {
                title: "3. E-Commerce Website",
                analogy: "Digital Shopping Mall",
                color: "border-emerald-500/30 text-emerald-400",
                goal: "Sell products & collect money online",
                db: "✅ Yes (products, orders & carts)",
                who: "Owner (adds products & prices)",
                cost: "Moderate-High ($$$) • 2–3 weeks",
                ex: "Amazon, Flipkart, Nike store",
                when: "Client wants customers to pay & buy online"
              },
              {
                title: "4. Custom Web App",
                analogy: "Tailor-Made Business Software",
                color: "border-purple-500/30 text-purple-400",
                goal: "Automate daily company operations",
                db: "✅ Yes (multi-user relational DB)",
                who: "Staff & managers via role logins",
                cost: "Enterprise ($$$$) • 3–6 weeks",
                ex: "DevX CRM, Curexa Clinic ERP",
                when: "Client wants to replace Excel & track staff"
              }
            ].map((c, i) => (
              <div key={i} className={cn("p-4 rounded-2xl bg-white/5 border backdrop-blur-md", c.color)}>
                <h4 className="text-base font-bold text-white mb-1">{c.title}</h4>
                <span className="text-xs font-semibold text-cyan-300 block mb-3">Like: {c.analogy}</span>
                <div className="space-y-1.5 text-[11px] text-slate-300">
                  <p><strong className="text-slate-400">Goal: </strong>{c.goal}</p>
                  <p><strong className="text-slate-400">Database: </strong>{c.db}</p>
                  <p><strong className="text-slate-400">Who edits: </strong>{c.who}</p>
                  <p><strong className="text-slate-400">Cost/Time: </strong>{c.cost}</p>
                  <p><strong className="text-slate-400">Example: </strong>{c.ex}</p>
                </div>
                <div className="mt-3 p-2 rounded-xl bg-slate-950/70 text-[11px] text-cyan-200">
                  <strong>Recommend if: </strong>{c.when}
                </div>
              </div>
            ))}
          </div>

          {/* 5-Second Takeaway Rule */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-blue-950/40 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm text-cyan-200 font-medium">
            <div>
              <strong className="text-white block mb-0.5">Quick Decision Rule:</strong>
              {slide.takeaway}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                onClick={() => setShowWizardModal(true)}
                size="sm"
                className="bg-cyan-500 text-slate-950 font-bold text-xs rounded-full px-3"
              >
                Launch Wizard
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 11. DEEP DIVE: STATIC WEBSITES */}
      {slide.type === "static-deep-dive" && (
        <div className="max-w-5xl w-full mx-auto text-left">
          <SectionTitle
            tag="Module 2 • Static Websites"
            title={slide.title}
            subtitle={slide.subtitle}
          />
          <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-500/30 mb-5">
            <span className="text-xs font-bold text-blue-400 block mb-1">{slide.headline}</span>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">{slide.definition}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            {slide.benefits.map((b, i) => (
              <div key={i} className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all">
                <div className="flex items-center gap-2 mb-2 text-blue-400">
                  <b.icon size={18} />
                  <h4 className="text-sm sm:text-base font-bold text-white">{b.title}</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 to-slate-900 border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-slate-200 italic">
              "{slide.clientPitch}"
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <AudioSpeechButton text={slide.clientPitch} />
              <CopyScriptButton text={slide.clientPitch} />
            </div>
          </div>
        </div>
      )}

      {/* 12. DEEP DIVE: DYNAMIC WEBSITES & CMS */}
      {slide.type === "dynamic-deep-dive" && (
        <div className="max-w-5xl w-full mx-auto text-left">
          <SectionTitle
            tag="Module 2 • Dynamic Websites & CMS"
            title={slide.title}
            subtitle={slide.subtitle}
          />
          <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 mb-5">
            <span className="text-xs font-bold text-cyan-400 block mb-1">{slide.headline}</span>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">{slide.definition}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            {slide.keyCapabilities.map((cap, i) => (
              <div key={i} className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-all">
                <div className="flex items-center gap-2 mb-2 text-cyan-400">
                  <cap.icon size={18} />
                  <h4 className="text-sm sm:text-base font-bold text-white">{cap.title}</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{cap.desc}</p>
              </div>
            ))}
          </div>
          <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-slate-900 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-slate-200 italic">
              "{slide.clientPitch}"
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <AudioSpeechButton text={slide.clientPitch} />
              <CopyScriptButton text={slide.clientPitch} />
            </div>
          </div>
        </div>
      )}

      {/* 13. DEEP DIVE: E-COMMERCE WEBSITES */}
      {slide.type === "ecomm-deep-dive" && (
        <div className="max-w-5xl w-full mx-auto text-left">
          <SectionTitle
            tag="Module 2 • E-Commerce Websites"
            title={slide.title}
            subtitle={slide.subtitle}
          />
          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 mb-5 text-xs sm:text-sm text-emerald-200 font-medium">
            {slide.definition}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
            {slide.anatomy.map((item, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all flex flex-col justify-between">
                <div>
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit mb-2.5">
                    <item.icon size={20} />
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-white mb-2">{item.component}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-cyan-300 mb-5">
            <strong className="text-cyan-400 block mb-0.5">CrystalAura Advantage:</strong>
            {slide.crystalAuraNote}
          </div>
          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-slate-200 italic">
              "{slide.salesPitch}"
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <AudioSpeechButton text={slide.salesPitch} />
              <CopyScriptButton text={slide.salesPitch} />
            </div>
          </div>
        </div>
      )}

      {/* 14. DEEP DIVE: CUSTOM WEB APPS & PORTALS */}
      {slide.type === "custom-portal-deep-dive" && (
        <div className="max-w-5xl w-full mx-auto text-left">
          <SectionTitle
            tag="Module 2 • Custom Web Apps"
            title={slide.title}
            subtitle={slide.subtitle}
          />
          <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 mb-5 text-xs sm:text-sm text-purple-200 font-medium">
            {slide.definition}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            {slide.features.map((feat, i) => (
              <div key={i} className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all">
                <div className="flex items-center gap-2 mb-2 text-purple-400">
                  <feat.icon size={18} />
                  <h4 className="text-sm sm:text-base font-bold text-white">{feat.title}</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 to-slate-900 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-slate-200 italic">
              "{slide.salesPitch}"
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <AudioSpeechButton text={slide.salesPitch} />
              <CopyScriptButton text={slide.salesPitch} />
            </div>
          </div>
        </div>
      )}

      {/* 15. LANDING PAGES VS MULTI-PAGE WEBSITES */}
      {slide.type === "landing-vs-website" && (
        <div className="max-w-5xl w-full mx-auto text-left">
          <SectionTitle
            tag="Module 2 • Conversion Strategy"
            title={slide.title}
            subtitle={slide.subtitle}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
            {slide.comparison.map((item, i) => (
              <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2 text-cyan-400">
                    <item.icon size={20} />
                    <h4 className="text-base font-bold text-white">{item.type}</h4>
                  </div>
                  <span className="text-xs font-semibold text-cyan-300 block mb-3">Analogy: {item.analogy}</span>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4">{item.purpose}</p>
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-white/5 text-[11px] mb-3">
                    <strong className="text-slate-400">Best For: </strong>{item.bestFor}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-[11px] text-cyan-200 font-bold">
                  {item.conversionRate}
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-slate-900 border border-cyan-500/30 text-xs sm:text-sm text-slate-200 font-medium">
            <strong className="text-cyan-400 block mb-0.5">The Decision Rule:</strong>
            {slide.goldenRule}
          </div>
        </div>
      )}

      {/* 16. WHAT IS WEB DEVELOPMENT? (FRONTEND, BACKEND & FULLSTACK) */}
      {slide.type === "mod2-fullstack" && (
        <div className="max-w-5xl w-full mx-auto text-left">
          <SectionTitle
            tag="Module 2 • Web Development"
            title={slide.title}
            subtitle={slide.subtitle}
          />

          <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 mb-5 text-xs sm:text-sm text-cyan-200 font-medium">
            {slide.definition}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {slide.tiers.map((t, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-all flex flex-col justify-between">
                <div>
                  <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 w-fit mb-3">
                    <t.icon size={20} />
                  </div>
                  <h4 className="text-base font-bold text-white mb-1">{t.tier}</h4>
                  <span className="text-xs font-semibold text-cyan-300 block mb-2">{t.analogy}</span>
                  <p className="text-xs text-slate-300 leading-relaxed">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-slate-900 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-slate-200 italic">
              {slide.pitchTip}
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <AudioSpeechButton text={slide.pitchTip} />
              <CopyScriptButton text={slide.pitchTip} />
            </div>
          </div>
        </div>
      )}

      {/* 17. WEB PERFORMANCE & SEO */}
      {slide.type === "web-performance-seo" && (
        <div className="max-w-5xl w-full mx-auto text-left">
          <SectionTitle
            tag="Module 2 • Performance & SEO"
            title={slide.title}
            subtitle={slide.subtitle}
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-5">
            {slide.stats.map((s, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                <span className="text-2xl sm:text-3xl font-black text-cyan-400 block mb-0.5">{s.num}</span>
                <span className="text-xs font-bold text-white block mb-1">{s.label}</span>
                <span className="text-[11px] text-slate-400">{s.desc}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            {slide.pillars.map((p, i) => (
              <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-all">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 w-fit mb-3">
                  <p.icon size={20} />
                </div>
                <h4 className="text-base font-bold text-white mb-2">{p.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
          <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-slate-900 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-slate-200 italic">
              {slide.clientPitch}
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <AudioSpeechButton text={slide.clientPitch} />
              <CopyScriptButton text={slide.clientPitch} />
            </div>
          </div>
        </div>
      )}

      {/* 18. WHAT IS A MOBILE APP? (DEFINITION & DIFFERENCE) */}
      {slide.type === "what-is-app" && (
        <div className="max-w-5xl w-full mx-auto text-left">
          <SectionTitle
            tag="Core Definition"
            title={slide.title}
            subtitle={slide.subtitle}
          />

          {/* Definition Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-cyan-950/40 border border-cyan-500/30 mb-5 shadow-xl">
            <span className="text-xs font-bold text-cyan-400 block mb-1">
              {slide.inOneSentence.headline}
            </span>
            <p className="text-sm sm:text-base text-slate-200 font-medium leading-relaxed italic">
              "{slide.inOneSentence.definition}"
            </p>
          </div>

          {/* The 15-Second Pitch Box with Audio & Copy */}
          {slide.pitch15Sec && (
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 mb-5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-emerald-400 block">
                  {slide.pitch15Sec.label}
                </span>
                <div className="flex items-center gap-2">
                  <AudioSpeechButton text={slide.pitch15Sec.script} />
                  <CopyScriptButton text={slide.pitch15Sec.script} />
                </div>
              </div>
              <p className="text-xs sm:text-sm text-emerald-200 leading-relaxed font-medium italic">
                "{slide.pitch15Sec.script}"
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            {slide.keyDifferences.map((item, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2 text-cyan-400">
                    <item.icon size={18} />
                    <h4 className="text-sm sm:text-base font-bold text-white">{item.aspect}</h4>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <p><strong className="text-slate-400">Website: </strong><span className="text-slate-300">{item.website}</span></p>
                    <p><strong className="text-emerald-400">Mobile App: </strong><span className="text-slate-200">{item.mobileApp}</span></p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm text-emerald-200 font-semibold italic">
            <p>"{slide.goldenRule}"</p>
            <div className="shrink-0">
              <CopyScriptButton text={slide.goldenRule} label="Copy Rule" />
            </div>
          </div>
        </div>
      )}

      {/* 19. WEBSITE VS MOBILE APP: DECISION RULE */}
      {slide.type === "when-need-app" && (
        <div className="max-w-5xl w-full mx-auto text-left">
          <SectionTitle
            tag="Module 3 • App Decision Rule"
            title={slide.title}
            subtitle={slide.subtitle}
          />
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-blue-950/40 border border-cyan-500/30 mb-5 shadow-xl">
            <span className="text-xs font-bold text-cyan-400 block mb-1">{slide.thresholdRule.headline}</span>
            <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed italic">"{slide.thresholdRule.text}"</p>
          </div>
          <div className="space-y-3 mb-5">
            {slide.scenarios.map((sc, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">{sc.client}</h4>
                  <p className="text-xs text-slate-300"><strong className="text-slate-400">Why: </strong>{sc.reason}</p>
                  <span className="text-xs font-semibold text-emerald-400 block">{sc.verdict}</span>
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 shrink-0 w-fit">
                  {sc.recommendation}
                </span>
              </div>
            ))}
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-slate-300">
            <strong className="text-amber-400 block mb-0.5">Consultative Selling Tip:</strong>
            {slide.salesIntegrity}
          </div>
        </div>
      )}

      {/* 20. HOW MANY TYPES OF MOBILE APPS ARE THERE? */}
      {slide.type === "types-of-apps" && (
        <div className="max-w-5xl w-full mx-auto text-left">
          <SectionTitle
            tag="App Frameworks"
            title={slide.title}
            subtitle={slide.subtitle}
          />

          <div className="space-y-3.5 mb-6">
            {slide.appTypes.map((item, i) => (
              <div
                key={i}
                className={cn(
                  "p-5 rounded-2xl border transition-all",
                  item.highlight
                    ? "bg-cyan-950/40 border-cyan-500 shadow-xl shadow-cyan-500/10 ring-1 ring-cyan-500/30"
                    : "bg-white/5 border-white/10"
                )}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1.5 gap-1">
                  <h4 className="text-base font-bold text-white">{item.name}</h4>
                  <span className={cn("text-xs font-mono font-bold px-2.5 py-0.5 rounded-full w-fit", item.highlight ? "bg-cyan-500 text-slate-950" : "bg-white/10 text-slate-400")}>
                    {item.approach}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-2">{item.problem}</p>
                <span className="text-xs font-bold text-cyan-300 block">{item.verdict}</span>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-slate-900 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-slate-200 italic">
              "{slide.pitchQuote}"
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <AudioSpeechButton text={slide.pitchQuote} />
              <CopyScriptButton text={slide.pitchQuote} />
            </div>
          </div>
        </div>
      )}

      {/* 21. THE DEVLOMATIX MOBILE ADVANTAGE */}
      {slide.type === "mobile-advantage" && (
        <div className="max-w-5xl w-full mx-auto text-left">
          <SectionTitle
            tag="Module 3 • Mobile Engineering Advantage"
            title={slide.title}
            subtitle={slide.subtitle}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            {slide.pillars.map((p, i) => (
              <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2 text-cyan-400">
                    <p.icon size={18} />
                    <h4 className="text-base font-bold text-white">{p.title}</h4>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-slate-900 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-slate-200 italic">
              {slide.salesScript}
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <AudioSpeechButton text={slide.salesScript} />
              <CopyScriptButton text={slide.salesScript} />
            </div>
          </div>
        </div>
      )}

      {/* 22. MOBILE TESTING & STORE PUBLISHING */}
      {slide.type === "app-publishing" && (
        <div className="max-w-5xl w-full mx-auto text-left">
          <SectionTitle
            tag="Testing & Publishing"
            title={slide.title}
            subtitle={slide.subtitle}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {slide.steps.map((item, i) => (
              <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all flex flex-col justify-between">
                <div>
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit mb-3">
                    <item.icon size={20} />
                  </div>
                  <h4 className="text-base font-bold text-white mb-2">{item.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-slate-200 italic">
              {slide.salesValueProp}
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <AudioSpeechButton text={slide.salesValueProp} />
              <CopyScriptButton text={slide.salesValueProp} />
            </div>
          </div>
        </div>
      )}

      {/* 23. WHAT IS ARTIFICIAL INTELLIGENCE (AI)? */}
      {slide.type === "what-is-ai" && (
        <div className="max-w-5xl w-full mx-auto text-left">
          <SectionTitle
            tag="AI Explained Simply"
            title={slide.title}
            subtitle={slide.subtitle}
          />

          <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-purple-400 block mb-1">{slide.headline}</span>
              <p className="text-sm sm:text-base font-medium text-slate-200 italic">{slide.quote}</p>
            </div>
            <div className="shrink-0">
              <CopyScriptButton text={slide.quote} label="Copy Definition" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {slide.aiTools.map((tool, i) => (
              <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="text-base font-bold text-white">{tool.title}</h4>
                    <tool.icon size={18} className="text-purple-400" />
                  </div>
                  <span className="text-[11px] text-purple-300 block mb-2 font-semibold">
                    Benefit: {tool.analogy}
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">{tool.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 24. AI CHATBOTS VS DUMB KEYWORD BOTS */}
      {slide.type === "ai-chatbots-vs-rules" && (
        <div className="max-w-5xl w-full mx-auto text-left">
          <SectionTitle
            tag="Module 4 • Conversational AI"
            title={slide.title}
            subtitle={slide.subtitle}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
            {slide.comparison.map((item, i) => (
              <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2 text-purple-400">
                    <item.icon size={20} />
                    <h4 className="text-base font-bold text-white">{item.type}</h4>
                  </div>
                  <span className="text-xs font-semibold text-purple-300 block mb-3">Customer Feel: {item.experience}</span>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4">{item.howItWorks}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/5 text-[11px] text-slate-200">
                  <strong>Outcome: </strong>{item.customerReaction}
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 text-xs sm:text-sm text-purple-200 leading-relaxed">
            {slide.businessValue}
          </div>
        </div>
      )}

      {/* 25. WHAT IS AUTOMATION & WORKFLOW ENGINES? */}
      {slide.type === "what-is-automation" && (
        <div className="max-w-5xl w-full mx-auto text-left">
          <SectionTitle
            tag="Automations Explained"
            title={slide.title}
            subtitle={slide.subtitle}
          />

          <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 mb-6">
            <span className="text-xs font-bold text-cyan-300 block mb-1">{slide.inOneSentence.headline}</span>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic">"{slide.inOneSentence.definition}"</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {slide.steps.map((st, i) => (
              <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="h-7 w-7 rounded-full bg-cyan-500/20 text-cyan-400 text-xs flex items-center justify-center font-black">
                      {st.step}
                    </span>
                    <st.icon size={18} className="text-cyan-400" />
                  </div>
                  <h4 className="text-base font-bold text-white mb-1.5">{st.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{st.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-slate-200 italic">
              {slide.pitchSnippet}
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <AudioSpeechButton text={slide.pitchSnippet} />
              <CopyScriptButton text={slide.pitchSnippet} />
            </div>
          </div>
        </div>
      )}

      {/* 26. INTELLIGENT AI AGENTS */}
      {slide.type === "ai-agents" && (
        <div className="max-w-5xl w-full mx-auto text-left">
          <SectionTitle
            tag="Module 4 • Autonomous Agents"
            title={slide.title}
            subtitle={slide.subtitle}
          />
          <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 mb-5 text-xs sm:text-sm text-purple-200 font-medium">
            {slide.definition}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            {slide.agentExamples.map((ag, i) => (
              <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all flex flex-col justify-between">
                <div>
                  <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 w-fit mb-3">
                    <ag.icon size={20} />
                  </div>
                  <h4 className="text-base font-bold text-white mb-2">{ag.role}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{ag.task}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 to-slate-900 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-slate-200 italic">
              {slide.salesPunchline}
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <AudioSpeechButton text={slide.salesPunchline} />
              <CopyScriptButton text={slide.salesPunchline} />
            </div>
          </div>
        </div>
      )}

      {/* 27. THE DEVLOMATIX PRODUCT SUITE */}
      {slide.type === "product-suite" && (
        <div className="max-w-6xl w-full mx-auto text-left">
          <SectionTitle
            tag="Ready-to-Deploy Products"
            title={slide.title}
            subtitle={slide.subtitle}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {slide.products.map((p, i) => (
              <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/40 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-bold text-white">{p.name}</h4>
                    <Boxes size={18} className="text-cyan-400" />
                  </div>
                  <span className="text-xs font-semibold text-cyan-400 block mb-2">{p.tag}</span>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4">{p.pitch}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/5 text-[11px]">
                  <strong className="text-slate-400 block mb-0.5">Ideal Client:</strong>
                  <span className="text-slate-300">{p.whoBuys}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 28. THE BUSINESS MATH & LIVE ROI CALCULATOR */}
      {slide.type === "roi-math" && (
        <div className="max-w-6xl w-full mx-auto text-left space-y-6">
          <SectionTitle
            tag="Value & Economics"
            title={slide.title}
            subtitle={slide.subtitle}
          />

          {/* Embedded Live Interactive Calculator */}
          <RoiCalculatorWidget onOpenContact={() => setIsContactOpen(true)} />

          {/* Reference Calculations */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Core Reference Calculations:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {slide.calculations.map((calc, i) => (
                <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-all">
                  <h4 className="text-sm font-bold text-white mb-1.5 flex items-center gap-2">
                    <Calculator size={15} className="text-cyan-400" />
                    {calc.title}
                  </h4>
                  <div className="p-2 rounded-xl bg-slate-950/80 border border-white/5 text-[11px] text-amber-300 font-mono mb-2">
                    {calc.math}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {calc.insight}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 29. THE 5-MINUTE DISCOVERY CALL */}
      {slide.type === "mod5-discovery" && (
        <div className="max-w-5xl w-full mx-auto text-left">
          <SectionTitle
            tag="Module 5 • Discovery"
            title={slide.title}
            subtitle={slide.subtitle}
          />

          <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 mb-5 flex items-center justify-between">
            <p className="text-xs sm:text-sm text-cyan-300 font-semibold">{slide.goldenRule}</p>
            <Button
              onClick={() => setShowWizardModal(true)}
              size="sm"
              className="bg-purple-600 hover:bg-purple-500 text-white rounded-full text-xs font-bold px-3 shrink-0 ml-2"
            >
              <Sparkles size={13} className="mr-1" /> Matchmaker
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {slide.discoveryQuestions.map((item, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-cyan-400 block mb-1">
                    QUESTION {i + 1}
                  </span>
                  <h5 className="text-sm font-bold text-white mb-2 leading-snug">{item.q}</h5>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-white/5 text-[11px] text-slate-300">
                  <strong className="text-cyan-300 block mb-0.5">Why You Ask This:</strong>
                  <span>{item.why}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-white/10">
            <span className="text-xs font-bold text-slate-300 block mb-2">Instant Recommendation Guide:</span>
            <div className="space-y-2">
              {slide.solutionCheatSheet.map((map, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between text-xs p-2 rounded-lg bg-white/5 gap-1">
                  <span className="text-slate-300 font-medium">When client says: "{map.clientNeed}"</span>
                  <span className="text-cyan-400 font-bold">→ Recommend: {map.recommend}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 30. SOLUTION MAPPING BY INDUSTRY */}
      {slide.type === "mod5-industry" && (
        <div className="max-w-5xl w-full mx-auto text-left">
          <SectionTitle
            tag="Module 5 • Industry Solutions"
            title={slide.title}
            subtitle={slide.subtitle}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {slide.industries.map((ind, i) => (
              <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <ind.icon size={18} className="text-cyan-400" />
                    <h4 className="text-base font-bold text-white">{ind.industry}</h4>
                  </div>
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-200 mb-3">
                    <strong>Their Pain Point: </strong> {ind.pain}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs">
                  <strong className="text-emerald-400 block mb-0.5">What to Pitch:</strong>
                  <span className="text-slate-200">{ind.pitch}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 31. PRICING PACKAGES & PROPOSALS */}
      {slide.type === "mod5-packages" && (
        <div className="max-w-6xl w-full mx-auto text-left">
          <SectionTitle
            tag="Module 5 • Proposals"
            title={slide.title}
            subtitle={slide.subtitle}
          />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
            {slide.packages.map((pkg, i) => (
              <div
                key={i}
                className={cn(
                  "bg-white/5 backdrop-blur-3xl p-6 rounded-3xl border-t-[6px] flex flex-col justify-between transition-all",
                  pkg.popular
                    ? "border-cyan-500 shadow-[0_15px_60px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/30 bg-white/[0.08]"
                    : "border-slate-800 border-white/10"
                )}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-white">{pkg.name}</h3>
                    {pkg.popular && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500 text-slate-950">
                        {pkg.tag}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-slate-400 block mb-4">{pkg.target}</span>

                  <ul className="space-y-2.5 mb-6 text-xs sm:text-sm text-slate-300">
                    {pkg.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/5 text-xs">
                  <span className="font-bold text-cyan-400 block mb-0.5">When to Propose:</span>
                  <span className="text-slate-400">{pkg.idealDeal}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 32. HANDLING TOUGH OBJECTIONS */}
      {slide.type === "mod5-proposals" && (
        <div className="max-w-5xl w-full mx-auto text-left">
          <SectionTitle
            tag="Module 5 • Objection Handling"
            title={slide.title}
            subtitle={slide.subtitle}
          />

          <div className="space-y-3 mb-6">
            {slide.objections.map((ob, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between text-rose-400 font-bold text-xs sm:text-sm mb-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>Client Doubt: {ob.obj}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <AudioSpeechButton text={ob.rebuttal} label="Audio" />
                    <CopyScriptButton text={ob.rebuttal} label="Copy Rebuttal" />
                  </div>
                </div>
                <div className="flex items-start gap-2 text-slate-200 text-xs sm:text-sm leading-relaxed pl-5">
                  <span className="text-emerald-400 font-black shrink-0">→</span>
                  <span>{ob.rebuttal}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-slate-900 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-cyan-400 block mb-1">{slide.demoTip.title}</span>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic">
                "{slide.demoTip.text}"
              </p>
            </div>
            <div className="shrink-0">
              <CopyScriptButton text={slide.demoTip.text} label="Copy Demo Tip" />
            </div>
          </div>
        </div>
      )}

      {/* 33. REAL CLIENT SUCCESS STORIES */}
      {slide.type === "mod6-case-studies" && (
        <div className="max-w-6xl w-full mx-auto text-left">
          <SectionTitle
            tag="Module 6 • Case Studies"
            title={slide.title}
            subtitle={slide.subtitle}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {slide.cases.map((cs, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-xl p-5 rounded-2xl border border-white/10 hover:border-cyan-500/30 transition-all flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white mb-2 leading-tight">{cs.client}</h4>
                  <div className="space-y-2 text-xs mb-4">
                    <p><strong className="text-rose-400">The Problem:</strong> <span className="text-slate-300">{cs.problem}</span></p>
                    <p><strong className="text-cyan-400">Our Solution:</strong> <span className="text-slate-300">{cs.solution}</span></p>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs">
                  <strong className="text-emerald-400 block mb-0.5">The Real Result:</strong>
                  <span className="text-slate-200 text-[11px]">{cs.result}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 34. ROLE-PLAY PRACTICE DRILLS */}
      {slide.type === "mod6-roleplay" && (
        <div className="max-w-5xl w-full mx-auto text-left">
          <SectionTitle
            tag="Module 6 • Role-Play Drills"
            title={slide.title}
            subtitle={slide.subtitle}
          />

          <div className="space-y-4">
            {slide.roleplays.map((rp, i) => (
              <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <PlayCircle size={18} className="text-cyan-400" />
                  <h4 className="text-base font-bold text-white">{rp.title}</h4>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5 text-xs text-slate-200 mb-2 italic">
                  "{rp.persona}"
                </div>
                <p className="text-xs text-slate-300">
                  <strong className="text-cyan-400">Your Goal in the Conversation: </strong>
                  {rp.yourGoal}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 35. COMMON CLIENT TRAPS */}
      {slide.type === "mod6-client-traps" && (
        <div className="max-w-5xl w-full mx-auto text-left">
          <SectionTitle
            tag="Module 6 • Client Traps"
            title={slide.title}
            subtitle={slide.subtitle}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {slide.traps.map((item, i) => (
              <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-rose-500/30 transition-all flex flex-col justify-between">
                <div>
                  <h4 className="text-base font-bold text-rose-400 mb-2 flex items-center gap-2">
                    <AlertCircle size={18} className="shrink-0" />
                    {item.trap}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    {item.desc}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs">
                  <strong className="text-cyan-400 block mb-0.5">How You Position Devlomatix:</strong>
                  <span className="text-slate-200">{item.ourPitch}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 36. THE SUMMARY CHEAT SHEET */}
      {slide.type === "cheat-sheet" && (
        <div className="max-w-5xl w-full mx-auto text-left">
          <div className="flex items-center justify-between mb-4">
            <SectionTitle
              tag="1-Page Reference"
              title={slide.title}
              subtitle={slide.subtitle}
              centered={false}
            />
            <Button
              onClick={() => setShowPrintModal(true)}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-full text-xs font-bold px-4 flex items-center gap-1.5 shrink-0"
            >
              <Printer size={14} /> Print Desk Sheet
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {slide.definitions.map((item, i) => (
              <div key={i} className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-all flex flex-col justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-cyan-400 block mb-1">
                    {item.term}
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed">{item.meaning}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 37. CAN YOU ANSWER THESE 8 GOLDEN QUESTIONS? + READINESS SCORECARD */}
      {slide.type === "golden-questions" && (
        <div className="max-w-6xl w-full mx-auto text-left">
          <SectionTitle
            tag="Verbal Mastery Drill"
            title={slide.title}
            subtitle={slide.subtitle}
          />

          {/* Interactive Verbal Readiness Scorecard Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-blue-950/40 border border-cyan-500/30 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Award className="h-5 w-5 text-amber-400" />
                <span className="text-sm font-bold text-white">Sales Executive Verbal Readiness Scorecard</span>
              </div>
              <p className="text-xs text-slate-300">
                Self-test your spoken mastery. Practice answering each client question without looking at the text.
              </p>
            </div>
            <div className="flex items-center gap-4 bg-slate-950/60 p-2.5 rounded-xl border border-white/5 shrink-0">
              <div className="text-right">
                <span className="text-base font-black font-mono text-cyan-300">{masteredCount}/8 Mastered</span>
                <span className="text-[10px] text-slate-400 block font-mono">
                  {masteredPct === 100 ? "🎉 100% Certified Field-Ready!" : `${masteredPct}% Field-Ready`}
                </span>
              </div>
              <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-300",
                    masteredPct === 100 ? "bg-emerald-400" : "bg-cyan-400"
                  )}
                  style={{ width: `${masteredPct}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {slide.questions.map((q, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/40 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-black text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10">
                        Q{q.num}
                      </span>
                      <h4 className="text-sm sm:text-base font-bold text-white">{q.q}</h4>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <AudioSpeechButton text={q.whatYouSay} label="Audio" />
                      <CopyScriptButton text={q.whatYouSay} label="Copy" />
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-white/5 text-xs text-amber-300/90 italic mb-3">
                    "{q.clientAsks}"
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-xs sm:text-sm text-emerald-200 leading-relaxed mb-3">
                    <strong className="text-emerald-400 block text-[11px] uppercase tracking-wider mb-1">What You Say:</strong>
                    "{q.whatYouSay}"
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="p-2 rounded-lg bg-slate-950/80 border border-white/5 text-[11px] text-slate-300 font-medium">
                    {q.rule}
                  </div>

                  {/* Verbal Mastery Toggles */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <span className="text-[10px] text-slate-400 font-mono">My Verbal Confidence:</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleToggleMastery(q.num, 'need-practice')}
                        className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold border transition-all",
                          masteryStatus[q.num] === 'need-practice'
                            ? "bg-amber-500/20 text-amber-300 border-amber-500"
                            : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                        )}
                      >
                        ⚠️ Practice
                      </button>
                      <button
                        onClick={() => handleToggleMastery(q.num, 'mastered')}
                        className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold border transition-all",
                          masteryStatus[q.num] === 'mastered'
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                            : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                        )}
                      >
                        ✅ Mastered
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 38. INTERACTIVE KNOWLEDGE QUIZ */}
      {slide.type === "mod6-quiz" && (
        <div className="max-w-5xl w-full mx-auto text-left">
          <SectionTitle
            tag="Final Evaluation"
            title={slide.title}
            subtitle={slide.subtitle}
          />

          <div className="space-y-4 mb-6">
            {slide.quizzes.map((quiz, qIdx) => {
              const selectedOpt = selectedQuizAnswers[qIdx];
              const isAnswered = selectedOpt !== undefined;
              const isCorrect = selectedOpt === quiz.correct;

              return (
                <div key={qIdx} className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10">
                  <h4 className="text-xs sm:text-sm font-bold text-white mb-3">
                    {quiz.q}
                  </h4>

                  <div className="space-y-2 mb-3">
                    {quiz.options.map((opt, oIdx) => {
                      const isSelected = selectedOpt === oIdx;
                      return (
                        <button
                          key={oIdx}
                          onClick={() => {
                            if (!isAnswered) {
                              setSelectedQuizAnswers((prev) => ({ ...prev, [qIdx]: oIdx }));
                            }
                          }}
                          className={cn(
                            "w-full text-left p-2.5 rounded-xl text-xs transition-all border",
                            isAnswered
                              ? isCorrect
                                ? "bg-emerald-950/50 border-emerald-500 text-emerald-200"
                                : isSelected
                                ? "bg-rose-950/50 border-rose-500 text-rose-200"
                                : "bg-slate-900/40 border-white/5 text-slate-400 opacity-60"
                              : "bg-slate-900/60 border-white/5 hover:border-cyan-500/40 text-slate-300"
                          )}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {isAnswered && (
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-[11px] text-cyan-300">
                      <strong>Why this is correct: </strong> {quiz.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="text-center pt-4 border-t border-white/10">
            <Button
              onClick={() => setIsContactOpen(true)}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 px-8 py-5 md:px-12 md:py-6 text-base md:text-xl font-black rounded-2xl shadow-[0_15px_40px_rgba(6,182,212,0.4)] flex items-center gap-3 mx-auto transition-all hover:scale-105 active:scale-95 group"
            >
              <span>Practice Pitch / Book Live Consultation</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform shrink-0" />
            </Button>
          </div>
        </div>
      )}

      {/* 39. FINAL GRADUATION & CALL TO ACTION */}
      {slide.type === "closing" && (
        <div className="text-center max-w-4xl w-full mx-auto py-2 md:py-6">
          <SectionTitle
            tag="Training Complete"
            title={slide.title}
            subtitle={slide.subtitle}
          />

          <div className="my-6">
            <Button
              onClick={() => setIsContactOpen(true)}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 px-8 py-5 md:px-12 md:py-6 text-base md:text-xl font-black rounded-2xl shadow-[0_15px_40px_rgba(6,182,212,0.4)] flex items-center gap-3 mx-auto transition-all hover:scale-105 active:scale-95 group"
            >
              <span>{slide.cta}</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform shrink-0" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto mb-8">
            {slide.guarantees.map((g, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-center">
                <span className="text-xs font-bold text-cyan-300 block mb-0.5">{g.label}</span>
                <span className="text-[11px] text-slate-400">{g.desc}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-slate-500 font-black uppercase tracking-[0.2em] text-[10px] md:text-xs">
            <span className="flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-amber-500" /> Listen First
            </span>
            <span className="flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" /> Explain Simply
            </span>
            <span className="flex items-center gap-2">
              <Briefcase className="h-3.5 w-3.5 text-cyan-500" /> Win Together
            </span>
          </div>
        </div>
      )}

      {/* Presenter Notes Drawer (P) */}
      <PresenterNotesDrawer
        isOpen={showNotesDrawer}
        onClose={() => setShowNotesDrawer(false)}
        currentSlide={currentSlide}
        totalSlides={activeSlides.length}
        slide={slide}
      />

      {/* Solution Matchmaker Wizard Modal */}
      <SolutionWizardModal
        isOpen={showWizardModal}
        onClose={() => setShowWizardModal(false)}
        onOpenContact={() => setIsContactOpen(true)}
      />

      {/* Print 1-Page Cheat Sheet Modal */}
      <PrintCheatSheetModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
      />

      {/* Standalone Live ROI Calculator Modal */}
      {showRoiModal && (
        <div className="fixed inset-0 z-50 bg-[#020617]/95 backdrop-blur-2xl p-4 sm:p-8 overflow-y-auto flex items-center justify-center animate-in fade-in duration-200">
          <div className="max-w-4xl w-full relative">
            <div className="flex justify-end mb-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowRoiModal(false)}
                className="h-8 w-8 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20"
              >
                <X size={16} />
              </Button>
            </div>
            <RoiCalculatorWidget onOpenContact={() => {
              setShowRoiModal(false);
              setIsContactOpen(true);
            }} />
          </div>
        </div>
      )}

      {/* Enhanced Grid Overview Modal with Search & Module Filters */}
      {showGridModal && (
        <div className="fixed inset-0 z-50 bg-[#020617]/95 backdrop-blur-2xl p-4 sm:p-8 overflow-y-auto flex flex-col justify-between animate-in fade-in duration-200">
          <div className="max-w-6xl w-full mx-auto">
            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 mb-5 gap-3">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white">Full Curriculum Slide Index ({slides.length} Slides)</h3>
                <p className="text-xs text-slate-400 mt-0.5">Jump directly to any module, topic, or sales tool</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowGridModal(false)}
                  className="h-8 w-8 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-white"
                >
                  <X size={16} />
                </Button>
              </div>
            </div>

            {/* Search Input & Module Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div className="relative flex-1 max-w-md">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={gridSearchQuery}
                  onChange={(e) => setGridSearchQuery(e.target.value)}
                  placeholder="Search slides by title, topic, or keyword..."
                  className="w-full bg-slate-900 border border-white/10 rounded-full pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                />
                {gridSearchQuery && (
                  <button onClick={() => setGridSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs">
                    ✕
                  </button>
                )}
              </div>

              {/* Module Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
                {['ALL', 'Module 1', 'Module 2', 'Module 3', 'Module 4', 'Module 5', 'Module 6'].map((mod) => (
                  <button
                    key={mod}
                    onClick={() => setGridModuleFilter(mod)}
                    className={cn(
                      "px-2.5 py-1 rounded-full text-[10px] font-bold transition-all shrink-0 border",
                      gridModuleFilter === mod
                        ? "bg-cyan-500 text-slate-950 border-cyan-400"
                        : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
                    )}
                  >
                    {mod === 'ALL' ? 'All (39)' : mod}
                  </button>
                ))}
              </div>
            </div>

            {/* Slides Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
              {filteredSlides.map((s) => {
                const actualIndex = activeSlides.findIndex((item) => item.id === s.id);
                const isSelected = actualIndex === currentSlide;

                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      if (actualIndex !== -1) {
                        setCurrentSlide(actualIndex);
                      } else {
                        // If in express mode and clicked slide is not in express set, switch to full mode
                        setIsExpressMode(false);
                        const fullIdx = slides.findIndex((item) => item.id === s.id);
                        setCurrentSlide(fullIdx !== -1 ? fullIdx : 0);
                      }
                      setShowGridModal(false);
                    }}
                    className={cn(
                      "p-3 rounded-2xl border text-left transition-all duration-200 space-y-1 group flex flex-col justify-between h-28",
                      isSelected
                        ? "bg-cyan-950/40 border-cyan-500 shadow-xl shadow-cyan-500/10 ring-2 ring-cyan-500/30"
                        : "bg-white/5 border-white/10 hover:border-slate-700 hover:bg-white/10"
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[10px] font-mono font-black text-slate-500 group-hover:text-cyan-400">
                        {String(s.id).padStart(2, '0')}
                      </span>
                      <span className="text-[9px] uppercase font-bold text-cyan-400/80 px-1.5 py-0.5 rounded bg-cyan-500/10 truncate max-w-[100px]">
                        {s.meta?.module || s.type}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white line-clamp-2">
                      {s.title}
                    </h4>

                    <span className="text-[10px] text-slate-400 truncate w-full">
                      {s.meta?.category || s.subtitle}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Contact Inquiry Modal */}
      <ContactDialog
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />
    </PresentationLayout>
  );
}
