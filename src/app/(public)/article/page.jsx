'use client'
import { motion } from "framer-motion";
import { useState } from "react";
import { Search, Calendar, Clock, ArrowRight, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const categories = [
    "All",
    "Hospital Management",
    "Healthcare Tech",
    "Patient Care",
    "Industry News",
    "Tips & Guides",
];

const blogPosts = [
    {
        id: 1,
        title: "10 Ways to Improve Patient Experience in Your Hospital",
        excerpt: "Discover proven strategies to enhance patient satisfaction and streamline hospital operations for better outcomes.",
        category: "Patient Care",
        date: "Jan 15, 2026",
        readTime: "5 min read",
        image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&h=400&fit=crop",
        featured: true,
    },
    {
        id: 2,
        title: "The Future of Hospital Management Systems in 2026",
        excerpt: "Explore upcoming trends in healthcare technology and how modern HMS solutions are shaping the future of medical care.",
        category: "Healthcare Tech",
        date: "Jan 12, 2026",
        readTime: "7 min read",
        image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop",
        featured: true,
    },
    {
        id: 3,
        title: "NABH Accreditation: Complete Guide for Hospitals",
        excerpt: "Everything you need to know about NABH accreditation process, requirements, and how HMS can help achieve compliance.",
        category: "Hospital Management",
        date: "Jan 10, 2026",
        readTime: "10 min read",
        image: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=600&h=400&fit=crop",
        featured: false,
    },
    {
        id: 4,
        title: "Reducing Billing Errors with Automated Systems",
        excerpt: "Learn how automated billing systems can reduce errors by up to 90% and improve revenue cycle management.",
        category: "Tips & Guides",
        date: "Jan 8, 2026",
        readTime: "6 min read",
        image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=400&fit=crop",
        featured: false,
    },
    {
        id: 5,
        title: "ABDM Integration: What Hospitals Need to Know",
        excerpt: "A comprehensive guide to integrating with India's Ayushman Bharat Digital Mission for healthcare providers.",
        category: "Industry News",
        date: "Jan 5, 2026",
        readTime: "8 min read",
        image: "https://images.unsplash.com/photo-1551076805-e1869033e561?w=600&h=400&fit=crop",
        featured: false,
    },
    {
        id: 6,
        title: "Pharmacy Management: Best Practices for 2026",
        excerpt: "Optimize your hospital pharmacy operations with these proven management strategies and technology solutions.",
        category: "Tips & Guides",
        date: "Jan 3, 2026",
        readTime: "5 min read",
        image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&h=400&fit=crop",
        featured: false,
    },
];

const ArticlePage = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");

    const filteredPosts = blogPosts.filter((post) => {
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === "All" || post.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const featuredPosts = filteredPosts.filter((post) => post.featured);
    const regularPosts = filteredPosts.filter((post) => !post.featured);

    return (
        <div className="min-h-screen bg-background w-full">

            <main className=" ">
                {/* Hero Section */}
                <section className="section-padding bg-gradient-to-b from-secondary/50 to-background">
                    <div className="container mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-center max-w-3xl mx-auto"
                        >
                            <span className="module-badge mb-4">Resources</span>
                            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mt-4 mb-6">
                                Blog & <span className="hero-gradient-text">Resources</span>
                            </h1>
                            <p className="text-lg text-muted-foreground mb-8">
                                Stay updated with the latest insights, guides, and news in hospital management and healthcare technology.
                            </p>

                            {/* Search Bar */}
                            <div className="relative max-w-xl mx-auto">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search articles..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-12 pr-4 py-6 text-lg rounded-xl bg-card border-border"
                                />
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Categories */}
                <section className="py-8 border-b border-border">
                    <div className="container mx-auto">
                        <div className="flex flex-wrap justify-center gap-3">
                            {categories.map((category) => (
                                <Button
                                    key={category}
                                    variant={activeCategory === category ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setActiveCategory(category)}
                                    className="rounded-full"
                                >
                                    {category}
                                </Button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Featured Posts */}
                {featuredPosts.length > 0 && (
                    <section className="section-padding">
                        <div className="container mx-auto">
                            <h2 className="font-display text-2xl font-bold text-foreground mb-8">
                                Featured Articles
                            </h2>
                            <div className="grid md:grid-cols-2 gap-8">
                                {featuredPosts.map((post, index) => (
                                    <motion.article
                                        key={post.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                        className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/30 hover:shadow-xl transition-all"
                                    >
                                        <div className="aspect-video overflow-hidden">
                                            <img
                                                src={post.image}
                                                alt={post.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                        <div className="p-6">
                                            <div className="flex items-center gap-3 mb-4">
                                                <Badge variant="secondary">{post.category}</Badge>
                                                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                                    <Calendar className="w-4 h-4" />
                                                    {post.date}
                                                </span>
                                            </div>
                                            <h3 className="font-display text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                                                {post.title}
                                            </h3>
                                            <p className="text-muted-foreground mb-4">{post.excerpt}</p>
                                            <div className="flex items-center justify-between">
                                                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                                    <Clock className="w-4 h-4" />
                                                    {post.readTime}
                                                </span>
                                                <Link href={`/article/${'improve-patient-experience'}`} variant="ghost" size="sm" className="gap-2 group-hover:text-primary">
                                                    <span className="flex flex-row items-center gap-2">
                                                        Read More <ArrowRight className="w-4 h-4" />
                                                    </span>
                                                </Link>
                                            </div>
                                        </div>
                                    </motion.article>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* All Posts */}
                <section className="section-padding bg-secondary/30">
                    <div className="container mx-auto">
                        <h2 className="font-display text-2xl font-bold text-foreground mb-8">
                            All Articles
                        </h2>
                        {regularPosts.length > 0 ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {regularPosts.map((post, index) => (
                                    <motion.article
                                        key={post.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                        className="group bg-card rounded-xl overflow-hidden border border-border hover:border-primary/30 hover:shadow-lg transition-all"
                                    >
                                        <div className="aspect-video overflow-hidden">
                                            <img
                                                src={post.image}
                                                alt={post.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                        <div className="p-5">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Badge variant="outline" className="text-xs">{post.category}</Badge>
                                                <span className="text-xs text-muted-foreground">{post.date}</span>
                                            </div>
                                            <h3 className="font-display font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                                {post.title}
                                            </h3>
                                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{post.excerpt}</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-muted-foreground">{post.readTime}</span>
                                                <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        </div>
                                    </motion.article>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">No articles found matching your criteria.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Newsletter CTA */}
                <section className="section-padding">
                    <div className="container mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-3xl p-8 md:p-12 text-center border border-primary/20"
                        >
                            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
                                Subscribe to Our Newsletter
                            </h2>
                            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                                Get the latest healthcare insights, product updates, and industry news delivered to your inbox.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                                <Input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="flex-1 bg-background"
                                />
                                <Button className="hero-gradient text-primary-foreground">
                                    Subscribe
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </main>

        </div>
    );
};

export default ArticlePage;
