import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

dotenv.config();

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
    const userId = 'cmo6yh2uq0000m4ik3bo51ghc';
    const defaultCred = await prisma.credentials.findFirst({
        where: { userId, platform: 'WHATSAPP_CLOUD', isDefault: true }
    });
    
    console.log('Default Account:', JSON.stringify({
        id: defaultCred?.id,
        profile: defaultCred?.profile,
        phoneNumberId: defaultCred?.phoneNumberId, // Note: this might be null if stored in JSON
        isDefault: defaultCred?.isDefault
    }, null, 2));

    const templates = await prisma.messageTemplate.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' }
    });
    
    console.log(`Found ${templates.length} templates for user ${userId}`);
    
    const allTemplates = await prisma.messageTemplate.findMany({
        where: {
            name: {
                contains: 'curexa',
                mode: 'insensitive'
            }
        }
    });

    console.log('Global Curexa Search Results:', JSON.stringify(allTemplates.map(t => ({
        name: t.name,
        language: t.language,
        userId: t.userId,
        phoneNumberId: t.phoneNumberId
    })), null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
