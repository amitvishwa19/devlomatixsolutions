import React from 'react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export const Hint = ({ children, sideOffset, description }) => {
    return (
        <TooltipProvider>
            <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                    {children}
                </TooltipTrigger>
                <TooltipContent sideOffset={sideOffset} side={'bottom'} className='text-xs max-w-[220px] break-words'>
                    {description}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}