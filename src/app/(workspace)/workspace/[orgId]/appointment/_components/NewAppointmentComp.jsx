
import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog"
import { APPOINTMENTTYPE, hospitalDefaultSettings } from '@/utils/types'
import { ROLE } from '@prisma/client'
import { useSession } from 'next-auth/react'
import { useParams } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Loader, Mic, Play, Square, SquarePause } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { DatePicker } from '@/components/global/DatePicker'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import moment from 'moment'
import { useAction } from '@/hooks/use-action'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { newAppointment } from '../_actions/new-appointment'
import { useOrg } from '@/providers/OrgProvider'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage, } from "@/components/ui/avatar"
import { useModal } from '@/hooks/useModal'
import { DynamicIcon } from 'lucide-react/dynamic';
import { ScrollArea } from '@/components/ui/scroll-area'


export default function NewAppointmentComp() {
    const { data: session } = useSession()
    const params = useParams()
    const { orgId } = params
    const { server, servers, users } = useOrg()
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [listning, setListning] = useState(false)
    const [pauseListning, setPauseListning] = useState(false)
    const { isOpen, onClose, type: dtype, data } = useModal();
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


    function getTimePeriod() {
        const now = new Date();
        const hours = now.getHours(); // 0–23

        if (hours >= 5 && hours < 12) return "morning";
        if (hours >= 12 && hours < 16) return "noon";
        if (hours >= 16 && hours < 20) return "evening";
        if (hours >= 20 && hours < 24) return "night";
        return "midnight"; // covers hours 0–4
    }

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
        setAppointmentData({ ...appointmentData, note: transcript })
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


    return (
        <div className='flex flex-col gap-6'>

            <div className='flex flex-1 flex-col gap-4 flex-wrap'>


                {/* Doctor */}
                <div className='flex flex-col gap-2 w-full'>
                    <Label >Select Doctor</Label>
                    <Select defaultValue={server?.userId} onValueChange={(id) => {
                        //dispatch(setSelectedDoctor(JSON.stringify(server?.members.find(member => member.userId === id).user?.servers[0])))
                        setDoctor(server?.members.find(member => member.userId === id).user?.servers[0])
                        setAppointmentData({ ...appointmentData, doctorId: server?.members.find(member => member.userId === id).user?.servers[0].userId })
                        console.log('doctor', server?.members.find(member => member.userId === id).user?.servers[0])
                        //console.log(server?.members.find(member => member.userId === id).user?.servers[0].userId)
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
                    <Select onValueChange={(id) => {
                        setAppointmentData({ ...appointmentData, patientId: id })
                    }} className='m-0'>
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
                                        className={`flex flex-col p-4 md:h-16 w-full 
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
                    <div className='flex flex-row items-center justify-evenly  gap-4'>
                        {
                            options?.map((item, index) => {

                                return (
                                    <Button
                                        key={index}
                                        disabled={!item.status}
                                        variant={'ghost'}
                                        className={
                                            `border h-16 dark:hover:bg-darkFocusColor dark:bg-darkFocusColor/60 hover:ring-[0.8px]
                                                        ${type.type === item.type && item.status && 'dark:bg-darkFocusColor ring-[0.8px]'}
                                                        w-[20%]`
                                        }
                                        onClick={() => {
                                            setType(item)


                                        }}
                                    >
                                        <div className='flex flex-col p-4 items-center justify-center gap-2'>
                                            <DynamicIcon name={item.icon} size={52} className='h-10 line-through' />
                                            <span className={`capitalize ${!item.status && 'line-through'}`}>{item.type}</span>
                                        </div>
                                    </Button>
                                )
                            })
                        }
                    </div>
                </div>


                <div className='flex flex-col gap-2'>
                    <div className='flex flex-row gap-2 items-center'>
                        <Label className='text-sm font-light'>Notes</Label>
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
                    <Textarea className='text-xs' rows='4' disabled={loading} value={appointmentData.note} onChange={(e) => { setAppointmentData({ ...appointmentData, note: e.target.value }) }} />

                </div>


            </div>

            <div className='flex flex-row items-center gap-2 justify-end'>
                <Button disabled={loading} variant="ghost" size={'sm'} onClick={() => { handleOpenChange() }}>Cancel</Button>
                <Button disabled={loading} variant="save" size={'sm'} onClick={() => { handleSaveData() }}>
                    {loading && <Loader className=' animate-spin' />}
                    Book Now
                </Button>
            </div>
        </div>
    )
}
