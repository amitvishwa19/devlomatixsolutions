'use client'
import React, { useContext, useRef, useState } from 'react'
import { Loader, } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from '@/components/ui/textarea'
import { UnsplashImagePicker } from '../UnsplashImagePicker'
import { toast } from 'sonner'
import { useAction } from '@/hooks/use-action'
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { useModal } from '@/hooks/useModal'
import { redirect, useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { setLoading, setServer } from '@/redux/slices/org'
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
import { OrgContext } from '@/providers/OrgProvider'
import { createBoard } from '../../_actions/_board/create_board'



export function BoardCreator({ organization, children, sideOffset, boards, setBoards }) {
    const [selectedImage, setSelectedImage] = useState(null)
    const [processing, setProcessing] = useState(false)
    const [formData, setFormData] = useState({ title: '', description: '', avatar: null })
    const [error, setError] = useState('asas')
    const closeRef = useRef(null)
    const router = useRouter();
    const dispatch = useDispatch()
    const { loading, updateLoading, updateServer } = useContext(OrgContext)



    const { onOpen, onClose, isOpen, type, data } = useModal()
    const isModalOpen = isOpen && type === "createBoard";
    const { serverId } = data


    const { execute: createNewBoard, fieldErrors, isLoading } = useAction(createBoard, {
        onSuccess: (data) => {
            updateServer(data.server)
            updateLoading(false)
            router.push(`/workspace/${data?.server?.id}/board/${data?.board?.id}`)
            toast.success(`New board ${data?.board.title} created`)
        },
        onError: (error) => {
            setProcessing(false)
            updateLoading(false)
            toast.error('Error while creating board ,Please try again later')
        }
    })

    const handleBoardCreate = async () => {
        console.log('create board', serverId)
        try {

            if (!formData?.title) return toast.error("Title is required")
            if (!formData?.avatar) return toast.error("Please select  an Avatar Image")


            handleOpenChange()
            updateLoading(true)
            createNewBoard({
                orgId: serverId,
                title: formData.title,
                description: formData.description,
                avatar: formData.avatar.full
            })

        } catch (error) {
            console.log(error)
        } finally {
            //  setProcessing(false)
        }
    }

    const handlePopoverClose = () => {
        setFormData({ title: '', description: '', avatar: '' })
        setSelectedImage(null)
    }

    const handleOpenChange = () => {
        setFormData({ title: '', description: '', avatar: null })
        onClose()
    }


    return (


        <Sheet open={isModalOpen} onOpenChange={handleOpenChange}>

            <SheetContent className=' min-w-[25%]'>
                <SheetHeader>
                    <SheetTitle>
                        Create Board for  Organization space
                    </SheetTitle>
                    <SheetDescription className='text-xs items-start'>
                        Create new taskboard for your organization to manage workflow
                    </SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 py-4 mt-6">
                    <UnsplashImagePicker selectedImage={selectedImage} setSelectedImage={setSelectedImage} onClick={(img) => { setFormData({ ...formData, avatar: img }) }} />

                    <div className="grid gap-2">
                        <div className="grid grid-cols-4 items-center gap-2 mb-2">

                            <Input
                                id="width"
                                placeholder='Board Title'
                                className="col-span-4 h-8 mb-0 dark:text-white"
                                value={formData.title}
                                onChange={(e) => { setFormData({ ...formData, title: e.target.value }) }}
                            />



                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">

                            <Textarea
                                id="width"
                                rows='10'
                                placeholder='Board Description'
                                className="col-span-4 h-40 dark:text-white "
                                value={formData.description}
                                onChange={(e) => { setFormData({ ...formData, description: e.target.value }) }}
                            />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">

                            <Button size='sm' variant='primary' className='col-span-4 mt-2 dark:bg-blue-600 bg-slate-600 text-gray-300' disabled={isLoading} onClick={() => { handleBoardCreate() }}>
                                {isLoading && <Loader className='h-4 w-4 mr-2 animate-spin' />}
                                Create Board
                            </Button>
                        </div>

                    </div>
                </div>

            </SheetContent>
        </Sheet>
    )
}
