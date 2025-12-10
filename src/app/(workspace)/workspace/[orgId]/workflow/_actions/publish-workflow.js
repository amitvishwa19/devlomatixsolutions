'use server'

import { db } from "@/lib/db"
import { WORKFLOWSTATUS } from "@prisma/client"
import { FlowToExecutionPlan } from "./executionPlan"
import { CalculateWOrkflowCost } from "../_lib/helpers"
import { revalidatePath } from "next/cache"

export async function PublishWorkflow({ userId, workflowId, defination, orgId }) {



    if (!workflowId) {
        throw new Error('Workflow id not defined')
    }

    const workflow = await db.workflow.findUnique({
        where: { id: workflowId }
    })

    if (!workflow) {
        throw new Error('Workflow not found')
    }

    if (workflow.status !== WORKFLOWSTATUS.DRAFT) {
        throw new Error('Workflow status not draft')
    }

    const flow = JSON.parse(defination)
    const result = FlowToExecutionPlan(flow.nodes, flow.edges)

    console.log(result)

    if (result.error) {
        throw new Error('Flow defination is not valid')
    }

    if (!result.executionPlan) {
        throw new Error('No execution plan generated')
    }

    const creditCost = CalculateWOrkflowCost(flow.nodes)

    await db.workflow.update({
        where: { id: workflowId, userId },
        data: {
            defination,
            executionPlan: JSON.stringify(result.executionPlan),
            creditCost,
            status: WORKFLOWSTATUS.PUBLISHED
        }
    })

    revalidatePath(`/workspace/${orgId}/workflow/${workflowId}`)
}