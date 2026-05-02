import { waManager } from './whatsapp';
import { db } from './db';

async function main() {
    try {
        console.log("Checking for active sessions in database...");
        const auths = await db.whatsAppAuth.findMany({
            where: { status: 'CONNECTED' }
        });

        if (auths.length === 0) {
            console.error("No 'CONNECTED' WhatsApp sessions found in DB. Please scan the QR code in the browser first.");
            process.exit(1);
        }

        const sessionId = auths[0].sessionId;
        console.log("Found session for ID:", sessionId);

        console.log("Connecting waManager...");
        waManager.connect(sessionId);

        // Wait for connection to open
        let tries = 0;
        const maxTries = 15;
        while (waManager.getState() !== 'open' && tries < maxTries) {
            console.log(`[${tries}/${maxTries}] Connection state:`, waManager.getState());
            await new Promise(r => setTimeout(r, 2000));
            tries++;
        }

        if (waManager.getState() === 'open') {
            const targetJid = '919712340450@s.whatsapp.net';
            const message = 'Hello from Antigravity! Your WhatsApp integration is now fully powered by the database. 🎉';

            console.log(`Sending message to ${targetJid}...`);
            const result = await waManager.sendMessage(targetJid, { text: message });

            console.log("Message sent successfully!");
            console.log("Result:", JSON.stringify(result, null, 2));
        } else {
            console.error("Time out: Could not establish connection. Please ensure your phone is connected and the session is valid.");
        }
    } catch (err) {
        console.error("Test script failed:", err);
    } finally {
        process.exit(0);
    }
}

main();
