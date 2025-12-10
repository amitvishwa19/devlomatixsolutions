import { cn } from '@/lib/utils'
import { useReactFlow } from '@xyflow/react'
import React from 'react'
import { useFlowValidation } from '../../_hooks/useFlowValidation'

export function NodeCard({ children, nodeId, isSelected }) {
    //const { getNode, setCenter } = useReactFlow()
    const { invalidInputs } = useFlowValidation()
    const hasInvalidInputs = invalidInputs.some((node) => node.nodeId === nodeId)
    //hasInvalidInputs && 'border-red-600 border-2'

    //console.log('@invalidInputs', invalidInputs)

    //console.log('@invalidInputs', invalidInputs)
    return (
        <div
            className={cn(
                'rounded-md cursor-pointer bg-background border-2 border-separate w-[420px] text-xs gap-1 flex flex-col', isSelected && 'border-green-800',
                hasInvalidInputs && 'border-red-600'
            )}
            onDoubleClick={() => {
                //console.log('Double click', nodeId)
                const node = nodeId
                if (!node) return
                const { position, measured } = node

                if (!position || !measured) return
                const { width, height } = measured

                const x = position.x + width / 2
                const y = position.y + height / 2
                if (x === undefined || y === undefined) return

                //console.log('Double click', nodeId, position, measured)
                //console.log('@position', x, y)

                setCenter(x, y, {
                    zoom: 0.1,
                    duration: 500
                })

            }}
        >
            {children}
        </div>
    )
}
