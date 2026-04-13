'use client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import React, { useEffect, useId, useState } from 'react'

export default function StringParam({ param, value, updateNodeParamValue, disabled }) {
    const id = useId()
    const [inputValue, setInputValue] = useState(value || '')

    let Component = Input

    if (param.variant === 'textarea') {
        Component = Textarea
    }

    const handleInputChange = (e) => {
        setInputValue(e)
    }

    useEffect(() => {
        updateNodeParamValue(inputValue)
    }, [inputValue, updateNodeParamValue])

    return (
        <div className='space-y-1 p-1 w-full'>
            <Label htmlFor={id} className='flex text-[10px] font-bold uppercase text-muted-foreground mb-1'>
                {param.name}
                {param.required && <p className='text-destructive px-1'>*</p>}
            </Label>
            <Component
                id={id}
                className='text-xs rounded-xl bg-background border-muted'
                value={inputValue}
                disabled={disabled}
                placeholder={param.placeholder || param.name}
                onChange={(e) => { handleInputChange(e.target.value) }}
            />
            {param.helperText && <p className='text-[10px] text-muted-foreground italic mt-1'>E.g. {param.helperText}</p>}
        </div>
    )
}
