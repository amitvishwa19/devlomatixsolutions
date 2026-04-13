'use client'
import React, { useId } from 'react'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from '@/components/ui/label'

export default function SelectParam({ param, value, updateNodeParamValue, disabled }) {
    const id = useId()
    return (
        <div className='flex flex-col gap-1 w-full'>
            <Label htmlFor={id} className='text-[10px] font-bold uppercase text-muted-foreground flex'>
                {param.name}
                {param.required && <p className='text-destructive px-1'>*</p>}
            </Label>
            <Select 
                onValueChange={val => updateNodeParamValue(val)} 
                defaultValue={value}
                disabled={disabled}
            >
                <SelectTrigger className='w-full rounded-xl bg-background border-muted h-10' id={id}>
                    <SelectValue placeholder='Select an option' />
                </SelectTrigger>
                <SelectContent className="rounded-xl shadow-xl">
                    <SelectGroup>
                        <SelectLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">Options</SelectLabel>
                        {param.options?.map((option) => (
                            <SelectItem key={option.value} value={option.value} className="rounded-lg">
                                {option.label || option.lable}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    )
}
