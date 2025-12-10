'use client'
import React from 'react'
import { useState } from "react";
import { Tag, Folder, LayoutGrid } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoryManager } from '../_components/CategoryManager';
import { TagManager } from '../_components/TagManager';
import { ScrollArea } from '@/components/ui/scroll-area';


// Sample data
const initialTags = [
    { id: "1", name: "Featured", color: "tag-orange", count: 12 },
    { id: "2", name: "Tutorial", color: "tag-blue", count: 8 },
    { id: "3", name: "News", color: "tag-green", count: 24 },
    { id: "4", name: "Review", color: "tag-pink", count: 5 },
    { id: "5", name: "Guide", color: "tag-purple", count: 15 },
];

const initialCategories = [
    { id: "1", name: "Technology", parentId: null, count: 45 },
    { id: "2", name: "Web Development", parentId: "1", count: 20 },
    { id: "3", name: "Mobile Apps", parentId: "1", count: 15 },
    { id: "4", name: "AI & Machine Learning", parentId: "1", count: 10 },
    { id: "5", name: "Design", parentId: null, count: 30 },
    { id: "6", name: "UI/UX", parentId: "5", count: 18 },
    { id: "7", name: "Branding", parentId: "5", count: 12 },
    { id: "8", name: "Business", parentId: null, count: 22 },
];

export default function CategoryPage() {
    const [tags, setTags] = useState(initialTags);
    const [categories, setCategories] = useState(initialCategories);

    // Tag handlers
    const addTag = (tag) => {
        const newTag = {
            ...tag,
            id: Date.now().toString(),
            count: 0,
        };
        setTags((prev) => [...prev, newTag]);
    };

    const updateTag = (id, updates) => {
        setTags((prev) =>
            prev.map((tag) => (tag.id === id ? { ...tag, ...updates } : tag))
        );
    };

    const deleteTag = (id) => {
        setTags((prev) => prev.filter((tag) => tag.id !== id));
    };

    // Category handlers
    const addCategory = (category) => {
        const newCategory = {
            ...category,
            id: Date.now().toString(),
            count: 0,
        };
        setCategories((prev) => [...prev, newCategory]);
    };

    const updateCategory = (id, updates) => {
        setCategories((prev) =>
            prev.map((cat) => (cat.id === id ? { ...cat, ...updates } : cat))
        );
    };

    const deleteCategory = (id) => {
        // Also delete children
        const idsToDelete = new Set();
        const findChildren = (parentId) => {
            idsToDelete.add(parentId);
            categories
                .filter((c) => c.parentId === parentId)
                .forEach((c) => findChildren(c.id));
        };
        findChildren(id);
        setCategories((prev) => prev.filter((cat) => !idsToDelete.has(cat.id)));
    };

    return (
        <div className='absolute inset-0 flex flex-col gap-2 p-2'>
            <div className='w-full dark:bg-darkSecondaryBackground  p-4 rounded-md border flex flex-row items-center justify-between'>
                <div>
                    <h2 className='text-xl'>Categories and Tags</h2>
                    <h2 className='text-xs text-white/50'>Manage categories and tags</h2>
                </div>
            </div>
            <ScrollArea className='h-[85vh] dark:bg-darkSecondaryBackground rounded-md'>
                <div className="">
                    <div className=" mx-auto px-6 py-12">


                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4 mb-10">
                            <div className="p-6 rounded-lg bg-card dark:bg-darkPrimaryBackground border border-border shadow-card">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-md bg-tag-blue/10">
                                        <Tag className="h-5 w-5 text-tag-blue" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{tags.length}</p>
                                        <p className="text-sm text-muted-foreground">Total Tags</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 rounded-lg bg-card dark:bg-darkPrimaryBackground border border-border shadow-card">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-md bg-tag-green/10">
                                        <Folder className="h-5 w-5 text-tag-green" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{categories.length}</p>
                                        <p className="text-sm text-muted-foreground">Categories</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <Tabs defaultValue="tags" className="space-y-6">
                            <TabsList className="grid w-full grid-cols-2 h-12 bg-secondary/50 p-1 rounded-md">
                                <TabsTrigger
                                    value="tags"
                                    className="gap-2 rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm"
                                >
                                    <Tag className="h-4 w-4" />
                                    Tags
                                </TabsTrigger>
                                <TabsTrigger
                                    value="categories"
                                    className="gap-2 rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm"
                                >
                                    <Folder className="h-4 w-4" />
                                    Categories
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="tags" className="animate-fade-in">
                                <TagManager
                                    tags={tags}
                                    onAddTag={addTag}
                                    onUpdateTag={updateTag}
                                    onDeleteTag={deleteTag}
                                />
                            </TabsContent>

                            <TabsContent value="categories" className="animate-fade-in">
                                <CategoryManager
                                    categories={categories}
                                    onAddCategory={addCategory}
                                    onUpdateCategory={updateCategory}
                                    onDeleteCategory={deleteCategory}
                                />
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </ScrollArea>
        </div>
    )
}
