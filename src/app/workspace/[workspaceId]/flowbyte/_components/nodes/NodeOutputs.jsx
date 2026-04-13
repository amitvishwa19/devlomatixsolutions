'use client'
import { cn } from '@/lib/utils'
import React from 'react'
import { Handle, Position } from '@xyflow/react'
import { ColorForHandle } from './common'

export default function NodeOutputs({ children }) {
    return (
        <div className='flex flex-col gap-1 p-2'>
            {children}
        </div>
    )
}

export function NodeOutput({ output, nodeId }) {
    return (
        <div className='flex justify-end relative p-3 bg-muted/20 rounded-2xl border border-transparent transition-all'>
            <p className='text-[10px] font-bold uppercase text-muted-foreground w-full text-right'>{output.name}</p>
            <Handle
                id={output.name}
                type='source'
                position={Position.Right}
                className={cn("!bg-muted-foreground !border-4 !border-card !-right-2 !w-5 !h-5 !transition-all hover:!scale-125", ColorForHandle[output.type])}
            />
        </div>
    )
}
