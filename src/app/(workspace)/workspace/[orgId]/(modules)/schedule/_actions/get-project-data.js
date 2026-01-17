'use server'

import { db } from "@/lib/db"

export async function getProjectData(orgId) {

    const tasks = await db.card.findMany({
        where: {
            serverId: orgId
        },
        include: {
            assignee: true,
            list: true,
            board: true
        },

    })

    // const projects = await db.task.findMany({
    //     where: {
    //         serverId: orgId
    //     }
    // })
    return tasks
}