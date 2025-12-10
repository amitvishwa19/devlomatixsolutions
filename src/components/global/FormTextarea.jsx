"use client";

import { useFormStatus } from "react-dom";
import { KeyboardEventHandler, forwardRef } from "react";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormErrors } from "./FormErrors";



export const FormTextarea = forwardRef(({
    id,
    name,
    label,
    placeholder,
    required,
    disabled,
    errors,
    onBlur,
    onClick,
    onKeyDown,
    className,
    defaultValue,
    onchange,
}, ref) => {
    const { pending } = useFormStatus();

    return (
        <div className="space-y-2 w-full">
            <div className="space-y-1 w-full">
                {label ? (
                    <Label
                        htmlFor={id}
                        className="text-xs font-semibold text-neutral-700"
                    >
                        {label}
                    </Label>
                ) : null}
                <Textarea
                    onKeyDown={onKeyDown}
                    onBlur={onBlur}
                    onClick={onClick}
                    ref={ref}
                    required={required}
                    placeholder="Type your message here."
                    name={name}
                    id={id}
                    disabled={pending || disabled}
                    //value={defaultValue}
                    //onchange={onchange}
                    className={cn(
                        "focus-visible:ring-0 focus-visible:ring-offset-0 ring-0 focus:ring-0 outline-none shadow-sm flex  w-full",
                        className
                    )}
                    aria-describedby={`${id}-error`}
                    defaultValue={defaultValue}
                />
            </div>
            <FormErrors
                id={id}
                errors={errors}
            />
        </div>
    )
})

FormTextarea.displayName = "FormTextarea";