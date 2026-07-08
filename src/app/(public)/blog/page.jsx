'use client';

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { blogPosts } from "../_data/products";

// Inline SVG Icons for Blog
const CalendarIcon = ({ className = "w-3 h-3" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
);

const ClockIcon = ({ className = "w-3 h-3" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);

const ArrowRightIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
);

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#06040a] pt-32 pb-24 text-foreground font-sans">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Blog Header */}
        <div className="text-center mb-16">
          <span className="text-[10px] font-sans tracking-[0.35em] text-primary uppercase font-bold block mb-3">
            ✦ Crystal Wisdom ✦
          </span>
          <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight mb-4">
            Sacred <span className="shimmer-text italic font-normal">Journal</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm leading-relaxed">
            Ancient minerals wisdom, alignment guidebooks, energy charging guidelines, and crystal ritual diaries from our master caretakers.
          </p>
          <div className="w-16 h-[1px] bg-primary/30 mx-auto mt-6" />
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post, i) => (
            <Link
              href={`/blog/${post.slug}`}
              key={post.id}
              className="block group"
            >
              <motion.article
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="glass-card rounded-2xl overflow-hidden border border-white/5 hover:border-primary/20 flex flex-col justify-between hover-glow-card h-full"
              >
                <div className="relative overflow-hidden aspect-[16/10] bg-white/5">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  <span className="absolute top-4 left-4 bg-[#06040a]/80 backdrop-blur-md text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full text-primary border border-white/10">
                    {post.category}
                  </span>
                </div>
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-mono uppercase tracking-wider mb-3">
                      <span className="flex items-center gap-1.5"><CalendarIcon className="w-3.5 h-3.5 text-primary" /> {post.date}</span>
                      <span className="flex items-center gap-1.5"><ClockIcon className="w-3.5 h-3.5 text-primary" /> {post.readTime}</span>
                    </div>
                    <h2 className="font-serif text-lg font-bold mb-2 group-hover:text-primary transition-colors duration-300">
                      {post.title}
                    </h2>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mb-6">
                      {post.excerpt}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-2 text-[10px] font-bold text-primary tracking-widest uppercase transition-all duration-300 group-hover:translate-x-1.5">
                    Read Entry <ArrowRightIcon className="w-3.5 h-3.5" />
                  </span>
                </div>
              </motion.article>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}