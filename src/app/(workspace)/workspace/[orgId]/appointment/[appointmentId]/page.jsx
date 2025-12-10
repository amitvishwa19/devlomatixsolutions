'use client'

import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog"
import { appointmentStatus, APPOINTMENTTYPE, hospitalDefaultSettings } from '@/utils/types'
import { ROLE } from '@prisma/client'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { CalendarIcon, Loader, Loader2, Mic, Play, Save, Square, SquarePause } from 'lucide-react'
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
import { setAppointments } from '../_redux/appointment-slice'
import { z } from "zod";
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { cn } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from "@/components/ui/calendar";
import { updateAppointment } from '../_actions/update-appointment'


const appointmentSchema = z.object({
    id: z.string().trim(),
    doctorId: z.string().trim().nonempty({ message: "Please select a doctor" }),
    patientId: z.string().trim().nonempty({ message: "Please select a patient" }),
    serverId: z.string().trim().nonempty({ message: "Please select a server" }),
    date: z.string().nonempty({ message: "Please select an appointment date" }),
    slot: z.any().refine(val => val !== undefined && val !== null, { message: "Please select a slot" }),
    time: z.string().trim().nonempty({ message: "Please select an appointment time" }),
    type: z.object({
        type: z.string(),
        status: z.boolean(),
        charge: z.number(),
        icon: z.string()
    }),
    status: z.any(),
    note: z.string().optional(),
    additionalNote: z.string().optional(),
    doctorNote: z.string().optional(),
});


export default function EditAppointmentPage() {
    const appointment = useSelector((state) => state.appointment.selectedAppointment)
    const { data: session } = useSession()
    const { orgId } = useParams()
    const { server, servers, users, refreshServer } = useOrg()
    const dispatch = useDispatch()
    const router = useRouter()
    const [listning, setListning] = useState(false)
    const [pauseListning, setPauseListning] = useState(false)


    const [doctor, setDoctor] = useState({})
    const [slot, setSlot] = useState({ slot: 'morning', start: '09:00 AM', end: '01:00 PM', avaliable: false })
    const [slotTimes, setSlotTimes] = useState([])
    const [time, setTime] = useState(null)
    const [type, setType] = useState({ type: 'clinic', status: false, charge: 250, icon: 'hospital' })
    const options = doctor?.setting?.consultationOptions ? doctor?.setting?.consultationOptions : hospitalDefaultSettings?.consultationOptions
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate())
    yesterday.setHours(0, 0, 0, 0) // normalize time

    const [loading, setLoading] = useState(false)
    const [isDataLoaded, setIsDataLoaded] = useState(false) // ✅ Track loading state



    useEffect(() => {
        if (!appointment) { router.push(`/workspace/${orgId}/appointment`) }
    }, [appointment])

    const form = useForm({
        resolver: zodResolver(appointmentSchema),
        defaultValues: {
            id: "",
            doctorId: "",
            patientId: "",
            serverId: orgId || "",
            date: "",
            slot: null,
            time: "",
            type: { type: 'clinic', status: false, charge: 250, icon: 'hospital' },
            note: "",
            additionalNote: "",
            doctorNote: "",
            status: ""
        }
    });



    useEffect(() => {
        const resetData = {
            id: appointment?.id || "",
            doctorId: appointment?.doctorDetails?.id || "",
            patientId: appointment?.patientDetails?.id || "",
            serverId: orgId,
            date: appointment?.date || "",
            slot: appointment?.slot || null,
            time: appointment?.time || "",
            type: appointment?.type || { type: 'clinic', status: false, charge: 250, icon: 'hospital' },
            note: appointment?.note || "",
            additionalNote: appointment?.note || "",
            doctorNote: appointment?.note || "",
            status: appointment?.status || "pending",
        }

        form.reset(resetData)
        setDoctor(server)
        setIsDataLoaded(true)
        console.log('resetData', resetData)
    }, [appointment]);


    useEffect(() => {
        if (session) {
            setDoctor(server)
        }
    }, [server])

    function futureDate() {
        const dateString = "2025-12-02T00:00:00+05:30"
        const targetDate = new Date(form?.getValues('date'))
        const today = new Date()
        today.setHours(0, 0, 0, 0) // Reset time to compare only dates
        targetDate.setHours(0, 0, 0, 0) // Reset time for clean comparison
        return targetDate > today

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

        return compareTime < now && (moment().format('DD') === moment(appointment?.date).format('DD'));
    }


    useEffect(() => {

        const times = [];
        const startTime = form?.getValues('slot')?.start || '09:00 AM';
        const endTime = form?.getValues('slot')?.end || '12:00 PM';
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


    }, [form, slot])



    // ------------------------------------Voice note-------------------------------------------
    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    useEffect(() => {
        //setAppointmentData({ ...appointmentData, note: transcript })
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
        form.reset()
        onClose()
    }

    const { execute } = useAction(updateAppointment, {
        onSuccess: (data) => {
            setLoading(false)
            refreshServer().then(
                toast.success('Appointment updated successfully', { id: 'update-appointment' })
            )
        },
        onError: (error) => {
            setLoading(false)
            toast.error('Oops!, Somethin went wrong, try again later', { id: 'update-appointment' })
        }
    })

    function onSubmit(data) {
        toast.loading('Please wait while we are updating the appointment', { id: 'update-appointment' })
        setLoading(true)
        execute(data)
        console.log('Onsubmit', data)

        console.log(data)
    }




    return (
        <div className='absolute inset-0 flex flex-col gap-2 p-2'>

            <div className='w-full dark:bg-[#151D24] p-4 rounded-md border flex flex-row items-center justify-between'>
                <div>
                    <h2 className='text-xl'>Update Appointment ({appointment?.patient})</h2>
                    <h2 className='text-xs text-white/50'>One Click to Better Health – Book Your Appointment</h2>
                </div>

            </div>

            <ScrollArea className=' mt-0 p-4 flex flex-col gap-4 h-[85vh]  dark:bg-darkSecondaryBackground rounded-md border'>


                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6  h-full flex flex-col ">

                        <div className=' md:grid md:grid-flow-row md:grid-cols-2 gap-4'>

                            <div className='flex flex-1 flex-col gap-4 flex-wrap'>

                                {/* Doctor */}
                                <FormField control={form.control} name="doctorId" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Select Doctor *</FormLabel>
                                        <Select
                                            onValueChange={(id) => {
                                                field.onChange
                                                setDoctor(server?.members.find(member => member.userId === id).user?.servers[0])
                                            }}
                                            defaultValue={appointment?.doctorDetails?.id}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select doctor" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-popover z-50">
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

                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                                />

                                {/* Patient */}
                                <FormField control={form.control} name="patientId" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Select Patient *</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={appointment?.patientDetails?.id}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select patient" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-popover z-50">
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

                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                                />

                                {/* Appointment Date */}
                                <FormField control={form.control} name="date" render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Select Appointment date *</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button variant="outline"
                                                        className={cn("w-full pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground")}>
                                                        {field.value ? format(field.value, "PPP") : <span>Select Appointment date *</span>}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0 bg-popover z-50"
                                                align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) => date < yesterday}
                                                    className={cn("p-3  nter - events - auto dark:bg-darkPrimaryBackground w-[250px] outline-none")}

                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                                />

                                {/* Slot Selector */}
                                <FormField control={form.control} name="slot" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Appointment Slots *</FormLabel>
                                        <FormControl>


                                            <div className="flex flex-col md:flex-row gap-2 flex-wrap">
                                                {(doctor?.setting?.timing ?? hospitalDefaultSettings?.timing)?.map((item, index) => {

                                                    return (

                                                        <Button
                                                            key={index}
                                                            type="button"
                                                            variant="ghost"
                                                            disabled={!item.avaliable}
                                                            className={`flex flex-col md:flex-row p-4 h-12  md:h-16 
                                                             bg-primary/20 items-center justify-center rounded-md
                                                            dark:bg-darkFocusColor/60  flex-1 
                                                            hover:dark:bg-darkFocusColor transition-all hover:ring-[0.8px]
                                                            ${field.value?.slot === item.slot && item.avaliable && 'bg-primary/30 dark:bg-darkFocusColor ring-[0.8px]'} border flex flex-row items-center `
                                                            }

                                                            onClick={() => {
                                                                setSlot(item)
                                                                field.onChange(item);
                                                                setSlot(item);
                                                            }}
                                                        >
                                                            <div className='flex flex-col items-center justify-center gap-2'>
                                                                <span className={`capitalize ${!item.avaliable && ' line-through'}`}>{item.slot}</span>
                                                                <span className={` capitalize text-xs  ${!item.avaliable && ' line-through'}`}>{item.start} - {item.end}</span>
                                                            </div>
                                                        </Button>
                                                    )
                                                })}
                                            </div>

                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                                />


                                {/* Sleect Time */}
                                <FormField control={form.control} name="time" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Appointment Time *</FormLabel>
                                        <FormControl>
                                            <div className="flex flex-col gap-2 flex-wrap">
                                                <div className="flex flex-row flex-wrap items-center gap-2">
                                                    {slotTimes?.map((item, index) => {
                                                        let isBooked = false

                                                        doctor?.appointments?.forEach((appointment) => {
                                                            if (
                                                                appointment?.doctorId === doctor?.userId &&
                                                                appointment?.time === item &&
                                                                moment(appointment?.date).format("Do MMM") ===
                                                                moment(form?.getValues('date')).format("Do MMM")
                                                            ) {
                                                                isBooked = true
                                                            }
                                                        })

                                                        const isDisabled =
                                                            isBooked || (parseTime(item) && !futureDate())

                                                        const isActive = field.value === item

                                                        return (
                                                            <div key={index}>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    disabled={isDisabled}
                                                                    className={cn(
                                                                        "border w-20 hover:ring-[0.8px]",
                                                                        isActive && "dark:bg-[#161F2B] ring-[0.8px]",
                                                                        isDisabled && "opacity-60"
                                                                    )}
                                                                    onClick={() => {
                                                                        field.onChange(item)
                                                                        setTime(item)
                                                                    }}
                                                                >
                                                                    <span
                                                                        className={cn(
                                                                            "text-xs",
                                                                            isDisabled && "line-through"
                                                                        )}
                                                                    >
                                                                        {item}
                                                                    </span>
                                                                </Button>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                                />


                                {/* consultationOptions */}
                                <FormField control={form.control} name="type" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Appointment Type *</FormLabel>
                                        <FormControl>
                                            <div className="flex flex-col gap-2">
                                                <div className="grid grid-flow-col grid-cols-4 gap-2 m-1">
                                                    {options?.map((item, index) => {
                                                        const isActive = field.value?.type === item.type
                                                        const isDisabled = !item.status

                                                        return (
                                                            <Button
                                                                key={index}
                                                                type="button"
                                                                variant="ghost"
                                                                disabled={isDisabled}
                                                                className={cn(
                                                                    "border h-12 bg-primary/20 dark:bg-darkFocusColor/60 hover:ring-[0.8px] dark:hover:bg-darkFocusColor w-full",
                                                                    isActive && item.status && "bg-primary/30 dark:bg-darkFocusColor ring-[0.8px]"
                                                                )}
                                                                onClick={() => {
                                                                    field.onChange(item)
                                                                    //setAppointmentData({ ...appointmentData, type: item })
                                                                    //setType(item)
                                                                    console.log(item)
                                                                }}
                                                            >
                                                                <div className="flex flex-row p-4 items-center justify-center gap-2">
                                                                    <DynamicIcon name={item.icon} size={52} className="h-10" />
                                                                    <span className={cn("capitalize", isDisabled && "line-through")}>
                                                                        {item.type}
                                                                    </span>
                                                                </div>
                                                            </Button>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                                />


                                {/* Status */}
                                <FormField control={form.control} name="status" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Select Status *</FormLabel>

                                        <Select onValueChange={field.onChange} defaultValue={appointment?.status}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-popover z-50">
                                                {appointmentStatus.map((item, index) => {

                                                    return (
                                                        <SelectItem key={index} value={item?.value}>
                                                            {item.title}
                                                        </SelectItem>
                                                    )
                                                })}

                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                                />


                            </div>

                            <div className='flex flex-col gap-4'>

                                {/* Nottes */}
                                <FormField
                                    control={form.control}
                                    name="note"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex flex-row gap-2 items-center">
                                                <FormLabel className="text-sm font-light">Notes</FormLabel>
                                                <div className="flex flex-row gap-2">
                                                    <Mic
                                                        className={cn(
                                                            "cursor-pointer",
                                                            listning && "text-red-600 font-bold animate-ping"
                                                        )}
                                                        size={18}
                                                        onClick={() => startListning()}
                                                    />
                                                    {listning && (
                                                        <div className="flex flex-row gap-2">
                                                            {pauseListning && (
                                                                <Play
                                                                    size={18}
                                                                    className="cursor-pointer text-green-500"
                                                                    onClick={() => {
                                                                        setPauseListning(false);
                                                                        SpeechRecognition.startListening();
                                                                    }}
                                                                />
                                                            )}
                                                            {!pauseListning && (
                                                                <SquarePause
                                                                    size={18}
                                                                    className="cursor-pointer"
                                                                    onClick={() => {
                                                                        setPauseListning(true);
                                                                        SpeechRecognition.stopListening();
                                                                    }}
                                                                />
                                                            )}
                                                            <Square
                                                                size={18}
                                                                className="cursor-pointer text-red-600"
                                                                onClick={() => {
                                                                    setListning(false);
                                                                    SpeechRecognition.abortListening();
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <FormControl>
                                                <Textarea
                                                    className="text-xs"
                                                    rows={10}
                                                    disabled={loading}
                                                    {...field}
                                                    onChange={(e) => {
                                                        field.onChange(e); // Updates form state
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Additional Comment */}
                                <FormField
                                    control={form.control}
                                    name="additionalNote"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex flex-row gap-2 items-center">
                                                <FormLabel className="text-sm font-light">Additional Comment</FormLabel>
                                                <div className="flex flex-row gap-2">
                                                    <Mic
                                                        className={cn(
                                                            "cursor-pointer",
                                                            listning && "text-red-600 font-bold animate-ping"
                                                        )}
                                                        size={18}
                                                        onClick={() => startListning()}
                                                    />
                                                    {listning && (
                                                        <div className="flex flex-row gap-2">
                                                            {pauseListning && (
                                                                <Play
                                                                    size={18}
                                                                    className="cursor-pointer text-green-500"
                                                                    onClick={() => {
                                                                        setPauseListning(false);
                                                                        SpeechRecognition.startListening();
                                                                    }}
                                                                />
                                                            )}
                                                            {!pauseListning && (
                                                                <SquarePause
                                                                    size={18}
                                                                    className="cursor-pointer"
                                                                    onClick={() => {
                                                                        setPauseListning(true);
                                                                        SpeechRecognition.stopListening();
                                                                    }}
                                                                />
                                                            )}
                                                            <Square
                                                                size={18}
                                                                className="cursor-pointer text-red-600"
                                                                onClick={() => {
                                                                    setListning(false);
                                                                    SpeechRecognition.abortListening();
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <FormControl>
                                                <Textarea
                                                    className="text-xs"
                                                    rows={10}
                                                    disabled={loading}
                                                    {...field}
                                                    onChange={(e) => {
                                                        field.onChange(e); // Updates form state
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Doctor Note */}
                                <FormField
                                    control={form.control}
                                    name="doctorNote"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex flex-row gap-2 items-center">
                                                <FormLabel className="text-sm font-light">Doctor Note</FormLabel>
                                                <div className="flex flex-row gap-2">
                                                    <Mic
                                                        className={cn(
                                                            "cursor-pointer",
                                                            listning && "text-red-600 font-bold animate-ping"
                                                        )}
                                                        size={18}
                                                        onClick={() => startListning()}
                                                    />
                                                    {listning && (
                                                        <div className="flex flex-row gap-2">
                                                            {pauseListning && (
                                                                <Play
                                                                    size={18}
                                                                    className="cursor-pointer text-green-500"
                                                                    onClick={() => {
                                                                        setPauseListning(false);
                                                                        SpeechRecognition.startListening();
                                                                    }}
                                                                />
                                                            )}
                                                            {!pauseListning && (
                                                                <SquarePause
                                                                    size={18}
                                                                    className="cursor-pointer"
                                                                    onClick={() => {
                                                                        setPauseListning(true);
                                                                        SpeechRecognition.stopListening();
                                                                    }}
                                                                />
                                                            )}
                                                            <Square
                                                                size={18}
                                                                className="cursor-pointer text-red-600"
                                                                onClick={() => {
                                                                    setListning(false);
                                                                    SpeechRecognition.abortListening();
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <FormControl>
                                                <Textarea
                                                    className="text-xs"
                                                    rows={10}
                                                    disabled={loading}
                                                    {...field}
                                                    onChange={(e) => {
                                                        field.onChange(e); // Updates form state
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                        </div>

                        <div className='flex py-4 justify-end fixed bottom-4 right-4'>
                            <Button disabled={loading} type='submit' variant={'save'} size='sm'>
                                {loading ? <Loader className=' animate-spin' /> : <Save />}
                                Update Appointment
                            </Button>
                        </div>

                    </form>
                </Form>

            </ScrollArea>



        </div >
    )
}
