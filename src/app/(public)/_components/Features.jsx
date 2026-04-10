'use client';
import { motion } from "framer-motion";
import {
  Bot, Send, Users, BarChart3, ShoppingCart, Shield,
  Zap, Globe,
} from "lucide-react";

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
    desc: "Collaborate with your team on customer conversations. Assign chats, add notes, and track response times.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    desc: "Track campaign performance, message delivery rates, and agent productivity with real-time analytics.",
  },
  {
    icon: ShoppingCart,
    title: "In-Chat Payments",
    desc: "Let customers browse products and complete purchases directly within WhatsApp conversations.",
  },
  {
    icon: Shield,
    title: "Green Tick Verified",
    desc: "Get the official green tick badge on WhatsApp to build trust and credibility with your customers.",
  },
  {
    icon: Zap,
    title: "API & Webhooks",
    desc: "Connect your existing tools with our robust REST API and real-time webhooks for seamless integration.",
  },
  {
    icon: Globe,
    title: "Multi-Language",
    desc: "Reach customers worldwide with support for 60+ languages in templates and chatbot responses.",
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-24 sm:py-32">
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
            Powerful Features
          </p>
          <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl lg:text-5xl">
            Everything You Need to{" "}
            <span className="text-gradient-sun">Win on WhatsApp</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            From marketing campaigns to customer support — our platform has all the tools
            your business needs to thrive.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="group glass-card rounded-xl p-6 transition-all duration-300 hover:border-primary/20 shimmer"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:shadow-[0_0_20px_hsl(190_90%_50%/0.3)]" style={{ transition: "box-shadow 0.3s" }}>
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
