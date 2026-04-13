'use client'
import React, { memo } from 'react'
import { NodeCard } from './NodeCard'
import { TaskRegistry } from '../../_lib/tasks/registry'
import { Badge } from '@/components/ui/badge'
import { CoinsIcon, Copy, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NodeInput, NodeInputs } from './NodeInputs'
import NodeOutputs, { NodeOutput } from './NodeOutputs'
import { useReactFlow } from '@xyflow/react'
import { toast } from 'sonner'
import { CreateFlowNode } from '../../_lib/tasks/CreateFlowNode'

export const NodeComponent = memo((props) => {
    const nodeData = props.data
    const task = TaskRegistry[nodeData.type]

    const { deleteElements, getNode, addNodes } = useReactFlow()

    if (!task) return null

    return (
        <NodeCard nodeId={props.id} isSelected={!!props.selected}>
            {/* NODE HEADER */}
            <div className='flex items-center gap-2 p-4 drag-handle cursor-grab border-b border-muted'>
                <div className="bg-primary/10 p-2 rounded-xl">
                    <task.icon size={18} className="text-primary" />
                </div>
                <div className='flex justify-between items-center w-full'>
                    <div>
                        <p className='text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 leading-none mb-1'>
                            Task Node
                        </p>
                        <h4 className='text-sm font-bold text-foreground'>
                            {task.label}
                        </h4>
                    </div>
                    <div className='flex gap-2 items-center'>
                        {task.isEntryPoint && (
                            <Badge className='bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 text-[10px] h-6 px-2 lowercase'>
                                <span className="w-1.5 h-1.5 bg-primary rounded-full mr-1.5 animate-pulse" />
                                Entry
                            </Badge>
                        )}
                        <Badge className='gap-1.5 flex items-center text-[10px] bg-secondary hover:bg-secondary border-muted h-6 px-2 font-bold'>
                            <CoinsIcon size={12} className="text-primary" />
                            {task.credits}
                        </Badge>
                        {!task.isEntryPoint && (
                            <div className="flex gap-1 ml-2">
                                <Button
                                    variant='ghost'
                                    size="icon"
                                    className='h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive'
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        deleteElements({ nodes: [{ id: props.id }] })
                                        toast.success('Node deleted', { id: `delete-${props.id}` })
                                    }}
                                >
                                    <Trash2 size={16} />
                                </Button>
                                <Button
                                    variant='ghost'
                                    size="icon"
                                    className='h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary'
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        const node = getNode(props.id)
                                        const newX = node.position.x
                                        const newY = node.position.y + (node.measured?.height || 200) + 20
                                        const newNode = CreateFlowNode(node.data.type, { x: newX, y: newY })
                                        addNodes([newNode])
                                        toast.success('Node duplicated', { id: `dup-${props.id}` })
                                    }}
                                >
                                    <Copy size={16} />
                                </Button>
                            </div>
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
