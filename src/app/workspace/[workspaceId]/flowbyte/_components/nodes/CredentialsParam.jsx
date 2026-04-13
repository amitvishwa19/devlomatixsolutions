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
import { useQuery } from '@tanstack/react-query'
import { getCredentials } from '../../_actions/get-credentials'

export default function CredentialsParam({ param, value, updateNodeParamValue, disabled }) {
    const id = useId()
    const { data, isLoading } = useQuery({
        queryKey: ['credentials-for-user'],
        queryFn: () => getCredentials(),
        refetchInterval: 10000
    })

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
                    <SelectValue placeholder={isLoading ? 'Loading...' : 'Select credential'} />
                </SelectTrigger>
                <SelectContent className="rounded-xl shadow-xl">
                    <SelectGroup>
                        <SelectLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">Available Credentials</SelectLabel>
                        {data?.length === 0 && (
                            <SelectItem value="none" disabled className="text-xs italic">No credentials found</SelectItem>
                        )}
                        {data?.map((credential) => (
                            <SelectItem key={credential.id} value={credential.id} className="rounded-lg">
                                {credential.platform} ({credential.environment})
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    )
}
