import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { DynamicIcon } from 'lucide-react/dynamic';
import { useDispatch, useSelector } from 'react-redux';
import { hospitalDefaultSettings } from '@/utils/types';
import { setAppointmentType } from '../_redux/appointment-slice';



export default function TypeSelector({ data, onChange }) {
    const [type, setType] = useState({ type: 'clinic', status: false, charge: 250, icon: 'hospital' })
    const dispatch = useDispatch()
    const selectDoctor = useSelector((state) => state.appointment.selectedDoctor)
    const options = selectDoctor?.setting?.consultationOptions ? selectDoctor?.setting?.consultationOptions : hospitalDefaultSettings?.consultationOptions

    return (
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
                                    `border h-16 dark:hover:bg-darkFocusColor dark:bg-darkFocusColor/60
                                    ${type.type === item.type && item.status && 'dark:bg-darkFocusColor'}
                                     w-[20%]`
                                }
                                onClick={() => {
                                    setType(item)
                                    onChange(item)
                                    dispatch(setAppointmentType(JSON.stringify(item)))
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
    )
}
