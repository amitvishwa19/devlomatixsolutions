'use server'

import { db } from "@/lib/db"
import parser from 'cron-parser'
import { revalidatePath } from "next/cache"

export async function UpdateWorkflowCron({ id, cron, userId, orgId }) {
    console.log('UpdateWorkflowCron server action', id, cron, orgId)

    try {

        const interval = parser.parseExpression(cron, { utc: true })
        await db.workflow.update({
            where: { id, userId },
            data: {
                cron,
                nextRunAt: interval.next().toDate()
            }
        })

        revalidatePath(`/workspace/${orgId}/workflow`)
    } catch (error) {
        console.error(error)
        throw new Error('Invalid cron')
    }
}