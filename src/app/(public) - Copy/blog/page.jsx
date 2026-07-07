'use client';

import React from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

const blogPosts = [
  {
    id: "healing-power-of-amethyst",
    title: "The Healing Power of Amethyst",
    excerpt: "Discover why amethyst has been revered for centuries as a stone of spiritual protection, purification, and inner peace.",
    category: "Crystal Aura",
    date: "March 15, 2026",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600&h=400&fit=crop",
  },
  {
    id: "vastu-tips-home",
    title: "5 Vastu Tips for a Harmonious Home",
    excerpt: "Learn how to place crystals and pyramids in your home to attract positive energy and remove negativity according to Vastu Shastra.",
    category: "Vastu",
    date: "March 8, 2026",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1615529328331-f8917597711f?w=600&h=400&fit=crop",
  },
  {
    id: "beginners-guide-chakras",
    title: "Beginner's Guide to Chakra Healing",
    excerpt: "Understanding the seven chakras and how to use specific crystals to balance and align your energy centers.",
    category: "Meditation",
    date: "February 28, 2026",
    readTime: "8 min read",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=400&fit=crop",
  },
  {
    id: "rose-quartz-love",
    title: "Rose Quartz: The Stone of Unconditional Love",
    excerpt: "Explore the gentle healing energy of rose quartz and how it can open your heart chakra to give and receive love.",
    category: "Crystal Aura",
    date: "February 20, 2026",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1603344797033-f0f4f587ab60?w=600&h=400&fit=crop",
  },
  {
    id: "cleansing-crystals-guide",
    title: "How to Cleanse & Charge Your Crystals",
    excerpt: "A complete guide to different methods of crystal cleansing — moonlight, sage, sound, and more.",
    category: "Guides",
    date: "February 12, 2026",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1600298882525-c4b2100e1000?w=600&h=400&fit=crop",
  },
  {
    id: "meditation-with-crystals",
    title: "Deepening Your Meditation with Crystals",
    excerpt: "Learn which crystals to hold during meditation and how they can enhance focus, clarity, and spiritual connection.",
    category: "Meditation",
    date: "February 5, 2026",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1545389336-cf090694435e?w=600&h=400&fit=crop",
  },
];

export default function CrystalAuraBlogPage() {
  return (
    <div className="min-h-screen bg-transparent pt-12 pb-24 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <p className="text-primary text-[10px] tracking-[0.3em] uppercase mb-4 font-sans font-black">
            ✦ Crystal Wisdom ✦
          </p>
          <h1 className="font-serif text-5xl md:text-7xl text-foreground mb-6">
            <span className="text-gold-gradient font-semibold">Sacred</span> Journal
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
            Guides, tips, and ancient wisdom for your spiritual journey with healing crystals.
          </p>
          <div className="section-divider w-48 mx-auto mt-8" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post, i) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group cursor-pointer"
            >
              <div className="relative overflow-hidden rounded-[2rem] border border-white/5 bg-white/[0.02] mb-6">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4">
                  <span className="glass px-4 py-1.5 rounded-full border border-white/10 text-[10px] uppercase font-black tracking-widest text-primary">
                    {post.category}
                  </span>
                </div>
              </div>
              <div className="px-2">
                <div className="flex items-center gap-6 text-muted-foreground/40 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                  <span className="flex items-center gap-2 transition-colors group-hover:text-primary"><Calendar className="w-3.5 h-3.5" />{post.date}</span>
                  <span className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" />{post.readTime}</span>
                </div>
                <h3 className="font-serif text-2xl lg:text-3xl text-foreground group-hover:text-primary transition-colors duration-300 mb-4 leading-tight font-semibold">
                  {post.title}
                </h3>
                <p className="text-muted-foreground font-light text-base line-clamp-2 mb-6 leading-relaxed italic">
                    "{post.excerpt}"
                </p>
                <div className="flex items-center gap-4 text-primary text-[10px] font-black uppercase tracking-[0.3em] group-hover:gap-6 transition-all">
                  <span>Read full entry</span>
                  <div className="w-8 h-px bg-primary/30 group-hover:w-12 transition-all" />
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
}
