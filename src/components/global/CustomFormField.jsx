'use client'
import React from 'react'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FormFieldType } from '@/utils/types'
import 'react-phone-number-input/style.css'
import PhoneInput from 'react-phone-number-input'


const RenderField = ({ field, props }) => {
    const { fieldType } = props
    switch (fieldType) {
        case FormFieldType.INPUT:
            //return <Input placeholder={props.placeholder} {...field} />
            return (
                <div className='bg-red-200/10'>
                    <FormControl>
                        <Input
                            type='text'
                            placeholder='placeholder'
                            {...field}
                        />
                    </FormControl>
                </div>

            )

        case FormFieldType.TEXTAREA:
            return (
                <div className='bg-red-200/10'>
                    <FormControl>
                        <Textarea
                            type='text'
                            placeholder='placeholder'
                            {...field}
                        />
                    </FormControl>
                </div>

            )
        default:
            break;
    }
}

export default function CustomFormField(props) {
    const { control, name, label, placeholder, description } = props
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem>

                    {label && <FormLabel>{label}</FormLabel>}

                    <RenderField field={field} props={props} />

                    <FormMessage className='shad-error' />

                    {/* <FormControl>
                        <Input placeholder={placeholder} {...field} />
                    </FormControl>
                    <FormDescription>
                        {description}
                    </FormDescription>
                    <FormMessage /> */}
                </FormItem>
            )}
        />
    )
}
