'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

const UpdateAuthRecordSchema = z.object({
    workspaceId: z.string(),
    deviceInfo: z.object({
        phoneNumber: z.string().optional(),
        deviceName: z.string().optional(),
        platform: z.string().optional(),
        connectedAt: z.string().optional(),
    }).optional(),
});

const handler = async (data) => {
    const { workspaceId, deviceInfo } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        const updatedAuth = await db.whatsAppAuth.upsert({
            where: { sessionId: userId },
            update: {
                phoneNumber: deviceInfo?.phoneNumber,
                deviceName: deviceInfo?.deviceName,
                platform: deviceInfo?.platform,
                connectedAt: deviceInfo?.connectedAt,
                status: 'CONNECTED',
                userId: userId,
                isActive: true
            },
            create: {
                sessionId: userId,
                userId: userId,
                phoneNumber: deviceInfo?.phoneNumber,
                deviceName: deviceInfo?.deviceName,
                platform: deviceInfo?.platform,
                connectedAt: deviceInfo?.connectedAt,
                status: 'CONNECTED',
                isActive: true
            }
        });

        return { success: true, data: updatedAuth };
    } catch (error) {
        return { error: error.message || "Failed to update auth record" };
    }
};

export const updateAuthRecord = createSafeAction(UpdateAuthRecordSchema, handler);
