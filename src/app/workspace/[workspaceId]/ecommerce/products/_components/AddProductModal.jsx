'use client'
import { useState, useEffect, useRef } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createProduct } from '../_actions/createProduct'
import { updateProduct } from '../_actions/updateProduct'
import { uploadProductImage } from '../_actions/uploadProductImage'
import { getEcommerceCategories } from '../_actions/getEcommerceCategories'
import { toast } from 'sonner'
import { Package, Tag, Loader2, Upload, X, ImagePlus } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAction } from '@/hooks/use-action'

const INITIAL_DATA = {
    title: '',
    description: '',
    longDescription: '',
    sku: '',
    price: '',
    discount: '',
    quantity: '0',
    status: 'active',
    category: '',
    imageUrl: '',
}

export function AddProductModal({ open, onClose, product, onSuccess, workspaceId }) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState(INITIAL_DATA)
    const [uploading, setUploading] = useState(false)
    const [localPreview, setLocalPreview] = useState(null)
    const fileInputRef = useRef(null)

    const isEdit = !!product?.id

    const { execute: fetchCategories, data: categoriesData, isLoading: loadingCategories } = useAction(getEcommerceCategories, {
        onSuccess: (data) => {
            // categories loaded
        },
        onError: (error) => {
            console.error('[FETCH_CATEGORIES_ERROR]', error)
        }
    })

    useEffect(() => {
        if (workspaceId && open) {
            fetchCategories({ workspaceId })
        }
    }, [workspaceId, open, fetchCategories])

    const categories = categoriesData?.categories || []

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
                category: product.metadata?.category || '',
                imageUrl: product.imageUrl || '',
            })
            setLocalPreview(null)
        } else {
            setFormData(INITIAL_DATA)
            setLocalPreview(null)
        }
    }, [product, open])

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value === undefined ? '' : value
        }))
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

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Show local preview immediately
        const previewUrl = URL.createObjectURL(file)
        setLocalPreview(previewUrl)
        setFormData(prev => ({ ...prev, imageUrl: previewUrl }))

        setUploading(true)
        try {
            const formDataObj = new FormData()
            formDataObj.append('file', file)

            const result = await uploadProductImage(formDataObj)

            if (result.success) {
                // Release local preview and use uploaded URL
                URL.revokeObjectURL(previewUrl)
                handleChange('imageUrl', result.url)
                toast.success('Image uploaded successfully')
            } else {
                // Keep local preview if upload fails
                handleChange('imageUrl', previewUrl)
                toast.error(result.message || 'Upload failed, using local preview')
            }
        } catch (error) {
            console.error('[UPLOAD_ERROR]', error)
            handleChange('imageUrl', previewUrl)
            toast.error('Failed to upload image')
        } finally {
            setUploading(false)
        }
    }

    const handleRemoveImage = () => {
        if (localPreview) {
            URL.revokeObjectURL(localPreview)
            setLocalPreview(null)
        }
        handleChange('imageUrl', '')
    }

    const discountedPrice = ((parseFloat(formData.price) || 0) * (1 - (parseFloat(formData.discount) || 0) / 100)).toFixed(2)

    return (
        <Sheet open={open} onOpenChange={onClose}>
            <SheetContent className="w-full sm:max-w-2xl flex flex-col p-2 bg-transparent border-0">
                <div className='border bg-card rounded-md h-full overflow-hidden'>
                    <SheetHeader className="border-b pb-4 pr-8">
                        <SheetTitle className="flex items-center gap-2">
                            <Package className="w-5 h-5 text-primary" />
                            {isEdit ? 'Edit Product' : 'Add New Product'}
                        </SheetTitle>
                        <SheetDescription>
                            {isEdit ? 'Update product details below' : 'Fill in the details to add a new product'}
                        </SheetDescription>
                    </SheetHeader>

                    <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">


                        <ScrollArea className="h-[80vh]  px-4">
                            <div className="space-y-4 py-4">
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
                                    <Select 
                                        value={formData.category} 
                                        onValueChange={(v) => handleChange('category', v)}
                                        disabled={loadingCategories}
                                    >
                                        <SelectTrigger className="bg-background border-border text-foreground">
                                            <SelectValue placeholder={loadingCategories ? "Loading..." : "Select category"} />
                                        </SelectTrigger>
                                        <SelectContent className="bg-popover border-border text-popover-foreground">
                                            {loadingCategories ? (
                                                <div className="flex items-center justify-center p-2">
                                                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                                                </div>
                                            ) : categories.length === 0 ? (
                                                <div className="p-2 text-xs text-muted-foreground text-center">
                                                    No categories found
                                                </div>
                                            ) : (
                                                categories.map(cat => (
                                                    <SelectItem key={cat.id} value={cat.name} className="focus:bg-accent focus:text-accent-foreground">
                                                        <div className="flex items-center gap-2">
                                                            {cat.color && (
                                                                <div 
                                                                    className="w-2 h-2 rounded-full" 
                                                                    style={{ backgroundColor: cat.color }}
                                                                />
                                                            )}
                                                            <p className="font-medium">{cat.name}</p>
                                                        </div>
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs">Short Description</Label>
                                    <Textarea
                                        rows='4'
                                        value={formData.description}
                                        onChange={(e) => handleChange('description', e.target.value)}
                                        placeholder="Brief description..."
                                        className="bg-background border-border text-foreground placeholder:text-muted-foreground min-h-[80px]"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs">Long Description</Label>
                                    <Textarea
                                        rows='4'
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

                                {formData.price && formData.discount > 0 && (
                                    <div className="p-3 rounded-lg bg-accent">
                                        <p className="text-xs text-muted-foreground">After Discount:</p>
                                        <p className="text-lg font-bold text-foreground">₹{discountedPrice}</p>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label className="text-xs">SKU</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={formData.sku}
                                            onChange={(e) => handleChange('sku', e.target.value)}
                                            placeholder="Auto-generated"
                                            className="bg-background border-border text-foreground placeholder:text-muted-foreground font-mono"
                                        />
                                        <Button type="button" variant="outline" onClick={generateSKU} className="border-border hover:bg-accent shrink-0">
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
                                    <Label className="text-xs">Image</Label>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                    />
                                    {(localPreview || formData.imageUrl) ? (
                                        <div className="relative w-full h-40 rounded-lg border border-border overflow-hidden bg-muted group">
                                            <img
                                                src={localPreview || formData.imageUrl}
                                                alt="Preview"
                                                className="w-full h-full object-contain"
                                                onError={(e) => e.target.style.display = 'none'}
                                            />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                onClick={handleRemoveImage}
                                                className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-full h-40 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary hover:bg-accent/50 transition-colors"
                                        >
                                            {uploading ? (
                                                <>
                                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                                    <p className="text-xs text-muted-foreground">Uploading...</p>
                                                </>
                                            ) : (
                                                <>
                                                    <ImagePlus className="w-8 h-8 text-muted-foreground" />
                                                    <p className="text-xs text-muted-foreground">Click to upload image</p>
                                                    <p className="text-[10px] text-muted-foreground opacity-60">PNG, JPG up to 5MB</p>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </ScrollArea>

                        <SheetFooter className="border-t pt-4 pr-8">
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