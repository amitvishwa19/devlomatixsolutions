'use client'
import React from 'react'
import { 
    ContentfulHero, 
    TrustedByCloud, 
    UnifiedPlatformSection, 
    ContentfulCTA 
} from './_components/ContentfulSections'
import PageTransition from './_components/PageTransition'

export default function HomePage() {
    return (
        <PageTransition>
            <main className="bg-background min-h-screen">
                {/* Hero section with Dashboard Preview */}
                <ContentfulHero imgSrc="/assets/branding/dashboard-preview.png" />
                
                {/* Trusted By Logo Strip */}
                <TrustedByCloud />

                {/* Unified Platform / Value Props */}
                <UnifiedPlatformSection />

                {/* Final Call to Action */}
                <ContentfulCTA />
            </main>
        </PageTransition>
    )
}
