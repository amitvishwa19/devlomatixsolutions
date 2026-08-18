'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    BookOpen,
    Plus,
    Search,
    Globe,
    Lock,
    Eye,
    ThumbsUp,
    Trash2,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { getArticles, getCategories, deleteArticle } from '../_actions/knowbase-actions';
import { CreateArticleModal } from '../_components/CreateArticleModal';
import { ArticleViewerModal } from '../_components/ArticleViewerModal';

export default function KnowBaseArticlesPage() {
    const params = useParams();
    const workspaceId = params?.workspaceId;

    const [articles, setArticles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState('All');

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

    const handleInspect = (art) => {
        setSelectedArticle(art);
        setIsViewerOpen(true);
    };

    const handleDelete = async (id) => {
        const res = await deleteArticle(workspaceId, id);
        if (res.success) {
            toast.success("Article deleted");
            loadData();
        }
    };

    const filtered = articles.filter(a => {
        const matchesQuery = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCat = categoryFilter === 'All' || a.category === categoryFilter;
        return matchesQuery && matchesCat;
    });

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                            <BookOpen className="w-4 h-4 text-blue-500" />
                        </div>
                        <h1 className="text-lg font-bold text-foreground">Knowledge Base Articles & Guides</h1>
                    </div>
                    <p className="text-xs text-muted-foreground">Draft, format, and publish customer support guides and internal team SOPs.</p>
                </div>

                <Button
                    size="sm"
                    onClick={() => setIsCreateOpen(true)}
                    className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-xs"
                >
                    <Plus className="w-3.5 h-3.5" />
                    New Article
                </Button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                    {['All', 'Public', 'Internal'].map((vis) => (
                        <Button
                            key={vis}
                            variant={categoryFilter === vis ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setCategoryFilter(vis)}
                            className={`h-7 text-xs ${
                                categoryFilter === vis ? 'bg-blue-600 text-white hover:bg-blue-700' : 'border-border/80'
                            }`}
                        >
                            {vis}
                        </Button>
                    ))}
                </div>

                <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                    <Input
                        placeholder="Search articles..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-8 pl-8 text-xs bg-secondary/30 border-border/80"
                    />
                </div>
            </div>

            {loading ? (
                <div className="py-12 text-center text-xs text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" /> Loading articles...
                </div>
            ) : filtered.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground">
                    No articles found matching your filter
                </div>
            ) : (
                <div className="space-y-2.5">
                    {filtered.map((art) => (
                        <Card
                            key={art.id}
                            onClick={() => handleInspect(art)}
                            className="bg-card border-border/80 p-4 shadow-xs hover:border-blue-500/40 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
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
                                <h3 className="font-semibold text-xs text-foreground">{art.title}</h3>
                                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                                    <span>{art.views} views</span>
                                    <span>•</span>
                                    <span className="text-emerald-500 font-medium">{art.helpful} helpful</span>
                                    <span>•</span>
                                    <span>Updated {art.updated}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleInspect(art)}
                                    className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1"
                                >
                                    <Eye className="w-3.5 h-3.5" /> Read
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDelete(art.id)}
                                    className="h-7 w-7 text-rose-500 hover:bg-rose-500/10"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

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
        </div>
    );
}
