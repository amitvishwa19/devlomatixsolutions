import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setAppointmentTime } from '../_redux/appointment-slice'

const TimeSelector = ({ data, onChange, disabled = false }) => {
    const times = useSelector((state) => state.appointment.slotTime)
    const [time, setTime] = useState(data)
    const dispatch = useDispatch()

    const appointments = useSelector((state) => state.appointment.selectedDoctorAppointments)

    useEffect(() => {
        //console.log(data)
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


    return (
        <div className='flex flex-col gap-2 flex-wrap'>
            <Label className='text-sm'>Appointment Time</Label>
            <div
                className='flex flex-row flex-wrap items-center  gap-2 '

            >
                {times?.map((item, index) => {

                    let isBooked = false

                    data?.appointments?.map((appointment) => {

                        //console.log('@clecking for isBooked', appointment?.time === item, appointment)
                        //moment(appointment.date).format('Do MMM') === moment(data?.date).format('Do MMM')


                    })



                    return (
                        <div key={index}>
                            <Button
                                variant='ghost'
                                disabled={parseTime(item)}
                                className={`border w-20 ${time === item && 'dark:bg-[#161F2B]'}`}
                                onClick={() => {
                                    onChange(item)
                                    setTime(item)
                                    dispatch(setAppointmentTime(JSON.stringify(item)))
                                    console.log(item)
                                }}
                            >
                                <span className={`text-xs ${parseTime(item) && 'line-through'}`}>
                                    {item}
                                </span>

                            </Button>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}


export default React.memo(TimeSelector);