import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    try {
        await prisma.$executeRawUnsafe(`ALTER PUBLICATION supabase_realtime ADD TABLE "Message";`);
        console.log('✅ Enabled replication for Message table');
    } catch (e) {
        if (e.message.includes('already member')) {
            console.log('ℹ️  Message table already has replication enabled');
        } else {
            console.error('❌ Error for Message:', e.message);
        }
    }

    try {
        await prisma.$executeRawUnsafe(`ALTER PUBLICATION supabase_realtime ADD TABLE "DirectMessage";`);
        console.log('✅ Enabled replication for DirectMessage table');
    } catch (e) {
        if (e.message.includes('already member')) {
            console.log('ℹ️  DirectMessage table already has replication enabled');
        } else {
            console.error('❌ Error for DirectMessage:', e.message);
        }
    }

    await prisma.$disconnect();
}

main();
