import React from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import { Pencil } from 'lucide-react'
import PostEditor from './PostEditor'


export default function PostEdit({ isOpen, onClose, onSubmit, post }) {



    const handleOnCLose = () => {
        onClose()
    }


    return (
        <Dialog open={isOpen} onOpenChange={handleOnCLose}>
            <form>
                <DialogTrigger asChild>
                    <Pencil size={16} className=' cursor-pointer' />
                </DialogTrigger>
                <DialogContent className="min-h-[96%] min-w-[96%] [&>button:last-child]:hidden p-4">
                    <DialogTitle className='hidden' />
                    <PostEditor post={post} onSuccessPost={() => { }} edit={true} />
                </DialogContent>
            </form>
        </Dialog>
    )
}
