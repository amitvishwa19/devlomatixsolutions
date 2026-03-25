import 'dotenv/config';
import { db } from "./src/lib/db.js";

async function dumpAllCreds() {
    console.log("Dumping ALL Credentials in the system...");
    
    const creds = await db.credentials.findMany({
        orderBy: { createdAt: 'desc' }
    });

    console.log(`Found ${creds.length} total credentials.`);
    creds.forEach(c => {
        console.log(` - ID: ${c.id} Platform: ${c.platform} Profile: ${c.profile} Status: ${c.status} UserID: ${c.userId}`);
    });

    const gmailCount = creds.filter(c => ['GMAIL', 'GOOGLE'].includes(c.platform.toUpperCase())).length;
    console.log(`\nGmail/Google Count: ${gmailCount}`);
    
    const connectedGmailCount = creds.filter(c => ['GMAIL', 'GOOGLE'].includes(c.platform.toUpperCase()) && c.status === 'connected').length;
    console.log(`Connected Gmail Count: ${connectedGmailCount}`);
}

dumpAllCreds();
