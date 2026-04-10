'use client';
import { motion } from "framer-motion";
import Link from "next/link";
import { Navbar } from "../_components/Navbar";
import { Footer } from "../_components/Footer";
import { CTA } from "../_components/CTA";
import { ArrowRight, Calendar, Clock } from "lucide-react";

const posts = [
  {
    title: "10 WhatsApp Marketing Strategies That Actually Work in 2025",
    slug: "whatsapp-marketing-strategies-2025",
    excerpt: "Discover proven strategies to boost engagement, drive sales, and build lasting customer relationships through WhatsApp Business API.",
    category: "Marketing",
    date: "Apr 5, 2026",
    readTime: "8 min read",
  },
  {
    title: "How to Build a No-Code WhatsApp Chatbot in Under 30 Minutes",
    slug: "no-code-whatsapp-chatbot",
    excerpt: "Step-by-step guide to creating powerful automated conversations using KonnectX's drag-and-drop chatbot builder.",
    category: "Tutorial",
    date: "Mar 28, 2026",
    readTime: "6 min read",
  },
  {
    title: "WhatsApp Business API vs WhatsApp Business App: Which One Do You Need?",
    slug: "whatsapp-business-api-vs-app",
    excerpt: "A comprehensive comparison to help you decide the right WhatsApp solution for your business size and goals.",
    category: "Guide",
    date: "Mar 15, 2026",
    readTime: "5 min read",
  },
  {
    title: "Boosting E-Commerce Sales with WhatsApp Catalog & Cart Recovery",
    slug: "ecommerce-whatsapp-catalog-cart-recovery",
    excerpt: "Learn how to integrate your product catalog and recover abandoned carts automatically through WhatsApp messaging.",
    category: "E-Commerce",
    date: "Mar 8, 2026",
    readTime: "7 min read",
  },
  {
    title: "GDPR & WhatsApp: How to Stay Compliant While Scaling Campaigns",
    slug: "gdpr-whatsapp-compliance",
    excerpt: "Essential compliance tips for businesses running WhatsApp campaigns in regulated markets.",
    category: "Compliance",
    date: "Feb 25, 2026",
    readTime: "4 min read",
  },
  {
    title: "The Ultimate Guide to WhatsApp Broadcast vs Group Messaging",
    slug: "whatsapp-broadcast-vs-group-messaging",
    excerpt: "Understand the key differences, use cases, and best practices for reaching your audience at scale.",
    category: "Marketing",
    date: "Feb 18, 2026",
    readTime: "6 min read",
  },
];

const categoryColors = {
  Marketing: "bg-primary/15 text-primary",
  Tutorial: "bg-chart-2/15 text-chart-2",
  Guide: "bg-chart-3/15 text-chart-3",
  "E-Commerce": "bg-chart-4/15 text-chart-4",
  Compliance: "bg-chart-5/15 text-chart-5",
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="relative py-24 sm:py-32 mesh-bg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-2xl text-center"
          >
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              Blog & Resources
            </p>
            <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl lg:text-5xl">
              Insights for <span className="text-gradient-sun">WhatsApp Growth</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Expert tips, tutorials, and strategies to supercharge your WhatsApp marketing.
            </p>
          </motion.div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, i) => (
              <motion.article
                key={post.title}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="group glass-card flex flex-col rounded-2xl p-6 transition-all duration-300 hover:ring-1 hover:ring-primary/30"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${categoryColors[post.category] ?? "bg-primary/15 text-primary"}`}>
                    {post.category}
                  </span>
                </div>
                <h2 className="mt-4 text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h2>
                <p className="mt-2 flex-1 text-sm text-muted-foreground line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{post.date}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{post.readTime}</span>
                </div>
                <Link href={`/blog/${post.slug}`} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                  Read More <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
      <CTA />
      <Footer />
    </div>
  );
}
