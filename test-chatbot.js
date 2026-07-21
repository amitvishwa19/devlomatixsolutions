import { db } from "./src/lib/db.js";
import { waBotEngine } from "./src/app/workspace/[workspaceId]/konnectx/_lib/bot-engine.js";

async function main() {
    console.log("--- BOT FLOWS ---");
    const flows = await db.botFlow.findMany();
    console.log(`Found ${flows.length} flows:`);
    for (const f of flows) {
        console.log(`- ID: ${f.id}, Name: "${f.name}", Active: ${f.active}, WorkspaceId: ${f.workspaceId}, UserId: ${f.userId}`);
        console.log(`  Nodes: ${JSON.stringify(f.nodes).substring(0, 150)}...`);
    }

    console.log("\n--- CREDENTIALS ---");
    const credentials = await db.credentials.findMany({
        where: { platform: 'WHATSAPP_CLOUD' }
    });
    console.log(`Found ${credentials.length} WHATSAPP_CLOUD credentials:`);
    for (const c of credentials) {
        console.log(`- ID: ${c.id}, WorkspaceId: ${c.workspaceId}, UserId: ${c.userId}, isDefault: ${c.isDefault}`);
    }

    console.log("\n--- EXECUTIONS ---");
    const executions = await db.botExecution.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' }
    });
    console.log(`Last ${executions.length} executions:`);
    for (const e of executions) {
        console.log(`- ID: ${e.id}, FlowId: ${e.botFlowId}, Phone: ${e.phone}, Status: ${e.status}, Error: ${e.error}, Responses: ${JSON.stringify(e.responses)}`);
    }

    console.log("\n--- WHATSAPP MESSAGES ---");
    const messages = await db.whatsAppMessage.findMany({
        take: 5,
        orderBy: { timestamp: 'desc' }
    });
    console.log(`Last ${messages.length} WhatsApp messages:`);
    for (const m of messages) {
        console.log(`- ID: ${m.id}, FromMe: ${m.fromMe}, Text: "${m.text}", Timestamp: ${m.timestamp}`);
    }
}

main().catch(console.error).finally(() => db.$disconnect());
