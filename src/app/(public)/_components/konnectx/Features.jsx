'use client';

import React from "react";
import { motion } from "framer-motion";
import {
  Bot, Send, Users, BarChart3, ShoppingCart, Shield,
  Zap, Globe,
} from "lucide-react";
import { useLanguage } from "./use-language";

const features = [
  {
    icon: Send,
    title: "Bulk Campaigns",
    desc: "Send personalized broadcasts to thousands of customers using Meta-approved templates with rich media support.",
  },
  {
    icon: Bot,
    title: "No-Code Chatbot",
    desc: "Build intelligent conversation flows with our drag-and-drop chatbot builder. No coding skills required.",
  },
  {
    icon: Users,
    title: "Shared Team Inbox",
    desc: "Collaborate with your team on customer conversations. Assign chats, add internal notes, and track response times.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    desc: "Track campaign performance, message delivery rates, read rates, and agent productivity with real-time analytics.",
  },
  {
    icon: ShoppingCart,
    title: "In-Chat Payments",
    desc: "Let customers browse products, view catalogs, and complete seamless purchases directly within WhatsApp conversations.",
  },
  {
    icon: Shield,
    title: "Green Tick Verified",
    desc: "Get the official green tick badge on WhatsApp to build immediate trust and credibility with your customers.",
  },
  {
    icon: Zap,
    title: "API & Webhooks",
    desc: "Connect your existing CRM and tech stack with our robust REST API and real-time event webhooks.",
  },
  {
    icon: Globe,
    title: "Multi-Language",
    desc: "Reach customers worldwide with localized templates and multilingual chatbot automation.",
  },
];

export function Features() {
  const { t } = useLanguage();

  return (
    <section id="kx-features" className="relative py-20 sm:py-28">
      <div className="section-divider mx-auto max-w-5xl" />
      <div className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-primary">
            {t("features.badge")}
          </p>
          <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl lg:text-5xl text-foreground">
            {t("features.title")}{" "}
            <span className="text-gradient-sun">{t("features.title2")}</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
            From automated marketing campaigns to unified customer support — everything needed to scale on WhatsApp.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 25, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
              className="group glass-card rounded-2xl p-6 transition-all duration-300 hover:border-primary/40 hover:-translate-y-1"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div 
                className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_20px_hsl(190_90%_50%/0.3)]"
              >
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
