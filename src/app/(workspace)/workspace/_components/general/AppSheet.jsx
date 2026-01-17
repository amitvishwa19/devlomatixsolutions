import React from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger, } from "@/components/ui/sheet"
import { CustomBadge } from '../../../(misc)/_components/CustomBadge'
import moment from 'moment'
import { Card } from '@/components/ui/card'
import { Calendar } from 'lucide-react'



export default function InventoryView({ inventory, isOpen, onClose, children }) {

    if (!inventory) return null

    function getExpiryPriority(expiryDate, { highDays = 7, mediumDays = 30 } = {}) {
        const today = new Date();
        const expiry = new Date(expiryDate);

        // Normalize times (avoid time-of-day issues)
        today.setHours(0, 0, 0, 0);
        expiry.setHours(0, 0, 0, 0);

        const diffInDays = Math.ceil(
            (expiry - today) / (1000 * 60 * 60 * 24)
        );

        // Already expired
        if (diffInDays < 0) return "expired";

        if (diffInDays <= highDays) return "high";
        if (diffInDays <= mediumDays) return "medium";

        return "low";
    }

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'INR',
        }).format(amount);
    };


    return (
        <Sheet open={isOpen} onOpenChange={onClose}>

            <SheetContent className='bg-transparent min-w-[540px] p-2 border-l-0'>
                <div className='h-full bg-card rounded-lg border'>

                    <SheetHeader className="mb-6">
                        <div className="flex items-center justify-between">
                            <SheetTitle className="text-md font-bold flex flex-col">
                                <span>{inventory?.name}</span>
                                <span className='text-xs text-muted-foreground'>{inventory?.sku}</span>
                            </SheetTitle>
                            <div className='flex flex-col'>
                                <span className='flex flex-col text-xs text-muted-foreground'>Expiry Date</span>
                                <CustomBadge status={getExpiryPriority(inventory.expiryDate)}>
                                    {moment(inventory.expiryDate).format("MMM Do YY")}
                                </CustomBadge>
                            </div>
                        </div>
                    </SheetHeader>


                    <div className="space-y-6 p-2">

                        <Card className="p-4 border dark:bg-darkFocusColor">

                            <div className="space-y-2">
                                <p className="text-md font-medium text-foreground">{inventory?.name}</p>
                                <p className="text-sm text-muted-foreground">ID: {inventory?.sku}</p>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    {inventory?.description}
                                </div>


                                <p className="text-sm text-muted-foreground">SUpplier: {inventory?.supplier}</p>
                                <p className="text-sm text-muted-foreground">Location: {inventory?.location}</p>
                                <p className="text-sm text-muted-foreground">Minimum Stock: {inventory?.minStock}</p>
                                <p className="text-sm text-muted-foreground">Unit Price: {inventory?.unitPrise}</p>
                                <p className="text-sm text-muted-foreground">Unit: {inventory?.unit}</p>
                            </div>
                        </Card>

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-4">
                            <Card className="p-4 border-border/50">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    Issue Date
                                </div>
                                <p className="mt-1 font-medium text-foreground">{formatDate(inventory.createdAt)}</p>
                            </Card>
                            <Card className="p-4 border-border/50">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    Expiry Date
                                </div>
                                <p className="mt-1 font-medium text-foreground">{formatDate(inventory.expiryDate)}</p>
                            </Card>
                        </div>
                    </div>



                </div>
            </SheetContent>
        </Sheet>
    )
}
