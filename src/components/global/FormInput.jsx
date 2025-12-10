"use client";

import { forwardRef } from "react";
import { useFormStatus } from "react-dom";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FormErrors } from "./FormErrors";




export const FormInput = forwardRef(({
    id,
    label,
    type,
    placeholder,
    required,
    disabled,
    errors,
    className,
    defaultValue = "",
    onBlur
}, ref) => {
    const { pending } = useFormStatus();

    return (
        <div className="space-y-2">
            <div className="space-y-1">
                {label ? (
                    <Label
                        htmlFor={id}
                        className="text-xs font-semibold text-neutral-700"
                    >
                        {label}
                    </Label>
                ) : null}
                <Input
                    onBlur={onBlur}
                    defaultValue={defaultValue}
                    ref={ref}
                    required={required}
                    name={id}
                    id={id}
                    placeholder={placeholder}
                    type={type}
                    disabled={pending || disabled}
                    className={cn(
                        "resize-none focus-visible:ring-0 focus-visible:ring-offset-0 ring-0 focus:ring-0 outline-none shadow-sm flex  w-full",
                        className,
                    )}
                    aria-describedby={`${id}-error`}
                />
            </div>
            <FormErrors id={id} errors={errors} />
        </div>
    )
});

FormInput.displayName = "FormInput";