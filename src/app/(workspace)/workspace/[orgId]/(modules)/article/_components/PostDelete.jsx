import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import { Loader, Pencil, Trash2 } from 'lucide-react'
import { useAction } from '@/hooks/use-action'
import { deletePost } from '../_actions/delete-post'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { useArticle } from '../_provider/articleProvider'

export default function PostDelete({ post }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false)
    const { data: session } = useSession()
    const { posts, setPosts } = useArticle()

    const handleDelete = async () => {
        setLoading(true)
        toast.loading('Deleting post......', { id: 'delete-post' })
        await execute({ userId: session?.user?.userId, postId: post?.id })
    }

    const { execute } = useAction(deletePost, {
        onSuccess: (data) => {
            console.log('Post deleted', data)
            toast.success('Post deleted successfully', { id: 'delete-post' })
            setPosts(posts?.filter(post => post?.id !== data?.post?.id))
            setOpen(false)
            setLoading(false)
        },
        onError: (error) => {
            setLoading(false)
            toast.error('Oops! soething went wrong, try again later', { id: 'delete-post' })
        }
    })


    return (
        <Dialog open={open} onOpenChange={() => { setOpen(!open) }}>
            <form>
                <DialogTrigger asChild>
                    <Trash2 size={16} className=' cursor-pointer' />
                </DialogTrigger>
                <DialogContent className="">
                    <DialogHeader>
                        <DialogTitle>
                            <div className='flex flex-row gap-2'>
                                <span> Delete post</span>
                                <span className='text-xs text-muted-foreground'>({post.title})</span>
                            </div>
                        </DialogTitle>
                        <DialogDescription>This action will permanently delete the post. Continue?</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4">

                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="ghost" size={'sm'} disabled={loading}>Cancel</Button>
                        </DialogClose>
                        <Button variant={'save'} size={'sm'} onClick={() => { handleDelete() }} disabled={loading}>
                            {loading ? <Loader className=' animate-spin' /> : <Trash2 />}
                            Delete Post
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    )
}
