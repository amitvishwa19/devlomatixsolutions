import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Loader, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useModal } from '@/hooks/useModal'
import { useAction } from '@/hooks/use-action'
import { deletePost } from '../_actions/delete-post'
import { useSession } from 'next-auth/react'
import { useContent } from '../_provider/contentProvider'


export function DeletePost({ postId }) {
    const { data: session } = useSession()
    const [loading, setLoading] = useState(false)
    const { isOpen, onClose, type, data } = useModal();
    const isModalOpen = isOpen && type === "delete-post";
    const { categories, setPosts } = useContent()

    const { execute } = useAction(deletePost, {
        onSuccess: (data) => {
            setPosts(prev => prev.filter(post => post.id !== postId));
            toast.success('Post Deleted successfully', { id: 'delete-post' })
            handleOpenChange()
            setLoading(false)
        },
        onError: (error) => {
            setLoading(false)
            console.log(error)
        }
    })

    const handleOnSubmit = () => {
        toast.loading('Deleting post.....', { id: 'delete-post' })
        setLoading(true)
        execute({ postId: postId, userId: session.user.userId })
    }


    const handleOpenChange = async () => {
        onClose()
    }


    // open = { isModalOpen } onOpenChange = { handleOpenChange }
    return (
        <Dialog>
            <DialogTrigger className=''>
                Delete
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px] dark:text-[#d3e3fd] p-0 overflow-hidden dark:bg-darkSecondaryBackground">

                <DialogHeader className="flex flex-col gap-4 p-4">
                    <DialogTitle className="text-lg text-center font-semibold">
                        Delete Post for your Organization
                    </DialogTitle>
                    <DialogDescription className='self-center text-sm mt-8'>
                        Are you sure you want to delete the Post? This  action cannot be undone!
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className=" p-2">

                    <Button variant={'ghost'} size='sm' onClick={handleOpenChange}>Cancel</Button>

                    <Button variant="destructive" size={'sm'} disabled={loading} onClick={handleOnSubmit}>
                        {
                            loading && <Loader className='w-4 h-4 animate-spin mr-2' />
                        }

                        Delete
                    </Button>
                </DialogFooter>

            </DialogContent>
        </Dialog>
    )
}
