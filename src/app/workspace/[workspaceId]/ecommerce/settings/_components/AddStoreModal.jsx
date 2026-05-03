'use client'
import { useState, useEffect, useRef } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { createStore } from '../_actions/createStore'
import { updateStore } from '../_actions/updateStore'
import { toast } from 'sonner'
import { ShoppingCart, Loader2, Upload, X, ImagePlus, Store } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

const PLATFORMS = [
    { value: 'shopify', label: 'Shopify', desc: 'Connect your Shopify store' },
    { value: 'woocommerce', label: 'WooCommerce', desc: 'Connect your WooCommerce store' },
    { value: 'manual', label: 'Manual Store', desc: 'Add products manually' },
]

const CURRENCIES = [
    { value: 'INR', label: 'Indian Rupee (₹)' },
    { value: 'USD', label: 'US Dollar ($)' },
    { value: 'EUR', label: 'Euro (€)' },
    { value: 'GBP', label: 'British Pound (£)' },
]

const INITIAL_DATA = {
    name: '',
    description: '',
    platform: 'manual',
    storeUrl: '',
    logo: '',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    accessToken: '',
    apiKey: '',
    apiSecret: '',
}

export function AddStoreModal({ open, onClose, store, onSuccess, workspaceId }) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState(INITIAL_DATA)
    const fileInputRef = useRef(null)

    const isEdit = !!store?.id

    useEffect(() => {
        if (store) {
            setFormData({
                name: store.name || '',
                description: store.description || '',
                platform: store.platform || 'manual',
                storeUrl: store.storeUrl || '',
                logo: store.logo || '',
                currency: store.currency || 'INR',
                timezone: store.timezone || 'Asia/Kolkata',
                accessToken: store.accessToken || '',
                apiKey: store.apiKey || '',
                apiSecret: store.apiSecret || '',
            })
        } else {
            setFormData(INITIAL_DATA)
        }
    }, [store, open])

    const handleChange = (field, value) => {
        setFormData(prev => ({ 
            ...prev, 
            [field]: value === undefined ? '' : value 
        }))
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
            <SheetContent className="w-full sm:max-w-xl flex flex-col p-2 bg-transparent border-0">
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
                        <ScrollArea className="h-[75vh] px-4">
                            <div className="space-y-4 py-4">
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
                                    <Label className="text-xs">Platform *</Label>
                                    <Select value={formData.platform} onValueChange={(v) => handleChange('platform', v)}>
                                        <SelectTrigger className="bg-background border-border text-foreground">
                                            <SelectValue placeholder="Select platform" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-popover border-border text-popover-foreground">
                                            {PLATFORMS.map(platform => (
                                                <SelectItem key={platform.value} value={platform.value} className="focus:bg-accent focus:text-accent-foreground">
                                                    <div>
                                                        <p className="font-medium">{platform.label}</p>
                                                        <p className="text-[10px] text-muted-foreground">{platform.desc}</p>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
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

                                {formData.platform !== 'manual' && (
                                    <>
                                        <div className="space-y-2">
                                            <Label className="text-xs">Access Token</Label>
                                            <Input
                                                value={formData.accessToken}
                                                onChange={(e) => handleChange('accessToken', e.target.value)}
                                                placeholder="shpat_xxxxx..."
                                                type="password"
                                                className="bg-background border-border text-foreground placeholder:text-muted-foreground font-mono"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs">API Key</Label>
                                                <Input
                                                    value={formData.apiKey}
                                                    onChange={(e) => handleChange('apiKey', e.target.value)}
                                                    placeholder="Consumer Key"
                                                    className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs">API Secret</Label>
                                                <Input
                                                    value={formData.apiSecret}
                                                    onChange={(e) => handleChange('apiSecret', e.target.value)}
                                                    placeholder="Consumer Secret"
                                                    type="password"
                                                    className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="space-y-2">
                                    <Label className="text-xs">Store Logo</Label>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                    {formData.logo ? (
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
                            </div>
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