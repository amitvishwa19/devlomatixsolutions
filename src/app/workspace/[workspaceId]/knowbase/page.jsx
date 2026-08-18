'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import {
    BookOpen,
    FolderTree,
    ThumbsUp,
    Search,
    Plus,
    FileText,
    ExternalLink,
    Sparkles,
    Eye,
    Globe,
    Lock,
    Clock,
    ChevronRight,
    Bot,
    ArrowUpRight,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { getArticles, getCategories } from './_actions/knowbase-actions';
import { CreateArticleModal } from './_components/CreateArticleModal';
import { ArticleViewerModal } from './_components/ArticleViewerModal';
import { AiSearchModal } from './_components/AiSearchModal';

export default function KnowBaseDashboard() {
    const params = useParams();
    const workspaceId = params?.workspaceId;

    const [articles, setArticles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [isAiSearchOpen, setIsAiSearchOpen] = useState(false);

    const loadData = async () => {
        setLoading(true);
        const [artRes, catRes] = await Promise.all([
            getArticles(workspaceId),
            getCategories(workspaceId)
        ]);
        if (artRes.success) setArticles(artRes.data);
        if (catRes.success) setCategories(catRes.data);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [workspaceId]);

    const stats = [
        { label: 'Published Articles', value: `${articles.length}`, change: '+5 this month', icon: FileText, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
        { label: 'Help Categories', value: `${categories.length}`, change: 'Public & Internal', icon: FolderTree, color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20' },
        { label: 'Helpful Rating (CSAT)', value: '94.8%', change: '840 positive votes', icon: ThumbsUp, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
        { label: 'AI Q&A Queries', value: '2,150', change: 'Deflected 38% tickets', icon: Bot, color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' }
    ];

    const handleInspect = (art) => {
        setSelectedArticle(art);
        setIsViewerOpen(true);
    };

    const filtered = articles.filter(a =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-500/10 via-primary/5 to-transparent p-5 rounded-2xl border border-border/80">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                            <BookOpen className="w-5 h-5 text-blue-500" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-foreground">KnowBase Knowledge & Docs</h1>
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/30 text-[10px] font-mono">
                            HELP CENTER & WIKI
                        </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground max-w-xl">
                        Publish public customer help centers, documentation guides, and internal team SOPs with AI-powered instant Q&A.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsAiSearchOpen(true)}
                        className="h-8 text-xs border-border/80 gap-1.5 shadow-xs text-purple-400"
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        AI RAG Search
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => setIsCreateOpen(true)}
                        className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-xs"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        New Article
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                    >
                        <Card className="bg-card border-border/80 shadow-xs hover:border-border transition-colors">
                            <CardHeader className="py-0 px-3 border-b border-border/40 space-y-0">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{stat.label}</span>
                                    <div className={`w-7 h-7 rounded-md flex items-center justify-center border shrink-0 ${stat.color}`}>
                                        <stat.icon className="w-3.5 h-3.5" />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-3 pt-2">
                                <div className="text-xl font-bold text-foreground">{stat.value}</div>
                                <span className="text-[10px] text-muted-foreground">{stat.change}</span>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Popular Articles Table */}
            <div className="space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-500" />
                        <h2 className="text-sm font-bold text-foreground">Knowledge Articles & Documentation</h2>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                            <Input
                                placeholder="Search guides, wikis..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-8 pl-8 text-xs bg-secondary/30 border-border/80"
                            />
                        </div>
                        <Link href={`/workspace/${workspaceId}/knowbase/articles`}>
                            <Button variant="outline" size="sm" className="h-8 px-2.5 border-border/80 text-xs gap-1">
                                <span>All Articles</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                            </Button>
                        </Link>
                    </div>
                </div>

                {loading ? (
                    <div className="py-12 text-center text-xs text-muted-foreground">
                        <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" /> Loading articles...
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-12 text-center text-xs text-muted-foreground">
                        No articles match your query
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filtered.map((art) => (
                            <Card
                                key={art.id}
                                onClick={() => handleInspect(art)}
                                className="bg-card border-border/80 p-3.5 shadow-xs hover:border-blue-500/40 cursor-pointer transition-all flex items-center justify-between gap-3"
                            >
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-[9px] font-mono">{art.category}</Badge>
                                        <Badge
                                            variant="outline"
                                            className={`text-[9px] font-semibold px-1.5 py-0 rounded ${
                                                art.visibility === 'Public' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                                            }`}
                                        >
                                            {art.visibility}
                                        </Badge>
                                    </div>
                                    <h3 className="font-semibold text-xs text-foreground line-clamp-1">{art.title}</h3>
                                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                                        <span>{art.views} views</span>
                                        <span>•</span>
                                        <span className="text-emerald-500 font-medium">{art.helpful} helpful</span>
                                        <span>•</span>
                                        <span>Updated {art.updated}</span>
                                    </div>
                                </div>

                                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground shrink-0">
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Article Modal */}
            <CreateArticleModal
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                workspaceId={workspaceId}
                categories={categories}
                onArticleCreated={() => loadData()}
            />

            {/* Article Viewer Modal */}
            <ArticleViewerModal
                open={isViewerOpen}
                onOpenChange={setIsViewerOpen}
                article={selectedArticle}
            />

            {/* AI RAG Search Modal */}
            <AiSearchModal
                open={isAiSearchOpen}
                onOpenChange={setIsAiSearchOpen}
                articles={articles}
                onSelectArticle={(art) => handleInspect(art)}
            />
        </div>
    );
}
