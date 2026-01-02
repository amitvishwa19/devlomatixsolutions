'use client'
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useOrg } from '@/providers/OrgProvider';
import { CalendarDays } from 'lucide-react';
import { CalendarView } from './_components/CalendarView';



const mockAppointments = {
    "2025-11-23": [
        { id: "1", patientName: "John Doe", time: "9:00 AM", specialty: "Cardiology", status: "confirmed" },
        { id: "2", patientName: "Jane Smith", time: "11:00 AM", specialty: "Pediatrics", status: "confirmed" },
        { id: "3", patientName: "Robert Chen", time: "2:00 PM", specialty: "Neurology", status: "confirmed" },
    ],
    "2025-12-10": [
        { id: "4", patientName: "Maria Garcia", time: "10:00 AM", specialty: "Dermatology", status: "pending" },
        { id: "5", patientName: "David Lee", time: "1:00 PM", specialty: "Ophthalmology", status: "confirmed" },
    ],
    "2025-11-25": [
        { id: "6", patientName: "Sarah Williams", time: "8:00 AM", specialty: "Orthopedics", status: "confirmed" },
        { id: "7", patientName: "Tom Brown", time: "10:00 AM", specialty: "General Practice", status: "confirmed" },
        { id: "8", patientName: "Emily Davis", time: "3:00 PM", specialty: "Cardiology", status: "completed" },
    ],
    "2025-12-10": [
        { id: "9", patientName: "Michael Jordan", time: "9:00 AM", specialty: "Sports Medicine", status: "confirmed" },
        { id: "10", patientName: "Lisa Anderson", time: "11:00 AM", specialty: "Pediatrics", status: "confirmed" },
        { id: "11", patientName: "James Wilson", time: "4:00 PM", specialty: "Cardiology", status: "pending" },
    ],
    "2025-12-10": [
        { id: "12", patientName: "Mike Johnson", time: "2:00 PM", specialty: "Dermatology", status: "pending" },
        { id: "121", patientName: "Mike Johnson", time: "2:15 PM", specialty: "Dermatology", status: "pending" },
        { id: "1211", patientName: "Mike Johnson", time: "4:00 PM", specialty: "Dermatology", status: "pending" },
        { id: "13", patientName: "Anna Martinez", time: "5:00 PM", specialty: "Psychiatry", status: "confirmed" },
    ],
    "2025-11-28": [
        { id: "14", patientName: "Patricia White", time: "10:00 AM", specialty: "Endocrinology", status: "completed" },
        { id: "15", patientName: "Kevin Brown", time: "1:00 PM", specialty: "Gastroenterology", status: "confirmed" },
        { id: "16", patientName: "Rachel Green", time: "3:00 PM", specialty: "Rheumatology", status: "confirmed" },
    ],
    "2025-11-29": [
        { id: "17", patientName: "Chris Evans", time: "9:00 AM", specialty: "Urology", status: "confirmed" },
        { id: "18", patientName: "Monica Geller", time: "11:00 AM", specialty: "Obstetrics", status: "confirmed" },
    ],
};


export default function AppointmentCalenderPage() {
    const { server } = useOrg()



    return (
        <div className='absolute inset-0 flex flex-col gap-2 p-2'>

            <div className='w-full dark:bg-darkSecondaryBackground  p-4 rounded-md border flex flex-row items-center justify-between'>
                <div>
                    <h2 className='text-xl flex flex-row items-center gap-2'>
                        <CalendarDays className='h-5 w-5 text-sky-500' />
                        Appointment Calender
                    </h2>
                    <h2 className='text-xs text-muted-foreground'>Appointment Calendar for Optimal Patient Flow, Real-Time Updates, and Effortless Time Management</h2>
                </div>
                <div>

                </div>
            </div>

            <ScrollArea className='h-[85vh] flex flex-grow dark:bg-darkSecondaryBackground rounded-md p-2 border'>
                <CalendarView />
            </ScrollArea>


        </div >
    )
}
