import Navbar from "@/carewell/components/landing/Navbar";
import HeroSection from "@/carewell/components/landing/HeroSection";
import HealthcareSection from "@/carewell/components/landing/HealthcareSection";
import ClientsSection from "@/carewell/components/landing/ClientsSection";
import ComplianceSection from "@/carewell/components/landing/ComplianceSection";
import FeaturesSection from "@/carewell/components/landing/FeaturesSection";
import ModulesSection from "@/carewell/components/landing/ModulesSection";
import ProductTourSection from "@/carewell/components/landing/ProductTourSection";
import ComparisonSection from "@/carewell/components/landing/ComparisonSection";
import ROICalculator from "@/carewell/components/landing/ROICalculator";
import CaseStudiesSection from "@/carewell/components/landing/CaseStudiesSection";
import HowItWorksSection from "@/carewell/components/landing/HowItWorksSection";
import StatsSection from "@/carewell/components/landing/StatsSection";
import VideoTestimonialsSection from "@/carewell/components/landing/VideoTestimonialsSection";
import TestimonialsSection from "@/carewell/components/landing/TestimonialsSection";
import IntegrationsSection from "@/carewell/components/landing/IntegrationsSection";
import FAQSection from "@/carewell/components/landing/FAQSection";
import CTASection from "@/carewell/components/landing/CTASection";
import Footer from "@/carewell/components/landing/Footer";
import WhatsAppWidget from "@/carewell/components/WhatsAppWidget";
import ExitIntentPopup from "@/carewell/components/ExitIntentPopup";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16 md:pt-20">
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
      </main>
      <Footer />
      <WhatsAppWidget />
      <ExitIntentPopup />
    </div>
  );
};

export default Index;
