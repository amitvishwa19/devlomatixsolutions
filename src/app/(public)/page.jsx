'use client'
import React from 'react'

import { ArrowRight, Shield, Clock, Users, Award, Heart, Stethoscope, Brain, Bone, Baby, Siren, Sparkles, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import HeroSection from './_components/landing/HeroSection';
import HealthcareSection from './_components/landing/HealthcareSection';
import ClientsSection from './_components/landing/ClientsSection';
import ComplianceSection from './_components/landing/ComplianceSection';
import FeaturesSection from './_components/landing/FeaturesSection';
import ModulesSection from './_components/landing/ModulesSection';
import ProductTourSection from './_components/landing/ProductTourSection';
import ComparisonSection from './_components/landing/ComparisonSection';
import ROICalculator from './_components/landing/ROICalculator';
import CaseStudiesSection from './_components/landing/CaseStudiesSection';
import HowItWorksSection from './_components/landing/HowItWorksSection';
import StatsSection from './_components/landing/StatsSection';
import VideoTestimonialsSection from './_components/landing/VideoTestimonialsSection';
import TestimonialsSection from './_components/landing/TestimonialsSection';
import IntegrationsSection from './_components/landing/IntegrationsSection';
import FAQSection from './_components/landing/FAQSection';
import CTASection from './_components/landing/CTASection';



const services = [
    { icon: Siren, title: 'Emergency Care', description: '24/7 emergency services with rapid response teams', color: 'from-red-500 to-orange-500' },
    { icon: Heart, title: 'Cardiology', description: 'Advanced heart care with latest technology', color: 'from-pink-500 to-rose-500' },
    { icon: Brain, title: 'Neurology', description: 'Expert neurological diagnosis and treatment', color: 'from-purple-500 to-indigo-500' },
    { icon: Bone, title: 'Orthopedics', description: 'Comprehensive bone and joint care', color: 'from-amber-500 to-yellow-500' },
    { icon: Baby, title: 'Pediatrics', description: 'Specialized care for children of all ages', color: 'from-cyan-500 to-teal-500' },
    { icon: Stethoscope, title: 'General Medicine', description: 'Primary healthcare for everyday needs', color: 'from-emerald-500 to-green-500' },
];

const stats = [
    { number: '50+', label: 'Expert Doctors', suffix: '' },
    { number: '10K', label: 'Happy Patients', suffix: '+' },
    { number: '25', label: 'Years Experience', suffix: '+' },
    { number: '15', label: 'Departments', suffix: '+' },
];

const features = [
    { icon: Shield, title: 'Trusted Care', description: 'Board-certified physicians committed to your wellbeing' },
    { icon: Clock, title: 'Always Available', description: '24/7 emergency services and support' },
    { icon: Users, title: 'Expert Team', description: 'Skilled specialists across all medical fields' },
    { icon: Award, title: 'Quality Assured', description: 'Accredited by leading healthcare organizations' },
];


export default function HomePage() {
    return (
        <div className="min-h-screen overflow-hidden w-full">
            <HeroSection />
            <HealthcareSection />
            <ClientsSection />
            <ComplianceSection />
            <FeaturesSection />
            <ModulesSection />
            <ProductTourSection />
            <ComparisonSection />
            <ROICalculator />
            <CaseStudiesSection />
            <HowItWorksSection />
            <StatsSection />
            <VideoTestimonialsSection />
            <TestimonialsSection />
            <IntegrationsSection />
            <FAQSection />
            <CTASection />


        </div>
    )
}
