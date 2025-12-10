
import React, { useEffect, useState } from 'react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue, } from "@/components/ui/select"
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ROLE } from '@prisma/client'
import { useAction } from '@/hooks/use-action'
import { Input } from '@/components/ui/input'
import { getAppointments } from '../_actions/get-appointments'

export const UserSelect = ({ data, onChange, disabled = false, title, type, defaultValue }) => {

    return (
        <div className='flex flex-col gap-1 w-full'>
            <Label className='text-sm'>{title}</Label>
            <Select defaultValue={defaultValue} onValueChange={(id) => { onChange(id) }} disabled={disabled} className='m-0'>
                <SelectTrigger className="">
                    <>
                        <SelectValue placeholder={title} />

                    </>
                </SelectTrigger>
                <SelectContent className='dark:bg-[#0E141B]'>
                    <SelectGroup>
                        {data?.map((item, index) => {

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
    )
}

export default React.memo(UserSelect);