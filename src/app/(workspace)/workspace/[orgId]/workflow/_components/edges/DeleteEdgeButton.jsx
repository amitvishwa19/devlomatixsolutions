import { Button } from '@/components/ui/button'
import { BaseEdge, EdgeLabelRenderer, getSimpleBezierPath, getSmoothStepPath, useReactFlow } from '@xyflow/react'
import { DeleteIcon, Trash } from 'lucide-react'
import React from 'react'

export default function DeleteEdgeButton(props) {
    const [edgePath, labelX, labelY] = getSmoothStepPath(props)
    //console.log('@DeleteEdgeBUtton', edgePath)
    //const [edgePath, labelX, labelY] = getSimpleBezierPath(props)
    const { setEdges } = useReactFlow()
    return (
        <>
            <BaseEdge
                path={edgePath}
                markerEnd={props.markerEnd}
                style={props.style}
            />
            <EdgeLabelRenderer>
                <div style={{
                    position: 'absolute',
                    transform: `translate(-50%,-50%) translate(${labelX}px,${labelY}px)`,
                    pointerEvents: 'all'
                }}>
                    <Button
                        variant='ghost'
                        className=' border-none cursor-pointer rounded-full text-xs  hover:shadow-lg hover:bg-transparent'
                        onClick={() => {
                            setEdges((edges) => edges.filter((edge) => edge.id !== props.id))
                        }}
                    >
                        <Trash size={16} className='hover:text-red-600 font-semibold hover:font-semibold ' />
                    </Button>

                </div>
            </EdgeLabelRenderer>
        </>
    )
}
