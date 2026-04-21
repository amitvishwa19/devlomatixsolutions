'use client'
import React from 'react'

import { ArrowRight, Shield, Clock, Users, Award, Heart, Stethoscope, Brain, Bone, Baby, Siren, Sparkles, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Hero from './_components/Hero';
import WhyChooseUs from './_components/WhyChooseUs';
import Process from './_components/Process';
import TechStack from './_components/TechStack';
import Testimonials from './_components/Testimonials';
import FAQ from './_components/FAQ';
import PageTransition from './_components/PageTransition';
import CTA from './_components/CTA';
import Services from './_components/Services';






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
