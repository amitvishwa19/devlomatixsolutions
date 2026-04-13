'use client'
import { cn } from '@/lib/utils'
import { Handle, Position, useEdges } from '@xyflow/react'
import React from 'react'
import { NodeParamField } from './NodeParamField'
import { ColorForHandle } from './common'
import { useFlowValidation } from '../../_hooks/useFlowValidation'

export function NodeInputs({ children }) {
    return (
        <div className='flex flex-col gap-1 p-2'>
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
        <div className={cn(
            'flex justify-start relative p-3 bg-muted/40 rounded-2xl border border-transparent transition-all hover:bg-muted/60', 
            hasError && 'bg-destructive/10 border-destructive/20'
        )}>
            <NodeParamField param={input} nodeId={nodeId} disabled={isConnected} />
            {!input.hideHandle && (
                <Handle
                    id={input.name}
                    type='target'
                    position={Position.Left}
                    className={cn("!bg-muted-foreground !border-4 !border-card !-left-2 !w-5 !h-5 !transition-all hover:!scale-125", ColorForHandle[input.type])}
                />
            )}
        </div>
    )
}
