'use client'
import { Loader } from 'lucide-react'
import React, { useContext, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { FileUpload } from '@/components/global/FileUpload'
import { useAction } from '@/hooks/use-action'
import { toast } from 'sonner'
import { useModal } from '@/hooks/useModal'
import { UnsplashImagePicker } from '@/components/global/UnsplashImagePicker'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, } from "@/components/ui/sheet"
import { OrgContext } from '@/providers/OrgProvider'
import { createServer } from '../_action/server/create_server'
import { useSession } from 'next-auth/react'

const formSchema = z.object({
    name: z.string().min(1, {
        message: "Server name is required."
    }),
    imageUrl: z.string().min(1, {
        message: "Server image is required."
    })
});


export default function CreateOrgModal({ userId, orgId, children }) {
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);
    const [open, setOpen] = useState(false)
    const [processing, setProcessing] = useState(false)
    const [imgUrl, setImgUrl] = useState('')
    const [selectedImage, setSelectedImage] = useState(null)
    const [data, setData] = useState({ name: '', imageUrl: '' })
    const { onOpen, onClose, isOpen, type } = useModal()
    const { updateLoading, updateServer, updateServers } = useContext(OrgContext)
    const { data: session } = useSession()


    const isModalOpen = isOpen && type === "createServer";



    const { execute } = useAction(createServer, {
        onSuccess: (data) => {
            console.log('data', data)
            updateLoading(false)
            updateServer(data.server)
            updateServers(data.servers)
            router.push(`/workspace/${data?.server?.id}`)
            toast.success(`Organizational workspace ${data?.server?.name} created successfully`)
        },
        onError: (error) => {
            setProcessing(false)
            updateLoading(false)
            toast.error(error)
        }
    })



    const handleClose = (e) => {
        e.preventDefault()
        setOpen(!open)
        form.reset();
    }

    const handleOpenChange = () => {
        onClose()
        setProcessing(false)
        setData({ name: '', imageUrl: '' })
    }

    const handleCreateOrgSpace = () => {


        if (data.name.length == 0) return toast.error('Give your Organization space a name')
        if (data.imageUrl.length == 0) return toast.error('Give your Organization space a avatar')

        updateLoading(true)
        handleOpenChange()
        execute({ ...data, userId: session.user.userId })
    }

    return (
        <Sheet open={isModalOpen} onOpenChange={handleOpenChange}>
            <SheetTrigger asChild>
                {children}
            </SheetTrigger>
            <SheetContent className='w-[100%] md:min-w-[25%]'>
                <SheetHeader>
                    <SheetTitle>Create new Organizational Workspace</SheetTitle>
                    <SheetDescription className='text-xs text-muted-foreground'>
                        Manage all your workspace.Give your organization a personality with a name and an image. You can always change it later.
                    </SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 py-4 mt-6">

                    <div>
                        <UnsplashImagePicker selectedImage={selectedImage} setSelectedImage={setSelectedImage} onClick={(img) => { setData({ ...data, imageUrl: img.full }) }} />
                    </div>

                    <div className='flex justify-center w-full '>
                        <span className='dark:text-white'>Or</span>
                    </div>

                    <div className='flex items-center justify-center '>
                        <FileUpload
                            endpoint="serverImage"
                            value={data.imageUrl}
                            onChange={(e) => { setData({ ...data, imageUrl: e }) }}
                            className='bg-red-800'
                        />
                    </div>

                    <div>
                        <Input
                            disabled={processing}
                            placeholder='Your organization space name'
                            value={data.name}
                            onChange={e => setData({ ...data, name: e.target.value })}
                            className='text-white'
                        />
                    </div>

                    <div>
                        <Button
                            // disabled={processing}
                            variant='outline'
                            size=''
                            className='w-full'
                            onClick={() => handleCreateOrgSpace()}
                        >
                            Create Your Organization Space
                        </Button>
                    </div>


                </div>

            </SheetContent>
        </Sheet>
    )
}





