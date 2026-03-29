const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const crypto = require('crypto');

function decryptCredentials(storedCredentials) {
    if (!storedCredentials) return {};
    if (storedCredentials?.enc && typeof storedCredentials.enc === 'string') {
        const key = process.env.ENCRYPTION_KEY;
        if (!key) return storedCredentials;
        try {
            const parts = storedCredentials.enc.split(':');
            const ivBuffer = Buffer.from(parts[0], 'hex');
            const encText = Buffer.from(parts.slice(1).join(':'), 'hex');
            const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), ivBuffer);
            let decrypted = decipher.update(encText);
            decrypted = Buffer.concat([decrypted, decipher.final()]);
            return JSON.parse(decrypted.toString());
        } catch (e) {
            return { error: e.message };
        }
    }
    return storedCredentials;
}

async function main() {
    const creds = await prisma.credentials.findMany({
        where: { platform: 'FACEBOOK' }
    });

    console.log(`Found ${creds.length} Facebook credentials`);
    creds.forEach(c => {
        const decoded = decryptCredentials(c.credentials);
        console.log(`ID: ${c.id}, Status: ${c.status}, Platform: ${c.platform}`);
        console.log(`Has accessToken: ${!!(decoded.accessToken || decoded.access_token)}`);
        console.log(`Has pageId: ${!!(decoded.pageId || decoded.page_id)}`);
        console.log(`Decoded keys: ${Object.keys(decoded).join(', ')}`);
        console.log('---');
    });
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
