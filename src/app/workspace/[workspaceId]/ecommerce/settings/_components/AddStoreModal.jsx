'use client'
import { useState, useEffect, useRef } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createStore } from '../_actions/createStore'
import { updateStore } from '../_actions/updateStore'
import { uploadStoreLogo } from '../_actions/uploadStoreLogo'
import { toast } from 'sonner'
import { ShoppingCart, Loader2, Upload, X, ImagePlus, Store, Key, CreditCard, Smartphone, Building2, Wallet, Truck, Percent, ClipboardList, Package, ShoppingBag, Bell, RefreshCw } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

const CURRENCIES = [
    { value: 'INR', label: 'Indian Rupee (₹)' },
    { value: 'USD', label: 'US Dollar ($)' },
    { value: 'EUR', label: 'Euro (€)' },
    { value: 'GBP', label: 'British Pound (£)' },
]

const INITIAL_DATA = {
    name: '',
    slug: '',
    description: '',
    platform: 'manual',
    storeUrl: '',
    logo: '',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    accessToken: '',
    apiKey: '',
    apiSecret: '',
    paymentOptions: { card: true, upi: true, netbanking: true, cod: true },
    codMinAmount: 0,
    codMaxAmount: 5000,

    // Shipping
    defaultShippingCost: 0,
    freeShippingThreshold: null,
    shippingMethod: 'flat',

    // Tax
    taxPercentage: 0,
    taxInclusive: false,

    // Order
    autoFulfillOrders: false,
    orderPrefix: 'ORD',
    sendConfirmationEmail: true,

    // Inventory
    trackInventory: true,
    lowStockThreshold: 10,

    // Checkout
    guestCheckout: true,
    requirePhone: true,
    requireAddress: true,

    // Notifications
    orderEmailAlerts: true,
    lowStockAlerts: false,

    // Sync
    syncInterval: 30,
    webhooksEnabled: true,

    // Social
    socialLinks: {
        facebook: { url: '', accessToken: '', pageId: '' },
        instagram: { url: '', accessToken: '', igUserId: '' },
        twitter: { url: '', apiKey: '', apiSecret: '', accessToken: '', accessSecret: '' },
    }
}

const generateSlug = (name) => {
    // "Crystal Aura" -> "crystal-aura" (replace space with hyphen)
    // "CrystalAura" -> "crystalaura" (just lowercase, no hyphen)
    const hasSpace = name.includes(' ');

    let slug = name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '');

    if (hasSpace) {
        // Replace space with hyphen: "Crystal Aura" -> "crystal-aura"
        slug = slug.replace(/\s+/g, '-');
    }
    // else: "CrystalAura" -> "crystalaura" (just lowercase)

    return slug;
}

export function AddStoreModal({ open, onClose, store, onSuccess, workspaceId }) {
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [formData, setFormData] = useState(INITIAL_DATA)
    const fileInputRef = useRef(null)

    const isEdit = !!store?.id

    const handleLogoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size must be less than 5MB');
            return;
        }

        setUploading(true);
        try {
            const formDataObj = new FormData();
            formDataObj.append('file', file);

            const result = await uploadStoreLogo(formDataObj);

            if (result.success) {
                handleChange('logo', result.url);
                toast.success('Logo uploaded successfully');
            } else {
                toast.error(result.message || 'Failed to upload logo');
            }
        } catch (error) {
            console.error('[LOGO_UPLOAD_ERROR]', error);
            toast.error('Failed to upload logo');
        } finally {
            setUploading(false);
        }
    }

    useEffect(() => {
        if (store) {
            setFormData({
                name: store.name || '',
                slug: store.slug || '',
                description: store.description || '',
                platform: store.platform || 'manual',
                storeUrl: store.storeUrl || '',
                logo: store.logo || '',
                currency: store.currency || 'INR',
                timezone: store.timezone || 'Asia/Kolkata',
                accessToken: store.accessToken || '',
                apiKey: store.apiKey || '',
                apiSecret: store.apiSecret || '',
                paymentOptions: store.paymentOptions || { card: true, upi: true, netbanking: true, cod: true },
                codMinAmount: store.codMinAmount ?? 0,
                codMaxAmount: store.codMaxAmount ?? 5000,

                // Shipping
                defaultShippingCost: store.defaultShippingCost ?? 0,
                freeShippingThreshold: store.freeShippingThreshold ?? null,
                shippingMethod: store.shippingMethod || 'flat',

                // Tax
                taxPercentage: store.taxPercentage ?? 0,
                taxInclusive: store.taxInclusive ?? false,

                // Order
                autoFulfillOrders: store.autoFulfillOrders ?? false,
                orderPrefix: store.orderPrefix || 'ORD',
                sendConfirmationEmail: store.sendConfirmationEmail ?? true,

                // Inventory
                trackInventory: store.trackInventory ?? true,
                lowStockThreshold: store.lowStockThreshold ?? 10,

                // Checkout
                guestCheckout: store.guestCheckout ?? true,
                requirePhone: store.requirePhone ?? true,
                requireAddress: store.requireAddress ?? true,

                // Notifications
                orderEmailAlerts: store.orderEmailAlerts ?? true,
                lowStockAlerts: store.lowStockAlerts ?? false,

                // Sync
                syncInterval: store.syncInterval ?? 30,
                webhooksEnabled: store.webhooksEnabled ?? true,
                
                // Social
                socialLinks: store.metadata?.socialLinks || {
                    facebook: { url: '', accessToken: '', pageId: '' },
                    instagram: { url: '', accessToken: '', igUserId: '' },
                    twitter: { url: '', apiKey: '', apiSecret: '', accessToken: '', accessSecret: '' },
                }
            })
        } else {
            setFormData(INITIAL_DATA)
        }
    }, [store, open])

    const handleChange = (field, value) => {
        if (field === 'name') {
            setFormData(prev => ({
                ...prev,
                name: value,
                slug: generateSlug(value)
            }))
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value === undefined ? '' : value
            }))
        }
    }

    const [showApiKey, setShowApiKey] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            let result
            if (isEdit) {
                result = await updateStore({ workspaceId, storeId: store.id, formData })
            } else {
                result = await createStore({ workspaceId, formData })
            }

            console.log('Store result:', result)

            if (result?.data?.store) {
                if (!isEdit && result?.data?.apiKey) {
                    setShowApiKey(result.data.apiKey);
                    toast.success('Store created! Save your API Key - it will not be shown again.');
                } else {
                    toast.success(isEdit ? 'Store updated!' : 'Store created!');
                }
                onSuccess?.()
                if (!showApiKey) onClose();
            } else if (result?.error) {
                toast.error(result.error)
            } else {
                toast.error('Failed to save store')
            }
        } catch (error) {
            console.error('[STORE_SUBMIT_ERROR]', error)
            toast.error(error.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Sheet open={open} onOpenChange={onClose}>
            <SheetContent className="w-full min-w-[40vw]  flex flex-col p-2 bg-transparent border-0">



                <div className='border bg-card rounded-md h-full overflow-hidden'>
                    <SheetHeader className="border-b pb-4 pr-8">
                        <SheetTitle className="flex items-center gap-2">
                            <Store className="w-5 h-5 text-primary" />
                            {isEdit ? 'Edit Store' : 'Add New Store'}
                        </SheetTitle>
                        <SheetDescription>
                            {isEdit ? 'Update store details below' : 'Connect a new store to sync products and orders'}
                        </SheetDescription>
                    </SheetHeader>


                    <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">

                        <ScrollArea className='h-[80vh] p-4'>
                            <Tabs defaultValue="basic" className="w-full">
                                <TabsList className="w-full grid grid-cols-5 mb-4">
                                    <TabsTrigger value="basic" className="text-xs">Basic</TabsTrigger>
                                    <TabsTrigger value="payment" className="text-xs">Payment</TabsTrigger>
                                    <TabsTrigger value="settings" className="text-xs">Settings</TabsTrigger>
                                    <TabsTrigger value="notifications" className="text-xs">Notifications</TabsTrigger>
                                    <TabsTrigger value="social" className="text-xs">Social</TabsTrigger>
                                </TabsList>

                                <ScrollArea className="h-[65vh] px-4">
                                    <TabsContent value="basic" className="space-y-4 mt-0">
                                        <div className="space-y-2">
                                            <Label className="text-xs">Store Name *</Label>
                                            <Input
                                                value={formData.name}
                                                onChange={(e) => handleChange('name', e.target.value)}
                                                placeholder="My Online Store"
                                                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-xs">Store Slug *</Label>
                                            <Input
                                                value={formData.slug}
                                                onChange={(e) => handleChange('slug', e.target.value.toLowerCase().trim())}
                                                placeholder="my-online-store"
                                                className="bg-background border-border text-foreground placeholder:text-muted-foreground font-mono"
                                                required
                                            />
                                            <p className="text-[10px] text-muted-foreground">Used to connect from external frontend</p>
                                        </div>



                                        <div className="space-y-2">
                                            <Label className="text-xs">Store URL *</Label>
                                            <Input
                                                value={formData.storeUrl}
                                                onChange={(e) => handleChange('storeUrl', e.target.value)}
                                                placeholder="https://mystore.com"
                                                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-xs">Description</Label>
                                            <Textarea
                                                rows='3'
                                                value={formData.description}
                                                onChange={(e) => handleChange('description', e.target.value)}
                                                placeholder="Brief description of your store..."
                                                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs">Currency</Label>
                                                <Select value={formData.currency} onValueChange={(v) => handleChange('currency', v)}>
                                                    <SelectTrigger className="bg-background border-border text-foreground">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-popover border-border text-popover-foreground">
                                                        {CURRENCIES.map(curr => (
                                                            <SelectItem key={curr.value} value={curr.value}>{curr.label}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs">Status</Label>
                                                <Badge variant="outline" className="text-green-500 border-green-500/30">Connected</Badge>
                                            </div>
                                        </div>



                                        <div className="space-y-2">
                                            <Label className="text-xs">Store Logo</Label>
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                accept="image/*"
                                                onChange={handleLogoUpload}
                                                disabled={uploading}
                                                className="hidden"
                                            />
                                            {uploading ? (
                                                <div className="w-full h-24 rounded-lg border border-border flex flex-col items-center justify-center gap-2 bg-muted">
                                                    <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
                                                    <p className="text-xs text-muted-foreground">Uploading...</p>
                                                </div>
                                            ) : formData.logo ? (
                                                <div className="relative w-full h-24 rounded-lg border border-border overflow-hidden bg-muted">
                                                    <img src={formData.logo} alt="Store Logo" className="w-full h-full object-contain" />
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="icon"
                                                        onClick={() => handleChange('logo', '')}
                                                        className="absolute top-2 right-2 h-6 w-6"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="w-full h-24 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary hover:bg-accent/50 transition-colors"
                                                >
                                                    <ImagePlus className="w-6 h-6 text-muted-foreground" />
                                                    <p className="text-xs text-muted-foreground">Click to upload logo</p>
                                                </div>
                                            )}
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="payment" className="space-y-4 mt-0">
                                        <div className="space-y-3">
                                            <Label className="text-xs">Payment Options</Label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-background">
                                                    <div className="flex items-center gap-2">
                                                        <CreditCard className="w-4 h-4 text-muted-foreground" />
                                                        <span className="text-xs">Card</span>
                                                    </div>
                                                    <Switch
                                                        checked={formData.paymentOptions?.card ?? true}
                                                        onCheckedChange={(checked) => handleChange('paymentOptions', { ...formData.paymentOptions, card: checked })}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-background">
                                                    <div className="flex items-center gap-2">
                                                        <Smartphone className="w-4 h-4 text-muted-foreground" />
                                                        <span className="text-xs">UPI</span>
                                                    </div>
                                                    <Switch
                                                        checked={formData.paymentOptions?.upi ?? true}
                                                        onCheckedChange={(checked) => handleChange('paymentOptions', { ...formData.paymentOptions, upi: checked })}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-background">
                                                    <div className="flex items-center gap-2">
                                                        <Building2 className="w-4 h-4 text-muted-foreground" />
                                                        <span className="text-xs">Net Banking</span>
                                                    </div>
                                                    <Switch
                                                        checked={formData.paymentOptions?.netbanking ?? true}
                                                        onCheckedChange={(checked) => handleChange('paymentOptions', { ...formData.paymentOptions, netbanking: checked })}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-background">
                                                    <div className="flex items-center gap-2">
                                                        <Wallet className="w-4 h-4 text-muted-foreground" />
                                                        <span className="text-xs">COD</span>
                                                    </div>
                                                    <Switch
                                                        checked={formData.paymentOptions?.cod ?? true}
                                                        onCheckedChange={(checked) => handleChange('paymentOptions', { ...formData.paymentOptions, cod: checked })}
                                                    />
                                                </div>
                                            </div>

                                            {formData.paymentOptions?.cod && (
                                                <div className="grid grid-cols-2 gap-3 mt-2">
                                                    <div className="space-y-1">
                                                        <Label className="text-[10px] text-muted-foreground">COD Min Amount (₹)</Label>
                                                        <Input
                                                            type="number"
                                                            value={formData.codMinAmount || 0}
                                                            onChange={(e) => handleChange('codMinAmount', parseInt(e.target.value) || 0)}
                                                            className="bg-background border-border text-foreground"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-[10px] text-muted-foreground">COD Max Amount (₹)</Label>
                                                        <Input
                                                            type="number"
                                                            value={formData.codMaxAmount || 5000}
                                                            onChange={(e) => handleChange('codMaxAmount', parseInt(e.target.value) || 5000)}
                                                            className="bg-background border-border text-foreground"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="settings" className="space-y-4 mt-0">
                                        <div className="space-y-3">
                                            <Label className="text-xs flex items-center gap-2">
                                                <Truck className="w-4 h-4" /> Shipping
                                            </Label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] text-muted-foreground">Shipping Method</Label>
                                                    <Select value={formData.shippingMethod || 'flat'} onValueChange={(v) => handleChange('shippingMethod', v)}>
                                                        <SelectTrigger className="bg-background border-border text-foreground h-8">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-popover border-border text-popover-foreground">
                                                            <SelectItem value="flat">Flat Rate</SelectItem>
                                                            <SelectItem value="calculated">Calculated</SelectItem>
                                                            <SelectItem value="free">Free Shipping</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] text-muted-foreground">Default Cost (₹)</Label>
                                                    <Input
                                                        type="number"
                                                        value={formData.defaultShippingCost || 0}
                                                        onChange={(e) => handleChange('defaultShippingCost', parseFloat(e.target.value) || 0)}
                                                        className="bg-background border-border text-foreground h-8"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px] text-muted-foreground">Free Shipping Threshold (₹)</Label>
                                                <Input
                                                    type="number"
                                                    value={formData.freeShippingThreshold || ''}
                                                    onChange={(e) => handleChange('freeShippingThreshold', e.target.value ? parseFloat(e.target.value) : null)}
                                                    placeholder="Leave empty to disable"
                                                    className="bg-background border-border text-foreground"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="text-xs flex items-center gap-2">
                                                <Percent className="w-4 h-4" /> Tax Settings
                                            </Label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] text-muted-foreground">Tax Percentage (%)</Label>
                                                    <Input
                                                        type="number"
                                                        step="0.1"
                                                        value={formData.taxPercentage || 0}
                                                        onChange={(e) => handleChange('taxPercentage', parseFloat(e.target.value) || 0)}
                                                        className="bg-background border-border text-foreground"
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-background">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs">Prices Inclusive</span>
                                                    </div>
                                                    <Switch
                                                        checked={formData.taxInclusive ?? false}
                                                        onCheckedChange={(checked) => handleChange('taxInclusive', checked)}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="text-xs flex items-center gap-2">
                                                <ClipboardList className="w-4 h-4" /> Order Settings
                                            </Label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] text-muted-foreground">Order Prefix</Label>
                                                    <Input
                                                        value={formData.orderPrefix || 'ORD'}
                                                        onChange={(e) => handleChange('orderPrefix', e.target.value.toUpperCase())}
                                                        className="bg-background border-border text-foreground font-mono"
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-background">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs">Auto Fulfill</span>
                                                    </div>
                                                    <Switch
                                                        checked={formData.autoFulfillOrders ?? false}
                                                        onCheckedChange={(checked) => handleChange('autoFulfillOrders', checked)}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-background">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs">Send Confirmation</span>
                                                    </div>
                                                    <Switch
                                                        checked={formData.sendConfirmationEmail ?? true}
                                                        onCheckedChange={(checked) => handleChange('sendConfirmationEmail', checked)}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="text-xs flex items-center gap-2">
                                                <Package className="w-4 h-4" /> Inventory
                                            </Label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-background">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs">Track Inventory</span>
                                                    </div>
                                                    <Switch
                                                        checked={formData.trackInventory ?? true}
                                                        onCheckedChange={(checked) => handleChange('trackInventory', checked)}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] text-muted-foreground">Low Stock Alert</Label>
                                                    <Input
                                                        type="number"
                                                        value={formData.lowStockThreshold ?? 10}
                                                        onChange={(e) => handleChange('lowStockThreshold', parseInt(e.target.value) || 10)}
                                                        className="bg-background border-border text-foreground"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="text-xs flex items-center gap-2">
                                                <ShoppingBag className="w-4 h-4" /> Checkout Settings
                                            </Label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-background">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs">Guest Checkout</span>
                                                    </div>
                                                    <Switch
                                                        checked={formData.guestCheckout ?? true}
                                                        onCheckedChange={(checked) => handleChange('guestCheckout', checked)}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-background">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs">Require Phone</span>
                                                    </div>
                                                    <Switch
                                                        checked={formData.requirePhone ?? true}
                                                        onCheckedChange={(checked) => handleChange('requirePhone', checked)}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-background">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs">Require Address</span>
                                                    </div>
                                                    <Switch
                                                        checked={formData.requireAddress ?? true}
                                                        onCheckedChange={(checked) => handleChange('requireAddress', checked)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="notifications" className="space-y-4 mt-0">
                                        <div className="space-y-3">
                                            <Label className="text-xs flex items-center gap-2">
                                                <Bell className="w-4 h-4" /> Notifications
                                            </Label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-background">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs">Order Alerts</span>
                                                    </div>
                                                    <Switch
                                                        checked={formData.orderEmailAlerts ?? true}
                                                        onCheckedChange={(checked) => handleChange('orderEmailAlerts', checked)}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-background">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs">Low Stock Alerts</span>
                                                    </div>
                                                    <Switch
                                                        checked={formData.lowStockAlerts ?? false}
                                                        onCheckedChange={(checked) => handleChange('lowStockAlerts', checked)}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="text-xs flex items-center gap-2">
                                                <RefreshCw className="w-4 h-4" /> Sync Settings
                                            </Label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] text-muted-foreground">Sync Interval (min)</Label>
                                                    <Select value={String(formData.syncInterval || 30)} onValueChange={(v) => handleChange('syncInterval', parseInt(v))}>
                                                        <SelectTrigger className="bg-background border-border text-foreground h-8">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-popover border-border text-popover-foreground">
                                                            <SelectItem value="15">15 min</SelectItem>
                                                            <SelectItem value="30">30 min</SelectItem>
                                                            <SelectItem value="60">1 hour</SelectItem>
                                                            <SelectItem value="120">2 hours</SelectItem>
                                                            <SelectItem value="360">6 hours</SelectItem>
                                                            <SelectItem value="720">12 hours</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-background">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs">Webhooks</span>
                                                    </div>
                                                    <Switch
                                                        checked={formData.webhooksEnabled ?? true}
                                                        onCheckedChange={(checked) => handleChange('webhooksEnabled', checked)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="social" className="space-y-6 mt-0">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                <div className="bg-blue-500/10 p-1.5 rounded text-blue-500">
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
                                                </div>
                                                <Label className="text-xs font-bold">Facebook Settings</Label>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 pl-8">
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] text-muted-foreground">Page URL</Label>
                                                    <Input
                                                        value={formData.socialLinks?.facebook?.url || ''}
                                                        onChange={(e) => handleChange('socialLinks', { ...formData.socialLinks, facebook: { ...formData.socialLinks?.facebook, url: e.target.value }})}
                                                        placeholder="https://facebook.com/yourpage"
                                                        className="bg-background border-border text-foreground h-8 text-xs"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] text-muted-foreground">Page ID</Label>
                                                    <Input
                                                        value={formData.socialLinks?.facebook?.pageId || ''}
                                                        onChange={(e) => handleChange('socialLinks', { ...formData.socialLinks, facebook: { ...formData.socialLinks?.facebook, pageId: e.target.value }})}
                                                        placeholder="123456789"
                                                        className="bg-background border-border text-foreground h-8 text-xs"
                                                    />
                                                </div>
                                                <div className="space-y-1 col-span-2">
                                                    <Label className="text-[10px] text-muted-foreground">Access Token</Label>
                                                    <Input
                                                        value={formData.socialLinks?.facebook?.accessToken || ''}
                                                        onChange={(e) => handleChange('socialLinks', { ...formData.socialLinks, facebook: { ...formData.socialLinks?.facebook, accessToken: e.target.value }})}
                                                        placeholder="EAAGm0PX4ZCpwBA..."
                                                        type="password"
                                                        className="bg-background border-border text-foreground h-8 text-xs"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                <div className="bg-pink-500/10 p-1.5 rounded text-pink-500">
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                                                </div>
                                                <Label className="text-xs font-bold">Instagram Settings</Label>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 pl-8">
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] text-muted-foreground">Profile URL</Label>
                                                    <Input
                                                        value={formData.socialLinks?.instagram?.url || ''}
                                                        onChange={(e) => handleChange('socialLinks', { ...formData.socialLinks, instagram: { ...formData.socialLinks?.instagram, url: e.target.value }})}
                                                        placeholder="https://instagram.com/yourhandle"
                                                        className="bg-background border-border text-foreground h-8 text-xs"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] text-muted-foreground">IG User ID</Label>
                                                    <Input
                                                        value={formData.socialLinks?.instagram?.igUserId || ''}
                                                        onChange={(e) => handleChange('socialLinks', { ...formData.socialLinks, instagram: { ...formData.socialLinks?.instagram, igUserId: e.target.value }})}
                                                        placeholder="178414..."
                                                        className="bg-background border-border text-foreground h-8 text-xs"
                                                    />
                                                </div>
                                                <div className="space-y-1 col-span-2">
                                                    <Label className="text-[10px] text-muted-foreground">Access Token</Label>
                                                    <Input
                                                        value={formData.socialLinks?.instagram?.accessToken || ''}
                                                        onChange={(e) => handleChange('socialLinks', { ...formData.socialLinks, instagram: { ...formData.socialLinks?.instagram, accessToken: e.target.value }})}
                                                        placeholder="EAAGm0PX4ZCpwBA..."
                                                        type="password"
                                                        className="bg-background border-border text-foreground h-8 text-xs"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                <div className="bg-slate-800 p-1.5 rounded text-white">
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                                                </div>
                                                <Label className="text-xs font-bold">X (Twitter) Settings</Label>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 pl-8">
                                                <div className="space-y-1 col-span-2">
                                                    <Label className="text-[10px] text-muted-foreground">Profile URL</Label>
                                                    <Input
                                                        value={formData.socialLinks?.twitter?.url || ''}
                                                        onChange={(e) => handleChange('socialLinks', { ...formData.socialLinks, twitter: { ...formData.socialLinks?.twitter, url: e.target.value }})}
                                                        placeholder="https://x.com/yourhandle"
                                                        className="bg-background border-border text-foreground h-8 text-xs"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] text-muted-foreground">API Key</Label>
                                                    <Input
                                                        value={formData.socialLinks?.twitter?.apiKey || ''}
                                                        onChange={(e) => handleChange('socialLinks', { ...formData.socialLinks, twitter: { ...formData.socialLinks?.twitter, apiKey: e.target.value }})}
                                                        placeholder="Consumer Key"
                                                        className="bg-background border-border text-foreground h-8 text-xs"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] text-muted-foreground">API Secret</Label>
                                                    <Input
                                                        value={formData.socialLinks?.twitter?.apiSecret || ''}
                                                        onChange={(e) => handleChange('socialLinks', { ...formData.socialLinks, twitter: { ...formData.socialLinks?.twitter, apiSecret: e.target.value }})}
                                                        placeholder="Consumer Secret"
                                                        type="password"
                                                        className="bg-background border-border text-foreground h-8 text-xs"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] text-muted-foreground">Access Token</Label>
                                                    <Input
                                                        value={formData.socialLinks?.twitter?.accessToken || ''}
                                                        onChange={(e) => handleChange('socialLinks', { ...formData.socialLinks, twitter: { ...formData.socialLinks?.twitter, accessToken: e.target.value }})}
                                                        placeholder="Access Token"
                                                        className="bg-background border-border text-foreground h-8 text-xs"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] text-muted-foreground">Access Secret</Label>
                                                    <Input
                                                        value={formData.socialLinks?.twitter?.accessSecret || ''}
                                                        onChange={(e) => handleChange('socialLinks', { ...formData.socialLinks, twitter: { ...formData.socialLinks?.twitter, accessSecret: e.target.value }})}
                                                        placeholder="Access Token Secret"
                                                        type="password"
                                                        className="bg-background border-border text-foreground h-8 text-xs"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>
                                </ScrollArea>
                            </Tabs>

                            {isEdit && (
                                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                                    <div className="flex items-center gap-2 text-primary">
                                        <Key className="w-4 h-4" />
                                        <p className="text-sm font-medium">API Key</p>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground mt-1">
                                        Click "API Key" button in the store list to view or regenerate your API key.
                                    </p>
                                </div>
                            )}

                            {showApiKey && (
                                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-bold text-amber-400">API Key Generated</p>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">
                                        Copy this key now. It won't be shown again!
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <code className="flex-1 p-2 rounded bg-black/50 text-xs font-mono text-white break-all">
                                            {showApiKey}
                                        </code>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => navigator.clipboard.writeText(showApiKey)}
                                            className="shrink-0 border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                                        >
                                            Copy
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </ScrollArea>

                        <SheetFooter className="border-t pt-4 pr-8">
                            <Button type="button" variant="outline" onClick={() => { setShowApiKey(null); onClose(); }} className="border-border hover:bg-accent">
                                {showApiKey ? 'Done' : 'Cancel'}
                            </Button>
                            {!showApiKey && (
                                <Button type="submit" disabled={loading || !formData.name || !formData.storeUrl} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    {isEdit ? 'Update Store' : 'Create Store'}
                                </Button>
                            )}
                        </SheetFooter>
                    </form>
                </div>
            </SheetContent>
        </Sheet>
    )
}