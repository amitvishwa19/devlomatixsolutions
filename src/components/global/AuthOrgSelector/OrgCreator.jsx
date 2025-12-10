'use client'
import React, { Suspense, useEffect, useRef, useState } from 'react'
import { User2, Plus, Loader, Circle, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger, PopoverClose } from "@/components/ui/popover"
import { toast } from 'sonner'
import { FormInput } from '../FormInput'
import { FormTextarea } from '../FormTextarea'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { defaultImages } from '@/constants/images'
import { unsplash } from '@/utils/unsplash'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'
import { useAction } from '@/hooks/use-action'
import { createOrganization } from '@/app/(auth)/_action/org_create'
import { FileUpload } from '../FileUpload'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input'

const formSchema = z.object({
    name: z.string().min(1, {
        message: "Organization name is required."
    }),
    imageUrl: z.string().min(1, {
        message: "Organization image is required."
    })
});

export function OrgCreator({ children, sideOffset, className, UserId, organizations, setOrganizations }) {
    const [images, setImages] = useState([])
    const [image, setImage] = useState(null)
    const [selectedImage, setSelectedImage] = useState(null)
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)
    const [formData, setFormData] = useState({ title: '', description: '', avatar: null })
    const [error, setError] = useState('asas')
    const closeRef = useRef(null)
    const formRef = useRef(null)
    const inputRef = useRef(null)

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            imageUrl: "img",
        }
    });

    const isLoading = form.formState.isSubmitting;

    const { execute, fieldErrors } = useAction(createOrganization, {
        onSuccess: (data) => {
            console.log(data)
            closeRef.current?.click()
            toast.success(`Organization created successfully`)
            setOrganizations([...organizations, data])
            setProcessing(false)
        },
        onError: (error) => {
            setProcessing(false)
            toast.error(error)
        }
    })

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const result = await unsplash.photos.getRandom({
                    collectionIds: ['317099'],
                    count: 9
                })

                if (result && result.response) {
                    const newImages = result.response
                    setImages(newImages)
                    setLoading(false)
                } else {
                    console.error('Failed to get images from unsplash')
                }
            } catch (error) {
                console.log(error)
                setImages(defaultImages)
            }
        }
        fetchImages()
    }, [])

    const handleBoardCreate = async () => {
        try {
            if (!formData?.title) return toast.error("Title is required")
            if (!formData?.avatar) return toast.error("Please select  an Avatar Image")

            setProcessing(true)
            // await axios.post('/api/v1/taskman/board', { ...formData, organization: organization?._id })
            //     .then((res) => {
            //         console.log(res.data.data)
            //         setBoards([...boards, res.data.data])
            //         closeRef.current?.click();
            //     })


        } catch (error) {
            console.log(error)
        } finally {
            setProcessing(false)
        }
    }

    const onSubmit = async (values) => {
        console.log(values)
        form.reset()
        // const title = formData.get('title')
        // const description = formData.get('description')



        // if (!title) return toast.error('Organization Title cannot be empty!');
        // if (!image) return toast.error('Please select image for the Organization Logo!');

        // setProcessing(true)
        //execute({ title, description, avatar: image?.full, userId: UserId })

    }

    const handlePopoverClose = () => {
        setFormData({ title: '', description: '', avatar: '' })
        setSelectedImage(null)
    }

    const handleSelectedImage = (image) => {
        //console.log('img', image)
        if (loading) return;
        setSelectedImage(image.id)
        setImage({
            id: image.id,
            user: image.user.name,
            thumb: image.urls.thumb,
            full: image.urls.full,
            html: image.links.html
        })
    }


    return (
        <Popover onOpenChange={() => { handlePopoverClose() }}>
            <PopoverTrigger asChild>
                {children}
            </PopoverTrigger>

            <PopoverContent
                className={cn(`w-82 pt-3 bg-slate-900 ${className}`)}
                align={'start'}
                side={'bottom'}
                sideOffset={sideOffset}>
                <div className="grid gap-4">
                    <div className="flex items-center justify-between space-y-2">
                        <h4 className="font-medium leading-none justify-center text-sm">New Organization</h4>
                        <PopoverClose ref={closeRef} asChild>
                            <Button variant='ghost'>
                                <X className='h-4 w-4' />
                            </Button>
                        </PopoverClose>
                    </div>

                    {/* <Suspense fallback={<UnsplashImagePicker.Skeleton />}>
                        <UnsplashImagePicker selectedImage={selectedImage} setSelectedImage={setSelectedImage} onClick={(img) => { setFormData({ ...formData, avatar: img }) }} />
                    </Suspense> */}

                    {/* <Suspense fallback={<OrgCreator.Skeleton />}>
                        <div className='relative'>
                            <div className='grid grid-cols-3 gap-2 mb-2'>
                                {
                                    images.map((image) => (
                                        <div
                                            key={image.id}
                                            className={cn('cursor-pointer relative aspect-video group hover:opacity-75 transition bh-muted h-22', loading && "opacity-50 hover:opacity-50 cursor-auto")}
                                            onClick={() => {
                                                handleSelectedImage(image)
                                            }}>

                                            <input
                                                type="text"
                                                id={image.id}
                                                name={image.id}
                                                className="hidden"
                                                checked={selectedImage === image.id}
                                                disabled
                                                // value={`${image.id}|${image.urls.thumb}|${image.urls.full}|${image.links.html}|${image.user.name}`}
                                                value={image}
                                                onChange={() => { console.log('image selected') }}
                                            />

                                            <Image src={image.urls.thumb} fill alt='usplimg' className='object-cover rounded-sm' />
                                            {selectedImage === image.id && (
                                                <div className="absolute inset-y-0 h-full w-full bg-black/30 flex items-center justify-center">
                                                    <Check className="h-4 w-4 text-white" />
                                                </div>
                                            )}
                                            <Link href={image.links.html} target='_blank' className='flex item-center opacity-0 group-hover:opacity-100 absolute bottom-0 w-full text-[10px] truncate text-white hover:underline p-1 bg-black/50' >
                                                {image.user.name}
                                            </Link>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    </Suspense> */}

                    <Form {...form}>
                        <form ref={formRef} action={form.handleSubmit(onSubmit)} className='flex flex-col gap-2'>
                            <FormField
                                control={form.control}
                                name="imageUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Suspense fallback={<OrgCreator.Skeleton />}>
                                                <div className='relative'>
                                                    <div className='grid grid-cols-3 gap-2 mb-2'>
                                                        {
                                                            images.map((image) => (
                                                                <div
                                                                    key={image.id}
                                                                    className={cn('cursor-pointer relative aspect-video group hover:opacity-75 transition bh-muted h-22', loading && "opacity-50 hover:opacity-50 cursor-auto")}
                                                                    onClick={() => {
                                                                        handleSelectedImage(image)
                                                                    }}>

                                                                    <Input
                                                                        type="text"
                                                                        id={image.id}
                                                                        name='imageUrl'
                                                                        className="hidden"
                                                                        checked={selectedImage === image.id}
                                                                        disabled
                                                                        // value={`${image.id}|${image.urls.thumb}|${image.urls.full}|${image.links.html}|${image.user.name}`}
                                                                        value={field.value}
                                                                        onChange={() => { console.log('image selected') }}
                                                                    />

                                                                    <Image src={image.urls.thumb} fill alt='usplimg' className='object-cover rounded-sm' />
                                                                    {selectedImage === image.id && (
                                                                        <div className="absolute inset-y-0 h-full w-full bg-black/30 flex items-center justify-center">
                                                                            <Check className="h-4 w-4 text-white" />
                                                                        </div>
                                                                    )}
                                                                    <Link href={image.links.html} target='_blank' className='flex item-center opacity-0 group-hover:opacity-100 absolute bottom-0 w-full text-[10px] truncate text-white hover:underline p-1 bg-black/50' >
                                                                        {image.user.name}
                                                                    </Link>
                                                                </div>
                                                            ))
                                                        }
                                                    </div>
                                                </div>
                                            </Suspense>
                                        </FormControl>
                                        <FormMessage className='text-xs text-rose-400' />
                                    </FormItem>
                                )}
                            />

                            <div className="flex items-center justify-center text-center">
                                {/* <FormField
                                    control={form.control}
                                    name="imageUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <FileUpload
                                                    endpoint="serverImage"
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    className='bg-red-500'

                                                />
                                            </FormControl>
                                            <FormMessage className='text-xs text-rose-400' />
                                        </FormItem>
                                    )}
                                /> */}
                            </div>


                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>

                                        <FormControl>
                                            <Input
                                                disabled={processing}
                                                className="text-sm  p-2 rounded-sm h-8 focus-visible:ring-offset-0 focus-visible:ring-0 shadow-none w-full mb-2"
                                                placeholder="Enter organization name"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className='text-xs text-rose-400' />
                                    </FormItem>
                                )}
                            />


                            <Button variant='outline' size='sm' disabled={processing}>
                                {
                                    processing && <Loader className='h-4 w-4 animate-spin mr-2' />
                                }
                                Create Organization
                            </Button>

                        </form>
                    </Form>
                </div>
            </PopoverContent>
        </Popover>
    )
}

OrgCreator.Skeleton = function unsplashImageSkeleton() {
    return (
        <div className="grid grid-cols-3 gap-2">
            <Skeleton className="aspect-video h-full w-full p-2" />
            <Skeleton className="aspect-video h-full w-full p-2" />
            <Skeleton className="aspect-video h-full w-full p-2" />
            <Skeleton className="aspect-video h-full w-full p-2" />
            <Skeleton className="aspect-video h-full w-full p-2" />
            <Skeleton className="aspect-video h-full w-full p-2" />
            <Skeleton className="aspect-video h-full w-full p-2" />
            <Skeleton className="aspect-video h-full w-full p-2" />
            <Skeleton className="aspect-video h-full w-full p-2" />
        </div>
    )
}
