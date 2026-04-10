import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Stats } from "@/components/landing/Stats";
import { Industries } from "@/components/landing/Industries";
import { Integrations } from "@/components/landing/Integrations";
import { Pricing } from "@/components/landing/Pricing";
import { Testimonials } from "@/components/landing/Testimonials";
import { FAQ } from "@/components/landing/FAQ";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";
import { ThemeProvider } from "@/hooks/use-theme";
import { LanguageProvider } from "@/hooks/use-language";
import { ChatbotWidget } from "@/components/landing/ChatbotWidget";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "KonnectX — WhatsApp Business API Platform" },
      { name: "description", content: "Send bulk campaigns, automate conversations with no-code chatbots, and convert leads on WhatsApp. Official Business API partner." },
    ],
  }),
});

function Index() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className="min-h-screen bg-background">
          <Navbar />
          <Hero />
          <Features />
          <Stats />
          <Industries />
          <Integrations />
          <Pricing />
          <Testimonials />
          <FAQ />
          <CTA />
          <Footer />
          <ChatbotWidget />
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}
