import React, { useState } from 'react'
import { AlignJustify, X } from 'lucide-react'
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Sidebar } from './Sidebar'

export default function MobileSidebar() {
    const [open, setOpen] = useState(false)
    const onToggleClick = () => {
        setOpen(!open)
    }
    return (
        <div className=''>
            {/* <div className='md:hidden '>
                {
                    open
                        ? <X className='w-6-h-6 cursor-pointer' onClick={() => { onToggleClick() }} />
                        : <AlignJustify className='w-6-h-6 cursor-pointer' onClick={() => { onToggleClick() }} />
                }


            </div> */}

            <Button variant='ghost' size='sm' className='block md:hidden' onClick={() => { onToggleClick() }} >
                <AlignJustify className='w-6-h-6 cursor-pointer' />
            </Button>

            <Sheet open={open} onOpenChange={() => { onToggleClick() }} >

                <SheetContent side='left' className='p-2 pt-20 text-[#d3e3fd] '>
                    <Sidebar storageKey='mobile-sidebar-state' />
                </SheetContent>
            </Sheet>



        </div>
    )
}
