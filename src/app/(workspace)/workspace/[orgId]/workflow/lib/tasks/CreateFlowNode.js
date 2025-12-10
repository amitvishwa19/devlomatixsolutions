

export function CreateFlowNode(nodeType, position) {
    return {
        id: crypto.randomUUID(),
        type: "Node",
        dragHandle: '.drag-handle',
        data: {
            type: nodeType,
            inputs: {}
        },
        position: position
    }
}