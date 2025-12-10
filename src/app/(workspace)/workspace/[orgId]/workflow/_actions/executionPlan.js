import { Edge } from "@xyflow/react"
import { TaskRegistry } from "../lib/tasks/registry"
import { toast } from "sonner"

export const FlowToExecutionPlanValidationError = {
    NOENTRYPOINT: 'NO ENTRY POINT',
    INVALIDINPUTS: 'INVALID INPUTS'
}

export function FlowToExecutionPlan(nodes, edges) {


    const entryPoint = nodes.find((node) => TaskRegistry[node.data.type].isEntryPoint)

    if (!entryPoint) {
        //throw new Error("TODO : Handle this error")
        return {
            error: {
                type: FlowToExecutionPlanValidationError.NOENTRYPOINT
            }
        }
    }

    const inputsWithErrors = []
    const planned = new Set()

    const invalidInputs = getInvalidInputs(entryPoint, edges, planned)
    if (invalidInputs.length > 0) {
        inputsWithErrors.push({
            nodeId: entryPoint.id,
            inputs: invalidInputs
        })
    }

    const executionPlan = [
        {
            phase: 1,
            nodes: [entryPoint]
        }
    ]

    planned.add(entryPoint.id)



    for (let phase = 2; phase <= nodes.length && planned.size; phase++) {
        //console.log('@executing phase')

        const nextPhase = { phase, nodes: [] }
        for (const currentNode of nodes) {

            if (planned.has(currentNode.id)) {
                //Node already put in execution plan
                continue;
            }
            const invalidInputs = getInvalidInputs(currentNode, edges, planned)

            if (invalidInputs.length > 0) {
                const incomers = getIncomers(currentNode, nodes, edges)
                if (incomers.every(incomer => planned.has(incomer.id))) {
                    //if all incoming incomers/edges are planned and there are still invalid inputs
                    //then we can't plan this node yet
                    //means that workflow is invalid
                    console.error('Invalid inputs', currentNode.id, invalidInputs)

                    inputsWithErrors.push({
                        nodeId: currentNode.id,
                        inputs: invalidInputs
                    })

                    console.log(inputsWithErrors)
                    //throw new Error("TODO : Handle error 1")
                } else {
                    continue;
                }
            }

            nextPhase.nodes.push(currentNode)

        }

        for (const node of nextPhase.nodes) {
            planned.add(node.id)
        }
        executionPlan.push(nextPhase)

    }

    if (inputsWithErrors.length > 0) {
        return {
            error: {
                type: FlowToExecutionPlanValidationError.INVALIDINPUTS,
                invalidElement: inputsWithErrors
            }
        }
    }
    return { executionPlan }
}

function getInvalidInputs(node, edges, planned) {
    const invalidInputs = []
    const inputs = TaskRegistry[node.data.type].inputs

    for (const input of inputs) {
        const inputValue = node.data.inputs[input.name]
        const inputValueProvided = inputValue?.length > 0

        if (inputValueProvided) {
            //this input is fine , so we can move on
            continue;
        }
        //this input is not provided, so we need to check if it's an edge
        const incomingEdeges = edges.filter((edge) => edge.target === node.id)

        const inputLinkedToOutput = incomingEdeges.find(
            (edge) => edge.targetHandle === input.name
        )

        const requiredInputProvidedByVisitedOutput =
            input.required &&
            inputLinkedToOutput &&
            planned.has(inputLinkedToOutput.source)

        //console.log('@requiredInputProvidedByVisitedOutput', requiredInputProvidedByVisitedOutput)

        if (requiredInputProvidedByVisitedOutput) {
            //input is required and have valid value
            //provided by a task that is already planned
            continue;
        } else if (!input.required) {
            //input is not required and but there is  value   
            //we need to be sure output is already planned
            if (!inputLinkedToOutput) continue;
            if (inputLinkedToOutput && planned.has(inputLinkedToOutput.source)) {
                //Output is providing value to the input,input is fine
                continue;
            }
        }
        invalidInputs.push(input.name)
    }

    return invalidInputs;

}

function getIncomers(node, nodes, edges) {
    if (!node) {
        return []
    }

    const incomersId = new Set()
    edges.forEach(edge => {
        if (edge.target === node.id) {
            incomersId.add(edge.source)
        }
    })

    return nodes.filter((n) => incomersId.has(n.id))
}