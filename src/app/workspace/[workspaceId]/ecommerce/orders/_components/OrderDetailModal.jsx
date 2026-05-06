'use client';

import React, { useState } from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Package, Truck, MapPin, CreditCard, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { updateOrderStatus } from '../_actions/updateOrderStatus';
import { toast } from 'sonner';

export function OrderDetailModal({ open, onClose, order, workspaceId, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(order?.status || 'pending');
    const [fulfillmentStatus, setFulfillmentStatus] = useState(order?.fulfillmentStatus || 'unfulfilled');
    const [trackingNumber, setTrackingNumber] = useState(order?.trackingNumber || '');
    const [carrier, setCarrier] = useState(order?.carrier || '');

    // Reset state when order changes
    React.useEffect(() => {
        if (order) {
            setStatus(order.status || 'pending');
            setFulfillmentStatus(order.fulfillmentStatus || 'unfulfilled');
            setTrackingNumber(order.trackingNumber || '');
            setCarrier(order.carrier || '');
        }
    }, [order]);

    if (!order) return null;

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await updateOrderStatus({
                orderId: order.id,
                status,
                fulfillmentStatus,
                trackingNumber,
                carrier,
                workspaceId
            });

            if (res.success) {
                toast.success('Order updated successfully');
                if (onSuccess) onSuccess();
                onClose();
            } else {
                toast.error(res.message || 'Failed to update order');
            }
        } catch (err) {
            toast.error('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={onClose}>
            <SheetContent className="sm:max-w-xl w-full border-l border-white/10 bg-black/95 backdrop-blur-xl p-0 flex flex-col h-full">
                <SheetHeader className="p-6 border-b border-white/10">
                    <SheetTitle className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-primary" />
                        Order #{order.orderNumber || order.externalOrderId?.slice(-6)}
                    </SheetTitle>
                    <SheetDescription>
                        Placed on {new Date(order.createdAt).toLocaleString()}
                    </SheetDescription>
                </SheetHeader>

                <ScrollArea className="flex-1 p-6">
                    <div className="space-y-8">
                        {/* Status Controls */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs">Order Status</Label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger className="bg-muted/50">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="processing">Processing</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs">Fulfillment Status</Label>
                                <Select value={fulfillmentStatus} onValueChange={setFulfillmentStatus}>
                                    <SelectTrigger className="bg-muted/50">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="unfulfilled">Unfulfilled</SelectItem>
                                        <SelectItem value="fulfilled">Fulfilled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Shipping Details */}
                        <div className="space-y-4 p-4 rounded-lg bg-white/5 border border-white/5">
                            <h3 className="text-sm font-semibold flex items-center gap-2">
                                <Truck className="w-4 h-4 text-muted-foreground" /> Shipping Details
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Carrier</Label>
                                    <Input 
                                        value={carrier} 
                                        onChange={e => setCarrier(e.target.value)} 
                                        placeholder="e.g. FedEx, BlueDart" 
                                        className="h-8 text-xs bg-black/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Tracking Number</Label>
                                    <Input 
                                        value={trackingNumber} 
                                        onChange={e => setTrackingNumber(e.target.value)} 
                                        placeholder="Tracking ID" 
                                        className="h-8 text-xs bg-black/20 font-mono"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Customer Details */}
                        <div className="space-y-2 border-t border-white/5 pt-6">
                            <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Customer Details</Label>
                            <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                                <div>
                                    <p className="text-muted-foreground text-xs">Name</p>
                                    <p className="font-medium">{order.customerName || 'Guest'}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-xs">Email</p>
                                    <p className="font-medium">{order.customerEmail || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-xs">Phone</p>
                                    <p className="font-medium">{order.customerPhone || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-xs">Financial Status</p>
                                    <Badge variant="outline" className="text-[10px] uppercase mt-1">{order.financialStatus || 'pending'}</Badge>
                                </div>
                            </div>
                        </div>

                        {/* Shipping Address */}
                        {order.metadata?.shippingAddress && (
                            <div className="space-y-2 border-t border-white/5 pt-6">
                                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
                                    <MapPin className="w-3 h-3" /> Delivery Address
                                </Label>
                                <div className="p-3 bg-muted/20 rounded-md text-xs space-y-1">
                                    <p className="font-semibold">{order.metadata.shippingAddress.name}</p>
                                    <p>{order.metadata.shippingAddress.line1}</p>
                                    {order.metadata.shippingAddress.line2 && <p>{order.metadata.shippingAddress.line2}</p>}
                                    <p>{order.metadata.shippingAddress.city}, {order.metadata.shippingAddress.state} {order.metadata.shippingAddress.pincode}</p>
                                    <p>{order.metadata.shippingAddress.country}</p>
                                </div>
                            </div>
                        )}

                        {/* Order Items */}
                        <div className="space-y-2 border-t border-white/5 pt-6">
                            <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center justify-between">
                                <span>Order Summary</span>
                                <span className="font-black text-white">Total: {order.currency} {order.totalAmount?.toLocaleString()}</span>
                            </Label>
                            {/* Wait, the items array is inside the Cart model or Order metadata? In ECommerceOrder, the items are not explicitly stored in standard columns, they are likely inside `metadata.items` or similar. Let's render them if available. */}
                            {order.metadata?.items && Array.isArray(order.metadata.items) ? (
                                <div className="space-y-2 mt-3">
                                    {order.metadata.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center p-2 rounded-md bg-white/5 text-xs">
                                            <div className="flex items-center gap-3">
                                                {item.imageUrl && <img src={item.imageUrl} alt={item.title} className="w-8 h-8 rounded object-cover" />}
                                                <div>
                                                    <p className="font-medium text-white">{item.title}</p>
                                                    {item.variantName && <p className="text-[10px] text-muted-foreground">{item.variantName}</p>}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p>{item.quantity} x {item.price}</p>
                                                <p className="font-bold text-white">{item.quantity * item.price}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-muted-foreground mt-2 italic">Detailed items not available in metadata.</p>
                            )}
                        </div>

                    </div>
                </ScrollArea>

                <SheetFooter className="p-6 border-t border-white/10 bg-black/40">
                    <Button variant="outline" onClick={onClose} className="border-white/10 hover:bg-white/10">Close</Button>
                    <Button onClick={handleSave} disabled={loading} className="gap-2">
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        Save Changes
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
