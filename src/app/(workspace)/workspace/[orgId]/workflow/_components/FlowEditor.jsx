'use client'
import React, { useEffect } from 'react'
import { useState, useCallback } from 'react';
import { addEdge, applyEdgeChanges, applyNodeChanges, Background, BackgroundVariant, Controls, ReactFlow, useEdgesState, useNodesState, useReactFlow, getOutgoers } from '@xyflow/react'
import '@xyflow/react/dist/style.css';
import { CreateFlowNode } from '../lib/tasks/CreateFlowNode';
import { NodeComponent } from './nodes/NodeComponent';
import { saveWorkflow } from '../_actions/save-workflow';
import { useAction } from '@/hooks/use-action';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';
import DeleteEdgeButton from './edges/DeleteEdgeButton';
import { TaskRegistry } from '../lib/tasks/registry';
import WorkflowTopbar from './topbar/WorkflowTopbar';
import { WORKFLOWSTATUS } from '@prisma/client';





const nodeTypes = {
    Node: NodeComponent
}

const edgeTypes = {
    default: DeleteEdgeButton
}


export default function FlowEditor({ workflow }) {

    const { toObject, setViewport, screenToFlowPosition, updateNodeData } = useReactFlow()
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const { orgId } = useParams()
    const defination = JSON.stringify(toObject())

    //console.log('orgId', orgId)
    const [rfInstance, setRfInstance] = useState(null);

    useEffect(() => {
        try {
            const flow = JSON.parse(workflow.defination)
            if (!flow) return;
            setNodes(flow.nodes || [])
            setEdges(flow.edges || [])

            if (!flow.viewport) return
            const { x = 0, y = 0, zoom = 1 } = flow.viewport
            setViewport(x, y, zoom)


        } catch (error) {
            console.log('Error while getting workflow')
        }


    }, [workflow.defination, setEdges, setNodes, setViewport])


    const onNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        [],
    );
    const onEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        [],
    );

    const onConnect = useCallback(

        (connection) => {
            setEdges((eds) => addEdge({ ...connection, animated: true }, eds))

            if (!connection.targetHandle) return
            const node = nodes.find((nd) => nd.id === connection.target)
            //console.log('@Updated Node', node.id)
            if (!node) return

            const nodeInputs = node.data.inputs

            updateNodeData(node.id, {
                inputs: {
                    ...nodeInputs,
                    [connection.targetHandle]: ''
                }
            })
            //console.log('@Updated Node', node.id)
        },
        [setNodes, updateNodeData, nodes],
    );

    const { execute, isLoading } = useAction(saveWorkflow, {
        onSuccess: (data) => {
            //console.log('data', data)
            // handleOnOpenChange()
            toast.success(`Workflow ${data?.name} saved successfully`)
            //router.push(`/workspace/${orgId}/workflow/${data.id}`)
        },
        onError: (error) => {
            toast.error(error)
        }
    })

    const handleSaveWOrkflow = () => {
        const defination = JSON.stringify(toObject())
        execute({ userId: session?.user?.userId, workflowId: workflow.id, defination, orgId })
    }

    const onDragOver = useCallback((event) => {
        event.preventDefault()
        event.dataTransfer.dropEffect = 'move'
    }, [])

    const onDrop = useCallback((event) => {
        event.preventDefault()
        const taskType = event.dataTransfer.getData('application/reactFlow')

        if (!taskType === undefined || !taskType) return

        const position = screenToFlowPosition({
            x: event.clientX,
            y: event.clientY
        })

        console.log(position)

        const newNode = CreateFlowNode(taskType, position)
        setNodes((nds) => nds.concat(newNode))
        console.log('@newNode', newNode)
    }, [screenToFlowPosition, setNodes])

    const isValidConnection = useCallback((connection) => {
        //No self connection allowed
        if (connection.source === connection.target) return false
        const source = nodes.find((node) => node.id === connection.source)
        const target = nodes.find((node) => node.id === connection.target)
        if (!source || !target) {
            console.log('Invalid connection : Source or Target node not found')
            return false
        }

        const sourceTask = TaskRegistry[source.data.type]
        const targetTask = TaskRegistry[target.data.type]

        const output = sourceTask.outputs.find((o) => o.name === connection.sourceHandle)
        const input = targetTask.inputs.find((o) => o.name === connection.targetHandle)

        if (input?.type !== output?.type) {
            //console.log('Invalid connection : type mismatch')
            return false
        }



        //console.log('@node', node)

        const hasCycle = (node, visited = new Set()) => {

            if (visited.has(node.id)) return false
            visited.add(node.id)

            for (const outgoer of getOutgoers(node, nodes, edges)) {
                if (outgoer.id === connection.source) return true
                if (hasCycle(outgoer, visited)) return false
            }
        }

        const detectCycle = hasCycle(target)
        //console.log('@detectCycle', detectCycle)
        return !detectCycle

    }, [nodes, edges])


    return (
        <div className='absolute inset-0'>
            <WorkflowTopbar
                title={workflow.name}
                subtitle={workflow.id}
                workflowId={workflow.id}
                hideBUttons={true}
                defination={defination}
                isPublished={workflow.status === WORKFLOWSTATUS.PUBLISHED}
            />

            {/* <div className='flex items-center justify-end p-2 gap-2'>


                <ExecuteButton workflowId={workflow.id} />

                <Button
                    size='sm'
                    className='bg-blue-600 hover:bg-blue-800 text-white '
                    onClick={() => { handleSaveWOrkflow() }}

                    disabled={isLoading}
                >
                    {isLoading ? <Loader size={16} className='mr-2 animate-spin' /> : <Save size={16} className='mr-2' />}


                    Save
                </Button>
            </div> */}

            <ReactFlow
                nodes={nodes}
                onNodesChange={onNodesChange}
                edges={edges}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                onConnect={onConnect}
                fitView
                fitViewOptions={{ padding: 1 }}
                minZoom={0.2}
                maxZoom={4}
                snapToGrid
                snapGrid={[20, 20]}
                onDragOver={onDragOver}
                onDrop={onDrop}
                isValidConnection={isValidConnection}
            >


                <Background BackgroundVariant={BackgroundVariant.Lines} gap={12} size={1} />
                <Controls position='top-left' fitViewOptions={{ padding: 1 }} style={{ backgroundColor: 'transparent' }} />
            </ReactFlow>
        </div>
    )
}
