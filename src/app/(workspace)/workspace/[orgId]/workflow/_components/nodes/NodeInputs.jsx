'use client'
import { cn } from '@/lib/utils'
import { Handle, Position, useEdges } from '@xyflow/react'
import React from 'react'
import { NodeParamField } from './NodeParamField'
import { ColorForHandle } from './common'
import { useFlowValidation } from '../../_hooks/useFlowValidation'


export function NodeInputs({ children }) {
    return (
        <div className='flex flex-col '>
            {children}
        </div>
    )
}


export function NodeInput({ input, nodeId }) {
    const { invalidInputs } = useFlowValidation()
    const edges = useEdges()
    const isConnected = edges.some((edge) => edge.target === nodeId && edge.targetHandle === input.name)
    const hasError = invalidInputs.find((node) => node.nodeId === nodeId)?.inputs.find((invalidInput) => invalidInput === input.name)
    return (
        <div className={cn('flex justify-start relative p-2 bg-secondary w-full', hasError && 'bg-red-200/40')}>
            <NodeParamField param={input} nodeId={nodeId} disabled={isConnected} />
            {/* {JSON.stringify(input, null, 4)} */}
            {!input.hideHandle && (
                <Handle
                    id={input.name}
                    type='target'
                    position={Position.Left}
                    className={cn("!bg-muted-foreground !border-2 !border-background !-left-2 !w-4 !h-4", ColorForHandle[input.type])}
                />
            )}
        </div>
    )
}