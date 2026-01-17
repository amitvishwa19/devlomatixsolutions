import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { categories } from '@/data/mockData';
import { toast } from '@/hooks/use-toast';
import { Package } from 'lucide-react';




const initialFormData = {
    name: '',
    category: '',
    sku: '',
    quantity: 0,
    minStock: 0,
    unit: 'units',
    location: '',
    expiryDate: '',
    supplier: '',
    unitPrice: 0,
};

const units = ['units', 'pieces', 'boxes', 'tablets', 'tubes', 'rolls', 'bottles', 'packs'];

export function AddInventoryModal({ open, onOpenChange, onAdd }) {
    const [formData, setFormData] = useState(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast({ title: 'Error', description: 'Item name is required', variant: 'destructive' });
            return;
        }
        if (!formData.category) {
            toast({ title: 'Error', description: 'Please select a category', variant: 'destructive' });
            return;
        }
        if (!formData.sku.trim()) {
            toast({ title: 'Error', description: 'SKU is required', variant: 'destructive' });
            return;
        }

        setIsSubmitting(true);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        onAdd?.(formData);
        toast({
            title: 'Item Added',
            description: `${formData.name} has been added to inventory.`,
        });

        setFormData(initialFormData);
        setIsSubmitting(false);
        onOpenChange(false);
    };

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] bg-card border-border">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-foreground">
                        <div className="rounded-lg bg-primary/10 p-2">
                            <Package className="h-5 w-5 text-primary" />
                        </div>
                        Add New Inventory Item
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 space-y-2">
                            <Label htmlFor="name" className="text-foreground">Item Name *</Label>
                            <Input
                                id="name"
                                placeholder="e.g., Paracetamol 500mg"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                className="bg-secondary border-border"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category" className="text-foreground">Category *</Label>
                            <Select
                                value={formData.category}
                                onValueChange={(value) => handleChange('category', value)}
                            >
                                <SelectTrigger className="bg-secondary border-border">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent className="bg-popover border-border z-50">
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.name}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="sku" className="text-foreground">SKU *</Label>
                            <Input
                                id="sku"
                                placeholder="e.g., MED-001"
                                value={formData.sku}
                                onChange={(e) => handleChange('sku', e.target.value.toUpperCase())}
                                className="bg-secondary border-border font-mono"
                            />
                        </div>
                    </div>

                    {/* Quantity Info */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="quantity" className="text-foreground">Quantity</Label>
                            <Input
                                id="quantity"
                                type="number"
                                min="0"
                                value={formData.quantity}
                                onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 0)}
                                className="bg-secondary border-border"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="minStock" className="text-foreground">Min Stock Level</Label>
                            <Input
                                id="minStock"
                                type="number"
                                min="0"
                                value={formData.minStock}
                                onChange={(e) => handleChange('minStock', parseInt(e.target.value) || 0)}
                                className="bg-secondary border-border"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="unit" className="text-foreground">Unit</Label>
                            <Select
                                value={formData.unit}
                                onValueChange={(value) => handleChange('unit', value)}
                            >
                                <SelectTrigger className="bg-secondary border-border">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-popover border-border z-50">
                                    {units.map((unit) => (
                                        <SelectItem key={unit} value={unit}>
                                            {unit}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Location & Supplier */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="location" className="text-foreground">Storage Location</Label>
                            <Input
                                id="location"
                                placeholder="e.g., Pharmacy A-12"
                                value={formData.location}
                                onChange={(e) => handleChange('location', e.target.value)}
                                className="bg-secondary border-border"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="supplier" className="text-foreground">Supplier</Label>
                            <Input
                                id="supplier"
                                placeholder="e.g., PharmaCorp Ltd."
                                value={formData.supplier}
                                onChange={(e) => handleChange('supplier', e.target.value)}
                                className="bg-secondary border-border"
                            />
                        </div>
                    </div>

                    {/* Price & Expiry */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="unitPrice" className="text-foreground">Unit Price ($)</Label>
                            <Input
                                id="unitPrice"
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.unitPrice}
                                onChange={(e) => handleChange('unitPrice', parseFloat(e.target.value) || 0)}
                                className="bg-secondary border-border"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="expiryDate" className="text-foreground">Expiry Date</Label>
                            <Input
                                id="expiryDate"
                                type="date"
                                value={formData.expiryDate}
                                onChange={(e) => handleChange('expiryDate', e.target.value)}
                                className="bg-secondary border-border"
                            />
                        </div>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Adding...' : 'Add Item'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
