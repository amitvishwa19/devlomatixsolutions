import { db } from '@/lib/db';

export async function getWhatsappDefault() {
    try {
        const settings = await db.appSettings.findUnique({
            where: { key: 'global' },
            select: { integrations: true },
        });

        return settings?.integrations?.whatsappDefault || null;
    } catch (error) {
        console.error('[getWhatsappDefault] Error:', error);
        return null;
    }
}
