import "dotenv/config";
import { prisma } from '../prisma.js';

async function main() {
    console.log('--- Starting WhatsApp Templates Seeder ---');

    // 1. Get the first user or admin to attach templates to
    let user = await prisma.user.findFirst({
        where: { role: 'ADMIN' }
    });

    if (!user) {
        user = await prisma.user.findFirst();
    }

    if (!user) {
        console.error('No user found in the database. Please create a user first.');
        return;
    }

    const userId = user.id;
    console.log(`Seeding WhatsApp templates for User: ${user.email || user.username} (ID: ${userId})`);

    // 2. Define standard default templates
    const templatesData = [
        {
            name: 'welcome_message',
            category: 'UTILITY',
            language: 'en_US',
            type: 'TEXT',
            body: 'Welcome to our service, {{1}}! We are glad to have you on board. If you have any questions, feel free to ask.',
            footer: 'Powered by Devlomatix',
            status: 'APPROVED',
            isDefault: true,
            platform: 'WHATSAPP_CLOUD'
        },
        {
            name: 'appointment_reminder',
            category: 'UTILITY',
            language: 'en_US',
            type: 'TEXT',
            body: 'Hi {{1}}, this is a quick reminder for your upcoming appointment on {{2}} at {{3}}. Please let us know if you need to reschedule.',
            footer: 'Thank you for choosing us!',
            status: 'APPROVED',
            isDefault: true,
            platform: 'WHATSAPP_CLOUD'
        },
        {
            name: 'special_offer',
            category: 'MARKETING',
            language: 'en_US',
            type: 'TEXT',
            body: 'Hello {{1}}! We have an exclusive offer just for you. Use code {{2}} at checkout to get {{3}}% off your next purchase.',
            footer: 'Offer valid for a limited time.',
            status: 'APPROVED',
            isDefault: true,
            platform: 'WHATSAPP_CLOUD'
        },
        {
            name: 'payment_confirmation',
            category: 'UTILITY',
            language: 'en_US',
            type: 'TEXT',
            body: 'Dear {{1}}, we have successfully received your payment of {{2}} for invoice {{3}}. Thank you!',
            footer: 'Your account is up to date.',
            status: 'APPROVED',
            isDefault: true,
            platform: 'WHATSAPP_CLOUD'
        },
        {
            name: 'customer_support',
            category: 'UTILITY',
            language: 'en_US',
            type: 'interactive-button',
            body: 'Hi {{1}}, our support team has resolved your ticket (#{{2}}). Was this helpful?',
            footer: 'Please rate our service.',
            buttons: [
                { type: 'reply', reply: { id: 'btn_yes', title: 'Yes' } },
                { type: 'reply', reply: { id: 'btn_no', title: 'No' } },
            ],
            status: 'APPROVED',
            isDefault: true,
            platform: 'WHATSAPP_CLOUD'
        }
    ];

    // 3. Seed Templates
    let count = 0;
    for (const template of templatesData) {
        // Upsert by userId and name (this is a unique constraint in the schema)
        await prisma.messageTemplate.upsert({
            where: {
                userId_name: {
                    userId: userId,
                    name: template.name
                }
            },
            update: {
                ...template
            },
            create: {
                ...template,
                userId: userId
            }
        });
        count++;
    }

    console.log(`Seeded ${count} default WhatsApp templates.`);
    console.log('--- Seeding Complete ---');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
