'use client'
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Folder, Tag as TagIcon } from 'lucide-react';
import { CategoryCard } from './CategoryCard';
import { TagCard } from './TagCard';
import { CategoryDialog } from './CategoryDialog';
import { TagDialog } from './TagDialog';
import { DeleteDialog } from './DeleteDialog';
import { toast } from 'sonner';
import { newCategory } from '../_actions/new-category';
import { useAction } from '@/hooks/use-action';


export const mockCategories = [
    {
        id: '1',
        name: 'Technology',
        slug: 'technology',
        description: 'Articles about tech, programming, and software development',
        postCount: 24,
        createdAt: new Date('2024-01-15'),
    },
    {
        id: '2',
        name: 'Design',
        slug: 'design',
        description: 'UI/UX design, graphic design, and creative processes',
        postCount: 18,
        createdAt: new Date('2024-01-20'),
    },
    {
        id: '3',
        name: 'Business',
        slug: 'business',
        description: 'Business strategies, startups, and entrepreneurship',
        postCount: 12,
        createdAt: new Date('2024-02-01'),
    },
    {
        id: '4',
        name: 'Lifestyle',
        slug: 'lifestyle',
        description: 'Health, productivity, and personal development',
        postCount: 15,
        createdAt: new Date('2024-02-10'),
    },
    {
        id: '5',
        name: 'Tutorials',
        slug: 'tutorials',
        description: 'Step-by-step guides and how-to articles',
        postCount: 32,
        createdAt: new Date('2024-02-15'),
    },
];

export const mockTags = [
    { id: '1', name: 'React', slug: 'react', color: 'blue', postCount: 15, createdAt: new Date('2024-01-10') },
    { id: '2', name: 'TypeScript', slug: 'typescript', color: 'cyan', postCount: 12, createdAt: new Date('2024-01-12') },
    { id: '3', name: 'CSS', slug: 'css', color: 'purple', postCount: 8, createdAt: new Date('2024-01-15') },
    { id: '4', name: 'JavaScript', slug: 'javascript', color: 'yellow', postCount: 20, createdAt: new Date('2024-01-18') },
    { id: '5', name: 'Node.js', slug: 'nodejs', color: 'green', postCount: 10, createdAt: new Date('2024-01-20') },
    { id: '6', name: 'UI/UX', slug: 'ui-ux', color: 'pink', postCount: 14, createdAt: new Date('2024-01-22') },
    { id: '7', name: 'API', slug: 'api', color: 'orange', postCount: 7, createdAt: new Date('2024-01-25') },
    { id: '8', name: 'Database', slug: 'database', color: 'red', postCount: 9, createdAt: new Date('2024-01-28') },
    { id: '9', name: 'DevOps', slug: 'devops', color: 'blue', postCount: 5, createdAt: new Date('2024-02-01') },
    { id: '10', name: 'Testing', slug: 'testing', color: 'green', postCount: 6, createdAt: new Date('2024-02-05') },
];



export function TaxonomyManager() {

    const [categories, setCategories] = useState(mockCategories);
    const [tags, setTags] = useState(mockTags);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('categories');

    // Category dialogs
    const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [deletingCategory, setDeletingCategory] = useState(null);

    // Tag dialogs
    const [tagDialogOpen, setTagDialogOpen] = useState(false);
    const [editingTag, setEditingTag] = useState(null);
    const [deletingTag, setDeletingTag] = useState(null);



    // Filter based on search
    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredTags = tags.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );



    const { execute: handleAddCategory } = useAction(newCategory, {
        onSuccess: (data) => {
            console.log('add-category callback', data)
        },
        onError: (error) => {

        }
    })

    // Category handlers
    const handleSaveCategory = async (data) => {
        console.log('categories', data)

        await handleAddCategory({ name: data.name, slug: data.slug, description: data.description, status: data.status })


        if (editingCategory) {
            setCategories(prev =>
                prev.map(c => c.id === editingCategory.id ? { ...c, ...data } : c)
            );
            toast.success('Category updated successfully');
        } else {
            const newCategory = {
                id: Date.now().toString(),
                ...data,
                postCount: 0,
                createdAt: new Date(),
            };
            setCategories(prev => [newCategory, ...prev]);
            toast.success('Category created successfully');

        }
        setEditingCategory(null);
    };

    const handleDeleteCategory = () => {
        if (deletingCategory) {
            setCategories(prev => prev.filter(c => c.id !== deletingCategory.id));
            toast.success('Category deleted successfully');
            setDeletingCategory(null);
        }
    };

    // Tag handlers
    const handleSaveTag = (data) => {
        if (editingTag) {
            setTags(prev =>
                prev.map(t => t.id === editingTag.id ? { ...t, ...data } : t)
            );
            toast.success('Tag updated successfully');
        } else {
            const newTag = {
                id: Date.now().toString(),
                ...data,
                postCount: 0,
                createdAt: new Date(),
            };
            setTags(prev => [newTag, ...prev]);
            toast.success('Tag created successfully');
        }
        setEditingTag(null);
    };

    const handleDeleteTag = () => {
        if (deletingTag) {
            setTags(prev => prev.filter(t => t.id !== deletingTag.id));
            toast.success('Tag deleted successfully');
            setDeletingTag(null);
        }
    };

    return (
        <div className=" p-6 md:p-10  w-full">
            <div className="">


                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <TabsList className="bg-secondary/50 dark:bg-darkPrimaryBackground border border-border p-1 h-auto rounded-md">
                            <TabsTrigger
                                value="categories"
                                className="data-[state=active]:bg-primary data-[state=active]:dark:bg-darkSecondaryBackground  px-4 py-2 gap-2"
                            >
                                <Folder className="w-4 h-4" />
                                Categories
                                <span className="ml-1 px-1.5 py-0.5 rounded-md bg-background/50 text-xs">
                                    {categories.length}
                                </span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="tags"
                                className="data-[state=active]:bg-primary data-[state=active]:dark:bg-darkSecondaryBackground  px-4 py-2 gap-2"
                            >
                                <TagIcon className="w-4 h-4" />
                                Tags
                                <span className="ml-1 px-1.5 py-0.5 rounded-md bg-background/50 text-xs">
                                    {tags.length}
                                </span>
                            </TabsTrigger>
                        </TabsList>

                        <div className="flex items-center gap-3">
                            <div className="relative flex-1 sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9  border-border"
                                />
                            </div>
                            <Button
                                variant={'save'}

                                onClick={() => {
                                    if (activeTab === 'categories') {
                                        setEditingCategory(null);
                                        setCategoryDialogOpen(true);
                                    } else {
                                        setEditingTag(null);
                                        setTagDialogOpen(true);
                                    }
                                }}
                                className="bg-primary  hover:bg-primary/90 gap-2 shrink-0"
                            >
                                <Plus className="w-4 h-4" />
                                <span className="hidden sm:inline">
                                    Add {activeTab === 'categories' ? 'Category' : 'Tag'}
                                </span>
                            </Button>
                        </div>
                    </div>

                    {/* Categories Tab */}
                    <TabsContent value="categories" className="mt-0">
                        {filteredCategories.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground animate-fade-in">
                                <Folder className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p className="text-lg font-medium">No categories found</p>
                                <p className="text-sm mt-1">
                                    {searchQuery ? 'Try a different search term' : 'Create your first category'}
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2">
                                {filteredCategories.map((category, index) => (
                                    <CategoryCard
                                        key={category.id}
                                        category={category}
                                        index={index}
                                        onEdit={(cat) => {
                                            setEditingCategory(cat);
                                            setCategoryDialogOpen(true);
                                        }}
                                        onDelete={setDeletingCategory}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* Tags Tab */}
                    <TabsContent value="tags" className="mt-0">
                        {filteredTags.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground animate-fade-in">
                                <TagIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p className="text-lg font-medium">No tags found</p>
                                <p className="text-sm mt-1">
                                    {searchQuery ? 'Try a different search term' : 'Create your first tag'}
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {filteredTags.map((tag, index) => (
                                    <TagCard
                                        key={tag.id}
                                        tag={tag}
                                        index={index}
                                        onEdit={(t) => {
                                            setEditingTag(t);
                                            setTagDialogOpen(true);
                                        }}
                                        onDelete={setDeletingTag}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>

                {/* Dialogs */}
                <CategoryDialog
                    open={categoryDialogOpen}
                    onOpenChange={setCategoryDialogOpen}
                    category={editingCategory}
                    onSave={handleSaveCategory}
                />

                <TagDialog
                    open={tagDialogOpen}
                    onOpenChange={setTagDialogOpen}
                    tag={editingTag}
                    onSave={handleSaveTag}
                />

                <DeleteDialog
                    open={!!deletingCategory}
                    onOpenChange={(open) => !open && setDeletingCategory(null)}
                    itemName={deletingCategory?.name || ''}
                    itemType="category"
                    onConfirm={handleDeleteCategory}
                />

                <DeleteDialog
                    open={!!deletingTag}
                    onOpenChange={(open) => !open && setDeletingTag(null)}
                    itemName={deletingTag?.name || ''}
                    itemType="tag"
                    onConfirm={handleDeleteTag}
                />
            </div>
        </div>
    );
}
