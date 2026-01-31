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
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { TAG_COLORS, ENTITY_TYPES } from '../misc/types';
import { useToast } from '@/hooks/use-toast';
import { useFormValidationToast } from '../../hooks/useFormValidationToast';

// Zod schema for tag form
const tagSchema = z.object({
    name: z.string().min(1, 'Tag name is required').max(30, 'Name must be less than 30 characters'),
    description: z.string().max(150, 'Description must be less than 150 characters').optional(),
    color: z.string().default('gray'),
    entityTypes: z.array(z.string()),
});

export function TagDialog({ open, onOpenChange, tag, onSave }) {
    const { toast } = useToast();
    const { showValidationErrors } = useFormValidationToast();

    const form = useForm({
        resolver: zodResolver(tagSchema),
        defaultValues: {
            name: '',
            description: '',
            color: 'gray',
            entityTypes: [],
        },
    });

    useEffect(() => {
        if (open) {
            if (tag) {
                form.reset({
                    name: tag.name || '',
                    description: tag.description || '',
                    color: tag.color || 'gray',
                    entityTypes: tag.entityTypes || [],
                });
            } else {
                form.reset({
                    name: '',
                    description: '',
                    color: 'gray',
                    entityTypes: [],
                });
            }
        }
    }, [tag, open, form]);

    const onSubmit = (data) => {
        console.log('Tag Form Data:', data);

        onSave({
            ...tag,
            ...data,
            id: tag?.id || `tag${Date.now()}`,
            usageCount: tag?.usageCount || 0,
            createdAt: tag?.createdAt || new Date(),
        });

        toast({
            title: tag ? 'Tag Updated' : 'Tag Created',
            description: `${data.name} has been ${tag ? 'updated' : 'created'} successfully.`,
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

    const selectedColor = form.watch('color');
    const tagName = form.watch('name');
    const entityTypes = form.watch('entityTypes');
    const colorConfig = TAG_COLORS.find(c => c.id === selectedColor) || TAG_COLORS[0];

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-md min-w-[620px] p-2 border-0 bg-transparent">
                <div className='border rounded-lg p-2 bg-card h-full overflow-hidden'>
                    <SheetHeader>
                        <SheetTitle>{tag ? 'Edit Tag' : 'New Tag'}</SheetTitle>
                    </SheetHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit, showValidationErrors)} className="flex flex-col h-full">
                            <ScrollArea className="h-[75vh] mt-6">
                                <div className="space-y-4 pr-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Name *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter tag name" {...field} />
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
                                                    <Textarea placeholder="Enter tag description" {...field} rows={2} />
                                                </FormControl>
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
                                                                    <Badge
                                                                        variant="outline"
                                                                        className={`${colorConfig.bg} ${colorConfig.text} ${colorConfig.border}`}
                                                                    >
                                                                        {tagName || 'Preview'}
                                                                    </Badge>
                                                                </div>
                                                            </SelectValue>
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <ScrollArea className="h-48">
                                                            {TAG_COLORS.map(color => (
                                                                <SelectItem key={color.id} value={color.id}>
                                                                    <div className="flex items-center gap-2">
                                                                        <Badge
                                                                            variant="outline"
                                                                            className={`${color.bg} ${color.text} ${color.border}`}
                                                                        >
                                                                            {tagName || 'Sample'}
                                                                        </Badge>
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

                                    <div className="space-y-2">
                                        <FormLabel>Applies To</FormLabel>
                                        <div className="grid grid-cols-2 gap-2">
                                            {ENTITY_TYPES.map(entity => (
                                                <div key={entity.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`tag-${entity.id}`}
                                                        checked={entityTypes.includes(entity.id)}
                                                        onCheckedChange={() => toggleEntityType(entity.id)}
                                                    />
                                                    <label htmlFor={`tag-${entity.id}`} className="text-sm font-normal cursor-pointer">
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
                                    {tag ? 'Update' : 'Create'} Tag
                                </Button>
                            </SheetFooter>
                        </form>
                    </Form>
                </div>
            </SheetContent>
        </Sheet>
    );
}
