"use client"
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Calendar, Clock, User } from "lucide-react";
import { blogPosts } from "../../_data/products";

const renderParagraph = (line, i) => {
  if (line.startsWith("## ")) {
    return (
      <h2 key={i} className="font-serif text-2xl md:text-3xl text-foreground mt-10 mb-3">
        <span className="text-gold">✦</span> {line.replace(/^##\s*/, "")}
      </h2>
    );
  }
  return (
    <p key={i} className="text-muted-foreground leading-relaxed mb-5">
      {line}
    </p>
  );
};

const BlogPostPage = () => {
  const params = useParams();
  const slug = params.slug;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="pt-24 text-center">
        <p className="text-muted-foreground">Post not found</p>
        <Link href="/blog" className="text-gold mt-4 inline-block">Back to Journal</Link>
      </div>
    );
  }

  const related = blogPosts.filter((p) => p.id !== post.id).slice(0, 3);

  return (
    <div className="pt-20 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/blog" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mt-8 mb-6 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Journal
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <span className="inline-block text-gold text-xs tracking-widest mb-4">{post.category}</span>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight">{post.title}</h1>
          <div className="flex flex-wrap items-center gap-5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-gold" /> {post.author}</span>
            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-gold" /> {post.date}</span>
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-gold" /> {post.readTime}</span>
          </div>
        </motion.div>

        <motion.img
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          src={post.image}
          alt={post.title}
          className="w-full h-[420px] object-cover rounded-2xl mb-12"
        />

        <motion.article initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="prose prose-invert max-w-none">
          {post.content?.map(renderParagraph)}
        </motion.article>

        <div className="mt-16 pt-10 border-t border-border">
          <p className="text-gold text-xs tracking-widest mb-4">✦ CONTINUE READING ✦</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {related.map((p) => (
              <Link key={p.id} href={`/blog/${p.slug}`} className="glass-card rounded-xl overflow-hidden group">
                <div className="overflow-hidden">
                  <img src={p.image} alt={p.title} className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-4">
                  <span className="text-[10px] text-gold tracking-widest">{p.category}</span>
                  <h3 className="font-serif font-semibold mt-1 text-sm group-hover:text-gold transition-colors line-clamp-2">{p.title}</h3>
                  <span className="inline-flex items-center gap-1 text-xs text-gold mt-3 group-hover:gap-2 transition-all">
                    Read <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPostPage;