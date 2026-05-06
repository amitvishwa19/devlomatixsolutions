'use client'

import { useState, useEffect } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createCoupon, updateCoupon } from '../_actions/couponActions'
import { getStores } from '../../../settings/_actions/getStores'
import { toast } from 'sonner'
import { Ticket, Loader2 } from 'lucide-react'
import { useAction } from '@/hooks/use-action'

const INITIAL_DATA = {
    code: '',
    type: 'PERCENTAGE',
    value: '',
    minOrderAmount: '',
    maxDiscount: '',
    usageLimit: '',
    expiryDate: '',
    isActive: true,
    storeId: '',
}

export function AddCouponModal({ open, onClose, coupon, onSuccess, workspaceId }) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState(INITIAL_DATA)
    const isEdit = !!coupon?.id

    const { execute: fetchStores, data: storesData } = useAction(getStores)

    useEffect(() => {
        if (workspaceId && open) {
            fetchStores({ workspaceId })
        }
    }, [workspaceId, open, fetchStores])

    const stores = storesData?.stores || []

    useEffect(() => {
        if (coupon) {
            setFormData({
                code: coupon.code || '',
                type: coupon.type || 'PERCENTAGE',
                value: coupon.value?.toString() || '',
                minOrderAmount: coupon.minOrderAmount?.toString() || '',
                maxDiscount: coupon.maxDiscount?.toString() || '',
                usageLimit: coupon.usageLimit?.toString() || '',
                expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split('T')[0] : '',
                isActive: coupon.isActive ?? true,
                storeId: coupon.storeId || '',
            })
        } else {
            setFormData(INITIAL_DATA)
        }
    }, [coupon, open])

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        const payload = {
            ...formData,
            value: parseFloat(formData.value),
            minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : null,
            maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
            usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
            expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : null,
        }

        try {
            const res = isEdit 
                ? await updateCoupon(coupon.id, payload)
                : await createCoupon(payload)

            if (res.success) {
                toast.success(isEdit ? "Coupon updated" : "Coupon created")
                onSuccess?.()
                onClose()
            } else {
                toast.error(res.error)
            }
        } catch (error) {
            toast.error("An error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Sheet open={open} onOpenChange={onClose}>
            <SheetContent className="sm:max-w-md border-l border-white/5 bg-card/95 backdrop-blur-xl">
                <SheetHeader className="pb-6 border-b border-white/5">
                    <SheetTitle className="flex items-center gap-2 text-white">
                        <Ticket className="w-5 h-5 text-primary" />
                        {isEdit ? 'Edit Coupon' : 'Create New Coupon'}
                    </SheetTitle>
                    <SheetDescription>
                        Configure your discount code and usage limits.
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-6 h-[calc(100vh-200px)] overflow-y-auto pr-2">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Store</Label>
                            <Select 
                                value={formData.storeId} 
                                onValueChange={(val) => handleChange('storeId', val)}
                                required
                            >
                                <SelectTrigger className="bg-background border-border">
                                    <SelectValue placeholder="Select a store" />
                                </SelectTrigger>
                                <SelectContent>
                                    {stores.map(store => (
                                        <SelectItem key={store.id} value={store.id}>{store.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Coupon Code</Label>
                            <Input
                                value={formData.code}
                                onChange={(e) => handleChange('code', e.target.value)}
                                placeholder="e.g., SAVE20"
                                className="bg-background border-border uppercase"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Type</Label>
                                <Select value={formData.type} onValueChange={(val) => handleChange('type', val)}>
                                    <SelectTrigger className="bg-background border-border">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                                        <SelectItem value="FIXED">Fixed Amount</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Value {formData.type === 'PERCENTAGE' ? '(%)' : '(₹)'}</Label>
                                <Input
                                    type="number"
                                    value={formData.value}
                                    onChange={(e) => handleChange('value', e.target.value)}
                                    placeholder="20"
                                    className="bg-background border-border"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Min Order Amount</Label>
                                <Input
                                    type="number"
                                    value={formData.minOrderAmount}
                                    onChange={(e) => handleChange('minOrderAmount', e.target.value)}
                                    placeholder="0"
                                    className="bg-background border-border"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Max Discount</Label>
                                <Input
                                    type="number"
                                    value={formData.maxDiscount}
                                    onChange={(e) => handleChange('maxDiscount', e.target.value)}
                                    placeholder="No limit"
                                    className="bg-background border-border"
                                    disabled={formData.type === 'FIXED'}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Usage Limit</Label>
                                <Input
                                    type="number"
                                    value={formData.usageLimit}
                                    onChange={(e) => handleChange('usageLimit', e.target.value)}
                                    placeholder="Infinity"
                                    className="bg-background border-border"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Expiry Date</Label>
                                <Input
                                    type="date"
                                    value={formData.expiryDate}
                                    onChange={(e) => handleChange('expiryDate', e.target.value)}
                                    className="bg-background border-border"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <input 
                                type="checkbox" 
                                id="isActive"
                                checked={formData.isActive}
                                onChange={(e) => handleChange('isActive', e.target.checked)}
                                className="w-4 h-4 rounded border-border"
                            />
                            <Label htmlFor="isActive" className="cursor-pointer">Active and enabled</Label>
                        </div>
                    </div>

                    <SheetFooter className="absolute bottom-0 left-0 right-0 p-6 bg-card border-t border-white/5">
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            {isEdit ? 'Update Coupon' : 'Create Coupon'}
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    )
}
