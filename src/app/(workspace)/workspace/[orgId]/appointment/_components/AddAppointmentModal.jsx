
import React, { useEffect, useState } from 'react'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger, } from "@/components/ui/sheet"
import { APPOINTMENTTYPE, hospitalDefaultSettings, visitPurposes } from '@/utils/types'
import { ROLE } from '@prisma/client'
import { useSession } from 'next-auth/react'
import { useParams } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { CalendarDays, CalendarIcon, Loader, Mic, Play, Save, Square, SquarePause } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import moment from 'moment'
import { useAction } from '@/hooks/use-action'
import { newAppointment } from '../_actions/new-appointment'
import { useOrg } from '@/providers/OrgProvider'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage, } from "@/components/ui/avatar"
import { useModal } from '@/hooks/useModal'
import { DynamicIcon } from 'lucide-react/dynamic';
import { ScrollArea } from '@/components/ui/scroll-area'
import { VoiceToText } from '../../(misc)/_components/VoiceToText'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger, } from "@/components/ui/tabs"
import MedicalHistoryTab from '../../patient/_component/patient-profile/MedicalHistoryTab'
import MedicationsTab from '../../patient/_component/patient-profile/MedicationsTab'
import AllergiesTab from '../../patient/_component/patient-profile/AllergiesTab'
import VisitHistoryTab from '../../patient/_component/patient-profile/VisitHistoryTab'
import DocumentsTab from '../../patient/_component/patient-profile/DocumentsTab'


export default function AddAppointmentModal() {
    const { data: session } = useSession()
    const { orgId } = useParams()
    const { server, servers, users, refreshServer } = useOrg()
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [listning, setListning] = useState(false)
    const [pauseListning, setPauseListning] = useState(false)
    const { isOpen, onClose, type: dtype, data } = useModal();
    const isModalOpen = isOpen && dtype === "add-appointment-modal";

    const [doctor, setDoctor] = useState({})
    const [slot, setSlot] = useState({ slot: 'morning', start: '09:00 AM', end: '01:00 PM', avaliable: false })
    const [slotTimes, setSlotTimes] = useState([])
    const [time, setTime] = useState(null)
    const [type, setType] = useState({ type: 'clinic', status: false, charge: 250, icon: 'hospital' })
    const options = doctor?.setting?.consultationOptions ? doctor?.setting?.consultationOptions : hospitalDefaultSettings?.consultationOptions

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate())
    yesterday.setHours(0, 0, 0, 0) // normalize time

    console.log('data', data)

    const [appointmentData, setAppointmentData] = useState({
        patientId: null,
        doctorId: null,
        serverId: orgId,
        date: moment().format(),
        slot: hospitalDefaultSettings?.timing[0],
        time: null,
        visitType: 'consultation',
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

    function futureDate() {
        const dateString = "2025-12-02T00:00:00+05:30"
        const targetDate = new Date(appointmentData?.date)
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
                visitType: 'consultation',
                type: { type: 'clinic', status: false, charge: 250, icon: 'hospital' },
                note: ''
            })

        }
    }

    const handleSaveData = async () => {

        if (!appointmentData.doctorId) return toast.error('Please select a Doctor to book appointment')
        if (!appointmentData.patientId) return toast.error('Please select a Patient to book appointment')
        if (!appointmentData.date) return toast.error('Please select a Date to book appointment')
        if (!appointmentData.slot) return toast.error('Please select a Slot to book appointment')
        if (!appointmentData.time) return toast.error('Please select a Time to book appointment')
        if (!appointmentData.type) return toast.error('Please select a appointment type to book appointment')

        try {
            setLoading(true)
            toast.loading('Please wait while we are creating new appointment', { id: 'new-appointment' })
            await execute({ data: appointmentData })
        } catch (error) {

        } finally {

        }

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

    return (
        <Sheet open={isModalOpen} onOpenChange={() => { handleOpenChange() }}>


            <SheetContent open={true} className="p-0 dark:bg-darkPrimaryBackground [&>button:last-child]:hidden overflow-hidden min-w-[50%]">

                <SheetHeader className={'hidden'}>
                    <SheetTitle>Edit profile</SheetTitle>
                    <SheetDescription>
                        Make changes to your profile here. Click save when you&apos;re
                        done.
                    </SheetDescription>
                </SheetHeader>

                <ScrollArea className=' mt-0 p-4 flex flex-col gap-4 h-full'>

                    <Tabs defaultValue="appointment" className="w-full">
                        {data?.type}

                        <TabsList className='w-full flex flex-row items-center justify-between rounded-md'>
                            <TabsTrigger value="appointment" className='w-full rounded-md'>
                                <CalendarDays size={16} className='mr-2' />
                                Book Appointment
                            </TabsTrigger>
                            <TabsTrigger value="medicalHistory" className='w-full rounded-md'>
                                Medical History
                            </TabsTrigger>
                            <TabsTrigger value="medication" className='w-full rounded-md'>
                                Medication
                            </TabsTrigger>
                            <TabsTrigger value="allergies" className='w-full rounded-md'>
                                Allergies
                            </TabsTrigger>
                            <TabsTrigger value="visitHistory" className='w-full rounded-md'>
                                Visit History
                            </TabsTrigger>
                            <TabsTrigger value="documents" className='w-full rounded-md'>
                                Documents
                            </TabsTrigger>
                        </TabsList>


                        <TabsContent value="appointment">
                            <div className='flex flex-col gap-4'>
                                <div className='self-center'>
                                    <h2 className='text-lg'>Book New Appointment</h2>
                                </div>
                                <div className='flex flex-1 flex-col gap-4 flex-wrap'>


                                    {/* Doctor */}
                                    <div className='flex flex-col gap-2 w-full'>
                                        <Label >Select Doctor *</Label>
                                        <Select
                                            disabled={server?.members.filter(member => member.user.role === ROLE.DOCTOR).length === 0 ? true : false}
                                            defaultValue={server?.userId}
                                            onValueChange={(id) => {
                                                setDoctor(server?.members.find(member => member.userId === id).user?.servers[0])
                                                setAppointmentData({ ...appointmentData, doctorId: server?.members.find(member => member.userId === id).user?.servers[0].userId })
                                                console.log('doctor', server?.members.find(member => member.userId === id).user?.servers[0])
                                            }}
                                        >
                                            <SelectTrigger className="">
                                                <SelectValue placeholder="Select a doctor" />
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
                                        <Label className='text-sm'>Select Patient *</Label>
                                        <Select
                                            disabled={users?.filter(user => user.role === ROLE.PATIENT).length === 0 ? true : false}
                                            onValueChange={(id) => {
                                                setAppointmentData({ ...appointmentData, patientId: id })
                                            }}
                                            className='m-0'
                                        >
                                            <SelectTrigger className="">
                                                <>
                                                    <SelectValue placeholder='Select a Patient' />

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

                                    {/* Appointment Date */}
                                    <div className='flex flex-col gap-2 w-full'>
                                        <Label>Appointment date *</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="ghost"
                                                    className={cn("w-full pl-3 text-left font-normal border",
                                                        "text-muted-foreground")}>
                                                    {<span>{moment(appointmentData.date).format('Do MMM YY')}</span>}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0 bg-popover z-50"
                                                align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={''}
                                                    onSelect={(e) => {
                                                        console.log(moment(e).format())
                                                        setAppointmentData({ ...appointmentData, date: moment(e).format() })
                                                    }}
                                                    disabled={(date) => date < yesterday}
                                                    className={cn("p-3  nter - events - auto dark:bg-darkPrimaryBackground w-[250px] outline-none")}

                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    {/* Appointment visit type */}
                                    <div>
                                        <Label>Visit type *</Label>
                                        <Select defaultValue='consultation' onValueChange={(e) => { setAppointmentData({ ...appointmentData, visitType: e }) }}>
                                            <SelectTrigger className="">
                                                <SelectValue placeholder="Select Visit Purpose" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {visitPurposes.map(item => (
                                                    <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
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
                                                            className={`flex flex-row p-4 h-12 w-full 
                                                                bg-primary/20 items-center justify-center rounded-md 
                                                                dark:bg-darkFocusColor/60 
                                                                hover:dark:bg-darkFocusColor
                                                                 transition-all
                                                                 hover:ring-[0.8px]
                                                                 ${slot?.slot === item.slot && item.avaliable && 'bg-primary/30 dark:bg-darkFocusColor ring-[0.8px]'} border flex flex-row items-center `
                                                            }
                                                            onClick={() => {
                                                                //handleSlotChange(item)
                                                                setSlot(item)
                                                                setAppointmentData({ ...appointmentData, slot: item })
                                                            }}
                                                        >

                                                            <div className='flex flex-col items-center justify-center'>
                                                                <span className={`capitalize ${!item.avaliable && ' line-through'}`}>{item.slot}</span>
                                                                <span className={` capitalize text-xs text-muted-foreground  ${!item.avaliable && ' line-through'}`}>{item.start} - {item.end}</span>
                                                            </div>
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
                                                            disabled={isBooked ? true : false || (parseTime(item) && !futureDate())}
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
                                                            <span className={`text-xs ${(isBooked || (parseTime(item) && !futureDate())) && 'line-through'}`}>
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
                                                                `border h-12 bg-primary/20 dark:hover:bg-darkFocusColor dark:bg-darkFocusColor/60 hover:ring-[0.8px]
                                                         ${type.type === item.type && item.status && 'bg-primary/30 dark:bg-darkFocusColor ring-[0.8px]'}
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

                                    {/* Appointment Notes */}
                                    <div className='flex flex-col gap-2'>
                                        <div className='flex flex-row gap-2 items-center'>
                                            <Label className='text-sm font-light'>Notes</Label>
                                            <VoiceToText onChange={(e) => {
                                                setAppointmentData({ ...appointmentData, note: e })
                                            }} />

                                        </div>
                                        <Textarea className='text-xs' rows='6' disabled={loading} value={appointmentData.note} onChange={(e) => { setAppointmentData({ ...appointmentData, note: e }) }} />

                                    </div>


                                </div>

                                <div className='flex flex-row items-center gap-2 justify-end'>
                                    <Button disabled={loading} variant="ghost" size={'sm'} onClick={() => { handleOpenChange() }}>Cancel</Button>
                                    <Button disabled={loading} variant="save" size={'sm'} onClick={() => { handleSaveData() }}>
                                        {loading ? <Loader className=' animate-spin' /> : <Save />}
                                        Book Now
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="medicalHistory" className='p-0'>
                            <div className='flex flex-col items-center gap-4'>

                                <div className='self-center'>
                                    <h2 className='text-md'>Medical History</h2>
                                </div>

                                <MedicalHistoryTab />
                            </div>

                        </TabsContent>

                        <TabsContent value="medication" >
                            <div className='flex flex-col items-center gap-4'>

                                <div className='self-center'>
                                    <h2 className='text-md'>Medications</h2>
                                </div>
                                <MedicationsTab />
                            </div>
                        </TabsContent>

                        <TabsContent value="allergies" >
                            <div className='flex flex-col items-center gap-4'>

                                <div className='self-center'>
                                    <h2 className='text-md'>Allergies</h2>
                                </div>

                                <AllergiesTab />
                            </div>
                        </TabsContent>

                        <TabsContent value="visitHistory" >
                            <div className='flex flex-col items-center'>

                                <div className='self-center'>
                                    <h2 className='text-lg'>Visit History</h2>
                                </div>
                                <VisitHistoryTab />
                            </div>
                        </TabsContent>

                        <TabsContent value="documents" >
                            <div className='flex flex-col items-center gap-4'>

                                <div className='self-center'>
                                    <h2 className='text-lg'>Documents</h2>
                                </div>
                                <DocumentsTab />
                            </div>
                        </TabsContent>
                    </Tabs>




                </ScrollArea>



            </SheetContent>

        </Sheet>
    )
}
