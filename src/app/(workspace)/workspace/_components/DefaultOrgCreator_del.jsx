'use client'
import { Loader, Plus } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { useCardModal } from '@/hooks/useCardModal'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FileUpload } from '@/components/global/FileUpload'
import { useAction } from '@/hooks/use-action'
import { toast } from 'sonner'
import { useModal } from '@/hooks/useModal'
import { InitialOrgCreator } from './OrgCreateModal'
import { UnsplashImagePicker } from '@/components/global/UnsplashImagePicker'
import { createServer } from '../_action/server/create_server'

const formSchema = z.object({
    name: z.string().min(1, {
        message: "Server name is required."
    }),
    imageUrl: z.string().min(1, {
        message: "Server image is required."
    })
});

export default function DefaultOrgCreator() {
    const [imgUrl, setImgUrl] = useState('')
    const [selectedImage, setSelectedImage] = useState(null)
    const [data, setData] = useState({ name: '', imageUrl: '' })
    const { onOpen, onClose, isOpen, type } = useModal()
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);
    const [open, setOpen] = useState(false)
    const [processing, setProcessing] = useState(false)



    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            imageUrl: "",
        }
    });

    const isModalOpen = isOpen && type === "createFIrstServer";
    const isLoading = form.formState.isSubmitting;

    const { execute } = useAction(createServer, {
        onSuccess: (data) => {
            setProcessing(false)
            form.reset();
            router.refresh();
            onClose()
            toast.success(`Server ${data.name} created successfully`)
            //router.replace(`/org/${data.id}`)
        },
        onError: (error) => {
            setProcessing(false)
            toast.error(error)
        }
    })

    const onSubmit = async (values) => {
        try {
            setProcessing(true)
            execute({ ...values, userId, orgId })
        } catch (error) {
            console.log(error);
        }
    }

    const handleClose = (e) => {
        e.preventDefault()
        setOpen(!open)
        form.reset();
    }

    const handleOpenChange = () => {
        //router.refresh();
        //form.reset();
        onClose()
    }

    const handleCreateOrgSpace = () => {
        if (data.name.length == 0) return toast.error('Give your Organization space a name')
        if (data.imageUrl.length == 0) return toast.error('Give your Organization space a avatar')

        setProcessing(true)
        execute({ ...data })
    }


    return (
        <Dialog open={isModalOpen} onOpenChange={handleOpenChange} >
            <DialogTrigger asChild>

            </DialogTrigger>
            <DialogContent className="md:w-[450px]">
                <DialogHeader className="p-2 px-6">
                    <DialogTitle className="text-lg text-center font-bold mb-2 dark:text-white">
                        Create your first Organizational Space
                    </DialogTitle>
                    <DialogDescription className="text-center  text-zinc-600 dark:text-white/60 text-xs">
                        Give your organization a personality with a name and an image. You can always change it later.
                    </DialogDescription>
                </DialogHeader>


                <div className='flex flex-col justify-center items-center gap-2'>
                    <div className='margin-auto'>
                        <UnsplashImagePicker selectedImage={selectedImage} setSelectedImage={setSelectedImage} onClick={(img) => { setData({ ...data, imageUrl: img.full }) }} />
                    </div>

                    <div className='w-full dark:text-white'>
                        <Input
                            disabled={processing}
                            placeholder='Your organization space name'
                            value={data.name}
                            onChange={e => setData({ ...data, name: e.target.value })}
                        />
                    </div>
                    <div className='w-full dark:text-white'>
                        <Button
                            disabled={processing}
                            variant='outline'
                            size='sm'
                            className='w-full'
                            onClick={() => handleCreateOrgSpace()}
                        >
                            {
                                processing && <Loader className='w-4 h-4 mr-2 animate-spin' />
                            }
                            Create Your Organization Space
                        </Button>
                    </div>
                </div>

            </DialogContent>
        </Dialog>
    )
}
