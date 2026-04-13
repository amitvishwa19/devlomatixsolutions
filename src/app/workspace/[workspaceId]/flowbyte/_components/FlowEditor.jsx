'use client'
import React, { useEffect, useState, useCallback } from 'react'
import { 
    addEdge, 
    applyEdgeChanges, 
    applyNodeChanges, 
    Background, 
    BackgroundVariant, 
    Controls, 
    ReactFlow, 
    useReactFlow, 
    getOutgoers 
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { CreateFlowNode } from '../_lib/tasks/CreateFlowNode'
import { NodeComponent } from './nodes/NodeComponent'
import { TaskRegistry } from '../_lib/tasks/registry'
import WorkflowTopbar from './topbar/WorkflowTopbar'
import { WorkflowStatus } from '@prisma/client'
import { useParams } from 'next/navigation'

const nodeTypes = {
    Node: NodeComponent
}

export default function FlowEditor({ workflow }) {
    const { toObject, setViewport, screenToFlowPosition, updateNodeData } = useReactFlow()
    const [nodes, setNodes] = useState([])
    const [edges, setEdges] = useState([])
    const { workspaceId } = useParams()

    useEffect(() => {
        try {
            const flow = workflow.definition
            if (!flow) return
            
            setNodes(flow.nodes || [])
            setEdges(flow.edges || [])

            if (flow.viewport) {
                const { x = 0, y = 0, zoom = 1 } = flow.viewport
                setViewport(x, y, zoom)
            }
        } catch (error) {
            console.error('Error loading workflow definition:', error)
        }
    }, [workflow, setViewport])

    const onNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        []
    )

    const onEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        []
    )

    const onConnect = useCallback(
        (connection) => {
            setEdges((eds) => addEdge({ ...connection, animated: true }, eds))
            if (!connection.targetHandle) return
            
            const node = nodes.find((nd) => nd.id === connection.target)
            if (!node) return

            updateNodeData(node.id, {
                inputs: {
                    ...node.data.inputs,
                    [connection.targetHandle]: ''
                }
            })
        },
        [nodes, updateNodeData]
    )

    const onDragOver = useCallback((event) => {
        event.preventDefault()
        event.dataTransfer.dropEffect = 'move'
    }, [])

    const onDrop = useCallback((event) => {
        event.preventDefault()
        const taskType = event.dataTransfer.getData('application/reactFlow')
        if (!taskType) return

        const position = screenToFlowPosition({
            x: event.clientX,
            y: event.clientY
        })

        const newNode = CreateFlowNode(taskType, position)
        setNodes((nds) => nds.concat(newNode))
    }, [screenToFlowPosition])

    const isValidConnection = useCallback((connection) => {
        if (connection.source === connection.target) return false
        
        const source = nodes.find((node) => node.id === connection.source)
        const target = nodes.find((node) => node.id === connection.target)
        if (!source || !target) return false

        const sourceTask = TaskRegistry[source.data.type]
        const targetTask = TaskRegistry[target.data.type]
        if (!sourceTask || !targetTask) return false

        const output = sourceTask.outputs.find((o) => o.name === connection.sourceHandle)
        const input = targetTask.inputs.find((o) => o.name === connection.targetHandle)

        if (input?.type !== output?.type) return false

        const hasCycle = (node, visited = new Set()) => {
            if (visited.has(node.id)) return false
            visited.add(node.id)

            for (const outgoer of getOutgoers(node, nodes, edges)) {
                if (outgoer.id === connection.source) return true
                if (hasCycle(outgoer, visited)) return true
            }
            return false
        }

        const detectCycle = hasCycle(target)
        return !detectCycle
    }, [nodes, edges])

    return (
        <div className='flex-1 h-full relative overflow-hidden'>
            <WorkflowTopbar
                title={workflow.name}
                subtitle={workflow.id}
                workflowId={workflow.id}
                isPublished={workflow.status === WorkflowStatus.PUBLISHED}
            />

            <ReactFlow
                nodes={nodes}
                onNodesChange={onNodesChange}
                edges={edges}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                onConnect={onConnect}
                fitView
                fitViewOptions={{ padding: 1 }}
                minZoom={0.2}
                maxZoom={2}
                snapToGrid
                snapGrid={[20, 20]}
                onDragOver={onDragOver}
                onDrop={onDrop}
                isValidConnection={isValidConnection}
                className="bg-muted/5"
            >
                <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#e2e8f0" />
                <Controls position='bottom-right' fitViewOptions={{ padding: 1 }} showInteractive={false} />
            </ReactFlow>
        </div>
    )
}
