import React, { useRef, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger, } from "@/components/ui/sheet"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import { useModal } from '@/hooks/useModal'
import { UnsplashImagePicker } from '@/components/global/UnsplashImagePicker'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue, } from "@/components/ui/select"
import { ORGTYPE } from '@/utils/types'
import Image from 'next/image'
import { Loader, Trash2 } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { addServer } from '../_actions/add-server'
import { useAction } from '@/hooks/use-action'
import { useSession } from 'next-auth/react'
import { useOrg } from '@/providers/OrgProvider'

export function NewOrgModal() {
    const { onOpen, onClose, isOpen, type } = useModal()
    const isModalOpen = isOpen && type === "neworgmodal";
    const [selectedImage, setSelectedImage] = useState(null)
    const [data, setData] = useState({ name: '', imageUrl: '' })
    const [preview, setPreview] = useState('')
    const imgRef = useRef()
    const [serverData, setServerData] = useState({ title: '', description: '', type: null, file: null })
    const { data: session } = useSession()
    const [loading, setLoading] = useState(false)
    const { updateServer, updateServers } = useOrg()

    const handleOpenChange = () => {
        onClose()
        setServerData({ title: '', description: '', type: null, file: null })
        setPreview(null)
    }

    const handleFileChange = (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        const url = URL.createObjectURL(file)
        setPreview(url)

        const formData = new FormData()
        formData.append("file", file)

        setServerData({ ...serverData, file: formData })
    }

    const handleImageClick = () => {
        imgRef.current.click()   // open file picker
    }

    const handleSaveData = () => {
        if (serverData.title === '') return toast.error('Please provide a title for organization')
        if (serverData.type === null) return toast.error('Please select an organization type')

        toast.loading('Please wait ,we are creating new organization', { id: 'newserver' })
        setLoading(true)
        execute({
            userId: session?.user?.userId,
            title: serverData.title,
            description: serverData.description,
            type: serverData.type,
            file: serverData.file,
            fileName: serverData?.file?.get("file")?.name?.split('.', 1).toString(),
            size: serverData?.file?.get("file")?.size
        })

    }

    const { execute } = useAction(addServer, {
        onSuccess: (data) => {
            setLoading(false)
            updateServer(data.server)
            updateServers(data.servers)
            handleOpenChange()
            toast.success('New organization created successfilly', { id: 'newserver' })
        },
        onError: (error) => {
            toast.error('Oops!, Something went wrong, try again later', { id: 'newserver' })
        }
    })

    return (
        // <Sheet open={isModalOpen} onOpenChange={handleOpenChange}>
        //     <SheetContent className='dark:bg-darkPrimaryBackground min-w-[540px]'>
        //         <SheetHeader>
        //             <SheetTitle>Create new Organizational Workspace</SheetTitle>
        //             <SheetDescription className='text-xs text-muted-foreground'>
        //                 Manage all your workspace.Give your organization a personality with a name and an image. You can always change it later.
        //             </SheetDescription>
        //         </SheetHeader>
        //         <div className="grid gap-4 p-4 mt-2">


        //             <div>
        //                 <Label>Title</Label>
        //                 <Input value={serverData.title} disabled={loading} onChange={(e) => { setServerData({ ...serverData, title: e.target.value }) }} />
        //             </div>

        //             <div>
        //                 <Label>Description</Label>
        //                 <Textarea value={serverData.description} rows='4' disabled={loading} onChange={(e) => { setServerData({ ...serverData, description: e.target.value }) }} />
        //             </div>

        //             <div>
        //                 <Label>Organization Type</Label>
        //                 <Select onValueChange={(e) => { setServerData({ ...serverData, type: e }) }} disabled={loading}>
        //                     <SelectTrigger className="">
        //                         <SelectValue placeholder="Select a organization type" className=' text-muted-foreground' />
        //                     </SelectTrigger>
        //                     <SelectContent>
        //                         <SelectGroup>

        //                             {ORGTYPE.map((item, index) => {
        //                                 return (
        //                                     <SelectItem key={index} value={item.value} className=' capitalize'>{item.type}</SelectItem>
        //                                 )
        //                             })}

        //                         </SelectGroup>
        //                     </SelectContent>
        //                 </Select>
        //             </div>

        //             <div className='flex flex-col gap-2'>
        //                 <Label>Cover image</Label>
        //                 <Input
        //                     ref={imgRef}
        //                     disabled={loading}
        //                     type='file'
        //                     accept=".png, .jpg, .jpeg, .webp"
        //                     onChange={handleFileChange}
        //                     className='hidden'
        //                 />



        //                 {preview ? (
        //                     <div className='flex flex-col gap-2'>
        //                         <div className='relative h-24 w-24 border cursor-pointer rounded-lg overflow-hidden' onClick={handleImageClick}>
        //                             <Image src={preview} fill alt='' className="object-cover" />
        //                         </div>
        //                         <div className='p-1  w-24  text-sm cursor-pointer rounded-md dark:bg-darkFocusColor text-center' onClick={() => {
        //                             setPreview(null)
        //                             setServerData({ ...serverData, file: null })
        //                         }}>
        //                             Remove
        //                         </div>
        //                     </div>
        //                 ) : (
        //                     <div className='p-1  w-24  text-sm cursor-pointer rounded-md dark:bg-darkFocusColor text-center' onClick={handleImageClick}>
        //                         Add Image
        //                     </div>
        //                 )}


        //             </div>

        //         </div>
        //         <SheetFooter className='flex flex-col gap-4' disabled={loading}>
        //             <SheetClose asChild>
        //                 <Button variant="outline">Close</Button>
        //             </SheetClose>
        //             <Button type="submit" onClick={() => { handleSaveData() }} disabled={loading}>
        //                 {loading && <Loader className=' animate-spin' />}
        //                 Create Organization
        //             </Button>

        //         </SheetFooter>
        //     </SheetContent>
        // </Sheet>

        <Dialog open={isModalOpen} onOpenChange={handleOpenChange}>

            <DialogContent className='dark:bg-darkPrimaryBackground'>
                <DialogHeader>
                    <DialogTitle className='self-center'>Create new Organizational Workspace</DialogTitle>
                    <DialogDescription className='text-xs'>
                        Manage all your workspace.Give your organization a personality with a name and an image. You can always change it later.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 p-4 mt-2">


                    <div>
                        <Label>Title</Label>
                        <Input value={serverData.title} disabled={loading} onChange={(e) => { setServerData({ ...serverData, title: e.target.value }) }} />
                    </div>

                    <div>
                        <Label>Description</Label>
                        <Textarea value={serverData.description} rows='4' disabled={loading} onChange={(e) => { setServerData({ ...serverData, description: e.target.value }) }} />
                    </div>

                    <div>
                        <Label>Organization Type</Label>
                        <Select onValueChange={(e) => { setServerData({ ...serverData, type: e }) }} disabled={loading}>
                            <SelectTrigger className="">
                                <SelectValue placeholder="Select a organization type" className=' text-muted-foreground' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>

                                    {ORGTYPE.map((item, index) => {
                                        return (
                                            <SelectItem key={index} value={item.value} className=' capitalize'>{item.type}</SelectItem>
                                        )
                                    })}

                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className='flex flex-col gap-2'>
                        <Label>Cover image</Label>
                        <Input
                            ref={imgRef}
                            disabled={loading}
                            type='file'
                            accept=".png, .jpg, .jpeg, .webp"
                            onChange={handleFileChange}
                            className='hidden'
                        />



                        {preview ? (
                            <div className='flex flex-col gap-2'>
                                <div className='relative h-24 w-24 border cursor-pointer rounded-lg overflow-hidden' onClick={handleImageClick}>
                                    <Image src={preview} fill alt='' className="object-cover" />
                                </div>
                                <div className='p-1  w-24  text-sm cursor-pointer rounded-md dark:bg-darkFocusColor text-center' onClick={() => {
                                    setPreview(null)
                                    setServerData({ ...serverData, file: null })
                                }}>
                                    Remove
                                </div>
                            </div>
                        ) : (
                            <div className='p-1  w-24  text-sm cursor-pointer rounded-md dark:bg-darkFocusColor text-center' onClick={handleImageClick}>
                                Add Image
                            </div>
                        )}


                    </div>
                </div>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="ghost" size={'sm'}>Close</Button>
                    </DialogClose>
                    <Button variant="save" size={'sm'} onClick={() => { handleSaveData() }} disabled={loading}>
                        {loading && <Loader className=' animate-spin' />}
                        Create Organization
                    </Button>
                </DialogFooter>

            </DialogContent>

        </Dialog>
    )
}
