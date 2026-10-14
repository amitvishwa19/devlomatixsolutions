'use server';

import { db } from "@/lib/db";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";
import { konnectLegacyManager } from "../_lib/baileys-manager";

/**
 * Initiate WhatsApp QR pairing connection
 */
export async function initiateWhatsAppConnectionAction(workspaceId, { forceNewQr = false } = {}) {
    try {
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;
        const sessionId = workspaceId; // Scoped per workspace

        // Ensure session record exists with userId linked
        await db.whatsAppAuth.upsert({
            where: { sessionId },
            update: {
                userId,
                updatedAt: new Date()
            },
            create: {
                sessionId,
                userId,
                status: 'CONNECTING',
                isActive: true,
                sessionName: `Workspace ${workspaceId}`
            }
        });

        // Trigger Baileys connection
        const connState = await konnectLegacyManager.connect(sessionId, { forceNewQr });

        return {
            success: true,
            status: connState.status,
            qrCode: connState.qrCode,
            phoneNumber: connState.phoneNumber,
            deviceName: connState.deviceName
        };
    } catch (error) {
        console.error("[INITIATE_WA_CONNECTION_ERROR]", error);
        return {
            success: false,
            error: error.message || "Failed to initiate WhatsApp connection"
        };
    }
}

/**
 * Get live WhatsApp connection status (pollable or on-demand)
 */
export async function getWhatsAppConnectionStatusAction(workspaceId) {
    try {
        await ensureWorkspaceAccess(workspaceId);
        const sessionId = workspaceId;

        // Check active in-memory state first
        const memState = konnectLegacyManager.getSessionState(sessionId);

        // Check DB record
        const dbAuth = await db.whatsAppAuth.findUnique({
            where: { sessionId },
            select: {
                status: true,
                phoneNumber: true,
                deviceName: true,
                platform: true,
                qrCode: true,
                connectedAt: true,
                lastConnectedAt: true,
                updatedAt: true
            }
        });

        // Synthesize status (in-memory takes priority if active, otherwise DB)
        const status = memState.sock ? memState.status : (dbAuth?.status || 'DISCONNECTED');
        const qrCode = memState.qrCode || ((status === 'QR_REQUIRED' || status === 'SCAN_QR' || !['CONNECTED', 'LOGGED_OUT'].includes(status)) ? dbAuth?.qrCode : null);
        const phoneNumber = memState.phoneNumber || dbAuth?.phoneNumber || null;
        const deviceName = memState.deviceName || dbAuth?.deviceName || 'Linked Mobile Device';
        const connectedAt = memState.connectedAt || dbAuth?.connectedAt || null;

        return {
            success: true,
            status,
            qrCode,
            phoneNumber,
            deviceName,
            connectedAt
        };
    } catch (error) {
        console.error("[GET_WA_CONNECTION_STATUS_ERROR]", error);
        return {
            success: false,
            error: error.message || "Failed to fetch connection status"
        };
    }
}

/**
 * Disconnect or Log out WhatsApp Session
 */
export async function disconnectWhatsAppAction(workspaceId, { logout = false } = {}) {
    try {
        await ensureWorkspaceAccess(workspaceId);
        const sessionId = workspaceId;

        await konnectLegacyManager.disconnect(sessionId, logout);

        if (logout) {
            // Also clean up session keys if user explicitly chooses "Log Out"
            const authRecord = await db.whatsAppAuth.findUnique({
                where: { sessionId },
                select: { id: true }
            });

            if (authRecord) {
                await db.whatsAppSessionKey.deleteMany({
                    where: { whatsappAuthId: authRecord.id }
                }).catch(() => null);

                await db.whatsAppAuth.update({
                    where: { id: authRecord.id },
                    data: {
                        credentials: null,
                        qrCode: null,
                        phoneNumber: null,
                        status: 'LOGOUT',
                        disconnectedAt: new Date()
                    }
                }).catch(() => null);
            }
        }

        return {
            success: true,
            message: logout ? "WhatsApp account unlinked successfully" : "Session disconnected"
        };
    } catch (error) {
        console.error("[DISCONNECT_WA_ACTION_ERROR]", error);
        return {
            success: false,
            error: error.message || "Failed to disconnect WhatsApp"
        };
    }
}

/**
 * Send test message to verify linked phone connection
 */
export async function sendTestMessageAction(workspaceId, recipientOrObj, maybeText) {
    try {
        await ensureWorkspaceAccess(workspaceId);
        const sessionId = workspaceId;

        const recipient = typeof recipientOrObj === 'object' ? recipientOrObj.recipient : recipientOrObj;
        const text = typeof recipientOrObj === 'object' ? recipientOrObj.text : maybeText;

        if (!recipient || !text) {
            return { success: false, error: "Recipient and message text are required" };
        }

        const sent = await konnectLegacyManager.sendMessage(sessionId, recipient, text);

        return {
            success: true,
            messageId: sent.key?.id || `msg_${Date.now()}`,
            message: "Test message dispatched successfully!"
        };
    } catch (error) {
        console.error("[SEND_TEST_MESSAGE_ERROR]", error);
        return {
            success: false,
            error: error.message || "Failed to send message via linked device"
        };
    }
}
