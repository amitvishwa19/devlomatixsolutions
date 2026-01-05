import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, } from '@/components/ui/form';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue, } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { upsertInventory } from '../../_action/upsert-inventory';
import MultiLevelSelect from '@/app/(workspace)/workspace/_components/MultiLevelSelect';
import { DynamicIcon } from 'lucide-react/dynamic';

const inventoryFormSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, 'Name is required').max(100),
    description: z.string().max(500).optional(),
    category: z.string().optional(),
    sku: z.string().max(50).optional(),
    quantity: z.coerce.number().int().min(0, 'Quantity must be 0 or greater'),
    minStock: z.coerce.number().int().min(0, 'Minimum stock must be 0 or greater'),
    unit: z.string().min(1, 'Unit is required').max(20),
    location: z.string().max(100).optional(),
    expiryDate: z.date({ required_error: 'Expiry date is required' }),
    supplier: z.string().max(100).optional(),
    unitPrise: z.coerce.number().min(0, 'Unit price must be 0 or greater'),
});

export default function InventoryEditor({ isOpen, onClose, inventory, onSubmit, categories }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedLabel, setSelectedLabel] = useState("");
    const isEditing = !!inventory;



    function generateSKU(title, prefix = "MED") {
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
        resolver: zodResolver(inventoryFormSchema),
        defaultValues: {
            id: '',
            name: '',
            description: '',
            category: '',
            sku: '',
            quantity: 0,
            minStock: 0,
            unit: '',
            location: '',
            expiryDate: new Date(),
            supplier: '',
            unitPrise: 0,
        },
    });

    useEffect(() => {
        if (inventory) {
            form.reset({
                id: inventory.id,
                name: inventory.name,
                description: inventory.description || '',
                category: inventory.category || '',
                sku: inventory.sku || '',
                quantity: inventory.quantity,
                minStock: inventory.minStock,
                unit: inventory.unit,
                location: inventory.location || '',
                expiryDate: new Date(inventory.expiryDate),
                supplier: inventory.supplier || '',
                unitPrise: inventory.unitPrise,
            });
        } else {
            form.reset({
                id: '',
                name: '',
                description: '',
                category: '',
                sku: '',
                quantity: 0,
                minStock: 0,
                unit: '',
                location: '',
                expiryDate: new Date(),
                supplier: '',
                unitPrise: 0,
            });
        }
    }, [inventory, form, isOpen]);


    const handleNameChange = (e) => {
        const name = e.target.value;
        form.setValue('name', name);
        if (!isEditing) {
            const sku = generateSKU(name)
            form.setValue('sku', sku);
        }
    };


    const { execute } = useAction(upsertInventory, {
        onSuccess: (data) => {
            console.log('@inventory from server action', data)
            onClose(data.inventory)
            form.reset();
            setIsSubmitting(false)
            toast.success(`Inventory "${data?.inventory?.name}" Added successfully`)
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
                        {isEditing ? 'Update Inventory Item' : 'Add Inventory Item'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Update the details of this inventory item.'
                            : 'Fill in the details to add a new inventory item.'}
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
                                                {categories?.map((cat) => (
                                                    <SelectGroup key={cat.id}>
                                                        {/* <SelectLabel className="flex items-center gap-2 px-2 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-muted/50">
                                                            {cat.icon ? <DynamicIcon size={14} name={cat.icon} /> : <DynamicIcon size={14} name={'folder'} />}
                                                            {cat.name}
                                                        </SelectLabel> */}
                                                        <SelectItem value={cat.id} className='pl-4 font-medium text-sm'>
                                                            <div className='flex flex-row items-center gap-2'>
                                                                {cat.icon ? <DynamicIcon size={14} name={cat.icon} /> : <DynamicIcon size={14} name={'folder'} />}
                                                                <span>All {cat.name}</span>
                                                            </div>
                                                        </SelectItem>
                                                        {cat?.children?.map((subCat) => (

                                                            <SelectItem key={subCat.id} value={subCat.id} className='pl-8 font-medium text-sm'>
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

                            {/* Unit */}
                            <FormField
                                control={form.control}
                                name="unit"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Unit *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="pcs, kg, ml, etc." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Quantity */}
                            <FormField
                                control={form.control}
                                name="quantity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Quantity *</FormLabel>
                                        <FormControl>
                                            <Input type="number" min={0} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Min Stock */}
                            <FormField
                                control={form.control}
                                name="minStock"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Minimum Stock *</FormLabel>
                                        <FormControl>
                                            <Input type="number" min={0} {...field} />
                                        </FormControl>
                                        <FormDescription className="text-xs">
                                            Alert when stock falls below
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Unit Price */}
                            <FormField
                                control={form.control}
                                name="unitPrise"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Unit Price *</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={0}
                                                step={0.01}
                                                placeholder="0.00"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Expiry Date */}
                            <FormField
                                control={form.control}
                                name="expiryDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Expiry Date *</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            'w-full justify-start text-left font-normal',
                                                            !field.value && 'text-muted-foreground'
                                                        )}
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {field.value ? (
                                                            format(field.value, 'PPP')
                                                        ) : (
                                                            <span>Pick a date</span>
                                                        )}
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    initialFocus
                                                    className=" w-60 dark:bg-darkPrimaryBackground"
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Location */}
                            <FormField
                                control={form.control}
                                name="location"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Location</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Warehouse A, Shelf 3" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Supplier */}
                            <FormField
                                control={form.control}
                                name="supplier"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Supplier</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Supplier name" {...field} />
                                        </FormControl>
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
