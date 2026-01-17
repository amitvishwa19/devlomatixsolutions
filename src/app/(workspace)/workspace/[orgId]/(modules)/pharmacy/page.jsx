'use client'
import React, { useState } from 'react'
import PharmacyManagement from './_pages/PharmacyManagement'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ContentTopbar } from '../../(misc)/_components/ContentTopbar'
import { QuickBillDialog } from './_components/QuickBillDialog'

export default function PharmacyPage() {
    const [quickBillDialogOpen, setQuickBillDialogOpen] = useState(false);


    return (

        <div className='absolute inset-0 flex flex-col gap-2 p-2'>

            <ContentTopbar
                title='Pharmacy Management'
                description='Bringing technology and healthcare together to simplify pharmacy workflows and elevate patient safety'
                icon='tablets'
                action={true}
                actionName='Quick Bill'
                actionIcon='receipt-indian-rupee'
                onActionClick={() => { setQuickBillDialogOpen(true) }}
            />

            <ScrollArea className='h-[85vh] flex flex-grow rounded-md'>
                <PharmacyManagement />
            </ScrollArea>

            <QuickBillDialog
                open={quickBillDialogOpen}
                onOpenChange={setQuickBillDialogOpen}
                onBillCreated={(billData) => {
                    toast({
                        title: 'Sale Completed',
                        description: `Bill ${billData.billNumber} - Total: ₹${billData.grandTotal.toFixed(2)}`,
                    });
                }}
            />
        </div >
    )
}
