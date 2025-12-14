
import React, { useEffect, useState } from 'react'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger, } from "@/components/ui/sheet"
import { APPOINTMENTTYPE, hospitalDefaultSettings, visitPurposes } from '@/utils/types'
import { ROLE } from '@prisma/client'
import { useSession } from 'next-auth/react'
import { useParams } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { CalendarDays, CalendarIcon, CalendarRange, Loader, Mic, Play, Save, Square, SquarePause } from 'lucide-react'
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
import AppointmentEditor from './appointment-mamager/AppointmentEditor'


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


            <SheetContent open={true} className="p-0 dark:bg-darkPrimaryBackground [&>button:last-child]:hidden overflow-hidden min-w-[40%]">

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
                                <CalendarRange size={16} className='mr-2' />
                                Book Appointment
                            </TabsTrigger>
                            {/* <TabsTrigger value="medicalHistory" className='w-full rounded-md'>
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
                            </TabsTrigger> */}
                        </TabsList>


                        <TabsContent value="appointment">

                            <AppointmentEditor />

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
