'use client'
import React from 'react'

import { ArrowRight, Shield, Clock, Users, Award, Heart, Stethoscope, Brain, Bone, Baby, Siren, Sparkles, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Hero from './components/Hero';
import WhyChooseUs from './components/WhyChooseUs';
import Process from './components/Process';
import TechStack from './components/TechStack';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import PageTransition from './components/PageTransition';
import CTA from './components/CTA';
import Services from './components/Services';






export default function HomePage() {
    return (
        <PageTransition className="min-h-screen overflow-hidden w-full ">



            <Hero />
            <Services />
            <WhyChooseUs />
            <Process />
            <TechStack />
            <Testimonials />
            <FAQ />
            <CTA />
        </PageTransition>
    )
}
