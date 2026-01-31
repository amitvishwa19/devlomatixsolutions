import { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, FolderTree, Tag, Trash2 } from 'lucide-react';
import {
  CategoryCard,
  CategoryDialog,
  TagCard,
  TagDialog,
  TaxonomyFilters,
  TaxonomyStats
} from './components';
import { mockCategories, mockTags } from './mockData';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/carewell/hooks/useLocalStorage';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function TaxonomyDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('categories');
  const [categories, setCategories] = useLocalStorage('hms_categories', mockCategories);
  const [tags, setTags] = useLocalStorage('hms_tags', mockTags);

  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingTag, setEditingTag] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  const [categoryFilters, setCategoryFilters] = useState({ search: '', entityType: '', color: '' });
  const [tagFilters, setTagFilters] = useState({ search: '', entityType: '', color: '' });

  // Filter categories
  const filteredCategories = useMemo(() => {
    return categories.filter(category => {
      const matchesSearch = !categoryFilters.search ||
        category.name.toLowerCase().includes(categoryFilters.search.toLowerCase()) ||
        category.description?.toLowerCase().includes(categoryFilters.search.toLowerCase());

      const matchesEntity = !categoryFilters.entityType ||
        category.entityTypes?.includes(categoryFilters.entityType);

      const matchesColor = !categoryFilters.color || category.color === categoryFilters.color;

      return matchesSearch && matchesEntity && matchesColor;
    });
  }, [categories, categoryFilters]);

  // Filter tags
  const filteredTags = useMemo(() => {
    return tags.filter(tag => {
      const matchesSearch = !tagFilters.search ||
        tag.name.toLowerCase().includes(tagFilters.search.toLowerCase()) ||
        tag.description?.toLowerCase().includes(tagFilters.search.toLowerCase());

      const matchesEntity = !tagFilters.entityType ||
        tag.entityTypes?.includes(tagFilters.entityType);

      const matchesColor = !tagFilters.color || tag.color === tagFilters.color;

      return matchesSearch && matchesEntity && matchesColor;
    });
  }, [tags, tagFilters]);

  // Build category tree
  const categoryTree = useMemo(() => {
    const rootCategories = filteredCategories.filter(c => !c.parentId);
    const childrenMap = {};

    filteredCategories.forEach(cat => {
      if (cat.parentId) {
        if (!childrenMap[cat.parentId]) childrenMap[cat.parentId] = [];
        childrenMap[cat.parentId].push(cat);
      }
    });

    return { rootCategories, childrenMap };
  }, [filteredCategories]);

  // Category handlers
  const handleAddCategory = () => {
    setEditingCategory(null);
    setCategoryDialogOpen(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryDialogOpen(true);
  };

  const handleSaveCategory = (category) => {
    console.log('Saving category:', category);
    if (editingCategory) {
      setCategories(prev => prev.map(c => c.id === category.id ? category : c));
    } else {
      setCategories(prev => [...prev, category]);
    }
  };

  const handleDeleteCategory = (category) => {
    setDeleteItem({ type: 'category', item: category });
  };

  // Tag handlers
  const handleAddTag = () => {
    setEditingTag(null);
    setTagDialogOpen(true);
  };

  const handleEditTag = (tag) => {
    setEditingTag(tag);
    setTagDialogOpen(true);
  };

  const handleSaveTag = (tag) => {
    console.log('Saving tag:', tag);
    if (editingTag) {
      setTags(prev => prev.map(t => t.id === tag.id ? tag : t));
    } else {
      setTags(prev => [...prev, tag]);
    }
  };

  const handleDeleteTag = (tag) => {
    setDeleteItem({ type: 'tag', item: tag });
  };

  const confirmDelete = () => {
    if (!deleteItem) return;

    if (deleteItem.type === 'category') {
      console.log('Deleting category:', deleteItem.item);
      setCategories(prev => prev.filter(c => c.id !== deleteItem.item.id && c.parentId !== deleteItem.item.id));
      toast({
        title: 'Category Deleted',
        description: `${deleteItem.item.name} has been deleted.`,
      });
    } else {
      console.log('Deleting tag:', deleteItem.item);
      setTags(prev => prev.filter(t => t.id !== deleteItem.item.id));
      toast({
        title: 'Tag Deleted',
        description: `${deleteItem.item.name} has been deleted.`,
      });
    }
    setDeleteItem(null);
  };

  return (
    <div className="h-full flex flex-col gap-6 p-6">
      {/* Stats */}
      <TaxonomyStats categories={categories} tags={tags} />

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <TabsList>
            <TabsTrigger value="categories" className="gap-2">
              <FolderTree className="w-4 h-4" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="tags" className="gap-2">
              <Tag className="w-4 h-4" />
              Tags
            </TabsTrigger>
          </TabsList>

          {activeTab === 'categories' ? (
            <Button onClick={handleAddCategory} className="gap-2">
              <Plus className="w-4 h-4" />
              New Category
            </Button>
          ) : (
            <Button onClick={handleAddTag} className="gap-2">
              <Plus className="w-4 h-4" />
              New Tag
            </Button>
          )}
        </div>

        <TabsContent value="categories" className="flex-1 flex flex-col gap-4 mt-4">
          <TaxonomyFilters
            filters={categoryFilters}
            onFiltersChange={setCategoryFilters}
            type="category"
          />

          <ScrollArea className="flex-1">
            <div className="space-y-3 pr-4">
              {categoryTree.rootCategories.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FolderTree className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No categories found</p>
                  <Button variant="link" onClick={handleAddCategory}>
                    Create your first category
                  </Button>
                </div>
              ) : (
                categoryTree.rootCategories.map(category => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    onEdit={handleEditCategory}
                    onDelete={handleDeleteCategory}
                  >
                    {categoryTree.childrenMap[category.id]?.map(child => (
                      <CategoryCard
                        key={child.id}
                        category={child}
                        onEdit={handleEditCategory}
                        onDelete={handleDeleteCategory}
                      />
                    ))}
                  </CategoryCard>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="tags" className="flex-1 flex flex-col gap-4 mt-4">
          <TaxonomyFilters
            filters={tagFilters}
            onFiltersChange={setTagFilters}
            type="tag"
          />

          <ScrollArea className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pr-4">
              {filteredTags.length === 0 ? (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  <Tag className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No tags found</p>
                  <Button variant="link" onClick={handleAddTag}>
                    Create your first tag
                  </Button>
                </div>
              ) : (
                filteredTags.map(tag => (
                  <TagCard
                    key={tag.id}
                    tag={tag}
                    onEdit={handleEditTag}
                    onDelete={handleDeleteTag}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CategoryDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        category={editingCategory}
        categories={categories}
        onSave={handleSaveCategory}
      />

      <TagDialog
        open={tagDialogOpen}
        onOpenChange={setTagDialogOpen}
        tag={editingTag}
        onSave={handleSaveTag}
      />

      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteItem?.type === 'category' ? 'Category' : 'Tag'}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteItem?.item.name}"?
              {deleteItem?.type === 'category' && ' This will also delete all child categories.'}
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
