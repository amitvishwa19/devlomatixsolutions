import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
import { symmetricDecrypt } from '../../lib/encryption.js'

dotenv.config();

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
    const userId = 'cmo6yh2uq0000m4ik3bo51ghc';
    const credentials = await prisma.credentials.findMany({
        where: { userId, platform: 'WHATSAPP_CLOUD' }
    });

    console.log(`Found ${credentials.length} credentials for user.`);

    for (const cred of credentials) {
        console.log(`--- Testing Credential: ${cred.profile} (${cred.id}) ---`);
        let cloudCredentials = null;
        const stored = cred.credentials;

        try {
            if (typeof stored === 'string' && stored.includes(':')) {
                const decrypted = symmetricDecrypt(stored);
                cloudCredentials = JSON.parse(decrypted);
            } else if (typeof stored === 'string') {
                cloudCredentials = JSON.parse(stored);
            } else {
                cloudCredentials = stored;
            }

            if (!cloudCredentials || !cloudCredentials.accessToken || !cloudCredentials.wabaId) {
                console.log('Incomplete credentials, skipping.');
                continue;
            }

            console.log(`Fetching from WABA: ${cloudCredentials.wabaId}`);
            const url = `https://graph.facebook.com/v21.0/${cloudCredentials.wabaId}/message_templates`;
            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${cloudCredentials.accessToken}` }
            });
            const data = await res.json();

            if (!res.ok) {
                console.error('Meta API Error:', data.error);
                continue;
            }

            console.log(`Fetched ${data.data?.length || 0} templates.`);
            data.data?.forEach(t => {
                console.log(` - ${t.name} (${t.language}) [${t.category}]`);
            });

        } catch (e) {
            console.error('Error processing credential:', e.message);
        }
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
