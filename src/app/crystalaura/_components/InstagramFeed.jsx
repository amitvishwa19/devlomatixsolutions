'use client';

import React from "react";
import { motion } from "framer-motion";
import { Instagram } from "lucide-react";

const instagramPosts = [
  { image: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=400&fit=crop", likes: 234 },
  { image: "https://images.unsplash.com/photo-1603344797033-f0f4f587ab60?w=400&h=400&fit=crop", likes: 189 },
  { image: "https://images.unsplash.com/photo-1615529328331-f8917597711f?w=400&h=400&fit=crop", likes: 312 },
  { image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=400&fit=crop", likes: 156 },
  { image: "https://images.unsplash.com/photo-1545389336-cf090694435e?w=400&h=400&fit=crop", likes: 278 },
  { image: "https://images.unsplash.com/photo-1600298882525-c4b2100e1000?w=400&h=400&fit=crop", likes: 198 },
];

const InstagramFeed = () => {
  return (
    <section className="py-20 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <p className="text-primary text-[10px] tracking-[0.3em] uppercase mb-3 font-sans font-black">
            ✦ Follow Our Journey ✦
          </p>
          <h2 className="font-serif text-4xl md:text-5xl text-foreground mb-4">
            <span className="text-gold-gradient font-semibold">@crystalaura</span> on Instagram
          </h2>
          <p className="text-muted-foreground font-light max-w-xl mx-auto text-sm">
            Daily crystal inspiration, behind-the-scenes, and spiritual wisdom.
          </p>
          <div className="section-divider w-48 mx-auto mt-6" />
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {instagramPosts.map((post, i) => (
            <motion.a
              key={i}
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="group relative aspect-square overflow-hidden rounded-xl bg-muted"
            >
              <img
                src={post.image}
                alt={`Instagram post ${i + 1}`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                <div className="text-center">
                  <Instagram className="w-6 h-6 text-primary mx-auto mb-1" />
                  <p className="text-foreground text-xs font-sans">♥ {post.likes}</p>
                </div>
              </div>
            </motion.a>
          ))}
        </div>

        <div className="text-center mt-8">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary text-[10px] font-sans tracking-[0.2em] uppercase font-black hover:opacity-80 transition-opacity"
          >
            <Instagram className="w-4 h-4" />
            Follow us on Instagram
          </a>
        </div>
      </div>
    </section>
  );
};

export default InstagramFeed;
