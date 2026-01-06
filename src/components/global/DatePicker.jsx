'use client'
import React, { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { CalendarDays, Calendar as CalenderIcon } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover"
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Calendar } from '@/components/ui/calendar'
import moment from 'moment'
import { useDispatch } from 'react-redux'


export function DatePicker({ value, onChange, className, placeholder, disableFutere = false, disabled }) {

    const [open, setOpen] = useState(false)
    const [date, setDate] = useState(value ? format(value, 'dd MMM yyyy') : placeholder)
    const yesterday = new Date()

    yesterday.setDate(yesterday.getDate())
    yesterday.setHours(0, 0, 0, 0) // normalize time

    const handleDateSelect = (d) => {
        setOpen(!open)
        onChange(moment(d).format().toString())
        setDate(moment(d).format('MMM Do YY'))
    }

    useEffect(() => {
        if (value) {
            setDate(format(value, 'dd MMM yyyy'))
        }
    }, [value])


    const handleOnOpenChange = () => {
        setOpen(!open)
    }

    return (
        <Popover open={open} onOpenChange={handleOnOpenChange}  >
            <PopoverTrigger asChild className='p-2 m-0 w-full '>
                <Button
                    variant='ghost'
                    disabled={disabled}
                    className={cn(' justify-between text-left font-normal border  p-4', !value && 'dark:text-slate-400 text-slate-700')}
                >
                    <span>{date}</span>

                    <CalendarDays size={10} className='' />

                </Button>

            </PopoverTrigger>
            <PopoverContent className=" p-0  overflow-hidden rounded-xl mt-2 w-full" side='bottom' align='end'>
                <Calendar
                    mode='single'
                    selected={value}
                    onSelect={(date) => handleDateSelect(date)}
                    disabled={(date) => disableFutere ? date > yesterday : date < yesterday}
                    className={'w-[250px] rounded-xl dark:bg-darkPrimaryBackground'}
                />
            </PopoverContent>
        </Popover >
    )
}
