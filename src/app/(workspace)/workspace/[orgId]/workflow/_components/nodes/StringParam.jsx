'use client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import React, { useEffect, useId, useState } from 'react'

export default function StringParam({ param, value, updateNodeParamValue, disabled }) {
    const id = useId()
    const [inputValue, setInputValue] = useState(value || '')
    //console.log('@value', value)

    let Component = Input

    if (param.variant === 'textarea') {
        Component = Textarea
    }

    const handleInputChange = (e) => {
        //console.log('@@handleInputChange', e)
        setInputValue(e)
    }

    useEffect(() => {
        updateNodeParamValue(inputValue)
    }, [inputValue])


    return (

        <div className='space-y-1 p-1 w-full'>
            <Label htmlFor={id} className='flex text-xs mb-1'>
                {param.name} {param.value}
                {param.required && <p className='text-red-400 px-2'>*</p>}
            </Label>
            <Component
                id={id}
                className='text-xs'
                value={inputValue}
                disabled={disabled}
                rows='4'
                placeholder={param.name}
                onChange={(e) => { handleInputChange(e.target.value) }}
                onBlur={(e) => { handleInputChange(e.target.value) }}
            />
            {param.helperText && <p className='text-xs text-muted-foreground mt-1'>eg: {param.helperText}</p>}
        </div>
    )
}
