'use server'

import { db } from "@/lib/db"
import parser from 'cron-parser'
import { revalidatePath } from "next/cache"

export async function RemoveWorkflowCron({ id, userId, orgId }) {
    console.log('UpdateWorkflowCron server action', id, userId, orgId)

    try {


        await db.workflow.update({
            where: { id, userId },
            data: {
                cron: null,
                nextRunAt: null
            }
        })

        revalidatePath(`/workspace/${orgId}/workflow`)
    } catch (error) {
        console.error(error)
        throw new Error('Invalid cron')
    }
}