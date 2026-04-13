'use client'
import { cn } from '@/lib/utils'
import React from 'react'
import { useFlowValidation } from '../../_hooks/useFlowValidation'

export function NodeCard({ children, nodeId, isSelected }) {
    const { invalidInputs } = useFlowValidation()
    const hasInvalidInputs = invalidInputs.some((node) => node.nodeId === nodeId)

    return (
        <div
            className={cn(
                'rounded-3xl cursor-pointer bg-card/80 backdrop-blur-xl border border-muted shadow-2xl w-[420px] text-xs gap-1 flex flex-col transition-all duration-300',
                isSelected && 'ring-2 ring-primary border-primary/50 translate-y-[-2px]',
                hasInvalidInputs && 'border-destructive ring-1 ring-destructive'
            )}
        >

            {children}
        </div>
    )
}
