import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

const plans = [
  {
    name: "Lite",
    price: "₹7,194",
    period: "/Half Yearly",
    desc: "No Conversation Markup",
    features: [
      "3 Users",
      "Shared Team Inbox",
      "Agent Transfer & Assignment",
      "Conversation Labels",
      "Contact Notes & Reminders",
      "Unlimited Rich Media Templates",
      "Unlimited Campaigns",
      "Campaign Retargeting",
      "Advanced Campaign Report",
      "Unlimited Tags",
      "Unlimited Attributes",
      "Chat Automation (Welcome, OOO)",
      "Quick Replies",
      "Mobile App for Team Inbox",
    ],
    cta: "Select Plan",
    ctaLink: "/contact",
    popular: false,
  },
  {
    name: "Professional",
    price: "₹11,994",
    period: "/Half Yearly",
    desc: "No Conversation Markup",
    badge: "Everything in Lite Plan",
    features: [
      "5 Users",
      "All features in Lite Plan",
      "Drag and Drop Chatbot Builder",
      "Schedule Follow-Up Messages",
      "Carousel & Form Fill Templates",
      "Campaign Scheduler",
      "Campaign Auto Pause on Spam",
      "Round Robin Chat Assignment",
      "Lead Management Dashboard",
      "WhatsApp Forms",
      "Template Sending API",
      "Agent Custom Permissions",
      "Shopify/Woocommerce Integration",
      "Conversation Analytics",
      "Click to WhatsApp Ad Acquisition Report",
      "Download Chats and Reports",
      "Guided Onboarding & FB Verification",
    ],
    cta: "Select Plan",
    ctaLink: "/contact",
    popular: true,
  },
  {
    name: "Premium",
    price: "₹17,994",
    period: "/Half Yearly",
    desc: "No Conversation Markup",
    badge: "Everything in Professional Plan",
    features: [
      "10 Users",
      "All features in Professional Plan",
      "3 Active Chatbot Flows",
      "Product Catalogue on WhatsApp",
      "Smart Lead Priority Assignment",
      "Reply Message API",
      "Set Webhook",
      "Agent Performance Report",
      "WhatsApp Consultation with our Experts",
      "Auto Data Deletion (on Request)",
      "Priority Support (2 hours TAT)",
      "Dedicated Manager for Account Setup and Campaigns (Add-on, Paid)",
    ],
    cta: "Select Plan",
    ctaLink: "/contact",
    popular: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="relative py-24 sm:py-32 mesh-bg">
      <div className="section-divider mx-auto max-w-5xl" />
      <div className="mx-auto max-w-7xl px-4 pt-24 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Pricing
          </p>
          <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl lg:text-5xl">
            Simple, <span className="text-gradient-sun">Transparent Pricing</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Start free. Scale as you grow. No hidden fees — just Meta's standard conversation charges apply.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              className={`relative flex flex-col rounded-2xl p-8 transition-all duration-300 ${
                plan.popular
                  ? "glass-card ring-2 ring-primary/50"
                  : "glass-card"
              }`}
              style={{ boxShadow: plan.popular ? "var(--shadow-glow)" : "var(--shadow-card)" }}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-bold text-primary-foreground" style={{ background: "var(--gradient-sun)" }}>
                  Most Popular
                </span>
              )}
              <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-gradient-sun">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{plan.desc}</p>

              {"badge" in plan && plan.badge && (
                <div className="mt-4 flex items-center gap-2">
                  <span className="rounded-md px-3 py-1 text-xs font-bold text-primary-foreground" style={{ background: "var(--gradient-sun)" }}>
                    {plan.badge}
                  </span>
                  <span className="text-muted-foreground font-bold">+</span>
                </div>
              )}

              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link to={plan.ctaLink} className="mt-8">
                <Button
                  className="w-full font-semibold"
                  variant={plan.popular ? "default" : "outline"}
                  size="lg"
                  style={plan.popular ? { background: "var(--gradient-sun)" } : undefined}
                >
                  {plan.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
