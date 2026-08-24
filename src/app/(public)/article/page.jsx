'use client'
import React from 'react'
import { Calendar, Clock, ArrowRight, User } from "lucide-react";
import { motion } from "framer-motion";
import { articles, categories } from '../data/articles';
import PageTransition from '../_components/PageTransition';
import Link from 'next/link';

export default function ArticlePage() {

    const featuredArticles = articles.filter((a) => a.featured);
    const regularArticles = articles.filter((a) => !a.featured);


    return (
        <PageTransition>
            <div className="min-h-screen bg-background">


                {/* Hero Section */}
                <section className="relative pt-32 pb-20 overflow-hidden">
                    <div className="absolute inset-0 grid-pattern opacity-25 pointer-events-none" />
                    <div className="absolute top-1/3 left-1/4 w-80 h-80 orb-primary rounded-full blur-[120px] pointer-events-none" />
                    <div className="absolute bottom-1/4 right-1/4 w-64 h-64 orb-secondary rounded-full blur-[100px] pointer-events-none" />

                    <div className="container mx-auto px-6 relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="max-w-3xl mx-auto text-center"
                        >
                            <span className="text-primary text-sm font-semibold tracking-wider uppercase bg-primary/10 px-3.5 py-1 rounded-full border border-primary/20">
                                Blog & Insights
                            </span>
                            <h1 className="font-display text-4xl md:text-6xl font-extrabold mt-6 mb-6 text-foreground">
                                Tech <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-600 to-indigo-600">Articles</span>
                            </h1>
                            <p className="text-xl text-muted-foreground leading-relaxed">
                                Insights, tutorials, and best practices from our team of experts. Stay updated
                                with the latest in technology and software development.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Categories */}
                <section className="py-8 border-b border-border/40">
                    <div className="container mx-auto px-6">
                        <div className="flex flex-wrap justify-center gap-2.5">
                            {categories.map((category, index) => (
                                <motion.button
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer ${index === 0
                                        ? "bg-primary text-primary-foreground shadow-xs"
                                        : "bg-card border border-border/80 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                                        }`}
                                >
                                    {category}
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Featured Articles */}
                <section className="py-16">
                    <div className="container mx-auto px-6">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="font-display text-2xl md:text-3xl font-extrabold text-foreground mb-8"
                        >
                            Featured Articles
                        </motion.h2>
                        <div className="grid md:grid-cols-2 gap-8">
                            {featuredArticles.map((article, index) => (
                                <motion.article
                                    key={index}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                    whileHover={{ y: -8 }}
                                    className="group"
                                >
                                    <Link href={`/article/${article.slug}`}>
                                        <div className="glass-card overflow-hidden hover:border-primary/50 transition-all duration-300 cursor-pointer">
                                            <div className="relative h-56 overflow-hidden">
                                                <img
                                                    src={article.image}
                                                    alt={article.title}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent pointer-events-none" />
                                                <span className="absolute bottom-4 left-4 px-3 py-1 rounded-full bg-primary/90 text-primary-foreground text-xs font-semibold shadow-xs">
                                                    {article.category}
                                                </span>
                                            </div>
                                            <div className="p-6">
                                                <h3 className="font-display text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                                                    {article.title}
                                                </h3>
                                                <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-2">
                                                    {article.excerpt}
                                                </p>
                                                <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                                                    <div className="flex items-center gap-4">
                                                        <span className="flex items-center gap-1">
                                                            <User className="w-3 h-3 text-primary" />
                                                            {article.author.name}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-3 h-3 text-primary" />
                                                            {article.date}
                                                        </span>
                                                    </div>
                                                    <span className="flex items-center gap-1 text-primary">
                                                        <Clock className="w-3 h-3" />
                                                        {article.readTime}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.article>
                            ))}
                        </div>
                    </div>
                </section>

                {/* All Articles */}
                <section className="py-16 bg-secondary/30 dark:bg-card/30">
                    <div className="container mx-auto px-6">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="font-display text-2xl md:text-3xl font-extrabold text-foreground mb-8"
                        >
                            Latest Articles
                        </motion.h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {regularArticles.map((article, index) => (
                                <motion.article
                                    key={index}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                    whileHover={{ y: -5 }}
                                    className="group"
                                >
                                    <Link href={`/article/${article.slug}`}>
                                        <div className="glass-card overflow-hidden hover:border-primary/50 transition-all duration-300 cursor-pointer">
                                            <div className="relative h-44 overflow-hidden">
                                                <img
                                                    src={article.image}
                                                    alt={article.title}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent pointer-events-none" />
                                                <span className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-full bg-primary/90 text-primary-foreground text-xs font-semibold shadow-xs">
                                                    {article.category}
                                                </span>
                                            </div>
                                            <div className="p-5">
                                                <h3 className="font-display text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                                    {article.title}
                                                </h3>
                                                <p className="text-muted-foreground text-sm leading-relaxed mb-3 line-clamp-2">
                                                    {article.excerpt}
                                                </p>
                                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                    <span>{article.date}</span>
                                                    <span className="flex items-center gap-1 text-primary font-semibold group-hover:gap-2 transition-all">
                                                        Read more <ArrowRight className="w-3 h-3" />
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.article>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Newsletter Section */}
                <section className="py-20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-background via-card/50 to-background pointer-events-none" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] orb-primary rounded-full blur-[150px] pointer-events-none" />

                    <div className="container mx-auto px-6 relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                            className="max-w-2xl mx-auto text-center"
                        >
                            <h2 className="font-display text-3xl md:text-4xl font-extrabold mb-6 text-foreground">
                                Subscribe to Our <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-600 to-indigo-600">Newsletter</span>
                            </h2>
                            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                                Get the latest articles, tutorials, and industry insights delivered to your inbox
                                weekly.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="flex-1 px-4 py-3 rounded-xl bg-card border border-border/80 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors shadow-xs"
                                />
                                <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary via-blue-600 to-indigo-600 text-white font-bold shadow-md hover:shadow-lg transition-all cursor-pointer">
                                    Subscribe
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </section>


            </div>
        </PageTransition>
    )
}
