'use client';
import { motion } from "framer-motion";
import { Navbar } from "../_components/Navbar";
import { Footer } from "../_components/Footer";
import { Code, Book, Terminal, Zap } from "lucide-react";

const sections = [
  { icon: Terminal, title: "REST API", desc: "Full RESTful API with JSON payloads. Send messages, manage contacts, create templates, and more with simple HTTP requests." },
  { icon: Code, title: "SDKs & Libraries", desc: "Official SDKs for Node.js, Python, PHP, Java, and Go. Get started in minutes with your preferred language." },
  { icon: Zap, title: "Webhooks", desc: "Real-time event notifications for message delivery, read receipts, and customer interactions via configurable webhooks." },
  { icon: Book, title: "Guides & Tutorials", desc: "Step-by-step guides for common use cases: bulk messaging, chatbot creation, template management, and campaign automation." },
];

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="relative overflow-hidden py-24 sm:py-32 mesh-bg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Developer Resources</p>
            <h1 className="mt-3 text-4xl font-extrabold sm:text-5xl lg:text-6xl">
              API <span className="text-gradient-sun">Documentation</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Everything you need to integrate KonnectX into your application. Powerful APIs, comprehensive SDKs, and detailed guides.
            </p>
          </motion.div>
        </div>
      </section>
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2">
            {sections.map((s, i) => (
              <motion.div key={s.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }} className="glass-card rounded-xl p-8" style={{ boxShadow: "var(--shadow-card)" }}>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary"><s.icon className="h-6 w-6" /></div>
                <h3 className="mt-4 text-xl font-bold text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
