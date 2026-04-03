import "dotenv/config";
import { prisma } from '../prisma.js';

async function main() {
    console.log('--- Starting WhatsApp Cloud API Templates Seeder ---');

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
    console.log(`Seeding WhatsApp Cloud API templates for User: ${user.email || user.username} (ID: ${userId})`);

    // 2. Define comprehensive templates for all supported Cloud API message types
    const templatesData = [
        {
            name: "Cloud Standard Text",
            templateName: "cloud_standard_text",
            category: "UTILITY",
            language: "en_US",
            type: "text",
            body: "Hello! This is an official WhatsApp Cloud API text template. Welcome {{1}}!",
            footer: "Powered by HealthyFine UI",
            buttons: null,
            metadata: null,
            status: "APPROVED",
            approved: true,
            isDefault: true,
            platform: "WHATSAPP_CLOUD"
        },
        {
            name: "Cloud Image Message",
            templateName: "cloud_image_message",
            category: "MARKETING",
            language: "en_US",
            type: "image",
            body: "Check out our latest product catalog here!",
            footer: "Health & Wellness",
            buttons: null,
            metadata: { 
                mediaUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80"
            },
            status: "APPROVED",
            approved: true,
            isDefault: true,
            platform: "WHATSAPP_CLOUD"
        },
        {
            name: "Cloud Video Message",
            templateName: "cloud_video_message",
            category: "MARKETING",
            language: "en_US",
            type: "video",
            body: "Watch this short tutorial on API integration.",
            footer: "Guided by Experts",
            buttons: null,
            metadata: { 
                mediaUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4" 
            },
            status: "APPROVED",
            approved: true,
            isDefault: true,
            platform: "WHATSAPP_CLOUD"
        },
        {
            name: "Cloud Audio Note",
            templateName: "cloud_audio_note",
            category: "UTILITY",
            language: "en_US",
            type: "audio",
            body: "Your daily health tip voice note is ready.",
            footer: null,
            buttons: null,
            metadata: { 
                mediaUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" 
            },
            status: "APPROVED",
            approved: true,
            isDefault: true,
            platform: "WHATSAPP_CLOUD"
        },
        {
            name: "Cloud Document PDF",
            templateName: "cloud_document_pdf",
            category: "UTILITY",
            language: "en_US",
            type: "document",
            body: "Your invoice #{{1}} has been generated successfully.",
            footer: "Confidential",
            buttons: null,
            metadata: { 
                mediaUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" 
            },
            status: "APPROVED",
            approved: true,
            isDefault: true,
            platform: "WHATSAPP_CLOUD"
        },
        {
            name: "Cloud Interactive Location",
            templateName: "cloud_interactive_location",
            category: "UTILITY",
            language: "en_US",
            type: "location",
            body: "Here is the exact location for your appointment tomorrow.",
            footer: "Use maps to navigate",
            buttons: null,
            metadata: { 
                latitude: "18.5204",
                longitude: "73.8567",
                locationName: "HealthyFine Headquarters",
                locationAddress: "123 Wellness Ave, Pune, 411001"
            },
            status: "APPROVED",
            approved: true,
            isDefault: true,
            platform: "WHATSAPP_CLOUD"
        },
        {
            name: "Cloud Authentication PIN",
            templateName: "cloud_authentication_pin",
            category: "AUTHENTICATION",
            language: "en_US",
            type: "text",
            body: "Your secure login code is {{1}}. Never share it with anyone.",
            footer: "Security Team",
            buttons: ["Copy Code CTA"],
            metadata: null,
            status: "APPROVED",
            approved: true,
            isDefault: true,
            platform: "WHATSAPP_CLOUD"
        },
        {
            name: "Cloud Quick Replies",
            templateName: "cloud_quick_replies",
            category: "MARKETING",
            language: "en_US",
            type: "interactive-button",
            body: "Would you like to speak to our representative?",
            footer: "Select an option",
            buttons: ["Yes Please!", "No, Thanks", "Later"],
            metadata: null,
            status: "APPROVED",
            approved: true,
            isDefault: true,
            platform: "WHATSAPP_CLOUD"
        },
        {
            name: "Cloud Interactive Menu",
            templateName: "cloud_interactive_menu",
            category: "UTILITY",
            language: "en_US",
            type: "interactive-group",
            body: "Please choose the department you wish to consult.",
            footer: "Tap below",
            buttons: null,
            metadata: {
                listButton: "View Departments",
                listSections: [{
                    title: "Medical",
                    rows: [
                        { title: "Cardiology", description: "Heart specialists" },
                        { title: "Neurology", description: "Brain and nerves" }
                    ]
                }]
            },
            status: "APPROVED",
            approved: true,
            isDefault: true,
            platform: "WHATSAPP_CLOUD"
        },
        {
            name: "Cloud Product Carousel",
            templateName: "cloud_product_carousel",
            category: "MARKETING",
            language: "en_US",
            type: "carousel",
            body: "Browse our premium healthcare plans.",
            footer: "Swipe to view all",
            buttons: null,
            metadata: {
                isCarousel: true,
                carouselCards: [
                    { title: "Gold Plan", description: "All features unlocked", imageUrl: "https://picsum.photos/300", buttonText: "Buy Gold" },
                    { title: "Silver Plan", description: "Essential care", imageUrl: "https://picsum.photos/301", buttonText: "Buy Silver" },
                    { title: "Bronze Plan", description: "Basic coverage", imageUrl: "https://picsum.photos/302", buttonText: "Buy Bronze" }
                ]
            },
            status: "APPROVED",
            approved: true,
            isDefault: true,
            platform: "WHATSAPP_CLOUD"
        }
    ];

    // 3. Seed Templates safely
    let count = 0;
    for (const template of templatesData) {
        
        // Ensure metadata and buttons are stringified just or preserved as JSON
        // Prisma Json type logic will accept objects directly
        const payload = {
            ...template,
            userId: userId,
        };

        await prisma.messageTemplate.upsert({
            where: {
                userId_name: {
                    userId: userId,
                    name: template.name
                }
            },
            update: payload,
            create: payload
        });
        count++;
    }

    console.log(`Seeded ${count} WhatsApp Cloud API templates.`);
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
