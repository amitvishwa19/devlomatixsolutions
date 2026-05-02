'use client'
import { useState, useEffect } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { createProduct } from '../_actions/createProduct'
import { updateProduct } from '../_actions/updateProduct'
import { toast } from 'sonner'
import { Package, DollarSign, Tag, ImageIcon, Loader2, X } from 'lucide-react'

const CATEGORIES = [
    { value: 'crystals', label: 'Crystals', desc: 'Raw & polished crystals' },
    { value: 'jewelry', label: 'Jewelry', desc: 'Bracelets, necklaces & rings' },
    { value: 'meditation', label: 'Meditation', desc: 'Spheres, wands & malas' },
    { value: 'vastu', label: 'Vastu', desc: 'Feng Shui & Vastu products' },
    { value: 'accessories', label: 'Accessories', desc: 'Pouches, stands & tools' },
]

const INITIAL_DATA = {
    title: '',
    description: '',
    longDescription: '',
    sku: '',
    price: '',
    discount: '',
    quantity: '0',
    status: 'active',
    category: 'crystals',
    imageUrl: '',
}

export function AddProductModal({ open, onClose, product, onSuccess }) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState(INITIAL_DATA)
    const [activeTab, setActiveTab] = useState('basic')

    const isEdit = !!product?.id

    useEffect(() => {
        if (product) {
            setFormData({
                title: product.title || '',
                description: product.description || '',
                longDescription: product.metadata?.longDescription || '',
                sku: product.sku || '',
                price: product.price?.toString() || '',
                discount: product.discount?.toString() || '',
                quantity: product.inventoryCount?.toString() || '0',
                status: product.status || 'active',
                category: product.metadata?.category || 'crystals',
                imageUrl: product.imageUrl || '',
            })
        } else {
            setFormData(INITIAL_DATA)
        }
        setActiveTab('basic')
    }, [product, open])

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            let result
            if (isEdit) {
                result = await updateProduct(product.id, formData)
            } else {
                result = await createProduct(formData)
            }

            if (result.success) {
                toast.success(isEdit ? 'Product updated!' : 'Product created!')
                onSuccess?.()
                onClose()
            } else {
                toast.error(result.message || 'Failed to save product')
            }
        } catch (error) {
            console.error('[PRODUCT_SUBMIT_ERROR]', error)
            toast.error('Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    const generateSKU = () => {
        const prefix = formData.category?.substring(0, 3).toUpperCase() || 'PRD'
        const timestamp = Date.now().toString(36).toUpperCase()
        handleChange('sku', `${prefix}-${timestamp}`)
    }

    return (
        <Sheet open={open} onOpenChange={onClose}>
            <SheetContent className="w-full sm:max-w-xl flex flex-col bg-transparent border-0 p-2">

                <div className="border rounded-md bg-card h-full">
                    <SheetHeader className="border-b pb-4">
                        <SheetTitle className="flex items-center gap-2">
                            <Package className="w-5 h-5 text-primary" />
                            {isEdit ? 'Edit Product' : 'Add New Product'}
                        </SheetTitle>
                        <SheetDescription>
                            {isEdit ? 'Update product details below' : 'Fill in the details to add a new product'}
                        </SheetDescription>
                    </SheetHeader>

                    <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
                        <ScrollArea className="flex-1 px-2 h-[50vh] overflow-hidden ">
                            <div className="space-y-4 py-4 px-2">
                                <div className="space-y-2">
                                    <Label className="text-xs">Product Title *</Label>
                                    <Input
                                        value={formData.title}
                                        onChange={(e) => handleChange('title', e.target.value)}
                                        placeholder="e.g., Amethyst Crystal Bracelet"
                                        className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs">Category *</Label>
                                    <Select value={formData.category} onValueChange={(v) => handleChange('category', v)}>
                                        <SelectTrigger className="bg-background border-border text-foreground">
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-popover border-border text-popover-foreground">
                                            {CATEGORIES.map(cat => (
                                                <SelectItem key={cat.value} value={cat.value} className="focus:bg-accent focus:text-accent-foreground">
                                                    <p className="font-medium">{cat.label}</p>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs">Short Description</Label>
                                    <Textarea
                                    rows='6'
                                        value={formData.description}
                                        onChange={(e) => handleChange('description', e.target.value)}
                                        placeholder="Brief description..."
                                        className="bg-background border-border text-foreground placeholder:text-muted-foreground min-h-[80px]"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs">Long Description</Label>
                                    <Textarea
                                    rows='6'
                                        value={formData.longDescription}
                                        onChange={(e) => handleChange('longDescription', e.target.value)}
                                        placeholder="Detailed description..."
                                        className="bg-background border-border text-foreground placeholder:text-muted-foreground min-h-[100px]"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs">Price (₹) *</Label>
                                        <Input
                                            type="number"
                                            value={formData.price}
                                            onChange={(e) => handleChange('price', e.target.value)}
                                            placeholder="0"
                                            className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs">Discount (%)</Label>
                                        <Input
                                            type="number"
                                            value={formData.discount}
                                            onChange={(e) => handleChange('discount', e.target.value)}
                                            placeholder="0"
                                            className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                                        />
                                    </div>
                                </div>

                                <div className="p-3 rounded-lg bg-accent">
                                    <p className="text-xs text-muted-foreground">After Discount:</p>
                                    <p className="text-lg font-bold text-foreground">
                                        ₹{((parseFloat(formData.price) || 0) * (1 - (parseFloat(formData.discount) || 0) / 100)).toFixed(2)}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs">SKU</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={formData.sku}
                                            onChange={(e) => handleChange('sku', e.target.value)}
                                            placeholder="Auto-generated"
                                            className="bg-background border-border text-foreground placeholder:text-muted-foreground font-mono"
                                        />
                                        <Button type="button" variant="outline" onClick={generateSKU} className="border-border hover:bg-accent">
                                            <Tag className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs">Quantity</Label>
                                    <Input
                                        type="number"
                                        value={formData.quantity}
                                        onChange={(e) => handleChange('quantity', e.target.value)}
                                        placeholder="0"
                                        className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs">Status</Label>
                                    <Select value={formData.status} onValueChange={(v) => handleChange('status', v)}>
                                        <SelectTrigger className="bg-background border-border text-foreground">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-popover border-border text-popover-foreground">
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="draft">Draft</SelectItem>
                                            <SelectItem value="archived">Archived</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs">Image URL</Label>
                                    <Input
                                        value={formData.imageUrl}
                                        onChange={(e) => handleChange('imageUrl', e.target.value)}
                                        placeholder="/crystalaura/product-image.jpg"
                                        className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                                    />
                                </div>

                                {formData.imageUrl && (
                                    <div className="w-full h-40 rounded-lg border border-border overflow-hidden bg-muted">
                                        <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-contain" onError={(e) => e.target.style.display = 'none'} />
                                    </div>
                                )}
                            </div>
                        </ScrollArea>

                        <SheetFooter className="border-t pt-4">
                            <Button type="button" variant="outline" onClick={onClose} className="border-border hover:bg-accent">Cancel</Button>
                            <Button type="submit" disabled={loading || !formData.title || !formData.price} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                {isEdit ? 'Update Product' : 'Create Product'}
                            </Button>
                        </SheetFooter>
                    </form>
                </div>
            </SheetContent>
        </Sheet>
    )
}