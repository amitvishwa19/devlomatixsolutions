'use client'
import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import HeroSlide from "./slides/HeroSlide";
import ProblemSlide from "./slides/ProblemSlide";
import SolutionSlide from "./slides/SolutionSlide";
import ModulesSlide from "./slides/ModulesSlide";
import FeaturesSlide from "./slides/FeaturesSlide";
import OPDSlide from "./slides/OPDSlide";
import IPDSlide from "./slides/IPDSlide";
import EMRSlide from "./slides/EMRSlide";
import LaboratorySlide from "./slides/LaboratorySlide";
import PharmacySlide from "./slides/PharmacySlide";
import BillingSlide from "./slides/BillingSlide";
import ReportsSlide from "./slides/ReportsSlide";
import AnalyticsDashboardSlide from "./slides/AnalyticsDashboardSlide";
import AISlide from "./slides/AISlide";
import BenefitsSlide from "./slides/BenefitsSlide";
import TechnologySlide from "./slides/TechnologySlide";
import IntegrationsSlide from "./slides/IntegrationsSlide";
import VideoSlide from "./slides/VideoSlide";
import TestimonialsSlide from "./slides/TestimonialsSlide";
import PricingSlide from "./slides/PricingSlide";
import ImplementationSlide from "./slides/ImplementationSlide";
import CTASlide from "./slides/CTASlide";
import ContactSlide from "./slides/ContactSlide";
import { useSwipeNavigation } from "./hooks/useSwipeNavigation";
import ThemeSwitcher from "@/components/global/ThemeSwitch";
import ProgressBar from "./ProgressBar";
import ExportButton from "./ExportButton";
import DemoButton from "./DemoButton";
import PresenterNotes from "./PresenterNotes";
import InteractiveDemo from "./InteractiveDemo";
import SlideThumbnails from "./SlideThumbnails";
import SlideWrapper from "./SlideWrapper";
import SlideNavigation from "./SlideNavigation";
import "../deck/deck.css";


const slides = [
    { id: 1, component: HeroSlide, name: "Welcome" },
    { id: 2, component: ProblemSlide, name: "The Challenge" },
    { id: 3, component: SolutionSlide, name: "Our Solution" },
    { id: 4, component: ModulesSlide, name: "Modules" },
    { id: 5, component: FeaturesSlide, name: "Key Features" },
    { id: 6, component: OPDSlide, name: "OPD" },
    { id: 7, component: IPDSlide, name: "IPD" },
    { id: 8, component: EMRSlide, name: "EMR" },
    { id: 9, component: LaboratorySlide, name: "Laboratory" },
    { id: 10, component: PharmacySlide, name: "Pharmacy" },
    { id: 11, component: BillingSlide, name: "Billing" },
    { id: 12, component: ReportsSlide, name: "Reports" },
    { id: 13, component: AnalyticsDashboardSlide, name: "Analytics" },
    { id: 14, component: AISlide, name: "AI Powered" },
    { id: 15, component: BenefitsSlide, name: "Benefits" },
    { id: 16, component: TechnologySlide, name: "Technology" },
    { id: 17, component: IntegrationsSlide, name: "Integrations" },
    { id: 18, component: VideoSlide, name: "Demo Videos" },
    { id: 19, component: TestimonialsSlide, name: "Testimonials" },
    { id: 20, component: PricingSlide, name: "Pricing" },
    { id: 21, component: ImplementationSlide, name: "Implementation" },
    { id: 22, component: CTASlide, name: "Get Started" },
    { id: 23, component: ContactSlide, name: "Contact Us" },
];



export default function DeckPage() {

    const [currentSlide, setCurrentSlide] = useState(0);
    const [isDemoOpen, setIsDemoOpen] = useState(false);
    const [isNotesOpen, setIsNotesOpen] = useState(false);
    const slideContainerRef = useRef(null)
    const nextSlide = useCallback(() => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(prev => prev + 1);
        }
    }, [currentSlide]);

    const prevSlide = useCallback(() => {
        if (currentSlide > 0) {
            setCurrentSlide(prev => prev - 1);
        }
    }, [currentSlide]);

    const goToSlide = useCallback((index) => {
        if (index >= 0 && index < slides.length) {
            setCurrentSlide(index);
        }
    }, []);

    const getCurrentSlideElement = useCallback(() => {
        return slideContainerRef.current;
    }, []);

    // Swipe navigation
    const { handlers } = useSwipeNavigation({
        onSwipeLeft: nextSlide,
        onSwipeRight: prevSlide,
        threshold: 50,
    });

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Don't navigate if demo or notes are open
            if (isDemoOpen) return;

            if (e.key === "ArrowRight" || e.key === " ") {
                e.preventDefault();
                nextSlide();
            } else if (e.key === "ArrowLeft") {
                e.preventDefault();
                prevSlide();
            } else if (e.key === "n" || e.key === "N") {
                // Toggle presenter notes with 'N' key
                setIsNotesOpen(prev => !prev);
            } else if (e.key === "d" || e.key === "D") {
                // Toggle demo mode with 'D' key
                setIsDemoOpen(prev => !prev);
            } else if (e.key === "Escape") {
                setIsDemoOpen(false);
                setIsNotesOpen(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [nextSlide, prevSlide, isDemoOpen]);

    const CurrentSlideComponent = slides[currentSlide].component;
    const slideNames = slides.map(s => s.name);


    return (
        <div
            className="deck-root w-screen h-screen overflow-hidden bg-background touch-pan-y deck-bg-pattern"
            {...handlers}
        >


            {/* Progress Bar */}
            <ProgressBar currentSlide={currentSlide} totalSlides={slides.length} />

            <div className="flex flex-row items-center gap-4  p-4">
                {/* Theme Switcher */}
                <ThemeSwitcher />

                {/* Export Button */}
                <ExportButton
                    totalSlides={slides.length}
                    onGoToSlide={goToSlide}
                    getCurrentSlideElement={getCurrentSlideElement}
                />
            </div>

            {/* Demo Button */}
            <DemoButton onClick={() => setIsDemoOpen(true)} />

            {/* Presenter Notes */}
            <PresenterNotes
                currentSlide={currentSlide}
                isOpen={isNotesOpen}
                onToggle={() => setIsNotesOpen(!isNotesOpen)}
            />

            {/* Interactive Demo Modal */}
            <InteractiveDemo
                isOpen={isDemoOpen}
                onClose={() => setIsDemoOpen(false)}
            />

            {/* Slide Thumbnails */}
            <SlideThumbnails
                currentSlide={currentSlide}
                totalSlides={slides.length}
                onGoToSlide={goToSlide}
                slides={slides}
            />

            {/* Main Slide Content */}
            <div ref={slideContainerRef} className="w-full h-full">
                <AnimatePresence mode="wait">
                    <SlideWrapper key={currentSlide}>
                        <CurrentSlideComponent />
                    </SlideWrapper>
                </AnimatePresence>
            </div>

            {/* Navigation Controls */}
            <SlideNavigation
                currentSlide={currentSlide}
                totalSlides={slides.length}
                onNext={nextSlide}
                onPrev={prevSlide}
                onGoToSlide={goToSlide}
            />
        </div>
    );
}



