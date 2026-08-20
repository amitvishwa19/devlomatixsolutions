import { db } from '@/lib/db';

export async function getWhatsappDefault(workspaceId) {
    try {
        if (workspaceId) {
            const wsSettings = await db.appSettings.findUnique({
                where: { key: workspaceId },
                select: { integrations: true },
            }).catch(() => null);

            if (wsSettings?.integrations?.whatsappDefault) {
                return wsSettings.integrations.whatsappDefault;
            }
        }

        const globalSettings = await db.appSettings.findUnique({
            where: { key: 'global' },
            select: { integrations: true },
        }).catch(() => null);

        return globalSettings?.integrations?.whatsappDefault || null;
    } catch (error) {
        console.error('[getWhatsappDefault] Error:', error);
        return null;
    }
}
