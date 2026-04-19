'use server'

import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { waManager } from "../_lib/whatsapp-v2";

const GetStatusSchema = z.object({
    workspaceId: z.string(),
});

const handler = async (data) => {
    const { workspaceId } = data;

    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;
        
        const status = waManager.getState();
        
        // Auto-connect if not connected but has session in DB
        if (status === 'welcome') {
            const auth = await db.whatsAppAuth.findUnique({
                where: { sessionId: userId }
            });
            
            if (auth && auth.credentials) {
                console.log("[WA Action] Auto-connecting session for user:", userId);
                waManager.connect(userId);
            }
        }

        const qr = waManager.getQrCodeString();
        const currentStatus = waManager.getState();
        
        let authRecord = await db.whatsAppAuth.findUnique({
            where: { sessionId: userId }
        });

        return {
            data: {
                status: currentStatus,
                qr,
                metadata: JSON.parse(JSON.stringify(authRecord?.metadata || {})),
                user: waManager.getUser(),
                messages: waManager.getMessages()
            }
        };
    } catch (error) {
        return { error: error.message || "Failed to fetch status" };
    }
};

export const getStatus = createSafeAction(GetStatusSchema, handler);
