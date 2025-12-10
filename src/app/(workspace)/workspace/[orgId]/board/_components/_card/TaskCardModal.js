'use client'


import { useCardModal } from '@/hooks/useCardModal'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEffect } from 'react'



export const TaskCardModal = () => {
    const id = useCardModal((state) => state.id)
    const isOpen = useCardModal((state) => state.isOpen)
    const data = useCardModal((state) => state.data)
    const onClose = useCardModal((state) => state.onClose)

    useEffect(() => {
        console.log('Card modal opened', data)
    }, [isOpen])



    return (
        <Dialog open={isOpen} onOpenChange={onClose}>

            <DialogContent className="bg-slate-900 text-slate-200">
                <DialogHeader>
                    <DialogTitle className='text-sm'>Edit profile {id}</DialogTitle>
                    <DialogDescription>











                    </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                    <Button type="submit" onClick={onClose}>Save changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
