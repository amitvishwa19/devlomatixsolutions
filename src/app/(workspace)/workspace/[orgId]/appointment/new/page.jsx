'use client'
import { ScrollArea } from '@/components/ui/scroll-area'
import NewAppointmentManager from '../_components/NewAppointmentManager'

export default function NewAppointmentPage() {

    return (
        <div className='absolute inset-0 flex flex-col gap-2 p-2'>

            <div className='w-full dark:bg-[#151D24] p-4 rounded-md border flex flex-row items-center justify-between'>
                <div>
                    <h2 className='text-xl'>Book New Appointment</h2>
                    <h2 className='text-xs text-white/50'>One Click to Better Health – Book Your Appointment</h2>
                </div>

            </div>


            <div className='dark:bg-darkSecondaryBackground rounded-md border flex-1'>
                <ScrollArea className=' mt-0 p-4 flex flex-col gap-4 h-[85vh]  '>
                    <NewAppointmentManager />
                </ScrollArea>
            </div>

        </div >
    )
}
