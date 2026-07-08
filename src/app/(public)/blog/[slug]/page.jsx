'use client';

import React, { use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { blogPosts } from "../../_data/products";

// Inline SVG Icons
const CalendarIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
);

const ClockIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);

const UserIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);

const ArrowLeftIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
);

export default function BlogPostPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const slug = params.slug;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="min-h-screen bg-[#06040a] flex items-center justify-center text-center px-6">
        <div>
          <span className="text-3xl mb-4 block">🔮</span>
          <h1 className="font-serif text-2xl font-bold mb-4">Post Not Found</h1>
          <Link
            href="/blog"
            className="inline-block bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl px-6 py-2.5 text-xs font-bold tracking-widest uppercase transition-all duration-300"
          >
            Back to Journal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06040a] pt-32 pb-24 text-foreground font-sans">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Back Link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-[10px] tracking-widest uppercase font-bold text-muted-foreground hover:text-primary transition-colors duration-300 mb-8"
        >
          <ArrowLeftIcon className="w-3.5 h-3.5" /> Back to Journal
        </Link>

        {/* Hero Meta Info */}
        <div className="mb-10">
          <span className="text-[9px] tracking-[0.25em] text-primary font-bold uppercase block mb-3">
            {post.category}
          </span>
          <h1 className="text-3xl md:text-5xl font-serif font-bold tracking-tight text-foreground leading-tight mb-6">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-xs text-muted-foreground font-mono uppercase tracking-wider pb-6 border-b border-white/5">
            <span className="flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-primary" /> {post.author}
            </span>
            <span className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-primary" /> {post.date}
            </span>
            <span className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4 text-primary" /> {post.readTime}
            </span>
          </div>
        </div>

        {/* Big Editorial Image */}
        <div className="glass-card rounded-3xl overflow-hidden aspect-[16/9] border border-white/5 bg-white/5 mb-12 shadow-2xl">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content Body */}
        <div className="glass-card rounded-3xl p-8 md:p-12 border border-white/5 relative">
          <div className="flex flex-col gap-6 text-sm md:text-base text-muted-foreground leading-relaxed">
            {post.content.map((paragraph, index) => {
              if (paragraph.startsWith("## ")) {
                const titleText = paragraph.replace("## ", "");
                return (
                  <h2
                    key={index}
                    className="font-serif text-xl md:text-2xl font-bold text-foreground mt-6 mb-2 tracking-tight"
                  >
                    {titleText}
                  </h2>
                );
              }
              return (
                <p key={index} className="text-muted-foreground text-xs md:text-sm">
                  {paragraph}
                </p>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
