'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    FolderTree,
    Plus,
    BookOpen,
    Eye,
    Trash2,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { getCategories, deleteCategory } from '../_actions/knowbase-actions';
import { CreateCategoryModal } from '../_components/CreateCategoryModal';

export default function KnowBaseCategoriesPage() {
    const params = useParams();
    const workspaceId = params?.workspaceId;

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const loadData = async () => {
        setLoading(true);
        const res = await getCategories(workspaceId);
        if (res.success) setCategories(res.data);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [workspaceId]);

    const handleDelete = async (id) => {
        const res = await deleteCategory(workspaceId, id);
        if (res.success) {
            toast.success("Category deleted");
            loadData();
        }
    };

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                            <FolderTree className="w-4 h-4 text-blue-500" />
                        </div>
                        <h1 className="text-lg font-bold text-foreground">Knowledge Collections & Categories</h1>
                    </div>
                    <p className="text-xs text-muted-foreground">Organize articles into structured collections for customer navigation and team discovery.</p>
                </div>

                <Button
                    size="sm"
                    onClick={() => setIsCreateOpen(true)}
                    className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-xs"
                >
                    <Plus className="w-3.5 h-3.5" />
                    New Collection
                </Button>
            </div>

            {loading ? (
                <div className="py-12 text-center text-xs text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" /> Loading categories...
                </div>
            ) : categories.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground">
                    No categories created yet
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((cat) => (
                        <Card key={cat.id} className="bg-card border-border/80 p-4 space-y-2.5 shadow-xs hover:border-blue-500/40 transition-all flex flex-col justify-between">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                                        <FolderTree className="w-4 h-4" />
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Badge variant="secondary" className="text-[10px]">{cat.count} articles</Badge>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(cat.id)}
                                            className="h-6 w-6 text-rose-500 hover:bg-rose-500/10"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-xs text-foreground">{cat.name}</h3>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">{cat.views} total readers</p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create Category Modal */}
            <CreateCategoryModal
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                workspaceId={workspaceId}
                onCategoryCreated={() => loadData()}
            />
        </div>
    );
}
