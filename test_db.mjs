import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    try {
        const userId = 'cmnbhifag000058ikv4p5z6r7';
        const workspaceId = 'cmnbhifag000458ikwhv1zso2';
        
        console.log('Testing contact creation...');
        const contact = await prisma.contact.create({
            data: {
                name: 'Test Manual',
                phone: '9876543210',
                userId,
                workspaceId,
                tags: ['test'],
            },
            include: { category: true }
        });
        console.log('Success:', contact);
        
        console.log('Testing contact fetch...');
        const contacts = await prisma.contact.findMany({
            where: { userId },
            include: { category: true, groups: true }
        });
        console.log('Fetch Success, count:', contacts.length);
        
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
