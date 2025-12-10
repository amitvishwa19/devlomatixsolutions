import { cn } from '@/lib/utils'
import React from 'react'
import { Handle, Position } from '@xyflow/react'
import { ColorForHandle } from './common'

export default function NodeOutputs({ children }) {
    return (
        <div className='flex flex-col  '>
            {children}
        </div>
    )
}


export function NodeOutput({ output, nodeId }) {
    return (
        <div className='flex justify-end relative p-2 bg-secondary w-full'>
            {/* <NodeParamField param={input} nodeId={nodeId} /> */}

            <p className='text-xs text-muted-foreground  text-right w-full'>{output.name}</p>
            <Handle
                id={output.name}
                type='source'
                position={Position.Right}
                className={cn("!bg-muted-foreground !border-2 !border-background !-right-2 !w-4 !h-4", ColorForHandle[output.type])}
            />
        </div>
    )
}