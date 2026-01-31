import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger, } from "@/components/ui/sheet"
import { APPOINTMENTTYPE, hospitalDefaultSettings, visitPurposes } from '@/utils/types'
import { ROLE } from '@prisma/client'
import { useSession } from 'next-auth/react'
import { useParams } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { CalendarDays, CalendarIcon, ClipboardClock, Loader, Mic, Play, Save, Sparkle, Square, SquarePause, Stethoscope } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import moment from 'moment'
import { useAction } from '@/hooks/use-action'
import { useOrg } from '@/providers/OrgProvider'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage, } from "@/components/ui/avatar"
import { DynamicIcon } from 'lucide-react/dynamic';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DatePicker } from '@/components/global/DatePicker'
import { newAppointment } from '../../_actions/new-appointment'
import { ScrollArea } from '@/components/ui/scroll-area'
import AppointmentSlotCard from './AppointmentSlotCard'
import AppointmentTypeSelector from './AppointmentTypeSelector'
import { VoiceToText } from '../../../../(misc)/_components/VoiceToText'


const appointmentSchema = z.object({
    patientId: z.string().min(1, 'Patient is required'),
    doctorId: z.string().min(1, 'Doctor is required'),
    serverId: z.string().min(1, 'Server ID is required'),
    date: z.string().min(1, 'Date is required'),
    slot: z.object({
        slot: z.string(),
        start: z.string(),
        end: z.string(),
        avaliable: z.boolean().optional()
    }).nullable().refine(val => val !== null, { message: 'Slot is required' }),
    time: z.string().min(1, 'Time is required'),
    visitType: z.string().min(1, 'Visit type is required'),
    type: z.object({
        type: z.string(),
        status: z.boolean(),
        charge: z.number(),
        icon: z.string()
    }).nullable().refine(val => val !== null, { message: 'Appointment type is required' }),
    note: z.string().optional()
});

export function NewAppointmentSheet({ open, onOpenChange, onClose, data, mode, appointment, }) {

    const { data: session } = useSession()
    const params = useParams();
    const { server, servers, users, refreshServer } = useOrg()
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(false)
    const [doctor, setDoctor] = useState({})

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate())
    yesterday.setHours(0, 0, 0, 0) // normalize time


    const form = useForm({
        resolver: zodResolver(appointmentSchema),
        defaultValues: {
            patientId: appointment?.patientDetails?.id || '',
            doctorId: server?.userId || '',
            serverId: params.orgId || '',
            date: new Date().toISOString().split('T')[0],
            slot: hospitalDefaultSettings?.timing?.[0] || null,
            time: '',
            visitType: 'consultation',
            type: { type: 'clinic', status: false, charge: 250, icon: 'hospital' },
            note: ''
        }
    });


    useEffect(() => {
        if (appointment) {
            form.reset({
                patientId: appointment?.patientDetails?.id || '',
                doctorId: appointment?.doctorDetails?.id || '',
                serverId: params.orgId || '',
                date: new Date(appointment?.date) || new Date().toISOString().split('T')[0],
                slot: appointment?.slot || null,
                time: appointment?.time || '',
                visitType: appointment?.visitType || 'consultation',
                type: appointment?.time || { type: 'clinic', status: false, charge: 250, icon: 'hospital' },
                note: appointment?.note || ''
            })

        } else {
            form.reset({
                patientId: appointment?.patientDetails?.id || '',
                doctorId: server?.userId || '',
                serverId: params.orgId || '',
                date: new Date().toISOString().split('T')[0],
                slot: hospitalDefaultSettings?.timing?.[0] || null,
                time: '',
                visitType: 'consultation',
                type: { type: 'clinic', status: false, charge: 250, icon: 'hospital' },
                note: ''
            })
        }
    }, [appointment, form, mode])


    const doctors = useMemo(() =>
        server?.members?.filter(member => member.user.role === ROLE.DOCTOR) || [],
        [server?.members]
    );

    const patients = useMemo(() =>
        users?.filter(user => user.role === ROLE.PATIENT) || [],
        [users]
    );

    const doctorId = form.watch('doctorId');
    const selectedDoctor = useMemo(() =>
        doctors.find(d => d.userId === doctorId)?.user?.servers?.[0] || {},
        [doctorId, doctors]
    );

    const options = useMemo(() =>
        selectedDoctor?.setting?.consultationOptions || hospitalDefaultSettings?.consultationOptions || [],
        [selectedDoctor]
    );

    const timingOptions = useMemo(() =>
        selectedDoctor?.setting?.timing || hospitalDefaultSettings?.timing || [],
        [selectedDoctor]
    );

    const slotValue = form.watch('slot');
    const date = form.watch('date');

    const slotTimes = useMemo(() => {
        if (!slotValue) return [];

        const { start, end } = slotValue;
        const times = [];
        const interval = 15;

        const toMinutes = (timeStr) => {
            const [time, modifier] = timeStr.split(' ');
            let [hours, minutes] = time.split(':').map(Number);
            if (modifier === 'PM' && hours !== 12) hours += 12;
            if (modifier === 'AM' && hours === 12) hours = 0;
            return hours * 60 + minutes;
        };

        const toTimeString = (totalMinutes) => {
            let hours = Math.floor(totalMinutes / 60);
            let minutes = totalMinutes % 60;
            const modifier = hours >= 12 ? 'PM' : 'AM';
            if (hours === 0) hours = 12;
            if (hours > 12) hours -= 12;
            return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${modifier}`;
        };

        let startMinutes = toMinutes(start);
        const endMinutes = toMinutes(end);

        while (startMinutes < endMinutes) {
            times.push(toTimeString(startMinutes));
            startMinutes += interval;
        }
        return times;
    }, [slotValue, date]);


    const parseTime = (t) => {
        const [time, modifier] = t.split(" ");
        let [hours, minutes] = time.split(":");

        hours = parseInt(hours, 10);
        minutes = parseInt(minutes, 10);

        if (modifier === "PM" && hours !== 12) hours += 12;
        if (modifier === "AM" && hours === 12) hours = 0;

        const now = new Date();
        const compareTime = new Date();
        compareTime.setHours(hours, minutes, 0, 0);

        return compareTime < now && (moment().format('DD') === moment(data?.date).format('DD'));
    };

    const futureDate = useCallback(() => {
        const targetDate = new Date(form.getValues('date'));
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        targetDate.setHours(0, 0, 0, 0);
        return targetDate > today;
    }, [form]);


    useEffect(() => {
        if (session) {
            setDoctor(server)
        }
    }, [server])

    const handleOpenChange = () => {
        onOpenChange()

    }


    const { execute } = useAction(newAppointment, {
        onSuccess: (data) => {
            setLoading(false)
            refreshServer().then((e) => {
                setLoading(false)
                toast.success('New appointment created successfully', { id: 'new-appointment' });
                handleOpenChange()
            })
        },
        onError: (error) => {
            toast.error('Oops something went wrong,please try again later', { id: 'new-appointment' });
            setLoading(false)
            handleOpenChange()
            setLoading(false)
        }
    })


    const onSubmit = async (data) => {
        toast.loading('Please wait while we are creating new appointment', { id: 'new-appointment' });
        await execute({ data });
    };



    return (
        <Sheet open={open} onOpenChange={handleOpenChange}>
            <SheetContent className="bg-transparent bg-none border-0 p-2 min-w-[620px]">
                <div className="bg-card  h-full rounded-lg  border">

                    <SheetHeader className="space-y-4 pb-2">
                        <div className="flex items-center gap-3">
                            <div className="icon-container">
                                <Stethoscope className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <SheetTitle className="text-xl font-bold text-foreground text-sm">
                                    {mode === 'edit' ? "Edit Appointment" : "New Appointment"}
                                </SheetTitle>
                                <SheetDescription className="text-xs text-muted-foreground">
                                    {mode === 'edit'
                                        ? "Update the appointment details below"
                                        : "Schedule a new appointment with our healthcare professionals"
                                    }
                                </SheetDescription>
                            </div>
                        </div>
                    </SheetHeader>

                    <div className="mt-4">



                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} >
                                <ScrollArea className="h-[80vh] px-4 py-2">

                                    <div className='space-y-8'>

                                        {/* Doctor & Patient Row */}
                                        <div className='space-y-2'>
                                            <div className="flex items-center gap-2">
                                                <Sparkle className="h-4 w-4 text-primary" />
                                                <h3 className="text-sm font-semibold text-foreground">People</h3>
                                            </div>

                                            <div className='flex flex-row items-start gap-2'>
                                                <FormField
                                                    control={form.control}
                                                    name="doctorId"
                                                    render={({ field }) => (
                                                        <FormItem className="w-full">
                                                            <FormLabel>Select Doctor *</FormLabel>
                                                            <Select
                                                                disabled={doctors.length === 0}
                                                                onValueChange={field.onChange}
                                                                value={field.value}
                                                            >
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Select a doctor" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectGroup>
                                                                        {doctors.map((item) => (
                                                                            <SelectItem key={item?.user?.id} value={item?.user?.id}>
                                                                                <div className='flex flex-row items-center gap-2'>
                                                                                    <Avatar className='h-6 w-6 rounded-md'>
                                                                                        <AvatarImage src={item?.user?.avatar} />
                                                                                        <AvatarFallback className='rounded-md dark:bg-sky-600'>
                                                                                            {item?.user?.displayName?.substring(0, 1)}
                                                                                        </AvatarFallback>
                                                                                    </Avatar>
                                                                                    {item.user.displayName}
                                                                                </div>
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectGroup>
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="patientId"
                                                    render={({ field }) => (
                                                        <FormItem className="w-full">
                                                            <FormLabel>Select Patient *</FormLabel>
                                                            <Select
                                                                disabled={patients.length === 0}
                                                                onValueChange={field.onChange}
                                                                value={field.value}
                                                            >
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder='Select a Patient' />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent className='dark:bg-[#0E141B]'>
                                                                    <SelectGroup>
                                                                        {patients.map((item) => (
                                                                            <SelectItem key={item.id} value={item.id}>
                                                                                <div className='flex gap-2 items-center'>
                                                                                    <Avatar className='h-6 w-6 rounded-sm'>
                                                                                        <AvatarFallback className='text-xs bg-blue-600 rounded-sm'>
                                                                                            {item.displayName?.substring(0, 1)}
                                                                                        </AvatarFallback>
                                                                                    </Avatar>
                                                                                    {item.displayName}
                                                                                </div>
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectGroup>
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>

                                        {/* Date & Visit Type Row */}
                                        <div className='space-y-2'>
                                            <div className="flex items-center gap-2">
                                                <CalendarIcon className="h-4 w-4 text-primary" />
                                                <h3 className="text-sm font-semibold text-foreground">Schedule</h3>
                                            </div>

                                            <div className='flex flex-row items-start gap-2'>

                                                <FormField
                                                    control={form.control}
                                                    name="date"
                                                    render={({ field }) => (
                                                        <FormItem className="w-full">


                                                            <FormField
                                                                control={form.control}
                                                                name="date"
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel>Issue Date *</FormLabel>
                                                                        <FormControl>
                                                                            <DatePicker
                                                                                value={field.value}
                                                                                onChange={field.onChange}
                                                                                placeholder="Select date"
                                                                                className="bg-transparent p-2"
                                                                            />
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="visitType"
                                                    render={({ field }) => (
                                                        <FormItem className="w-full">
                                                            <FormLabel>Visit type *</FormLabel>
                                                            <Select onValueChange={field.onChange} value={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Select Visit Purpose" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    {visitPurposes.map(item => (
                                                                        <SelectItem key={item.value} value={item.value}>
                                                                            {item.label}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                            </div>


                                            <div className='flex flex-col gap-4'>


                                                {/* Slot Selector */}
                                                <FormField
                                                    control={form.control}
                                                    name="slot"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className='text-sm'>Prefered Slots *</FormLabel>
                                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-1">
                                                                {timingOptions.map((item, index) => (
                                                                    <AppointmentSlotCard
                                                                        key={index}
                                                                        slot={item}
                                                                        disabled={item.avaliable}
                                                                        onSelect={() => field.onChange(item)}
                                                                    />
                                                                ))}
                                                            </div>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                {/* Time Selector */}
                                                <FormField
                                                    control={form.control}
                                                    name="time"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className='text-sm flex flex-col gap-2'>
                                                                Time*
                                                                <span className='text-xs text-muted-foreground'>
                                                                    Showing 15-minute slots for evening ({slotTimes?.length} slots)
                                                                </span>
                                                            </FormLabel>
                                                            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
                                                                {slotTimes.map((item, index) => {
                                                                    let isBooked = false;
                                                                    selectedDoctor?.appointments?.forEach((appointment) => {
                                                                        if (appointment?.doctorId === selectedDoctor?.userId &&
                                                                            appointment?.time === item &&
                                                                            moment(appointment?.date).format('Do MMM') === moment(form.getValues('date')).format('Do MMM')) {
                                                                            isBooked = true;
                                                                        }
                                                                    });

                                                                    return (
                                                                        <Button
                                                                            key={index}
                                                                            type="button"
                                                                            variant='ghost'
                                                                            disabled={isBooked || (parseTime(item) && !futureDate())}
                                                                            className={cn(
                                                                                "px-2 py-2.5 rounded-lg text-xs font-medium transition-all duration-200",
                                                                                "border focus:outline-none focus:ring-2 focus:ring-primary/30",
                                                                                field.value === item && 'dark:bg-[#161F2B] border-[0.5px]   border-primary shadow-glow-sm'
                                                                            )}
                                                                            onClick={() => field.onChange(item)}
                                                                        >
                                                                            <span className={`text-xs ${(isBooked || (parseTime(item) && !futureDate())) && 'line-through'}`}>
                                                                                {item}
                                                                            </span>
                                                                        </Button>
                                                                    );
                                                                })}
                                                            </div>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                {/* Appointment Type */}
                                                <FormField
                                                    control={form.control}
                                                    name="type"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className='text-sm'>Appointment Type *</FormLabel>
                                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-1">
                                                                {options.map((item, index) => (
                                                                    // <Button
                                                                    //     key={index}
                                                                    //     type="button"
                                                                    //     disabled={!item.status}
                                                                    //     variant={'ghost'}
                                                                    //     className={cn(
                                                                    //         `border h-12 bg-primary/20 dark:hover:bg-darkFocusColor dark:bg-darkFocusColor/60 hover:ring-[0.8px] w-full`,
                                                                    //         field.value?.type === item.type && item.status && 'bg-primary/30 dark:bg-darkFocusColor ring-[0.8px]'
                                                                    //     )}
                                                                    //     onClick={() => field.onChange(item)}
                                                                    // >
                                                                    //     <div className='flex flex-row p-4 items-center justify-center gap-2'>
                                                                    //         <DynamicIcon name={item.icon} size={20} className='h-5' />
                                                                    //         <span className={`capitalize ${!item.status && 'line-through'}`}>
                                                                    //             {item.type}
                                                                    //         </span>
                                                                    //     </div>
                                                                    // </Button>
                                                                    <AppointmentTypeSelector
                                                                        key={index}
                                                                        value={field.value}
                                                                        selectedType={item}
                                                                        onSelectType={(item) => { field.onChange(item) }}
                                                                        disabled={!item.status}
                                                                    />
                                                                ))}
                                                            </div>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>


                                        </div>



                                        {/* Notes */}
                                        <FormField
                                            control={form.control}
                                            name="note"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className='flex flex-row gap-2 items-center'>
                                                        <FormLabel className='text-sm font-light'>Notes</FormLabel>
                                                        <VoiceToText onChange={(text) => field.onChange(text)} />
                                                    </div>
                                                    <FormControl>
                                                        <Textarea
                                                            {...field}
                                                            className='text-xs'
                                                            rows='6'
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </ScrollArea>

                                <SheetFooter className='flex flex-row justify-end mt-4'>
                                    <SheetClose asChild>
                                        <Button variant="outline" size={'sm'} type="button" onClick={onClose}>
                                            Close
                                        </Button>
                                    </SheetClose>
                                    <Button
                                        variant="save"
                                        size={'sm'}
                                        type='submit'
                                        disabled={form.formState.isSubmitting}
                                    >
                                        {form.formState.isSubmitting ? (
                                            <Loader className='animate-spin h-4 w-4 mr-2' />
                                        ) : (
                                            <Save className='h-4 w-4 mr-2' />
                                        )}
                                        Save changes
                                    </Button>
                                </SheetFooter>
                            </form>
                        </Form>


                    </div>
                </div>
            </SheetContent>
        </Sheet >
    );
}

export default NewAppointmentSheet;
