import React from 'react'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye } from 'lucide-react'

export default function PostView() {
    return (
        <Dialog>
            <form>
                <DialogTrigger asChild>
                    <Eye size={16} className=' cursor-pointer' />
                </DialogTrigger>
                <DialogContent className="min-h-[90%] min-w-[90%] [&>button:last-child]:hidden ">

                    <DialogTitle className='hidden'>Edit profile</DialogTitle>

                    <div className="grid gap-4">

                    </div>
                </DialogContent>
            </form>
        </Dialog>
    )
}
