import 'dotenv/config';
import { waManager } from '../../wa-api_delete/_lib/whatsapp-v2.js';
import { db } from '../../../../../../src/lib/db.js';

async function runTest() {
    const targetNumber = "919712340450"; 
    const targetJid = `${targetNumber}@s.whatsapp.net`;

    try {
        const auth = await db.whatsAppAuth.findFirst({ where: { status: 'CONNECTED' } });
        if (!auth) {
            console.error("No connected session found.");
            return;
        }

        waManager.connect(auth.sessionId);

        let tries = 0;
        while (waManager.getState() !== 'open' && tries < 15) {
            await new Promise(r => setTimeout(r, 1000));
            tries++;
        }

        if (waManager.getState() === 'open') {
            console.log("Connection open. Sending test button...");

            const legacyButtonPayload = {
                text: "Legacy Button Test: Can you see the buttons below?",
                footer: "Legacy Protocol",
                buttons: [
                    { buttonId: 'id1', buttonText: { displayText: 'Legacy Yes' }, type: 1 },
                    { buttonId: 'id2', buttonText: { displayText: 'Legacy No' }, type: 1 }
                ],
                headerType: 1
            };

            await waManager.sendMessage(targetJid, legacyButtonPayload);
            console.log("✅ Legacy Button message sent.");
        }
    } catch (error) {
        console.error(error);
    } finally {
        process.exit(0);
    }
}

runTest();
