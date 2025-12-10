import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger, } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useModal } from '@/hooks/useModal'
import { Mic, Play, ScanEye, Square, SquarePause } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useParams } from 'next/navigation'
import { useOrg } from '@/providers/OrgProvider'
import { useDispatch } from 'react-redux'
import { hospitalDefaultSettings } from '@/utils/types'
import moment from 'moment'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ROLE } from '@prisma/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DatePicker } from '@/components/global/DatePicker'
import { DynamicIcon } from 'lucide-react/dynamic';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useAction } from '@/hooks/use-action'
import { newAppointment } from '../_actions/new-appointment'
import { Textarea } from '@/components/ui/textarea'
import { appointmentStatus } from '@/utils/types'
import PatientProfile from './PatientProfile'
import { ScrollArea } from '@/components/ui/scroll-area'


export default function EditAppointment({ data }) {
    const { data: session } = useSession()
    const params = useParams()
    const { orgId } = params
    const { server, servers, users } = useOrg()
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [listning, setListning] = useState(false)
    const [pauseListning, setPauseListning] = useState(false)
    const { isOpen, onClose, type: dtype } = useModal();
    const isModalOpen = isOpen && dtype === "addappointment";

    const [doctor, setDoctor] = useState({})
    const [slot, setSlot] = useState({ slot: 'morning', start: '09:00 AM', end: '01:00 PM', avaliable: false })
    const [slotTimes, setSlotTimes] = useState([])
    const [time, setTime] = useState(null)
    const [type, setType] = useState({ type: 'clinic', status: false, charge: 250, icon: 'hospital' })
    const options = doctor?.setting?.consultationOptions ? doctor?.setting?.consultationOptions : hospitalDefaultSettings?.consultationOptions

    const [appointmentData, setAppointmentData] = useState({
        patientId: null,
        doctorId: null,
        serverId: orgId,
        date: moment().format(),
        slot: hospitalDefaultSettings?.timing[0],
        time: null,
        type: { type: 'clinic', status: false, charge: 250, icon: 'hospital' },
        note: ''
    })

    useEffect(() => {
        setAppointmentData({
            patientId: data?.patientDetails?.id,
            doctorId: data?.doctorDetails?.id,
            serverId: orgId,
            date: data?.date,
            slot: data?.slot,
            time: data.time,
            type: data.type,
            note: data.note,
            status: data.status
        })
    }, [data])


    function parseTime(t) {
        const [time, modifier] = t.split(" ");
        let [hours, minutes] = time.split(":");

        hours = parseInt(hours, 10);
        minutes = parseInt(minutes, 10);

        // Convert to 24-hour format
        if (modifier === "PM" && hours !== 12) hours += 12;
        if (modifier === "AM" && hours === 12) hours = 0;

        // Create date object for today with given time
        const now = new Date();
        const compareTime = new Date();
        compareTime.setHours(hours, minutes, 0, 0);

        return compareTime < now && (moment().format('DD') === moment(data?.date).format('DD'));
    }

    useEffect(() => {

        const times = [];
        const startTime = appointmentData?.slot?.start || '09:00 AM';
        const endTime = appointmentData?.slot?.end || '12:00 PM';
        const interval = 15 || 15;


        // Helper to convert 12-hour time to minutes
        const toMinutes = (timeStr) => {
            const [time, modifier] = timeStr?.split(' ');
            let [hours, minutes] = time?.split(':').map(Number);
            if (modifier === 'PM' && hours !== 12) hours += 12;
            if (modifier === 'AM' && hours === 12) hours = 0;
            return hours * 60 + minutes;
        };

        // Helper to convert minutes back to 12-hour time
        const toTimeString = (totalMinutes) => {
            let hours = Math.floor(totalMinutes / 60);
            let minutes = totalMinutes % 60;
            const modifier = hours >= 12 ? 'PM' : 'AM';

            let displayHour = hours % 12;
            if (displayHour === 0) displayHour = 12; // midnight & noon fix


            if (hours === 0) hours = 12;
            if (hours > 12) hours -= 12;
            return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${modifier}`;
        };

        let start = toMinutes(startTime);
        const end = toMinutes(endTime);

        while (start < end) {
            times.push(toTimeString(start));
            start += interval;
        }
        setSlotTimes(times)


    }, [appointmentData])


    useEffect(() => {
        if (session) {
            setDoctor(server)
            setAppointmentData({ ...appointmentData, doctorId: server?.userId })
        }
    }, [server, isModalOpen])


    // ------------------------------------Voice note-------------------------------------------
    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    useEffect(() => {
        if (transcript) {
            setAppointmentData({ ...appointmentData, note: transcript })
        }
    }, [transcript])

    const startListning = () => {
        setListning(!listning)
        SpeechRecognition.startListening({ continuous: true, language: 'en-IN' })
    }

    if (!browserSupportsSpeechRecognition) {
        return <span>Browser doesn't support speech recognition.</span>;
    }
    // ------------------------------------Voice note-------------------------------------------


    const handleOpenChange = () => {
        onClose()
        if (isModalOpen) {
            setAppointmentData({
                patientId: null,
                doctorId: null,
                serverId: orgId,
                date: moment().format(),
                slot: hospitalDefaultSettings?.timing[0],
                time: null,
                type: { type: 'clinic', status: false, charge: 250, icon: 'hospital' },
                note: ''
            })

        }




    }

    const handleSaveData = async () => {
        //console.log('@appointment redus data', selectedDoctor, selectedPatient, appointmentSelectedSlot, appointmentIntervel)
        console.log('@appointment redus data', appointmentData)

        if (!appointmentData.doctorId) return toast.error('Please select a Doctor to book appointment')
        if (!appointmentData.patientId) return toast.error('Please select a Patient to book appointment')
        if (!appointmentData.date) return toast.error('Please select a Date to book appointment')
        if (!appointmentData.slot) return toast.error('Please select a Slot to book appointment')
        if (!appointmentData.time) return toast.error('Please select a Time to book appointment')
        if (!appointmentData.type) return toast.error('Please select a appointment type to book appointment')

        // //console.log('@new appointment data', appointmentData)

        setLoading(true)
        toast.loading('Please wait while we are creating new appointment', { id: 'new-appointment' })
        execute({
            patientId: appointmentData.patientId,
            doctorId: appointmentData.doctorId,
            date: appointmentData.date,
            slot: appointmentData.slot,
            time: appointmentData.time,
            type: appointmentData.type,
            note: appointmentData.note,
            role: session.user.role,
            serverId: orgId
        })



    }

    const { execute } = useAction(newAppointment, {
        onSuccess: (data) => {
            console.log('@appointmentdata', data.appointment, data.appointments)
            handleOpenChange()
            setLoading(false)
            dispatch(setAppointments(JSON.stringify(data.appointments)))
            toast.success('New appointment created successfully', { id: 'new-appointment' })
        },
        onError: (error) => {
            console.log(error)
            toast.error('Oops!, Something went wrong,please try again later', { id: 'new-appointment' })
            handleOpenChange()
            setLoading(false)
        }
    })

    //console.log('data', data)

    return (
        <Dialog >

            <DialogTrigger asChild>
                <Button variant='outline' size='sm' className=''>
                    <ScanEye />
                </Button>
            </DialogTrigger>

            <DialogContent className="w-[90%] md:max-w-[40%] h-[90vh] flex flex-col p-2 rounded-md dark:bg-darkPrimaryBackground [&>button:last-child]:hidden">
                <DialogHeader className={'hidden'}>
                    <DialogTitle>Settings</DialogTitle>
                    <DialogDescription>
                        Manage your account settings and preferences.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="appointment" className="flex-1 flex flex-col min-h-0">

                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="appointment">Update Appointment</TabsTrigger>
                        <TabsTrigger value="notes">Notes</TabsTrigger>
                        <TabsTrigger value="profile">Profile</TabsTrigger>
                    </TabsList>

                    <TabsContent value="appointment" className="flex-1 min-h-0 mt-4">
                        <ScrollArea className="h-full pr-4">
                            <div className="space-y-4">


                                {/* Doctor */}
                                <div className='flex flex-col gap-2 w-full'>
                                    <Label >Select Doctor</Label>
                                    <Select defaultValue={data?.doctorDetails?.id} onValueChange={(id) => {
                                        setDoctor(server?.members.find(member => member.userId === id).user?.servers[0])
                                        setAppointmentData({ ...appointmentData, doctorId: server?.members.find(member => member.userId === id).user?.servers[0].userId })

                                    }}>
                                        <SelectTrigger className="">
                                            <SelectValue placeholder="Select doctor" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                {server?.members.filter(member => member.user.role === ROLE.DOCTOR)?.map((item) => {

                                                    return (
                                                        <SelectItem key={item?.user?.id} value={item?.user?.id} >
                                                            <div className='flex flex-row items-center gap-2'>
                                                                <Avatar className='h-6 w-6 rounded-md'>
                                                                    <AvatarImage src={item?.user?.avatar} alt="@shadcn" />
                                                                    <AvatarFallback className='rounded-md dark:bg-sky-600'>{item?.user?.displayName?.substring(0, 1)}</AvatarFallback>
                                                                </Avatar>
                                                                {item.user.displayName}

                                                            </div>
                                                        </SelectItem>
                                                    )
                                                })}

                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Patients */}
                                <div className='flex flex-col gap-2 w-full'>
                                    <Label className='text-sm'>Select Patient</Label>
                                    <Select
                                        defaultValue={data?.patientDetails?.id}
                                        onValueChange={(id) => {
                                            setAppointmentData({ ...appointmentData, patientId: id })
                                        }}
                                        className='m-0'
                                    >
                                        <SelectTrigger className="">
                                            <>
                                                <SelectValue placeholder='Please select Patient' />

                                            </>
                                        </SelectTrigger>
                                        <SelectContent className='dark:bg-[#0E141B]'>
                                            <SelectGroup>
                                                {users?.filter(user => user.role === ROLE.PATIENT)?.map((item, index) => {

                                                    return (
                                                        <SelectItem key={item.id} value={item?.id}>
                                                            <div className='flex gap-2 items-center'>
                                                                <Avatar className='h-6 w-6 rounded-sm'>
                                                                    <AvatarFallback className='text-xs bg-blue-600 rounded-sm'>{item.displayName?.substring(0, 1)}</AvatarFallback>
                                                                </Avatar>
                                                                {item.displayName}
                                                            </div>
                                                        </SelectItem>
                                                    )
                                                })}

                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Date Picker */}
                                <div className='flex flex-col gap-2'>
                                    <Label>Appointment Date</Label>
                                    <div className='flex flex-row gap-2'>
                                        <Input
                                            type="text"
                                            disabled
                                            value={moment(appointmentData.date).format('Do MMM YY')}
                                            onChange={() => { }}
                                        />

                                        <div className='flex  rounded-lg'>
                                            <DatePicker
                                                onChange={(e) => {

                                                    setAppointmentData({ ...appointmentData, date: e })
                                                }} />
                                        </div>
                                    </div>
                                </div>

                                {/* Slot Selector */}
                                <div className='flex flex-col gap-2 flex-wrap'>
                                    <Label className='text-sm'>Appointment Slots</Label>
                                    <div className=' flex-col md:flex-row items-center justify-around gap-2  grid grid-cols-2 p-1'>
                                        {(doctor?.setting?.timing ? doctor?.setting?.timing : hospitalDefaultSettings?.timing)?.map((item, index) => {

                                            return (
                                                <div key={index} className='w-full'>

                                                    <Button key={index}
                                                        variant={'ghost'}
                                                        disabled={!item.avaliable}
                                                        className={`flex flex-col p-4 h-12 w-full 
                                                                bg-red-200 items-center justify-center rounded-md 
                                                                dark:bg-darkFocusColor/60 
                                                                hover:dark:bg-darkFocusColor
                                                                  transition-all
                                                                  hover:ring-[0.8px]
                                                                  ${slot?.slot === item.slot && item.avaliable && 'dark:bg-darkFocusColor ring-[0.8px]'} border flex flex-row items-center `
                                                        }
                                                        onClick={() => {
                                                            //handleSlotChange(item)
                                                            setSlot(item)
                                                            setAppointmentData({ ...appointmentData, slot: item })
                                                        }}
                                                    >

                                                        <span className={`capitalize ${!item.avaliable && ' line-through'}`}>{item.slot}</span>
                                                        <span className={` capitalize text-xs  ${!item.avaliable && ' line-through'}`}>{item.start} - {item.end}</span>
                                                    </Button>

                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Sleect Time */}
                                <div className='flex flex-col gap-2 flex-wrap'>
                                    <Label className='text-sm'>Appointment Time</Label>
                                    <div
                                        className='flex flex-row flex-wrap items-center  gap-2 '

                                    >
                                        {slotTimes?.map((item, index) => {
                                            let isBooked = false
                                            doctor?.appointments?.map((appointment) => {
                                                if (appointment?.doctorId === doctor?.userId && appointment?.time === item && moment(appointment?.date).format('Do MMM') === moment(appointmentData?.date).format('Do MMM')) {
                                                    isBooked = true
                                                }
                                            })

                                            return (
                                                <div key={index}>
                                                    <Button
                                                        variant='ghost'
                                                        disabled={isBooked ? true : false || parseTime(item)}
                                                        className={`
                                                                                            border w-20 
                                                                                            ${time === item && 'dark:bg-[#161F2B] ring-[0.8px]'}
                                                                                            hover:ring-[0.8px]
                                                                                        `}
                                                        onClick={() => {
                                                            setAppointmentData({ ...appointmentData, time: item })
                                                            setTime(item)
                                                            console.log(item)
                                                        }}
                                                    >
                                                        <span className={`text-xs ${(isBooked || parseTime(item)) && 'line-through'}`}>
                                                            {item}

                                                        </span>

                                                    </Button>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* consultationOptions */}
                                <div className='flex flex-col gap-2'>
                                    <Label className='text-sm'>Appointment Type</Label>
                                    <div className='grid grid-flow-col grid-col-4 gap-2 m-1'>
                                        {
                                            options?.map((item, index) => {

                                                return (
                                                    <Button
                                                        key={index}
                                                        disabled={!item.status}
                                                        variant={'ghost'}
                                                        className={
                                                            `border h-12 dark:hover:bg-darkFocusColor dark:bg-darkFocusColor/60 hover:ring-[0.8px]
                                                            ${type.type === item.type && item.status && 'dark:bg-darkFocusColor ring-[0.8px]'}
                                                            w-full`
                                                        }
                                                        onClick={() => {
                                                            setType(item)
                                                            setAppointmentData({ ...appointmentData, type: item })
                                                        }}
                                                    >
                                                        <div className='flex flex-row p-4 items-center justify-center gap-2'>
                                                            <DynamicIcon name={item.icon} size={52} className='h-10 line-through' />
                                                            <span className={`capitalize ${!item.status && 'line-through'}`}>{item.type}</span>
                                                        </div>
                                                    </Button>

                                                )
                                            })
                                        }
                                    </div>
                                </div>

                                {/* Appointment Status */}
                                <div className='flex flex-col gap-2'>
                                    <Label>Appointment Status</Label>
                                    <Select defaultValue={appointmentData.status}>
                                        <SelectTrigger className="">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                {appointmentStatus?.map((status, index) => {
                                                    return (
                                                        <SelectItem key={index} value={status.value}>
                                                            {status.title}
                                                        </SelectItem>
                                                    )
                                                })}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>


                            </div>
                        </ScrollArea>
                    </TabsContent>

                    <TabsContent value="notes" className="flex-1 min-h-0 mt-4">
                        <ScrollArea className="h-full pr-4">
                            <div className="space-y-4">
                                <div className='flex flex-col gap-2'>
                                    <div className='flex flex-row gap-2 items-center'>
                                        <Label className='text-sm font-light'>Patient's Note</Label>
                                        <div className='flex flex-row gap-2 '>
                                            <Mic
                                                className={`cursor-pointer ${listning && 'text-red-600 font-bold animate-ping'}`}
                                                size={18}
                                                onClick={() => {
                                                    startListning()
                                                }}
                                            />
                                            {
                                                listning && (
                                                    <div className='flex flex-row gap-2'>
                                                        {pauseListning && <Play size={18} className='cursor-pointer text-green-500' onClick={() => {
                                                            setPauseListning(false)
                                                            SpeechRecognition.startListening()
                                                        }} />}
                                                        {!pauseListning && <SquarePause size={18} className='cursor-pointer' onClick={() => {
                                                            setPauseListning(true)
                                                            SpeechRecognition.stopListening()
                                                        }} />}
                                                        <Square size={18} className='cursor-pointer text-red-600' onClick={() => {
                                                            setListning(false)
                                                            SpeechRecognition.abortListening()
                                                            //resetTranscript()
                                                        }} />
                                                    </div>
                                                )
                                            }

                                        </div>
                                    </div>
                                    <Textarea className='text-xs' rows='20' disabled={loading} value={appointmentData.note} onChange={(e) => { setAppointmentData({ ...appointmentData, note: e.target.value }) }} />

                                </div>

                                <div className='flex flex-col gap-2'>
                                    <div className='flex flex-row gap-2 items-center'>
                                        <Label className='text-sm font-light'>Doctor's's Note</Label>
                                        <div className='flex flex-row gap-2 '>
                                            <Mic
                                                className={`cursor-pointer ${listning && 'text-red-600 font-bold animate-ping'}`}
                                                size={18}
                                                onClick={() => {
                                                    startListning()
                                                }}
                                            />
                                            {
                                                listning && (
                                                    <div className='flex flex-row gap-2'>
                                                        {pauseListning && <Play size={18} className='cursor-pointer text-green-500' onClick={() => {
                                                            setPauseListning(false)
                                                            SpeechRecognition.startListening()
                                                        }} />}
                                                        {!pauseListning && <SquarePause size={18} className='cursor-pointer' onClick={() => {
                                                            setPauseListning(true)
                                                            SpeechRecognition.stopListening()
                                                        }} />}
                                                        <Square size={18} className='cursor-pointer text-red-600' onClick={() => {
                                                            setListning(false)
                                                            SpeechRecognition.abortListening()
                                                            //resetTranscript()
                                                        }} />
                                                    </div>
                                                )
                                            }

                                        </div>
                                    </div>
                                    <Textarea className='text-xs' rows='20' disabled={loading} value={appointmentData.note} onChange={(e) => { setAppointmentData({ ...appointmentData, note: e.target.value }) }} />

                                </div>
                            </div>
                        </ScrollArea>
                    </TabsContent>

                    <TabsContent value="profile" className="flex-1 min-h-0 mt-4">
                        <ScrollArea className="h-full pr-4">
                            <PatientProfile />
                        </ScrollArea>
                    </TabsContent>

                    <TabsContent value="security" className="flex-1 min-h-0 mt-4">
                        <ScrollArea className="h-full pr-4">
                            <div className="space-y-4">
                                <h4 className="text-sm font-medium">Security Settings</h4>
                                <p className="text-sm text-muted-foreground">
                                    Manage your security preferences and protect your account.
                                </p>

                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="rounded-lg border p-4 space-y-2">
                                        <h5 className="font-medium">Security Option {i + 1}</h5>
                                        <p className="text-sm text-muted-foreground">
                                            This is an important security setting that helps protect your account.
                                            We recommend keeping this enabled for maximum protection.
                                            Review these settings regularly to ensure your account stays secure.
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </TabsContent>
                </Tabs>

                <div className='flex flex-row gap-2 items-center justify-end'>
                    <Button variant={'ghost'} size={'sm'}>Cancel</Button>
                    <Button variant={'save'} size='sm'>Save</Button>
                </div>
            </DialogContent>

        </Dialog>
    )
}
