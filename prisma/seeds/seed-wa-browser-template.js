import "dotenv/config";
import { prisma } from '../prisma.js';

async function main() {
    console.log('--- Starting WhatsApp Browser Templates Seeder ---');

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
    console.log(`Seeding WhatsApp Browser templates for User: ${user.email || user.username} (ID: ${userId})`);

    // 2. Define standard default templates for browser
    const templatesData = [
        { "name": "Standard Text", "category": "UTILITY", "language": "en_US", "type": "text", "body": "Hello! This is a standard WhatsApp text template. How are you doing today?", "footer": "HealthyFine Solutions", "buttons": null, "metadata": null, "status": "APPROVED", "isDefault": true, "platform": "WHATSAPP_BROWSER" },
        { "name": "Image Message", "category": "MARKETING", "language": "en_US", "type": "image", "body": "Check out this beautiful image from HealthyFine!", "footer": "Health & Wellness", "buttons": null, "metadata": "{\"mediaUrl\": \"https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80\"}", "status": "APPROVED", "isDefault": true, "platform": "WHATSAPP_BROWSER" },
        { "name": "Video Message", "category": "MARKETING", "language": "en_US", "type": "video", "body": "Watch our latest wellness guide video.", "footer": "Guided by Experts", "buttons": null, "metadata": "{\"mediaUrl\": \"https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4\"}", "status": "APPROVED", "isDefault": true, "platform": "WHATSAPP_BROWSER" },
        { "name": "Audio Voice Note", "category": "UTILITY", "language": "en_US", "type": "audio", "body": "Voice message from your health counselor.", "footer": null, "buttons": null, "metadata": "{\"mediaUrl\": \"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3\"}", "status": "APPROVED", "isDefault": true, "platform": "WHATSAPP_BROWSER" },
        { "name": "Document Message", "category": "UTILITY", "language": "en_US", "type": "document", "body": "Your health report is attached here as a PDF.", "footer": "Confidential", "buttons": null, "metadata": "{\"mediaUrl\": \"https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf\"}", "status": "APPROVED", "isDefault": true, "platform": "WHATSAPP_BROWSER" },
        { "name": "Interactive Buttons", "category": "MARKETING", "language": "en_US", "type": "interactive-button", "body": "Would you like to book a consultation?", "footer": "Select an option below", "buttons": "[\"Yes, Book Now\", \"Tell me more\", \"Maybe later\"]", "metadata": null, "status": "APPROVED", "isDefault": true, "platform": "WHATSAPP_BROWSER" },
        { "name": "Interactive List", "category": "UTILITY", "language": "en_US", "type": "interactive-group", "body": "Please choose your preferred department.", "footer": "Tap the button to view options", "buttons": null, "metadata": "{\"listButton\": \"View Departments\", \"listSections\": [{\"rows\": [{\"title\": \"OPD\", \"description\": \"Outpatient Department\"}, {\"title\": \"Pharmacy\", \"description\": \"Buy medicines\"}], \"title\": \"General\"}]}", "status": "APPROVED", "isDefault": true, "platform": "WHATSAPP_BROWSER" },
        { "name": "Carousel Display", "category": "MARKETING", "language": "en_US", "type": "text", "body": "Our Top Wellness Packages:\n\n1. Gold Plan - All features included\n2. Silver Plan - Essential features\n3. Bronze Plan - Basic features", "footer": "Reply with the plan name to subscribe", "buttons": null, "metadata": "{\"plans\": [\"Gold\", \"Silver\", \"Bronze\"], \"isCarousel\": true}", "status": "APPROVED", "isDefault": true, "platform": "WHATSAPP_BROWSER" },
        { "name": "Disappearing View Once", "category": "UTILITY", "language": "en_US", "type": "text", "body": "Your one-time access code is: 9988. This message will disappear.", "footer": null, "buttons": null, "metadata": "{\"viewOnce\": true}", "status": "APPROVED", "isDefault": true, "platform": "WHATSAPP_BROWSER" },
        { "name": "Carousel Display_copy_633", "category": "MARKETING", "language": "en_US", "type": "carousel", "body": "Our Top Wellness Packages:\n\n1. Gold Plan - All features included\n2. Silver Plan - Essential features\n3. Bronze Plan - Basic features", "footer": "Reply with the plan name to subscribe", "buttons": "[]", "metadata": "{\"plans\": [\"Gold\", \"Silver\", \"Bronze\"], \"isCarousel\": true, \"carouselCards\": [{\"title\": \"sdsdsdsd\", \"imageUrl\": \"https://picsum.photos/300\", \"buttonText\": \"View Details\", \"description\": \"sdsdsdsdsd\"}, {\"title\": \"sdssdsdsd\", \"imageUrl\": \"https://picsum.photos/300\", \"buttonText\": \"View Details\", \"description\": \"sdsdsdsd\"}]}", "status": "PENDING", "isDefault": false, "platform": "WHATSAPP_BROWSER" }
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

    console.log(`Seeded ${count} default WhatsApp Browser templates.`);
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
