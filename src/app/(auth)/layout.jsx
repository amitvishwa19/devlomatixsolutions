'use client'
import React, { useState, useEffect, useMemo } from 'react';
import carewellLogo from '@/assets/images/logo/logo.png';
import { Activity, Heart, Users, Shield, Pill, FileText, Cloud, Smartphone, Building, CreditCard } from 'lucide-react';
import Link from 'next/link';
import NetworkBackground from '@/components/global/NetworkBackground';


const slidingContent = [
    {
        title: "Caring for Health Beyond Treatment.",
        highlight: "Organizing Care, Empowering Lives",
        description: "Smart systems. Seamless care. Where medicine meets management. Our platform simplifies healthcare by connecting people, processes, and data — ensuring every detail of patient care is perfectly organized.",
        icon: Heart
    },
    {
        title: "Complete Clinical Management.",
        highlight: "OPD, IPD & EMR Solutions",
        description: "Streamline patient consultations, admissions, and electronic medical records. Track patient history, prescriptions, and treatment plans with our comprehensive clinical workflow management system.",
        icon: Activity
    },
    {
        title: "Advanced Pharmacy Module.",
        highlight: "GST Compliant Inventory Control",
        description: "Manage medicine inventory, batch tracking, expiry alerts, and GST-compliant billing. Integrated with clinical modules for seamless prescription fulfillment and stock management.",
        icon: Pill
    },
    {
        title: "Pathology & Radiology.",
        highlight: "500+ Reports & Templates",
        description: "Complete laboratory and radiology management with 500+ pre-built report templates. Automated result delivery, sample tracking, and integration with diagnostic equipment.",
        icon: FileText
    },
    {
        title: "Auto Cloud Backup.",
        highlight: "Secure Data Protection",
        description: "Never lose critical patient data with automatic cloud backup. HIPAA-compliant security, encrypted storage, and instant disaster recovery for complete peace of mind.",
        icon: Cloud
    },
    {
        title: "Mobile Application.",
        highlight: "Healthcare On The Go",
        description: "Access patient records, appointments, and reports from anywhere. Real-time notifications, telemedicine support, and seamless sync across all your devices.",
        icon: Smartphone
    },
    {
        title: "TPA & Insurance Management.",
        highlight: "Cashless Claims Processing",
        description: "Streamlined insurance claim processing, TPA tie-ups, and corporate billing. Automated pre-authorization, claim tracking, and seamless reimbursement workflows.",
        icon: CreditCard
    },
    {
        title: "Multi-Branch Support.",
        highlight: "Centralized Hospital Network",
        description: "Manage multiple hospital branches from a single dashboard. Unified patient records, inter-branch referrals, and consolidated reporting across your healthcare network.",
        icon: Building
    }
];

const AuthLayout = ({ children, title, subtitle }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);



    // Auto-slide effect
    useEffect(() => {
        const slideInterval = setInterval(() => {
            setIsAnimating(true);
            setTimeout(() => {
                setCurrentSlide((prev) => (prev + 1) % slidingContent.length);
                setIsAnimating(false);
            }, 500);
        }, 5000);

        return () => clearInterval(slideInterval);
    }, []);

    const currentContent = slidingContent[currentSlide];
    const CurrentIcon = currentContent.icon;

    return (
        <div className="min-h-screen flex flex-row w-full">
            <NetworkBackground />


            {/* Left Section - Presentation (70%) */}
            <div className="hidden md:flex md:w-[70%] min-h-screen relative overflow-hidden bg-linear-to-br from-primary/20 via-primary/5 to-background items-center justify-center">

                {/* Decorative mesh blobs for depth - pointer-events-none is CRITICAL */}
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />

                {/* Content with Glass Effect */}
                <div id="loader-content" className="relative z-10 flex flex-col items-center justify-center max-w-3xl w-full mx-8 px-12 py-16 bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.1)] ring-1 ring-white/5">

                    {/* Healthcare Icons */}
                    <div className="flex justify-center gap-6 mb-8">
                        <Activity
                            className="w-10 h-10 text-white animate-bounce"
                            style={{ animationDelay: '0s', animationDuration: '2s' }}
                        />
                        <Heart
                            className="w-10 h-10 text-white animate-bounce"
                            style={{ animationDelay: '0.2s', animationDuration: '2s' }}
                        />
                        <Users
                            className="w-10 h-10 text-white animate-bounce"
                            style={{ animationDelay: '0.4s', animationDuration: '2s' }}
                        />
                        <Shield
                            className="w-10 h-10 text-white animate-bounce"
                            style={{ animationDelay: '0.6s', animationDuration: '2s' }}
                        />
                    </div>

                    {/* Auto-Sliding Content */}
                    <div className={`transition-all duration-500 text-center max-w-2xl ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
                        {/* Current Feature Icon */}
                        <div className="flex justify-center mb-4">
                            <div className="p-4 rounded-full bg-white/10 backdrop-blur-sm">
                                <CurrentIcon className="w-12 h-12 text-white" />
                            </div>
                        </div>

                        {/* Main Heading */}
                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-6">
                            {currentContent.title}{" "}
                            <span className="text-white/80">{currentContent.highlight}</span>
                        </h1>

                        {/* Description */}
                        <p className="text-white/70 text-sm md:text-base mb-8 max-w-xl mx-auto">
                            {currentContent.description}
                        </p>
                    </div>

                    {/* Slide Indicators */}
                    <div className="flex justify-center gap-2 mb-6">
                        {slidingContent.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    setIsAnimating(true);
                                    setTimeout(() => {
                                        setCurrentSlide(index);
                                        setIsAnimating(false);
                                    }, 300);
                                }}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentSlide
                                    ? 'bg-white w-6'
                                    : 'bg-white/40 hover:bg-white/60'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Divider with Heart */}
                    <div className="flex items-center justify-center gap-4 mb-8">
                        <div className="w-16 h-0.5 bg-white/50" />
                        <Heart className="w-6 h-6 text-white fill-white animate-pulse" style={{ animationDuration: '2s' }} />
                        <div className="w-16 h-0.5 bg-white/50" />
                    </div>

                    {/* Subtitle */}
                    <p className="text-white/60 text-sm md:text-base mb-8 text-center">
                        Empowering healthcare providers with intelligent solutions for<br />
                        patient care, resource management, and operational excellence
                    </p>

                    {/* Features Grid */}
                    <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-10">
                        <div className="flex items-center gap-2 text-white/70 text-sm animate-fade-in" style={{ animationDelay: '0.4s' }}>
                            <Shield className="w-4 h-4 text-white" />
                            <span>Secure & Compliant</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/70 text-sm animate-fade-in" style={{ animationDelay: '0.5s' }}>
                            <Activity className="w-4 h-4 text-white" />
                            <span>Real-time Monitoring</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/70 text-sm animate-fade-in" style={{ animationDelay: '0.6s' }}>
                            <Users className="w-4 h-4 text-white" />
                            <span>Patient-Centric</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/70 text-sm animate-fade-in" style={{ animationDelay: '0.7s' }}>
                            <Heart className="w-4 h-4 text-white" />
                            <span>Compassionate Care</span>
                        </div>
                    </div>

                </div>

            </div>

            {/* Right Section - Form (30%) */}
            <div className="w-full md:w-[30%] flex flex-col items-center justify-center p-8 bg-background min-h-screen overflow-y-auto relative z-20">
                <div className="w-full max-w-md">
                    {/* Logo */}
                    <div className="flex justify-center mb-8">
                        <Link href="/">
                            <img src={carewellLogo} alt="CareWell HMS" className="h-12" />
                        </Link>
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl font-semibold text-center text-foreground mb-2">
                        {title}
                    </h2>
                    {subtitle && (
                        <p className="text-muted-foreground text-center mb-8">{subtitle}</p>
                    )}

                    {/* Form Content */}
                    <div className="relative z-30">
                        {children}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
