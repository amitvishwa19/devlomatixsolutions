import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findFirst();
    if (!user) {
        console.error("No user found in the database. Cannot create templates.");
        return;
    }

    const userId = user.id;
    console.log(`Creating templates for User: ${user.email} (${userId})`);

    const templates = [
        {
            name: 'text_message_demo',
            category: 'MARKETING',
            language: 'en_US',
            type: 'text',
            body: 'Hello {{1}}! This is a simple text message template from HealthyFine. How can we help you today?',
            footer: 'Reply STOP to unsubscribe',
            status: 'APPROVED'
        },
        {
            name: 'image_message_demo',
            category: 'MARKETING',
            language: 'en_US',
            type: 'image',
            body: 'Check out our latest health tips in this infographic!',
            footer: 'HealthyFine Tips',
            metadata: {
                mediaUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80'
            },
            status: 'APPROVED'
        },
        {
            name: 'video_message_demo',
            category: 'UTILITY',
            language: 'en_US',
            type: 'video',
            body: 'Watch this quick video on how to use our platform.',
            footer: 'HealthyFine Tutorial',
            metadata: {
                mediaUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4'
            },
            status: 'APPROVED'
        },
        {
            name: 'audio_message_demo',
            category: 'UTILITY',
            language: 'en_US',
            type: 'audio',
            body: 'Listen to the voice note for your appointment instructions.',
            metadata: {
                mediaUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
            },
            status: 'APPROVED'
        },
        {
            name: 'document_message_demo',
            category: 'UTILITY',
            language: 'en_US',
            type: 'document',
            body: 'Your medical report is ready for download.',
            footer: 'Confidential Document',
            metadata: {
                mediaUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
            },
            status: 'APPROVED'
        },
        {
            name: 'contact_vcard_demo',
            category: 'UTILITY',
            language: 'en_US',
            type: 'text', // Baileys often handles vCards as text/object type or specialized sendMessage
            body: 'Here is our contact information for your address book.',
            metadata: {
                vcard: {
                    fullName: 'HealthyFine Support',
                    org: 'HealthyFine Solutions',
                    phone: '+15551234567',
                    email: 'support@healthyfine.com'
                }
            },
            status: 'APPROVED'
        },
        {
            name: 'buttons_message_demo',
            category: 'MARKETING',
            language: 'en_US',
            type: 'interactive-button',
            body: 'Would you like to schedule an appointment?',
            footer: 'Quick Actions',
            buttons: ['Schedule Now', 'Maybe Later', 'View Services'],
            status: 'APPROVED'
        },
        {
            name: 'list_message_demo',
            category: 'UTILITY',
            language: 'en_US',
            type: 'interactive-group',
            body: 'Please select a department from the list below.',
            footer: 'Select an option',
            metadata: {
                listButton: 'View Departments',
                listSections: [
                    {
                        title: 'Medical',
                        rows: [
                            { title: 'Cardiology', description: 'Heart related issues' },
                            { title: 'Neurology', description: 'Brain and nervous system' }
                        ]
                    },
                    {
                        title: 'Support',
                        rows: [
                            { title: 'Billing', description: 'Payment and invoices' },
                            { title: 'General', description: 'Other inquiries' }
                        ]
                    }
                ]
            },
            status: 'APPROVED'
        },
        {
            name: 'carousel_demo',
            category: 'MARKETING',
            language: 'en_US',
            type: 'text', // Placeholder for carousel logic if not natively supported by this Baileys version
            body: 'Check out our various health packages!\n\n1. Basic Checkup - $50\n2. Premium Wellness - $150\n3. Family Plan - $400',
            footer: 'Reply with the number to learn more',
            metadata: {
                isCarousel: true,
                items: [
                    { title: 'Basic', price: '$50', url: '...' },
                    { title: 'Premium', price: '$150', url: '...' }
                ]
            },
            status: 'APPROVED'
        },
        {
            name: 'disappearing_demo',
            category: 'UTILITY',
            language: 'en_US',
            type: 'text',
            body: 'This is a sensitive message and should be viewed once.',
            metadata: {
                viewOnce: true
            },
            status: 'APPROVED'
        }
    ];

    for (const t of templates) {
        try {
            await prisma.messageTemplate.upsert({
                where: {
                    userId_name: {
                        userId: userId,
                        name: t.name
                    }
                },
                update: { ...t },
                create: { ...t, userId: userId }
            });
            console.log(`Created/Updated Template: ${t.name}`);
        } catch (err) {
            console.error(`Failed to create template ${t.name}:`, err);
        }
    }

    console.log("All templates created successfully.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
