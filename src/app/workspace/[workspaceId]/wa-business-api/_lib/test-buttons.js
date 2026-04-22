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

            const buttonPayload = {
                interactive: true,
                interactiveMessage: {
                    header: {
                        title: "Campaign Test",
                        hasProgressBar: false,
                        headerType: 1
                    },
                    body: { text: "This is a FORCED button test using the new relayMessage logic." },
                    footer: { text: "Devlomatix System" },
                    nativeFlowMessage: {
                        buttons: [
                            {
                                name: "quick_reply",
                                buttonParamsJson: JSON.stringify({
                                    display_text: "Test Success",
                                    id: "id_test_success"
                                })
                            }
                        ],
                        messageParamsJson: ''
                    }
                }
            };

            await waManager.sendMessage(targetJid, buttonPayload);
            console.log("✅ FORCED Button message sent.");
        }
    } catch (error) {
        console.error(error);
    } finally {
        process.exit(0);
    }
}

runTest();
