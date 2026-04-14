'use client'
import React from 'react'
import { Calendar, Clock, ArrowLeft, ArrowRight, Twitter, Linkedin, Facebook, Link as LinkIcon, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useParams, useRouter } from 'next/navigation';
import { articles } from '../../data/articles';
import PageTransition from '../../_components/PageTransition';
import Link from 'next/link';

export default function ArticleDetailPage() {

    const { slug } = useParams();
    const navigate = useRouter();


    const article = articles.find((a) => a.slug === slug);
    const relatedArticles = articles
        .filter((a) => a.slug !== slug && a.category === article?.category)
        .slice(0, 3);

    if (!article) {
        return (
            <PageTransition>
                <div className="min-h-screen bg-background">
                    <Navbar />
                    <div className="container mx-auto px-6 pt-32 pb-20 text-center">
                        <h1 className="font-display text-4xl font-bold mb-4">Article Not Found</h1>
                        <p className="text-muted-foreground mb-8">The article you're looking for doesn't exist.</p>
                        <Button onClick={() => navigate.push("/article")}>Back to Articles</Button>
                    </div>
                    <Footer />
                </div>
            </PageTransition>
        );
    }

    const handleShare = (platform) => {
        const url = window.location.href;
        const text = article.title;

        const shareUrls = {
            twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        };

        if (platform === "copy") {
            navigator.clipboard.writeText(url);
            toast({
                title: "Link copied!",
                description: "The article link has been copied to your clipboard.",
            });
        } else {
            window.open(shareUrls[platform], "_blank", "width=600,height=400");
        }
    };

    return (
        <PageTransition>
            <div className="min-h-screen bg-background">


                {/* Hero Section */}
                <section className="relative pt-32 pb-12 overflow-hidden">
                    <div className="absolute inset-0 grid-pattern opacity-30" />
                    <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-primary/15 rounded-full blur-[120px]" />

                    <div className="container mx-auto px-6 relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="max-w-4xl mx-auto"
                        >
                            <Link
                                href="/article"
                                className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 mr-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Articles
                            </Link>

                            <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium mb-6">
                                {article.category}
                            </span>

                            <h1 className="font-display text-3xl md:text-5xl font-bold mb-6 leading-tight">
                                {article.title}
                            </h1>

                            <p className="text-xl text-muted-foreground mb-8">{article.excerpt}</p>

                            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={article.author.avatar}
                                        alt={article.author.name}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                    <div>
                                        <p className="font-medium text-foreground">{article.author.name}</p>
                                        <p className="text-xs">{article.author.role}</p>
                                    </div>
                                </div>
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {article.date}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {article.readTime}
                                </span>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Featured Image */}
                <section className="pb-12">
                    <div className="container mx-auto px-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="max-w-4xl mx-auto"
                        >
                            <img
                                src={article.image}
                                alt={article.title}
                                className="w-full h-[400px] object-cover rounded-2xl"
                            />
                        </motion.div>
                    </div>
                </section>

                {/* Article Content */}
                <section className="pb-16">
                    <div className="container mx-auto px-6">
                        <div className="max-w-4xl mx-auto flex gap-8">
                            {/* Social Share Sidebar */}
                            <motion.aside
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                                className="hidden lg:flex flex-col gap-3 sticky top-32 h-fit"
                            >
                                <p className="text-xs text-muted-foreground font-medium mb-2">Share</p>
                                <button
                                    onClick={() => handleShare("twitter")}
                                    className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                                >
                                    <Twitter className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleShare("linkedin")}
                                    className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                                >
                                    <Linkedin className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleShare("facebook")}
                                    className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                                >
                                    <Facebook className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleShare("copy")}
                                    className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                                >
                                    <LinkIcon className="w-4 h-4" />
                                </button>
                            </motion.aside>

                            {/* Main Content */}
                            <motion.article
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                                className="flex-1 prose prose-lg dark:prose-invert max-w-none
                         prose-headings:font-display prose-headings:font-bold
                         prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4
                         prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                         prose-p:text-muted-foreground prose-p:leading-relaxed
                         prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                         prose-strong:text-foreground
                         prose-ul:text-muted-foreground prose-ol:text-muted-foreground
                         prose-li:marker:text-primary
                         prose-code:bg-secondary prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                         prose-pre:bg-secondary prose-pre:border prose-pre:border-border"
                            >
                                <div dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, "<br />") }} />
                            </motion.article>
                        </div>
                    </div>
                </section>

                {/* Tags */}
                <section className="pb-12">
                    <div className="container mx-auto px-6">
                        <div className="max-w-4xl mx-auto lg:pl-[72px]">
                            <div className="flex flex-wrap gap-2">
                                {article.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="px-3 py-1 rounded-full bg-secondary/50 text-sm text-muted-foreground"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Mobile Share */}
                <section className="pb-12 lg:hidden">
                    <div className="container mx-auto px-6">
                        <div className="max-w-4xl mx-auto">
                            <p className="text-sm font-medium mb-3">Share this article</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleShare("twitter")}
                                    className="flex-1 py-2 rounded-xl bg-secondary/50 flex items-center justify-center gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                                >
                                    <Twitter className="w-4 h-4" />
                                    <span className="text-sm">Twitter</span>
                                </button>
                                <button
                                    onClick={() => handleShare("linkedin")}
                                    className="flex-1 py-2 rounded-xl bg-secondary/50 flex items-center justify-center gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                                >
                                    <Linkedin className="w-4 h-4" />
                                    <span className="text-sm">LinkedIn</span>
                                </button>
                                <button
                                    onClick={() => handleShare("copy")}
                                    className="flex-1 py-2 rounded-xl bg-secondary/50 flex items-center justify-center gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                                >
                                    <LinkIcon className="w-4 h-4" />
                                    <span className="text-sm">Copy</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Author Bio */}
                <section className="py-12 border-t border-border/50">
                    <div className="container mx-auto px-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="max-w-4xl mx-auto lg:pl-[72px]"
                        >
                            <div className="glass-card p-8">
                                <div className="flex flex-col sm:flex-row gap-6">
                                    <img
                                        src={article.author.avatar}
                                        alt={article.author.name}
                                        className="w-20 h-20 rounded-full object-cover flex-shrink-0"
                                    />
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Written by</p>
                                        <h3 className="font-display text-xl font-semibold mb-1">{article.author.name}</h3>
                                        <p className="text-primary text-sm font-medium mb-3">{article.author.role}</p>
                                        <p className="text-muted-foreground text-sm leading-relaxed mb-4">{article.author.bio}</p>
                                        <div className="flex gap-3">
                                            {article.author.twitter && (
                                                <a
                                                    href={`https://twitter.com/${article.author.twitter}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                                                >
                                                    <Twitter className="w-4 h-4" />
                                                </a>
                                            )}
                                            {article.author.linkedin && (
                                                <a
                                                    href={`https://linkedin.com/in/${article.author.linkedin}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                                                >
                                                    <Linkedin className="w-4 h-4" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Related Articles */}
                {relatedArticles.length > 0 && (
                    <section className="py-16 bg-card/30">
                        <div className="container mx-auto px-6">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="max-w-6xl mx-auto"
                            >
                                <h2 className="font-display text-2xl font-bold mb-8">Related Articles</h2>
                                <div className="grid md:grid-cols-3 gap-6">
                                    {relatedArticles.map((related, index) => (
                                        <motion.article
                                            key={related.slug}
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            viewport={{ once: true }}
                                            whileHover={{ y: -5 }}
                                            className="group"
                                        >
                                            <Link to={`/articles/${related.slug}`}>
                                                <div className="glass-card overflow-hidden hover:border-primary/50 transition-all duration-300">
                                                    <div className="relative h-40 overflow-hidden">
                                                        <img
                                                            src={related.image}
                                                            alt={related.title}
                                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                                                    </div>
                                                    <div className="p-5">
                                                        <h3 className="font-display text-lg font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                                            {related.title}
                                                        </h3>
                                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                            <span>{related.date}</span>
                                                            <span className="flex items-center gap-1 text-primary font-medium">
                                                                Read more <ArrowRight className="w-3 h-3" />
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        </motion.article>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    </section>
                )}


            </div>
        </PageTransition>
    )
}
