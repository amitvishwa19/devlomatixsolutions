import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Pricing } from "@/components/landing/Pricing";
import { CTA } from "@/components/landing/CTA";
import { FAQ } from "@/components/landing/FAQ";
import { Footer } from "@/components/landing/Footer";
import { ThemeProvider } from "@/hooks/use-theme";

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
  head: () => ({
    meta: [
      { title: "Pricing — KonnectX WhatsApp Business API Platform" },
      { name: "description", content: "Simple, transparent pricing for WhatsApp Business API. Start free, scale as you grow. No hidden fees." },
      { property: "og:title", content: "Pricing — KonnectX" },
      { property: "og:description", content: "Simple, transparent pricing for WhatsApp Business API. Start free, scale as you grow." },
    ],
  }),
});

function PricingPage() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-8">
          <Pricing />
          <FAQ />
          <CTA />
        </div>
        <Footer />
      </div>
    </ThemeProvider>
  );
}
