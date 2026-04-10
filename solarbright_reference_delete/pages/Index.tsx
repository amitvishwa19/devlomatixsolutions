import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import HowItWorks from "@/components/HowItWorks";
import CleaningTech from "@/components/CleaningTech";
import Benefits from "@/components/Benefits";
import PlanCalculator from "@/components/PlanCalculator";
import EnergySavingsCalculator from "@/components/EnergySavingsCalculator";
import Pricing from "@/components/Pricing";
import Dashboard from "@/components/Dashboard";
import Gallery from "@/components/Gallery";
import Tips from "@/components/Tips";
import FAQ from "@/components/FAQ";
import Testimonials from "@/components/Testimonials";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import AIChatbot from "@/components/AIChatbot";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <Services />
        <HowItWorks />
        <CleaningTech />
        <Benefits />
        <EnergySavingsCalculator />
        <PlanCalculator />
        <Pricing />
        <Dashboard />
        <Gallery />
        <Tips />
        <FAQ />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
      <AIChatbot />
    </div>
  );
};

export default Index;
