import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import * as Icons from 'lucide-react';
import { TAG_COLORS, ENTITY_TYPES, CATEGORY_ICONS } from '../types';
import { useToast } from '@/hooks/use-toast';
import { useFormValidationToast } from '@/carewell/hooks/useFormValidationToast';

// Zod schema for category form
const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(50, 'Name must be less than 50 characters'),
  description: z.string().max(200, 'Description must be less than 200 characters').optional(),
  icon: z.string().default('Folder'),
  color: z.string().default('blue'),
  entityTypes: z.array(z.string()),
  parentId: z.string().nullable().optional(),
});

export function CategoryDialog({ open, onOpenChange, category, categories, onSave }) {
  const { toast } = useToast();
  const { showValidationErrors } = useFormValidationToast();

  const form = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
      icon: 'Folder',
      color: 'blue',
      entityTypes: [],
      parentId: null,
    },
  });

  useEffect(() => {
    if (open) {
      if (category) {
        form.reset({
          name: category.name || '',
          description: category.description || '',
          icon: category.icon || 'Folder',
          color: category.color || 'blue',
          entityTypes: category.entityTypes || [],
          parentId: category.parentId || null,
        });
      } else {
        form.reset({
          name: '',
          description: '',
          icon: 'Folder',
          color: 'blue',
          entityTypes: [],
          parentId: null,
        });
      }
    }
  }, [category, open, form]);

  const onSubmit = (data) => {
    console.log('Category Form Data:', data);

    onSave({
      ...category,
      ...data,
      id: category?.id || `cat${Date.now()}`,
      itemCount: category?.itemCount || 0,
      createdAt: category?.createdAt || new Date(),
    });

    toast({
      title: category ? 'Category Updated' : 'Category Created',
      description: `${data.name} has been ${category ? 'updated' : 'created'} successfully.`,
    });

    onOpenChange(false);
  };

  const toggleEntityType = (entityId) => {
    const current = form.getValues('entityTypes');
    const updated = current.includes(entityId)
      ? current.filter(id => id !== entityId)
      : [...current, entityId];
    form.setValue('entityTypes', updated);
  };

  const parentCategories = categories?.filter(c => c.id !== category?.id && !c.parentId) || [];
  const selectedIcon = form.watch('icon');
  const selectedColor = form.watch('color');
  const entityTypes = form.watch('entityTypes');

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{category ? 'Edit Category' : 'New Category'}</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, showValidationErrors)} className="flex flex-col h-full">
            <ScrollArea className="flex-1 mt-6">
              <div className="space-y-4 pr-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter category name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter category description" {...field} rows={2} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="icon"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Icon</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue>
                                <div className="flex items-center gap-2">
                                  {(() => {
                                    const IconComponent = Icons[selectedIcon] || Icons.Folder;
                                    return <IconComponent className="w-4 h-4" />;
                                  })()}
                                  {selectedIcon}
                                </div>
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <ScrollArea className="h-48">
                              {CATEGORY_ICONS.map(iconName => {
                                const IconComponent = Icons[iconName] || Icons.Folder;
                                return (
                                  <SelectItem key={iconName} value={iconName}>
                                    <div className="flex items-center gap-2">
                                      <IconComponent className="w-4 h-4" />
                                      {iconName}
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </ScrollArea>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Color</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue>
                                <div className="flex items-center gap-2">
                                  <div className={`w-4 h-4 rounded ${TAG_COLORS.find(c => c.id === selectedColor)?.bg}`} />
                                  {TAG_COLORS.find(c => c.id === selectedColor)?.label}
                                </div>
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <ScrollArea className="h-48">
                              {TAG_COLORS.map(color => (
                                <SelectItem key={color.id} value={color.id}>
                                  <div className="flex items-center gap-2">
                                    <div className={`w-4 h-4 rounded ${color.bg}`} />
                                    {color.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </ScrollArea>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {parentCategories.length > 0 && (
                  <FormField
                    control={form.control}
                    name="parentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parent Category</FormLabel>
                        <Select onValueChange={(val) => field.onChange(val === 'none' ? null : val)} value={field.value || 'none'}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select parent category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">None (Top Level)</SelectItem>
                            {parentCategories.map(cat => (
                              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="space-y-2">
                  <FormLabel>Applies To</FormLabel>
                  <div className="grid grid-cols-2 gap-2">
                    {ENTITY_TYPES.map(entity => (
                      <div key={entity.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={entity.id}
                          checked={entityTypes.includes(entity.id)}
                          onCheckedChange={() => toggleEntityType(entity.id)}
                        />
                        <label htmlFor={entity.id} className="text-sm font-normal cursor-pointer">
                          {entity.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>

            <SheetFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {category ? 'Update' : 'Create'} Category
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
