'use client'
import { useState, useEffect, useRef } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MultiSelect } from "@/components/ui/multi-select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { createProduct } from '../_actions/createProduct'
import { updateProduct } from '../_actions/updateProduct'
import { uploadProductImage } from '../_actions/uploadProductImage'
import { getEcommerceCategories } from '../_actions/getEcommerceCategories'
import { getStores } from '../../settings/_actions/getStores'
import { toast } from 'sonner'
import { Package, Tag, Loader2, Upload, X, ImagePlus, ShoppingBag, Download, Briefcase, GraduationCap, Utensils, Layers, Plus } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAction } from '@/hooks/use-action'

const PRODUCT_TYPES = [
    { id: 'physical', label: 'Physical', icon: ShoppingBag, description: 'Physical goods like clothing, electronics, etc.' },
    { id: 'digital', label: 'Digital', icon: Download, description: 'Downloadable files, software, e-books, etc.' },
    { id: 'service', label: 'Service', icon: Briefcase, description: 'Consulting, repairs, professional services, etc.' },
    { id: 'course', label: 'Course', icon: GraduationCap, description: 'Online courses, workshops, training, etc.' },
    { id: 'food', label: 'Food & Beverage', icon: Utensils, description: 'Food items, drinks, restaurant orders, etc.' },
    { id: 'general', label: 'General', icon: Layers, description: 'General products for any type of store' },
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
    storeId: '',
    category: [],
    imageUrl: '',
    images: [],
    productType: 'physical',
    digitalFileUrl: '',
    duration: '',
    servings: '',
    nutritionalInfo: '',
    requirements: '',
    deliveryMethod: 'manual',
}

export function AddProductModal({ open, onClose, product, onSuccess, workspaceId }) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState(INITIAL_DATA)
    const [uploading, setUploading] = useState(false)
    const [localPreview, setLocalPreview] = useState(null)
    const [localPreviews, setLocalPreviews] = useState([])
    const fileInputRef = useRef(null)
    const fileInputMultipleRef = useRef(null)

    const isEdit = !!product?.id
    const activeProductType = PRODUCT_TYPES.find(t => t.id === formData.productType) || PRODUCT_TYPES[0]
    const ActiveIcon = activeProductType.icon

    const { execute: fetchCategories, data: categoriesData, isLoading: loadingCategories } = useAction(getEcommerceCategories)
    const { execute: fetchStores, data: storesData, isLoading: loadingStores } = useAction(getStores)

    useEffect(() => {
        if (workspaceId && open) {
            fetchCategories({ workspaceId })
            fetchStores({ workspaceId })
        }
    }, [workspaceId, open, fetchCategories, fetchStores])

    const allCategories = categoriesData?.categories || []
    const stores = storesData?.stores || []
    
    // Filter categories by selected store
    const categories = formData.storeId 
        ? allCategories.filter(c => c.storeId === formData.storeId) 
        : []

    useEffect(() => {
        if (product) {
            const existingImages = product.imageUrls?.images || product.metadata?.images || []
            
            let existingCategories = []
            if (Array.isArray(product.metadata?.category)) {
                existingCategories = product.metadata.category
            } else if (typeof product.metadata?.category === 'string' && product.metadata.category !== '') {
                existingCategories = [product.metadata.category]
            }

            setFormData({
                title: product.title || '',
                description: product.description || '',
                longDescription: product.metadata?.longDescription || '',
                sku: product.sku || '',
                price: product.price?.toString() || '',
                discount: product.discount?.toString() || '',
                quantity: product.inventoryCount?.toString() || '0',
                status: product.status || 'active',
                storeId: product.storeId || '',
                category: existingCategories,
                imageUrl: product.imageUrls?.cover || product.imageUrl || '',
                images: existingImages,
                productType: product.metadata?.productType || 'physical',
                digitalFileUrl: product.metadata?.digitalFileUrl || '',
                duration: product.metadata?.duration || '',
                servings: product.metadata?.servings || '',
                nutritionalInfo: product.metadata?.nutritionalInfo || '',
                requirements: product.metadata?.requirements || '',
                deliveryMethod: product.metadata?.deliveryMethod || 'manual',
            })
            setLocalPreview(null)
            setLocalPreviews([])
        } else {
            setFormData(INITIAL_DATA)
            setLocalPreview(null)
            setLocalPreviews([])
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
        
        if (!formData.storeId) {
            toast.error('Please select a store')
            return
        }

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
        const catName = Array.isArray(formData.category) && formData.category.length > 0 ? formData.category[0] : 'PRD'
        const prefix = catName.substring(0, 3).toUpperCase()
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

    const handleMultipleFileUpload = async (e) => {
        const files = Array.from(e.target.files || [])
        if (files.length === 0) return

        setUploading(true)

        const newLocalPreviews = files.map(file => ({
            file,
            preview: URL.createObjectURL(file)
        }))

        setLocalPreviews(prev => [...prev, ...newLocalPreviews])

        try {
            const uploadedUrls = []
            for (const file of files) {
                const formDataObj = new FormData()
                formDataObj.append('file', file)

                const result = await uploadProductImage(formDataObj)

                if (result.success) {
                    uploadedUrls.push(result.url)
                }
            }
            
            if (uploadedUrls.length > 0) {
                setFormData(prev => ({
                    ...prev,
                    images: [...prev.images, ...uploadedUrls]
                }))
            }
            
            toast.success(`${uploadedUrls.length} image(s) uploaded`)
        } catch (error) {
            console.error('[MULTIPLE_UPLOAD_ERROR]', error)
            toast.error('Failed to upload images')
        } finally {
            setUploading(false)
            if (fileInputMultipleRef.current) {
                fileInputMultipleRef.current.value = ''
            }
        }
    }

    const handleRemoveMultipleImage = (index, previewUrl) => {
        URL.revokeObjectURL(previewUrl)
        const updatedImages = formData.images.filter((_, i) => i !== index)
        const updatedPreviews = localPreviews.filter((_, i) => i !== index)
        handleChange('images', updatedImages)
        setLocalPreviews(updatedPreviews)
    }

    const handleSetCoverImage = (imageUrl) => {
        handleChange('imageUrl', imageUrl)
        toast.success('Cover image updated')
    }

    const discountedPrice = ((parseFloat(formData.price) || 0) * (1 - (parseFloat(formData.discount) || 0) / 100)).toFixed(2)

    return (
        <Sheet open={open} onOpenChange={onClose}>
            <SheetContent className="w-full min-w-[640px] flex flex-col p-2 bg-transparent border-0">

                <div className='border bg-card rounded-md h-full overflow-hidden w-full'>
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

                        <div className="border-b px-4 pt-4">
                            <div className="flex items-center gap-2 mb-3">
                                <ActiveIcon className="w-4 h-4 text-primary" />
                                <Label className="text-xs font-medium">Product Type</Label>
                            </div>
                            <Tabs value={formData.productType} onValueChange={(v) => handleChange('productType', v)} className="w-full">
                                <TabsList className="w-full justify-start h-auto flex-wrap gap-1 bg-transparent p-0">
                                    {PRODUCT_TYPES.map((type) => {
                                        const Icon = type.icon
                                        return (
                                            <TabsTrigger
                                                key={type.id}
                                                value={type.id}
                                                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-1.5 px-3 py-1.5 text-xs"
                                            >
                                                <Icon className="w-3.5 h-3.5" />
                                                {type.label}
                                            </TabsTrigger>
                                        )
                                    })}
                                </TabsList>
                            </Tabs>
                            <p className="text-xs text-muted-foreground mt-2 mb-3">
                                {activeProductType.description}
                            </p>
                        </div>

                        <ScrollArea className="h-[74vh]  px-4">
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

                                <div className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Store *</Label>
                                <Select value={formData.storeId} onValueChange={(val) => {
                                    handleChange('storeId', val);
                                    handleChange('category', []); // Reset categories when store changes
                                }}>
                                    <SelectTrigger className="w-full bg-muted/50 border-border/50 h-10">
                                        <SelectValue placeholder={loadingStores ? "Loading stores..." : "Select store"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {stores.map(store => (
                                            <SelectItem key={store.id} value={store.id}>
                                                {store.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Categories</Label>
                                </div>
                                <MultiSelect
                                    options={categories}
                                    selected={categories.filter(cat => Array.isArray(formData.category) && formData.category.includes(cat.name))}
                                    onChange={(selectedItems) => handleChange('category', selectedItems.map(item => item.name))}
                                    placeholder={!formData.storeId ? "Select a store first..." : loadingCategories ? "Loading..." : "Select categories..."}
                                    disabled={!formData.storeId}
                                />
                            </div>
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
                                    <Label className="text-xs">Cover Image</Label>
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
                                                    <p className="text-xs text-muted-foreground">Click to upload cover image</p>
                                                    <p className="text-[10px] text-muted-foreground opacity-60">PNG, JPG up to 5MB</p>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs">Product Images</Label>
                                        <span className="text-[10px] text-muted-foreground">
                                            {formData.images.length} image(s)
                                        </span>
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputMultipleRef}
                                        accept="image/*"
                                        multiple
                                        onChange={handleMultipleFileUpload}
                                        className="hidden"
                                    />
                                    <div className="grid grid-cols-4 gap-2">
                                        {(formData.images.length > 0 || localPreviews.length > 0) && (
                                            <>
                                                {localPreviews.map((item, index) => {
                                                    const imageUrl = formData.images[index]
                                                    const isCover = formData.imageUrl === imageUrl
                                                    return (
                                                        <div key={index} className="relative aspect-square rounded-lg border border-border overflow-hidden bg-muted group">
                                                            <img
                                                                src={item.preview}
                                                                alt={`Preview ${index + 1}`}
                                                                className="w-full h-full object-cover"
                                                            />
                                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                                                <Button
                                                                    type="button"
                                                                    variant={isCover ? "default" : "outline"}
                                                                    size="sm"
                                                                    className="h-7 text-xs"
                                                                    onClick={() => imageUrl && handleSetCoverImage(imageUrl)}
                                                                >
                                                                    Cover
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    variant="destructive"
                                                                    size="icon"
                                                                    className="h-7 w-7"
                                                                    onClick={() => handleRemoveMultipleImage(index, item.preview)}
                                                                >
                                                                    <X className="w-3 h-3" />
                                                                </Button>
                                                            </div>
                                                            {isCover && (
                                                                <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-[8px] px-1.5 py-0.5 rounded">
                                                                    Cover
                                                                </div>
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                                {formData.images.slice(localPreviews.length).map((imageUrl, idx) => {
                                                    const actualIndex = localPreviews.length + idx
                                                    const isCover = formData.imageUrl === imageUrl
                                                    return (
                                                        <div key={`existing-${actualIndex}`} className="relative aspect-square rounded-lg border border-border overflow-hidden bg-muted group">
                                                            <img
                                                                src={imageUrl}
                                                                alt={`Image ${actualIndex + 1}`}
                                                                className="w-full h-full object-cover"
                                                            />
                                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                                                <Button
                                                                    type="button"
                                                                    variant={isCover ? "default" : "outline"}
                                                                    size="sm"
                                                                    className="h-7 text-xs"
                                                                    onClick={() => handleSetCoverImage(imageUrl)}
                                                                >
                                                                    Cover
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    variant="destructive"
                                                                    size="icon"
                                                                    className="h-7 w-7"
                                                                    onClick={() => handleRemoveMultipleImage(actualIndex, imageUrl)}
                                                                >
                                                                    <X className="w-3 h-3" />
                                                                </Button>
                                                            </div>
                                                            {isCover && (
                                                                <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-[8px] px-1.5 py-0.5 rounded">
                                                                    Cover
                                                                </div>
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </>
                                        )}
                                        <div
                                            onClick={() => fileInputMultipleRef.current?.click()}
                                            className="aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-primary hover:bg-accent/50 transition-colors"
                                        >
                                            {uploading ? (
                                                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                            ) : (
                                                <>
                                                    <Plus className="w-5 h-5 text-muted-foreground" />
                                                    <p className="text-[8px] text-muted-foreground">Add More</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {formData.productType === 'digital' && (
                                    <>
                                        <div className="border-t pt-4 mt-4">
                                            <Label className="text-xs font-medium flex items-center gap-2">
                                                <Download className="w-3.5 h-3.5" />
                                                Digital Product Settings
                                            </Label>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs">Digital File URL</Label>
                                            <Input
                                                value={formData.digitalFileUrl}
                                                onChange={(e) => handleChange('digitalFileUrl', e.target.value)}
                                                placeholder="https://example.com/download/file"
                                                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs">Delivery Method</Label>
                                            <Select value={formData.deliveryMethod} onValueChange={(v) => handleChange('deliveryMethod', v)}>
                                                <SelectTrigger className="bg-background border-border text-foreground">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-popover border-border text-popover-foreground">
                                                    <SelectItem value="manual">Manual Download</SelectItem>
                                                    <SelectItem value="email">Email with Link</SelectItem>
                                                    <SelectItem value="automatic">Automatic after Payment</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </>
                                )}

                                {formData.productType === 'service' && (
                                    <>
                                        <div className="border-t pt-4 mt-4">
                                            <Label className="text-xs font-medium flex items-center gap-2">
                                                <Briefcase className="w-3.5 h-3.5" />
                                                Service Settings
                                            </Label>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs">Duration</Label>
                                            <Input
                                                value={formData.duration}
                                                onChange={(e) => handleChange('duration', e.target.value)}
                                                placeholder="e.g., 1 hour, 30 minutes"
                                                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs">Requirements</Label>
                                            <Textarea
                                                rows='3'
                                                value={formData.requirements}
                                                onChange={(e) => handleChange('requirements', e.target.value)}
                                                placeholder="What the customer needs to provide..."
                                                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                                            />
                                        </div>
                                    </>
                                )}

                                {formData.productType === 'course' && (
                                    <>
                                        <div className="border-t pt-4 mt-4">
                                            <Label className="text-xs font-medium flex items-center gap-2">
                                                <GraduationCap className="w-3.5 h-3.5" />
                                                Course Settings
                                            </Label>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs">Duration</Label>
                                            <Input
                                                value={formData.duration}
                                                onChange={(e) => handleChange('duration', e.target.value)}
                                                placeholder="e.g., 4 weeks, 10 hours total"
                                                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs">Requirements</Label>
                                            <Textarea
                                                rows='3'
                                                value={formData.requirements}
                                                onChange={(e) => handleChange('requirements', e.target.value)}
                                                placeholder="Prerequisites or requirements..."
                                                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                                            />
                                        </div>
                                    </>
                                )}

                                {formData.productType === 'food' && (
                                    <>
                                        <div className="border-t pt-4 mt-4">
                                            <Label className="text-xs font-medium flex items-center gap-2">
                                                <Utensils className="w-3.5 h-3.5" />
                                                Food & Beverage Settings
                                            </Label>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs">Servings/Portions</Label>
                                            <Input
                                                value={formData.servings}
                                                onChange={(e) => handleChange('servings', e.target.value)}
                                                placeholder="e.g., 2 servings, 1 piece"
                                                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs">Nutritional Information</Label>
                                            <Textarea
                                                rows='3'
                                                value={formData.nutritionalInfo}
                                                onChange={(e) => handleChange('nutritionalInfo', e.target.value)}
                                                placeholder="Calories, ingredients, allergens..."
                                                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                                            />
                                        </div>
                                    </>
                                )}

                                {formData.productType === 'general' && (
                                    <div className="border-t pt-4 mt-4">
                                        <p className="text-xs text-muted-foreground">
                                            General product type for any kind of ecommerce store. Use the standard fields above.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>

                        <SheetFooter className="border-t flex flex-row items-center justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                className="border-border hover:bg-accent"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading || !formData.title || !formData.price}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                            >
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