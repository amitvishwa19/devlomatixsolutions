import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { CTA } from "@/components/landing/CTA";
import { ThemeProvider } from "@/hooks/use-theme";
import { ShoppingCart, Bell, Megaphone, HeartHandshake, CalendarCheck, Star } from "lucide-react";

export const Route = createFileRoute("/templates")({
  component: TemplatesPage,
  head: () => ({
    meta: [
      { title: "Message Templates — KonnectX WhatsApp Business API" },
      { name: "description", content: "Ready-to-use WhatsApp message templates for e-commerce, support, marketing, and more. Get started in minutes." },
      { property: "og:title", content: "Templates — KonnectX" },
      { property: "og:description", content: "Ready-to-use WhatsApp message templates for every use case." },
    ],
  }),
});

const templates = [
  { icon: ShoppingCart, category: "E-commerce", count: 15, examples: ["Order confirmation", "Shipping update", "Abandoned cart recovery"] },
  { icon: Bell, category: "Notifications", count: 12, examples: ["Appointment reminders", "Payment receipts", "Account alerts"] },
  { icon: Megaphone, category: "Marketing", count: 10, examples: ["Product launch", "Flash sale", "Newsletter"] },
  { icon: HeartHandshake, category: "Customer Support", count: 8, examples: ["Ticket update", "Feedback request", "Resolution confirmation"] },
  { icon: CalendarCheck, category: "Booking & Events", count: 6, examples: ["Booking confirmation", "Event reminder", "Check-in notification"] },
  { icon: Star, category: "Loyalty & Rewards", count: 5, examples: ["Points earned", "Reward unlocked", "Birthday offer"] },
];

function TemplatesPage() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        <Navbar />
        <section className="relative overflow-hidden py-24 sm:py-32 mesh-bg">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">Template Library</p>
              <h1 className="mt-3 text-4xl font-extrabold sm:text-5xl lg:text-6xl">
                Message <span className="text-gradient-sun">Templates</span>
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">Pre-built, Meta-approved WhatsApp templates for every business use case. Customize and send in minutes.</p>
            </motion.div>
          </div>
        </section>
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map((t, i) => (
                <motion.div key={t.category} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }} className="glass-card rounded-xl p-6" style={{ boxShadow: "var(--shadow-card)" }}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><t.icon className="h-5 w-5" /></div>
                    <div><h3 className="font-bold text-foreground">{t.category}</h3><span className="text-xs text-muted-foreground">{t.count} templates</span></div>
                  </div>
                  <ul className="mt-4 space-y-1.5">
                    {t.examples.map((ex) => (<li key={ex} className="text-sm text-muted-foreground">• {ex}</li>))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        <CTA />
        <Footer />
      </div>
    </ThemeProvider>
  );
}
