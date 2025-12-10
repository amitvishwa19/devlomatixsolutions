'use client'
import { FileUpload } from '@/components/global/FileUpload'
import React, { useContext, useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { UnsplashImagePicker } from '@/components/global/UnsplashImagePicker'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader } from 'lucide-react'
import { useAction } from '@/hooks/use-action'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useModal } from '@/hooks/useModal'
import { createServer } from '../_action/server/create_server'
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, } from "@/components/ui/alert-dialog"
import { useSession } from 'next-auth/react'
import { OrgContext } from '@/providers/OrgProvider'

export function OrgCreateModal({ fileUploader = true, open }) {
    const [imgUrl, setImgUrl] = useState('')
    const [selectedImage, setSelectedImage] = useState(null)
    const [data, setData] = useState({ name: '', imageUrl: '' })
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)
    const router = useRouter()
    const { onOpen, onClose, isOpen, type } = useModal()
    const { data: session } = useSession()
    const { updateServer, updateServers } = useContext(OrgContext)


    const isModalOpen = isOpen && type === "createOrgModal";

    useEffect(() => {
        //console.log(data)
    }, [data])

    //const isModalOpen = isOpen && type === "createServerMOdal";
    //const isLoading = form.formState.isSubmitting;


    const { execute } = useAction(createServer, {
        onSuccess: (data) => {
            console.log('server created', data)
            setProcessing(false)
            setData({ name: '', imageUrl: '' })

            updateServer(data.server)
            updateServers(data.servers)
            //toast.success(`Organization space ${data?.server?.name} created successfully`)
            router.push(`/workspace/${data?.server?.id}`);
        },
        onError: (error) => {
            setProcessing(false)
            toast.error(error)
        }
    })


    const handleCreateOrgSpace = () => {
        if (data.name.length == 0) return toast.error('Give your Organization space a name')
        if (data.imageUrl.length == 0) return toast.error('Give your Organization space a avatar')
        //console.log('create default modal')
        handleOpenChange()
        //setProcessing(true)
        execute({ ...data, userId: session?.user?.userId })

    }

    const handleOpenChange = () => {
        //console.log('handleOpenChange')
        onClose()
    }

    return (


        <AlertDialog open={isModalOpen} onOpenChange={handleOpenChange}>
            <AlertDialogContent className='text-white'>
                <AlertDialogHeader>
                    <AlertDialogTitle>Create your first Workspace</AlertDialogTitle>
                    <AlertDialogDescription className='text-xs text-white/40'>
                        Collaborate, Manage Project and reach new productivity
                        peaks. ...where you can belong to a school club, a gaming group, or a worldwide art community.
                        Where just you and a handful of friends can spend time together.
                        A place that makes it easy to talk every day and hang out more often.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className='flex flex-col gap-2'>
                    <div>
                        <UnsplashImagePicker selectedImage={selectedImage} setSelectedImage={setSelectedImage} onClick={(img) => { setData({ ...data, imageUrl: img.full }) }} />
                    </div>

                    <div>
                        <Input
                            disabled={processing}
                            placeholder='Workspace name'
                            value={data.name}
                            className=' text-center'
                            onChange={e => setData({ ...data, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <Button
                            disabled={processing}
                            variant='outline'
                            size='sm'
                            className='w-full bg-blue-600 hover:bg-blue-800'
                            onClick={() => handleCreateOrgSpace()}
                        >
                            {
                                processing && <Loader className='w-4 h-4 mr-2 animate-spin' />
                            }
                            Create Your workspace
                        </Button>
                    </div>
                </div>
                {/* <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction>Continue</AlertDialogAction>
                </AlertDialogFooter> */}
            </AlertDialogContent>
        </AlertDialog>
    )
}
