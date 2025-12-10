import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { hospitalDefaultSettings, slotData } from '@/utils/types'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setAppointmentSelectedSlot, setSlotTime } from '../_redux/appointment-slice'



export default function SlotSelector({ onChange, }) {
    const [slot, setslot] = useState({ slot: 'morning', start: '09:00 AM', end: '01:00 PM', avaliable: false })
    const dispatch = useDispatch()

    const selectDoctor = useSelector((state) => state.appointment.selectedDoctor)
    const appointmentSelectedSlot = useSelector((state) => state.appointment.appointmentSelectedSlot)

    const handleSlotChange = (e) => {
        setslot(e)
        dispatch(setAppointmentSelectedSlot(JSON.stringify(e)))
        onChange(e)
    }

    useEffect(() => {
        setslot(appointmentSelectedSlot)
    }, [appointmentSelectedSlot])


    useEffect(() => {

        const times = [];
        const startTime = appointmentSelectedSlot?.start || '09:00 AM';
        const endTime = appointmentSelectedSlot?.end || '12:00 PM';
        const interval = selectDoctor?.setting?.slotTime || 15;


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
        dispatch(setSlotTime(times))

    }, [selectDoctor, appointmentSelectedSlot])



    const generateTimeSlots = (slot, appointmentTimings) => {
        const times = [];
        const startTime = slot?.start || '12:00 PM';
        const endTime = slot?.end || '06:00 PM';
        const interval = appointmentTimings || 15;


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

        //console.log('times', times)

        //dispatch(setSlotTime(times))
    };


    //console.log(generateTimeSlots({ start: "12:00 AM", end: "01:00 AM" }, 15))
    return (
        <div className='flex flex-col gap-2 flex-wrap'>
            <Label className='text-sm'>Appointment Slots</Label>
            <div className=' flex-col md:flex-row items-center justify-around gap-2  grid grid-cols-2 p-2'>
                {(selectDoctor?.setting?.timing ? selectDoctor?.setting?.timing : hospitalDefaultSettings?.timing)?.map((item, index) => {

                    return (
                        <div key={index} className='w-full'>

                            <Button key={index}
                                variant={'ghost'}
                                disabled={!item.avaliable}
                                className={`flex flex-col p-4 md:h-16 w-full 
                                    bg-red-200 items-center justify-center rounded-md 
                                    dark:bg-darkFocusColor/60 
                                    hover:dark:bg-darkFocusColor
                                    scale-100 transition-all
                                     ${slot?.slot === item.slot && item.avaliable && 'dark:bg-darkFocusColor'} border flex flex-row items-center`
                                }
                                onClick={() => { handleSlotChange(item) }}
                            >

                                <span className={`capitalize ${!item.avaliable && ' line-through'}`}>{item.slot}</span>
                                <span className={` capitalize text-xs  ${!item.avaliable && ' line-through'}`}>{item.start} - {item.end}</span>
                            </Button>

                        </div>
                    )
                })}
            </div>
        </div>
    )
}
