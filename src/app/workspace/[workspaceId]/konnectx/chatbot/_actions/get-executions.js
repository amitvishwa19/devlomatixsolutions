'use server'

import { db } from "@/lib/db";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { z } from "zod";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

const GetExecutionsSchema = z.object({
    workspaceId: z.string(),
    botFlowId: z.string().optional(),
    phone: z.string().optional(),
    limit: z.number().min(1).max(100).default(50),
    offset: z.number().min(0).default(0)
});

const handler = async (data) => {
    const { workspaceId, botFlowId, phone, limit, offset } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);

        const where = { workspaceId };
        if (botFlowId) where.botFlowId = botFlowId;
        if (phone) where.phone = { contains: phone, mode: 'insensitive' };

        const executions = await db.botExecution.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset,
            include: {
                botFlow: {
                    select: { name: true }
                }
            }
        });

        const total = await db.botExecution.count({ where });

        return {
            success: true,
            executions,
            total,
            hasMore: offset + executions.length < total
        };
    } catch (error) {
        return { error: error.message || "Failed to fetch executions" };
    }
};

export const getExecutions = createSafeAction(GetExecutionsSchema, handler);