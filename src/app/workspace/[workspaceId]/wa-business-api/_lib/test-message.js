import 'dotenv/config';
import { waManager } from '../../wa-api_delete/_lib/whatsapp-v2.js';
import { db } from '../../../../../../src/lib/db.js';

/**
 * STANDALONE TEST SCRIPT FOR WHATSAPP BUSINESS API (Baileys/Browser Session)
 * 
 * Run this to verify that the Browser-based WhatsApp integration is working.
 * It will attempt to find a 'CONNECTED' session in your database.
 * 
 * 
 */


async function runTest() {
    const targetNumber = "919712340450"; // Use digits only for the JID construction
    const targetJid = `${targetNumber}@s.whatsapp.net`;

    console.log(`[TEST] Starting WhatsApp Browser Session test for ${targetJid}...`);

    try {
        // 1. Find a connected session
        console.log("Checking for active sessions in database...");
        let auth = await db.whatsAppAuth.findFirst({
            where: { status: 'CONNECTED' }
        });

        if (!auth) {
            console.log("⚠️  [TEST] No 'CONNECTED' status found. checking for ANY session with credentials...");
            const allSessions = await db.whatsAppAuth.findMany({
                orderBy: { updatedAt: 'desc' }
            });

            if (allSessions.length > 0) {
                console.log(`[TEST] Found ${allSessions.length} total sessions:`);
                allSessions.forEach(s => {
                    console.log(` - ID: ${s.sessionId} | Status: ${s.status} | Last Updated: ${s.updatedAt}`);
                });

                // Use the most recently updated one
                auth = allSessions[0];
                console.log(`[TEST] Attempting to use most recent session: ${auth.sessionId}`);
            }
        }

        if (!auth) {
            console.error("❌ [TEST] FAILED: No WhatsApp sessions found in DB.");
            console.info("Please scan the QR code in the browser dashboard first.");
            return;
        }

        const sessionId = auth.sessionId;
        console.log(`[TEST] Found session ID: ${sessionId}. Connecting...`);

        // 2. Connect the manager
        waManager.connect(sessionId);

        // 3. Wait for connection to reach 'open' state
        let tries = 0;
        const maxTries = 15;
        while (waManager.getState() !== 'open' && tries < maxTries) {
            process.stdout.write(`\r[TEST] [${tries}/${maxTries}] Connection state: ${waManager.getState()}...`);
            await new Promise(r => setTimeout(r, 2000));
            tries++;
        }
        console.log("\n");

        if (waManager.getState() === 'open') {
            const message = 'Hello from Devlomatix! This is a test message confirming your browser-based WhatsApp session is active. 🚀';

            console.log(`[TEST] Sending message to ${targetJid}...`);
            const result = await waManager.sendMessage(targetJid, { text: message });

            console.log("✅ [TEST] SUCCESS! Message sent.");
            // console.log("Result:", JSON.stringify(result, null, 2));
        } else {
            console.error(`❌ [TEST] FAILED: Could not establish connection (Final State: ${waManager.getState()}).`);
            console.info("Check if your phone is connected to the internet.");
        }
    } catch (error) {
        console.error("🔥 [TEST] FATAL ERROR:");
        console.error(error);
    } finally {
        process.exit(0);
    }
}

// Execute
runTest();
