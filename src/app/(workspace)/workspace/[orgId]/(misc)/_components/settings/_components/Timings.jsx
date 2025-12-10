'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useOrg } from '@/providers/OrgProvider'
import { Check, CheckCheck, CircleMinus, CirclePlus, Copy, Loader, RefreshCcw, Save } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { refreshInviteCode } from '../_action/refresh-invite-code'
import { useAction } from '@/hooks/use-action'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { useOrigin } from '@/hooks/useOrigin'
import { DeleteOrdModal } from './DeleteOrdModal'
import { useModal } from '@/hooks/useModal'
import { updateOrg } from '../_action/update-org'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger, } from "@/components/ui/tooltip"
import { hospitalDefaultSettings, ORGTYPE, slotData } from '@/utils/types'
import { Checkbox } from '@/components/ui/checkbox'
import { updateHospitalTimings } from '../_action/update-hospital-timings'
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from '@/components/ui/scroll-area'
import { DynamicIcon } from 'lucide-react/dynamic';
import Image from 'next/image'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { usePathname } from 'next/navigation'


export default function Timings() {
    const { data: session } = useSession()
    const { onOpen } = useModal()
    const { server, refreshServer } = useOrg()
    const pathname = usePathname();

    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(false)

    const [refreshInvite, setRefreshInvite] = useState(false)
    const origin = useOrigin();


    const [open, setOpen] = useState(true)
    const [slotTime, setSlotTime] = useState(server?.setting?.slotTime || hospitalDefaultSettings.slotTime)
    const [timings, setTimings] = useState(server?.setting?.timing || hospitalDefaultSettings.timing)
    const [meetingType, setMeetingType] = useState(server?.setting?.consultationOptions || hospitalDefaultSettings.consultationOptions)

    const [preview, setPreview] = useState('')
    const imgRef = useRef()


    console.log('server', server)

    const [data, setData] = useState({
        name: server?.name,
        description: server?.description || '',
        inviteCode: server?.inviteCode,
        type: '',
        file: null
    })

    const inviteUrl = `${origin}/workspace/invite/${server?.inviteCode}`;


    const handleRefreshInviteCode = () => {
        console.log('refresh invite code')
        setRefreshInvite(true)
        execute({ serverId: server.id, userId: session?.user?.userId })
    }

    const { execute } = useAction(refreshInviteCode, {
        onSuccess: (data) => {
            console.log(`${origin}/workspace/invite/${data?.inviteCode}`)
            setData({ ...data, inviteCode: data?.inviteCode })
            setRefreshInvite(false)
            toast.success('Organization invitation link updated')
            //onOpen("inviteModal", { server: data });
        },
        onError: (error) => {
            console.log(error)
        }
    })

    const onCopy = () => {
        navigator.clipboard.writeText(inviteUrl);
        setCopied(true);
        toast.success('Invite link copied to clipboard', {
            className: "bg-red-500 text-white", // Apply custom background and text color
        })
        setTimeout(() => {
            setCopied(false);
        }, 1000);
    };

    const handleSaveData = async () => {
        //console.log('@update server setting', { serverId: server.id, userId: session?.user?.userId, slotTime, timings, meetingType, open })


        try {
            setLoading(true)
            toast.loading('Updating organization data, please wait...', { id: 'orgupdate' })
            await orgUpdate({
                serverId: server.id,
                userId: session?.user?.userId,
                orgData: data,
                type: data.type,
                file: data.file,
                fileName: data?.file?.get("file")?.name?.split('.', 1).toString(),
                size: data?.file?.get("file")?.size
            })


            await timingsUpdate({ serverId: server.id, userId: session?.user?.userId, slotTime, timings, meetingType, open })


            await refreshServer()
        } catch (error) {
            setLoading(false)
        } finally {
            toast.success('Organization info updated successfully', { id: 'orgupdate' })
            setLoading(false)
        }
    }

    const { execute: orgUpdate } = useAction(updateOrg)

    const { execute: timingsUpdate } = useAction(updateHospitalTimings)

    const handleTimings = (index, time, type) => {

        let newArr = [...timings]
        if (type === 'start') {
            newArr[index].start = time
            setTimings(newArr)
        } else if (type === 'end') {
            newArr[index].end = time
            setTimings(newArr)
        } else if (type === 'avaliable') {
            newArr[index].avaliable = time
            setTimings(newArr)
        }
    }

    const handleConsultationType = (index, value) => {
        let newArr = [...meetingType]
        newArr[index].status = value
        setMeetingType(newArr)
    }

    const handleConsultationCharge = (index, value) => {
        let newArr = [...meetingType]
        newArr[index].charge = value
        setMeetingType(newArr)
    }

    const handleFileChange = (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        const url = URL.createObjectURL(file)
        setPreview(url)

        const formData = new FormData()
        formData.append("file", file)

        setData({ ...data, file: formData })
    }

    const handleImageClick = () => {
        imgRef.current.click()   // open file picker
    }

    return (
        <div className='flex flex-col gap-2 absolute inset-0 overflow-hidden' >

            <div className='p-2'>
                <div className='flex flex-row justify-between items-center'>
                    <div className='py-4 px-2 flex flex-col'>
                        <span>Timings and Consultation</span>
                        <span className='text-xs text-muted-foreground'>Manage timings and consultation options</span>
                    </div>
                    {/* <Button variant={'outline'} size={'sm'} className='mr-2'>New Organization</Button> */}
                </div>
                <div className='px-2'>
                    <Separator className='self-center' />
                </div>
            </div>


            {/* <div className='p-2'>
                <div className='flex flex-row items-center justify-between'>
                    <span className='text-lg font-semibold mb-2 capitalize'>Organization ( {server?.name} )</span>
                    <Button variant={'outline'} size='sm' onClick={() => { onOpen("neworgmodal") }}>New Org</Button>
                </div>
                <Separator className='mt-2' />
            </div> */}

            <ScrollArea className='flex flex-col gap-6 h-full p-4' >

                <div className='flex flex-col gap-4'>

                    <div className='flex flex-col gap-6'>

                        <div className='flex flex-row gap-10 items-center '>
                            <Label>Consultation Open</Label>
                            <div className='flex flex-row items-center gap-2'>
                                <Switch checked={open} onCheckedChange={() => { setOpen(!open) }} />
                            </div>
                        </div>

                        <div className='flex flex-row gap-10 items-center'>
                            <Label>Consultation Slot time</Label>
                            <div className='flex flex-row items-center gap-2'>
                                <Button variant={'outline'} disabled={slotTime === 0} size={'sm'} onClick={() => { setSlotTime(slotTime - 5) }}>
                                    <CircleMinus />
                                </Button>

                                <Input disabled={true} value={slotTime} className='w-40 items-center text-center' />

                                <Button variant={'outline'} disabled={slotTime === 60} size={'sm'} onClick={() => { setSlotTime(slotTime + 5) }}>
                                    <CirclePlus />
                                </Button>
                            </div>
                        </div>

                        <div className='flex flex-col gap-2'>
                            <Label>Hospital Timings</Label>
                            <div className='flex flex-col gap-2'>
                                {timings?.map((slot, index) => {
                                    return (
                                        <div key={index} className='flex flex-row items-center gap-4'>
                                            <span className=' capitalize text-sm w-40'>{slot.slot}</span>
                                            <div className='flex flex-row items-center gap-4'>
                                                <Input type='text' value={slot.start} className='w-40 text-center' onChange={(e) => { handleTimings(index, e.target.value, 'start') }} />
                                                <span>-</span>
                                                <Input type='text' value={slot.end} className='w-40 text-center' onChange={(e) => { handleTimings(index, e.target.value, 'end') }} />
                                            </div>
                                            <div>
                                                <Checkbox checked={slot.avaliable} onCheckedChange={(e) => { handleTimings(index, e, 'avaliable') }} />
                                            </div>
                                        </div>
                                    )
                                })}

                            </div>
                        </div>

                        <div className='flex flex-col gap-2'>
                            <Label>Consultations Type</Label>
                            <div className='flex flex-col gap-4'>
                                {meetingType?.map((meeting, index) => {

                                    return (
                                        <div key={index} className='p-0 flex flex-row items-center gap-6'>
                                            <div className='flex flex-row items-center dark:bg-darkFocusColor rounded-md border gap-4 w-28 justify-center'>
                                                <DynamicIcon name={meeting.icon} size={20} className='h-10' />
                                                <span className='text-sm'> {meeting.type}</span>
                                            </div>
                                            <div className='flex flex-row items-center gap-2'>
                                                <span className='text-xl'>₹</span>
                                                <Input type='number' value={meeting.charge} className='w-28 text-center' onChange={(e) => { handleConsultationCharge(index, e.target.value) }} />
                                            </div>
                                            <Checkbox checked={meeting.status} onCheckedChange={(e) => { handleConsultationType(index, e) }} />
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                    </div>


                    <div className='flex flex-row gap-2 mt-4 justify-end items-end fixed bottom-4 right-4'>

                        <Button variant={'save'} size={'sm'} onClick={() => { handleSaveData() }} disabled={loading}>
                            {loading ? <Loader className=' animate-spin' /> : <Save className='' />}
                            Save
                        </Button>
                    </div>

                    <div className='h-[100px]' />
                </div>

            </ScrollArea>
            <DeleteOrdModal />
        </div>
    )
}
