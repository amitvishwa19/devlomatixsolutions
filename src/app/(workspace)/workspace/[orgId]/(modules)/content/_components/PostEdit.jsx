import React from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Pencil } from 'lucide-react'
import PostEditor from './PostEditor'


export default function PostEdit({ post }) {


    return (
        <Dialog>
            <form>
                <DialogTrigger asChild>
                    <Pencil size={16} className=' cursor-pointer' />
                </DialogTrigger>
                <DialogContent className="min-h-[96%] min-w-[96%] [&>button:last-child]:hidden ">
                    <DialogTitle className='hidden' />
                    <PostEditor post={post} onSuccessPost={() => { }} edit={true} />
                </DialogContent>
            </form>
        </Dialog>
    )
}
