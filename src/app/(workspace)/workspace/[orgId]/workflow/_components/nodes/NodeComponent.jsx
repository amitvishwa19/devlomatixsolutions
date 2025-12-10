import React, { memo, useCallback, useId, useState } from 'react'
import { NodeCard } from './NodeCard'
import { TaskRegistry } from '../../lib/tasks/registry'
import { Badge } from '@/components/ui/badge'
import { Coins, CoinsIcon, Copy, CopyIcon, GripVerticalIcon, Trash, Trash2, TrashIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
//import { Handle, Position, useReactFlow } from '@xyflow/react'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import { NodeInput, NodeInputs } from './NodeInputs'
import NodeOutputs, { NodeOutput } from './NodeOutputs'
import { useReactFlow } from '@xyflow/react'
import { toast } from 'sonner'
import { CreateFlowNode } from '../../lib/tasks/CreateFlowNode'


const DEV_MODE = process.env.NEXT_PUBLIC_DEV_MODE === 'true'
export const NodeComponent = memo((props) => {
    const nodeData = props.data
    const task = TaskRegistry[nodeData.type]

    const { deleteElements, getNode, addNodes } = useReactFlow()

    return (
        <NodeCard nodeId={props.id} isSelected={!!props.selected}>

            {DEV_MODE && <Badge >DEV:{props.id}</Badge>}
            {/* NODEHEADER */}
            <div className='flex items-center gap-2 p-2 drag-handle cursor-grab'>
                <task.icon size={16} />
                <div className=' flex justify-between items-center w-full'>
                    <p className='text-xs font-bold uppercase text-muted-foreground'>
                        {task.label}
                    </p>
                    <div className='flex gap-4 items-center'>
                        {task.isEntryPoint && <Badge className='bg-blue-500 text-white'>Entry Point</Badge>}
                        <Badge className='gap-2 flex items-center text-xs bg-blue-500 text-white'>
                            <CoinsIcon size={16} />
                            {task.credits}
                        </Badge>
                        {!task.isEntryPoint && (
                            <>
                                <Button
                                    variant='ghost'
                                    size={16}
                                    className=''
                                    onClick={() => {
                                        deleteElements({
                                            nodes: [{ id: props.id }]
                                        })
                                        toast.success('Node deleted')
                                    }}
                                >
                                    <Trash2 size={18} />
                                </Button>
                                <Button
                                    variant='ghost'
                                    size={16} className=''
                                    onClick={() => {
                                        const node = getNode(props.id)
                                        const newX = node.position.x
                                        const newY = node.position.y + node.measured?.height + 20
                                        const newNode = CreateFlowNode(node.data.type, { x: newX, y: newY })
                                        addNodes([newNode])
                                    }}
                                >
                                    <Copy size={18} />
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>



            <NodeInputs>
                {task.inputs.map((input) => (
                    <NodeInput
                        key={input.name}
                        input={input}
                        nodeId={props.id}
                    />
                ))}
            </NodeInputs>


            <NodeOutputs>
                {task.outputs.map((output) => (
                    <NodeOutput
                        key={output.name}
                        output={output}
                        nodeId={props.id}
                    />
                ))}
            </NodeOutputs>



        </NodeCard>
    )
})

NodeComponent.displayName = "NodeComponent"

