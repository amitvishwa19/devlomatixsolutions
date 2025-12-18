import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, } from '@/components/ui/form';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue, } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger, } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarIcon, Package, Loader2, Loader, Save, FolderOpen, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useAction } from '@/hooks/use-action';
import { DynamicIcon } from 'lucide-react/dynamic';
import { upsertService } from '../../_action/upsert-service';

const serviceFormSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, 'Name is required').max(100),
    description: z.string().max(500).optional(),
    category: z.string().optional(),
    sku: z.string().max(50).optional(),
    price: z.string().min(1, 'Price is required').max(100),
    insuranceCover: z.string(),
    status: z.boolean()

});

export default function ServiceEditor({ isOpen, onClose, onSubmit, categories, service }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedLabel, setSelectedLabel] = useState("");
    const isEditing = !!service;



    function generateSKU(title, prefix = "SER") {
        if (!title) return "";

        const words = title
            .toUpperCase()
            .replace(/[^A-Z0-9 ]/g, "") // remove special chars
            .split(" ")
            .filter(Boolean);

        const size = words.find(w => /\d+(ML|MG|G|CM|MM|L)$/i.test(w));
        const mainWords = words.filter(w => w !== size);

        const code = mainWords
            .slice(0, 2)               // take first 2 meaningful words
            .map(w => w.slice(0, 3))   // first 3 letters
            .join("-");

        return [prefix, code, size].filter(Boolean).join("-");
    }


    const form = useForm({
        resolver: zodResolver(serviceFormSchema),
        defaultValues: {
            id: '',
            name: '',
            description: '',
            category: '',
            sku: '',
            insuranceCover: 'not_covered',
            price: 0,
            status: true
        },
    });

    useEffect(() => {
        if (service) {
            form.reset({
                id: service.id,
                name: service.name,
                description: service.description || '',
                category: service?.category?.id || '',
                sku: service.sku || '',
                insuranceCover: service.insuranceCover || 'not_covered',
                price: service.price || 0,
                status: service.status || true,
            });
        } else {
            form.reset({
                id: '',
                name: '',
                description: '',
                category: '',
                sku: '',
                insuranceCover: 'not_covered',
                price: 0,
                status: true
            });
        }
    }, [service, form, isOpen]);


    const handleNameChange = (e) => {
        const name = e.target.value;
        form.setValue('name', name);
        if (!isEditing) {
            const sku = generateSKU(name)
            form.setValue('sku', sku);
        }
    };


    const { execute } = useAction(upsertService, {
        onSuccess: (data) => {
            onClose(data.service)
            form.reset();
            onSubmit(data.service)
            toast.success(`Service "${data?.service?.name}" Added/updated successfully`)
            setIsSubmitting(false)
        },
        onError: (error) => {
            toast.error('Oops!, Something went wrong, try again later')
            setIsSubmitting(false)
        }
    })


    const handleSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            await execute({ formData: data })
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setIsSubmitting(false);
        }
    };


    const handleOpenChange = () => {
        setIsSubmitting(false)
        form.reset();
        onClose()
    }


    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>

            <DialogContent>

                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-primary" />
                        {isEditing ? 'Update Service Item' : 'Add Service Item'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Update the details of this Service item.'
                            : 'Fill in the details to add a new Service item.'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">


                            {/* Name */}
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name *</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter item name"
                                                {...field}
                                                onChange={handleNameChange}
                                                autoFocus={false}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Category */}
                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                            </FormControl>

                                            <SelectContent>
                                                {categories.map((cat) => (
                                                    <SelectGroup key={cat.id}>
                                                        <SelectItem value={cat.id} className='pl-4 font-medium text-sm'>
                                                            <div className='flex flex-row items-center gap-2'>
                                                                {cat.icon ? <DynamicIcon size={14} name={cat.icon} /> : <DynamicIcon size={14} name={'folder'} />}
                                                                <span>All {cat.name}</span>
                                                            </div>
                                                        </SelectItem>
                                                        {cat?.children?.map((subCat) => (

                                                            <SelectItem value={subCat.id} className='pl-8 font-medium text-sm'>
                                                                <span className="flex items-center gap-2 text-muted-foreground">
                                                                    <ChevronRight className="h-3 w-3" />
                                                                    <span className="text-foreground">{subCat.name}</span>
                                                                </span>
                                                            </SelectItem>
                                                        ))}

                                                    </SelectGroup>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* SKU */}
                            <FormField
                                control={form.control}
                                name="sku"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>SKU</FormLabel>
                                        <FormControl>
                                            <Input placeholder="SKU-001" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Price */}
                            <FormField
                                control={form.control}
                                name="price"
                                type='nuber'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Price *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="₹ 500" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />



                            {/* Insurance Covver */}
                            <FormField
                                control={form.control}
                                name="insuranceCover"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Insurance Cover *</FormLabel>

                                        <Select
                                            defaultValue={'covered'}
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select insurance price" />
                                                </SelectTrigger>
                                            </FormControl>

                                            <SelectContent>
                                                <SelectItem value="fully_covered" className='font-medium text-sm'>FUlly Covered</SelectItem>
                                                <SelectItem value="partially_covered" className='font-medium text-sm'>Partially Covered</SelectItem>
                                                <SelectItem value="not_covered" className='font-medium text-sm'>Not Covered</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />


                            {/* Status */}
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status *</FormLabel>

                                        <Select
                                            defaultValue={true}
                                            value={field.value}
                                            // onValueChange={(value) =>
                                            //     //field.onChange(value === "active")
                                            //     field.onChange
                                            // }

                                            onValueChange={field.onChange}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                            </FormControl>

                                            <SelectContent>
                                                <SelectItem value={true} className='font-medium text-sm'>Active</SelectItem>
                                                <SelectItem value={false} className='font-medium text-sm'>Inactive</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                        </div>

                        {/* Description - Full width */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            rows='4'
                                            placeholder="Enter item description..."
                                            className="min-h-[80px] resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="gap-2 pt-4">
                            <Button
                                type="button"
                                variant="ghost"
                                size={'sm'}
                                onClick={() => onClose(false)}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button variant={'save'} size={'sm'} disabled={isSubmitting}>
                                {isSubmitting ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4 " />}
                                {isEditing ? 'Update Item' : 'Add Item'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>

            </DialogContent>
        </Dialog>
    )
}
