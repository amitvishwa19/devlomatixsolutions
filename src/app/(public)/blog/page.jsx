"use client"
import Link from "next/link";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { blogPosts } from "../_data/products";
import SEO from "../_components/SEO";

const BlogPage = () => {
  return (
    <div className="pt-20">
      <SEO title="Crystal Blog & Guides" description="Articles, rituals and guides on healing crystals, chakras, Vastu and gemstone care from CrystalAura." path="/blog" />
      <section className="py-16 text-center">
        <p className="text-gold text-sm tracking-widest mb-2">✦ CRYSTAL WISDOM ✦</p>
        <h1 className="font-serif text-5xl md:text-7xl mb-4">
          <span className="text-gold italic">Sacred</span> Journal
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Guides, tips, and ancient wisdom for your spiritual journey with healing crystals.
        </p>
        <div className="w-20 h-1 bg-gold mx-auto mt-6 rounded-full" />
      </section>
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post, i) => (
            <Link
              href={`/blog/${post.slug}`}
              key={post.id}
              className="block"
            >
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-card rounded-xl overflow-hidden group"
            >
              <div className="relative overflow-hidden">
                <img src={post.image} alt={post.title} className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500" />
                <span className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm text-xs px-3 py-1 rounded-full text-gold tracking-wider">{post.category}</span>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {post.date}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime}</span>
                </div>
                <h2 className="font-serif text-xl font-semibold mb-2 group-hover:text-gold transition-colors">{post.title}</h2>
                <p className="text-sm text-muted-foreground mb-4">{post.excerpt}</p>
                <span className="inline-flex items-center gap-2 text-sm text-gold tracking-widest group-hover:gap-3 transition-all">
                  READ FULL ENTRY <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </motion.article>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default BlogPage;